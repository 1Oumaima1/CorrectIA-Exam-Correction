import json
from difflib import SequenceMatcher

def grade_students(module: str, exam_id: str):
    # Charger le corrigé
    with open(f"uploads/json/{module}_{exam_id}_corrige.json", "r", encoding="utf-8") as f:
        corrige = json.load(f)

    # Charger les copies des étudiants
    with open(f"uploads/json/{module}_{exam_id}_students.json", "r", encoding="utf-8") as f:
        students = json.load(f)

    graded_students = []

    for student in students:
        student_id = student.get("CNE")
        student_responses = student.get("responses", {})
        total_score = 0
        total_points = 0

        student_grade = {"CNE": student_id, "module": module, "exam_id": exam_id, "grades": {}}

        for q_num, q_info in corrige["questions"].items():
            correct_answer = q_info["answer"]
            points = q_info["points"]
            student_answer = student_responses.get(q_num, "")

            # Calculer similarité entre la réponse et le corrigé
            similarity = SequenceMatcher(None, student_answer.lower(), correct_answer.lower()).ratio()

            score = round(similarity * points, 2)  # note proportionnelle
            student_grade["grades"][q_num] = {
                "student_answer": student_answer,
                "correct_answer": correct_answer,
                "points": points,
                "score": score
            }

            total_score += score
            total_points += points

        # Note finale
        student_grade["total_score"] = round(total_score, 2)
        student_grade["total_points"] = total_points
        graded_students.append(student_grade)

    # Sauvegarder les résultats
    output_path = f"uploads/json/{module}_{exam_id}_graded.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(graded_students, f, ensure_ascii=False, indent=2)

    return graded_students
