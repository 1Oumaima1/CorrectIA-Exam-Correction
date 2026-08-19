import re

def clean_answers(text: str) -> list[str]:
    blocks = re.split(r'Q\d+|\bQuestion\b\s*\d+', text, flags=re.IGNORECASE)
    answers = []

    for block in blocks:
        lines = []
        for line in block.splitlines():
            if '?' not in line:  # supprimer les questions
                line = re.sub(r'^\s*[\d\)\.\-•]+\s*', '', line)
                if line.strip():
                    lines.append(line.strip())

        if lines:
            answers.append(" ".join(lines))

    return answers
