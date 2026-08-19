from types import SimpleNamespace

from app.api.professeur import build_copy_summary


def test_build_copy_summary_includes_student_and_note_data():
    copie = SimpleNamespace(
        id=12,
        pdf_path="uploads/copies/7_2024_Math.pdf",
        etudiant=SimpleNamespace(
            id=7,
            nom="Dupont",
            prenom="Alice",
            cne="A1234567",
            email="alice@example.com",
            classe=SimpleNamespace(nom="IL-1"),
        ),
        examen=SimpleNamespace(id=3),
    )
    note = SimpleNamespace(note_finale=16.5, certitude=0.86, valide=1)

    payload = build_copy_summary(copie, note)

    assert payload["id"] == 12
    assert payload["etudiant"]["nom"] == "Dupont"
    assert payload["etudiant"]["cne"] == "A1234567"
    assert payload["note"]["note_finale"] == 16.5
    assert payload["note"]["valide"] is True
