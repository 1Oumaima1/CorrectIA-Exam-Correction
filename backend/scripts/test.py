import os
# ==============================
# CACHE HUGGING FACE SUR D:
# ==============================
os.environ["HF_HOME"] = "D:\\huggingface_cache"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
import json
from sentence_transformers import SentenceTransformer, util
# ==============================
# MODELE NLP
# ==============================
model = SentenceTransformer('camembert-base')


# ==============================
# CORRECTION
# ==============================
def grade_students_terminal(module: str, exam_id: str):
    students_file = f"uploads/json/{module}_{exam_id}_students.json"
    corrige_file = f"uploads/json/{module}_{exam_id}_corrige.json"

    if not os.path.exists(students_file):
        raise FileNotFoundError(f"❌ Fichier introuvable : {students_file}")

    if not os.path.exists(corrige_file):
        raise FileNotFoundError(f"❌ Fichier introuvable : {corrige_file}")

    with open(corrige_file, "r", encoding="utf-8") as f:
        corrige = json.load(f)

    with open(students_file, "r", encoding="utf-8") as f:
        students = json.load(f)

    print("\n================= CORRECTION AUTOMATIQUE =================\n")

    for student in students:
        cne = student["CNE"]
        responses = student["responses"]

        total_score = 0
        total_points = 0

        print(f"👩‍🎓 Étudiante : {cne}")

        for q_id, q_data in corrige["questions"].items():
            correct = q_data["answer"]
            points = q_data["points"]
            answer = responses.get(q_id, "")

            embeddings = model.encode([answer, correct], convert_to_tensor=True)
            similarity = util.cos_sim(embeddings[0], embeddings[1]).item()

            score = round(similarity * points, 2)

            print(f"\nQuestion {q_id}")
            print(f"Similarité : {similarity:.2f}")
            print(f"Note : {score}/{points}")

            total_score += score
            total_points += points

        print(f"\n✅ NOTE FINALE : {round(total_score,2)} / {total_points}")
        print("--------------------------------------------------\n")


# ==============================
# MAIN
# ==============================
if __name__ == "__main__":
    module = "Compilation"
    exam_id = "1"

    grade_students_terminal(module, exam_id)