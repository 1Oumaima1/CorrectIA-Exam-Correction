import os
import json
from scripts.process_student import process_student

def generate_students_json(copies_dir: str, module: str, exam_id: str, copy_paths: list[str] | None = None):
    """Génère un JSON pour toutes les copies d'un dossier."""
    students = []

    if copy_paths:
        files_to_process = [p for p in copy_paths if os.path.isfile(p)]
    else:
        files_to_process = [
            os.path.join(copies_dir, file)
            for file in os.listdir(copies_dir)
            if os.path.isfile(os.path.join(copies_dir, file))
        ]

    for path in files_to_process:
        students.append(process_student(path, module=module, exam_id=exam_id))

    #os.makedirs("uploads/json", exist_ok=True)
    """output_path = f"uploads/json/{module}_{exam_id}_students.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(students, f, ensure_ascii=False, indent=2)

    return students"""
    output_path = f"uploads/json/{exam_id}_students.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(students, f, ensure_ascii=False, indent=2)
    return output_path
