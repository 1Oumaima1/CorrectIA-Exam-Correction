import re


def _normalize_text(text: str) -> str:
    return (text or '').replace('\r', '\n').replace('\u00a0', ' ').replace('\t', ' ')


def clean_student_answers(text: str) -> dict:
    """Extrait les réponses d'un étudiant et les associe au bon numéro de question."""
    text = _normalize_text(text)
    pattern = re.compile(
        r'Question\s*(\d+)\s*[:.\-–—]?\s*(.*?)(?=\n\s*Question\s*\d+\s*[:.\-–—]?|\n\s*={2,}\s*\n|\Z)',
        re.IGNORECASE | re.DOTALL,
    )

    responses = {}
    for match in pattern.finditer(text):
        question_id = match.group(1).strip()
        block = match.group(2).strip()
        if not block:
            continue

        block = re.sub(r'^(?:\s*[-=]{2,}\s*\n)+', '', block)
        points_match = re.search(r'\((\d+)\s*points?\)', block, re.IGNORECASE)
        if points_match:
            answer = block[points_match.end():].strip()
        else:
            answer = block.strip()

        answer = re.sub(r'\s+', ' ', answer).strip()
        if answer:
            responses[question_id] = answer

    return responses
