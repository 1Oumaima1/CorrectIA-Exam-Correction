from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from .auth import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_etudiant(current=Depends(get_current_user)):
    if current["role"] != "etudiant":
        raise HTTPException(status_code=403, detail="Accès réservé aux étudiants")
    return current


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), current=Depends(require_etudiant)):
    etu = current["user"]

    resultats = (
        db.query(models.Note, models.Examen)
        .join(models.Examen, models.Note.examen_id == models.Examen.id)
        .filter(models.Note.etudiant_id == etu.id)
        .all()
    )

    return {
        "etudiant": {
            "id": etu.id,
            "nom": etu.nom,
            "prenom": etu.prenom,
            "email": etu.email,
            "cne": etu.cne,
            "classe": etu.classe.nom if etu.classe else None,
            "filiere": etu.classe.filiere.nom if etu.classe and etu.classe.filiere else None,
        },
        "resultats": [
            {
                "examen_id": examen.id,
                "titre": examen.titre,
                "module": examen.module,
                "semestre": examen.semestre,
                "note": note.note_finale,
                "certitude": note.certitude,
                "valide": note.valide,
            }
            for note, examen in resultats
        ]
    }
