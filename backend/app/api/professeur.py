from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
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


def require_professeur(current=Depends(get_current_user)):
    if current["role"] != "professeur":
        raise HTTPException(status_code=403, detail="Accès réservé aux professeurs")
    return current


def build_copy_summary(copie, note=None):
    etudiant = copie.etudiant
    note_payload = {
        "id": getattr(note, "id", None) if note else None,
        "note_finale": getattr(note, "note_finale", None) if note else None,
        "certitude": getattr(note, "certitude", None) if note else None,
        "valide": bool(getattr(note, "valide", 0)) if note and getattr(note, "valide", None) is not None else False,
    }
    return {
        "id": copie.id,
        "pdf_path": copie.pdf_path,
        "pdf_url": "/uploads/" + copie.pdf_path.replace('\\', '/').replace('uploads/', ''),
        "etudiant": {
            "id": etudiant.id if etudiant else None,
            "nom": etudiant.nom if etudiant else None,
            "prenom": etudiant.prenom if etudiant else None,
            "cne": etudiant.cne if etudiant else None,
            "email": etudiant.email if etudiant else None,
            "classe": etudiant.classe.nom if etudiant and etudiant.classe else None,
        },
        "note": note_payload,
    }


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), current=Depends(require_professeur)):
    prof_id = current["user"].id
    examens = db.query(models.Examen).filter_by(professeur_id=prof_id).all()
    classes = current["user"].classes

    return {
        "professeur": {
            "id": current["user"].id,
            "nom": current["user"].nom,
            "prenom": current["user"].prenom,
            "email": current["user"].email,
            "specialite": current["user"].specialite,
        },
        "nb_examens": len(examens),
        "nb_classes": len(classes),
        "classes": [{"id": c.id, "nom": c.nom, "niveau": c.niveau} for c in classes],
    }


@router.get("/examens")
def mes_examens(db: Session = Depends(get_db), current=Depends(require_professeur)):
    prof_id = current["user"].id
    examens = db.query(models.Examen).filter_by(professeur_id=prof_id).all()
    return [
        {
            "id": e.id,
            "titre": e.titre,
            "module": e.module,
            "semestre": e.semestre,
            "pdf_path": e.pdf_path,
            "corrige_path": e.corrige_path,
            "classes": [{"id": c.id, "nom": c.nom} for c in e.classes],
        }
        for e in examens
    ]


@router.get("/examens/{examen_id}/copies")
def copies_examen(examen_id: int, db: Session = Depends(get_db), current=Depends(require_professeur)):
    prof_id = current["user"].id
    examen = db.query(models.Examen).filter_by(id=examen_id, professeur_id=prof_id).first()
    if not examen:
        raise HTTPException(status_code=404, detail="Examen introuvable")

    copies = (
        db.query(models.Copie)
        .filter(models.Copie.examen_id == examen_id)
        .all()
    )

    result = []
    for copie in copies:
        note = (
            db.query(models.Note)
            .filter(models.Note.examen_id == examen_id, models.Note.etudiant_id == copie.etudiant_id)
            .first()
        )
        result.append(build_copy_summary(copie, note))

    return {
        "examen": {
            "id": examen.id,
            "titre": examen.titre,
            "module": examen.module,
            "semestre": examen.semestre,
        },
        "copies": result,
    }


@router.put("/examens/{examen_id}/etudiants/{etudiant_id}/note")
def update_note_examen(
    examen_id: int,
    etudiant_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current=Depends(require_professeur)
):
    prof_id = current["user"].id
    examen = db.query(models.Examen).filter_by(id=examen_id, professeur_id=prof_id).first()
    if not examen:
        raise HTTPException(status_code=404, detail="Examen introuvable")

    etudiant = db.query(models.Etudiant).filter_by(id=etudiant_id).first()
    if not etudiant:
        raise HTTPException(status_code=404, detail="Étudiant introuvable")

    note = (
        db.query(models.Note)
        .filter(models.Note.examen_id == examen_id, models.Note.etudiant_id == etudiant_id)
        .first()
    )
    if note is None:
        note = models.Note(etudiant_id=etudiant_id, examen_id=examen_id)
        db.add(note)

    note_finale = payload.get("note_finale")
    certitude = payload.get("certitude")
    valide = payload.get("valide")

    if note_finale not in (None, ""):
        note_finale_value = float(note_finale)
        if note_finale_value < 0 or note_finale_value > 20:
            raise HTTPException(status_code=400, detail="La note doit être comprise entre 0 et 20")
        note.note_finale = note_finale_value

    if certitude not in (None, ""):
        certitude_value = float(certitude)
        if certitude_value < 0 or certitude_value > 1:
            raise HTTPException(status_code=400, detail="La certitude doit être comprise entre 0 et 1")
        note.certitude = certitude_value

    if valide is not None:
        note.valide = 1 if bool(valide) else 0

    db.commit()
    db.refresh(note)

    return {
        "id": note.id,
        "etudiant_id": etudiant_id,
        "examen_id": examen_id,
        "note_finale": note.note_finale,
        "certitude": note.certitude,
        "valide": bool(note.valide),
    }


@router.get("/examens/{examen_id}/resultats")
def resultats_examen(examen_id: int, db: Session = Depends(get_db), current=Depends(require_professeur)):
    prof_id = current["user"].id
    examen = db.query(models.Examen).filter_by(id=examen_id, professeur_id=prof_id).first()
    if not examen:
        raise HTTPException(status_code=404, detail="Examen introuvable")

    notes = (
        db.query(models.Note, models.Etudiant)
        .join(models.Etudiant, models.Note.etudiant_id == models.Etudiant.id)
        .filter(models.Note.examen_id == examen_id)
        .all()
    )

    return {
        "examen": {
            "id": examen.id,
            "titre": examen.titre,
            "module": examen.module,
        },
        "resultats": [
            {
                "etudiant_id": etu.id,
                "nom": etu.nom,
                "prenom": etu.prenom,
                "cne": etu.cne,
                "note": note.note_finale,
                "certitude": note.certitude,
                "valide": note.valide,
            }
            for note, etu in notes
        ]
    }
