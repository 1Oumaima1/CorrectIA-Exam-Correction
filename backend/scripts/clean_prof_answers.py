import re


def _normalize_text(text: str) -> str:
    return (text or '').replace('\r', '\n').replace('\u00a0', ' ').replace('\t', ' ')


def clean_prof_answers(text: str) -> dict:
    """Extrait une structure par question à partir du corrigé PDF.

    Le format des PDFs varie : le nombre de points peut être sur la même ligne
    que "Question X" ou sur la ligne suivante. Cette version accepte les deux.
    """
    text = _normalize_text(text)

    header_re = re.compile(r'(?im)^\s*Question\s*(\d+)\b([^\n]*)')
    headers = list(header_re.finditer(text))

    questions = {}
    for idx, match in enumerate(headers):
        q_num = match.group(1).strip()
        raw_title = (match.group(2) or '').strip(' :-–—\t')

        start = match.start()
        end = headers[idx + 1].start() if idx + 1 < len(headers) else len(text)
        block = text[start:end].strip()
        if not block:
            continue

        points_match = re.search(r'\(?\s*(\d+)\s*points?\s*\)?', block, re.IGNORECASE)
        points = int(points_match.group(1)) if points_match else 0
        if points <= 0:
            continue

        lines = [ln.strip() for ln in block.splitlines() if ln.strip()]
        if lines:
            lines = lines[1:]
        body = '\n'.join(lines)

        body = re.sub(r'^\(\s*\d+\s*points?\s*\)\s*', '', body, flags=re.IGNORECASE)
        body = re.sub(r'^(?:Réponse|Reponse)\s+attendue\s*:\s*', '', body, flags=re.IGNORECASE)
        body = re.split(r'\n\s*(?:Barème|Bareme|Barme)\s*:', body, maxsplit=1, flags=re.IGNORECASE)[0].strip()
        body = re.sub(r'={3,}', ' ', body)

        question_text = f'Question {q_num}'
        if raw_title:
            question_text = f'Question {q_num} - {raw_title}'

        answer = re.sub(r'\s+', ' ', body).strip()
        if not answer:
            continue

        questions[q_num] = {
            'question_text': question_text,
            'answer': answer,
            'points': points,
        }

    return questions
