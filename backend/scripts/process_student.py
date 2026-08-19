import os
import re
from scripts.text_extractor import extract_text
from scripts.clean_student_answers import clean_student_answers


def process_student(file_path: str, module: str, exam_id: str) -> dict:
    """Génère un dict JSON pour un étudiant avec son CNE."""
    raw_name = os.path.splitext(os.path.basename(file_path))[0]
    cne = raw_name
    tokens = [token for token in re.split(r'[^A-Za-z0-9]+', raw_name) if token]
    if tokens:
        cne = tokens[-1]

    text = extract_text(file_path)
    responses = clean_student_answers(text)

    return {
        "CNE": cne,
        "module": module,
        "exam_id": exam_id,
        "responses": responses
    }
