import os
import sys
import json
import re

# Ajout du dossier racine pour que les imports fonctionnent
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from scripts.test_hf import calcul_similarite
from app.database import SessionLocal
from app import models

# ======================================================
# Nettoyage des réponses étudiantes
# ======================================================
def clean_student_answer(text: str) -> str:
    text = text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# ======================================================
# Vérifier la couverture minimale du contenu
# ======================================================
def content_coverage(student: str, prof: str) -> float:
    student_words = set(re.findall(r"\w+", student.lower()))
    prof_words = set(re.findall(r"\w+", prof.lower()))
    if not prof_words:
        return 0.0
    return len(student_words & prof_words) / len(prof_words)

# ======================================================
# Calcul du score avec Hugging Face + couverture
# ======================================================
def hf_score(student_answer, prof_answer, max_points):
    if not student_answer.strip():
        return 0.0

    sim = calcul_similarite(prof_answer, clean_student_answer(student_answer))[0]
    cov = content_coverage(student_answer, prof_answer)

    if sim < 0.40:
        return 0.0
    if cov < 0.10:
        return round(max_points * 0.2, 2)
    if sim < 0.70:
        return round(max_points * 0.4, 2)
    if sim < 0.85:
        return round(max_points * 0.7, 2)

    return round(max_points, 2)

# ======================================================
# Correction complète vers la base de données
# ======================================================
def correct_exam(corrige_path, students_path):
    db = SessionLocal()

    with open(corrige_path, encoding="utf-8") as f:
        corrige = json.load(f)

    with open(students_path, encoding="utf-8") as f:
        students = json.load(f)

    questions = corrige["questions"]
    total_possible = sum(q["points"] for q in questions.values())
    if total_possible == 0:
        print("[ERROR] Corrige invalide : total des points = 0")
        db.close()
        return

    seen_students = set()
    unique_students = []
    for student in students:
        raw_cne = student.get("CNE")
        cne = raw_cne.split("_")[-1] if raw_cne else None
        exam_id_raw = student.get("exam_id")
        if not exam_id_raw or not cne:
            continue
        try:
            exam_id = int(exam_id_raw)
        except ValueError:
            continue
        key = (cne.upper(), exam_id)
        if key in seen_students:
            continue
        seen_students.add(key)
        unique_students.append((student, cne.upper(), exam_id))

    for student, cne, exam_id in unique_students:
        etudiant = db.query(models.Etudiant).filter_by(cne=cne).first()
        if not etudiant:
            print(f"[ERROR] Etudiant introuvable : {cne}")
            continue

        note = db.query(models.Note).filter_by(
            etudiant_id=etudiant.id,
            examen_id=exam_id
        ).first()

        if note is None:
            note = models.Note(
                etudiant_id=etudiant.id,
                examen_id=exam_id,
                note_finale=0.0,
                certitude=0.0,
                valide=0
            )
            db.add(note)

        total_score = 0.0
        responses = student.get("responses", {}) or {}
        per_question = []
        for q_id, q in questions.items():
            student_answer = responses.get(str(q_id), responses.get(int(q_id), ""))
            if student_answer is None:
                student_answer = ""
            q_score = hf_score(student_answer, q["answer"], q["points"])
            total_score += q_score
            per_question.append((q_id, q_score, student_answer))
            print(f"[Q] {cne} q{q_id}: student={student_answer[:80]!r} score={q_score}")

        note_sur_20 = round((total_score / total_possible) * 20, 2)
        certitude = round(max(0.0, min(1.0, note_sur_20 / 20.0)), 2)

        note.note_finale = note_sur_20
        note.certitude = certitude
        note.valide = 1
        print(f"[OK] {cne} -> {note_sur_20}/20 (certitude={certitude})")

    db.commit()
    db.close()
    print("[OK] Correction terminee (DB uniquement)")

# ======================================================
# MAIN : détection automatique des fichiers JSON
# ======================================================
if __name__ == "__main__":
    json_dir = os.path.join(BASE_DIR, "uploads", "json")

    corrige_file = None
    students_file = None

    for f in os.listdir(json_dir):
        if f.endswith("_corrige.json"):
            corrige_file = os.path.join(json_dir, f)
        elif f.endswith("_students.json"):
            students_file = os.path.join(json_dir, f)

    if not corrige_file or not students_file:
        print("❌ Fichiers JSON introuvables dans", json_dir)
    else:
        correct_exam(corrige_file, students_file)
