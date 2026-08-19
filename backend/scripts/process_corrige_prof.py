from scripts.text_extractor import extract_text
from scripts.clean_prof_answers import clean_prof_answers
import json, os

def process_corrige_prof(path: str, module: str, exam_id: str):
    text = extract_text(path)  # extrait tout le texte du PDF
    questions = clean_prof_answers(text)  # maintenant questions, réponses et points

    corrige = {
        "module": module,
        "exam_id": exam_id,
        "questions": questions
    }

    """os.makedirs("uploads/json", exist_ok=True)
    output_path = f"uploads/json/{module}_{exam_id}_corrige.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(corrige, f, ensure_ascii=False, indent=2)

    return corrige"""
    output_path = f"uploads/json/{exam_id}_corrige.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(corrige, f, ensure_ascii=False, indent=2)
    return output_path
