"""
API REST pour le frontend React - Professeur & Étudiant
"""
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from app.database import SessionLocal
from app import models
from app.auth import verify_password
from pydantic import BaseModel
from typing import List
import os, shutil

router_prof = APIRouter(prefix="/api/professeur", tags=["API Professeur"])
router_etu = APIRouter(prefix="/api/etudiant", tags=["API Étudiant"])

UPLOAD_EXAMENS = "uploads/examens"
UPLOAD_CORRIGES = "uploads/corriges"
UPLOAD_COPIES = "uploads/copies"
for d in [UPLOAD_EXAMENS, UPLOAD_CORRIGES, UPLOAD_COPIES]:
    os.makedirs(d, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ========== SCHEMAS ==========
class ProfLoginSchema(BaseModel):
    email: str
    password: str


class EtuLoginSchema(BaseModel):
    email: str
    password: str


# ========== PROFESSEUR AUTH ==========
@router_prof.post("/login")
def prof_login(data: ProfLoginSchema, request: Request, db: Session = Depends(get_db)):
    prof = db.query(models.Professeur).filter(models.Professeur.email == data.email).first()
    if not prof or not verify_password(data.password, prof.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    request.session["professeur_id"] = prof.id
    return {"success": True, "professeur": {
        "id": prof.id, "nom": prof.nom, "prenom": prof.prenom,
        "email": prof.email, "specialite": prof.specialite
    }}


@router_prof.post("/logout")
def prof_logout(request: Request):
    request.session.pop("professeur_id", None)
    return {"success": True}


@router_prof.get("/me")
def prof_me(request: Request, db: Session = Depends(get_db)):
    prof_id = request.session.get("professeur_id")
    if not prof_id:
        raise HTTPException(status_code=401)
    prof = db.get(models.Professeur, prof_id)
    if not prof:
        raise HTTPException(status_code=404)
    return {
        "id": prof.id, "nom": prof.nom, "prenom": prof.prenom,
        "email": prof.email, "specialite": prof.specialite,
        "classes": [{"id": c.id, "nom": c.nom} for c in prof.classes]
    }


# ========== EXAMENS DU PROFESSEUR ==========
@router_prof.get("/examens")
def prof_examens(request: Request, db: Session = Depends(get_db)):
    prof_id = request.session.get("professeur_id")
    if not prof_id:
        raise HTTPException(status_code=401)
    examens = db.query(models.Examen).filter(models.Examen.professeur_id == prof_id).all()
    return [{
        "id": e.id, "titre": e.titre, "module": e.module,
        "semestre": e.semestre, "pdf_path": e.pdf_path,
        "corrige_path": e.corrige_path,
        "classes": [{"id": c.id, "nom": c.nom} for c in e.classes],
        "nb_copies": db.query(models.Copie).filter(models.Copie.examen_id == e.id).count(),
        "nb_notes": db.query(models.Note).filter(models.Note.examen_id == e.id).count()
    } for e in examens]


@router_prof.post("/examens")
async def prof_create_examen(
    request: Request,
    titre: str = Form(...),
    module: str = Form(...),
    semestre: str = Form(...),
    classes: List[int] = Form(...),
    pdf: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    prof_id = request.session.get("professeur_id")
    if not prof_id:
        raise HTTPException(status_code=401)
    if not pdf.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Le fichier doit être un PDF")

    pdf_path = os.path.join(UPLOAD_EXAMENS, f"{prof_id}_{pdf.filename}")
    with open(pdf_path, "wb") as f:
        shutil.copyfileobj(pdf.file, f)

    examen = models.Examen(
        titre=titre, module=module, semestre=semestre,
        pdf_path=pdf_path, professeur_id=prof_id
    )
    db.add(examen)
    db.commit()
    db.refresh(examen)

    for classe_id in classes:
        classe = db.get(models.Classe, classe_id)
        if classe:
            examen.classes.append(classe)
    db.commit()

    return {"id": examen.id, "titre": examen.titre, "module": examen.module,
            "semestre": examen.semestre, "success": True}


@router_prof.get("/examens/{examen_id}/resultats")
def prof_resultats(examen_id: int, request: Request, db: Session = Depends(get_db)):
    prof_id = request.session.get("professeur_id")
    if not prof_id:
        raise HTTPException(status_code=401)
    examen = db.query(models.Examen).filter_by(id=examen_id, professeur_id=prof_id).first()
    if not examen:
        raise HTTPException(status_code=404)
    notes = db.query(models.Note).filter_by(examen_id=examen_id).all()
    return {
        "examen": {"id": examen.id, "titre": examen.titre, "module": examen.module},
        "resultats": [{
            "etudiant_id": n.etudiant_id,
            "etudiant_nom": n.etudiant.nom if n.etudiant else None,
            "etudiant_prenom": n.etudiant.prenom if n.etudiant else None,
            "note_finale": n.note_finale,
            "certitude": n.certitude,
            "valide": n.valide
        } for n in notes]
    }


# ========== UPLOAD EXAM + CORRECTION ==========
@router_prof.post("/examens/{exam_id}/upload")
async def upload_and_correct(
    exam_id: int, request: Request,
    module: str = Form(...),
    corrige: UploadFile = File(...),
    copies: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    prof_id = request.session.get("professeur_id")
    if not prof_id:
        raise HTTPException(status_code=401)
    examen = db.query(models.Examen).filter_by(id=exam_id, professeur_id=prof_id).first()
    if not examen:
        raise HTTPException(status_code=404)

    corrige_path = f"{UPLOAD_CORRIGES}/{exam_id}_{corrige.filename}"
    with open(corrige_path, "wb") as f:
        shutil.copyfileobj(corrige.file, f)
    examen.corrige_path = corrige_path
    db.commit()

    saved = 0
    for file in copies:
        cne = os.path.splitext(file.filename)[0]
        etudiant = db.query(models.Etudiant).filter_by(cne=cne).first()
        if not etudiant:
            continue
        path = f"{UPLOAD_COPIES}/{exam_id}_{etudiant.id}_{file.filename}"
        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        copie = models.Copie(etudiant_id=etudiant.id, examen_id=exam_id, pdf_path=path)
        db.add(copie)
        saved += 1
    db.commit()

    # Lance la correction AI
    try:
        from scripts.process_corrige_prof import process_corrige_prof
        from scripts.generate_students_json import generate_students_json
        from scripts.compare_answers_HF import correct_exam
        os.makedirs("uploads/json", exist_ok=True)
        corrige_json = process_corrige_prof(corrige_path, module, exam_id)
        students_json = generate_students_json(UPLOAD_COPIES, module, exam_id)
        correct_exam(corrige_json, students_json)
        return {"success": True, "copies_saved": saved, "correction": "lancée"}
    except Exception as e:
        return {"success": True, "copies_saved": saved, "correction": f"erreur: {str(e)}"}


# ========== ÉTUDIANT AUTH ==========
@router_etu.post("/login")
def etu_login(data: EtuLoginSchema, request: Request, db: Session = Depends(get_db)):
    etu = db.query(models.Etudiant).filter(models.Etudiant.email == data.email).first()
    if not etu or not verify_password(data.password, etu.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    request.session["etudiant_id"] = etu.id
    return {"success": True, "etudiant": {
        "id": etu.id, "nom": etu.nom, "prenom": etu.prenom,
        "email": etu.email, "cne": etu.cne,
        "classe": etu.classe.nom if etu.classe else None
    }}


@router_etu.post("/logout")
def etu_logout(request: Request):
    request.session.pop("etudiant_id", None)
    return {"success": True}


@router_etu.get("/me")
def etu_me(request: Request, db: Session = Depends(get_db)):
    etu_id = request.session.get("etudiant_id")
    if not etu_id:
        raise HTTPException(status_code=401)
    etu = db.get(models.Etudiant, etu_id)
    if not etu:
        raise HTTPException(status_code=404)
    return {
        "id": etu.id, "nom": etu.nom, "prenom": etu.prenom,
        "email": etu.email, "cne": etu.cne,
        "classe": etu.classe.nom if etu.classe else None,
        "filiere": etu.classe.filiere.nom if (etu.classe and etu.classe.filiere) else None
    }


@router_etu.get("/resultats")
def etu_resultats(request: Request, db: Session = Depends(get_db)):
    etu_id = request.session.get("etudiant_id")
    if not etu_id:
        raise HTTPException(status_code=401)
    notes = (
        db.query(models.Note, models.Examen)
        .join(models.Examen, models.Note.examen_id == models.Examen.id)
        .filter(models.Note.etudiant_id == etu_id)
        .all()
    )
    return [{
        "note_id": n.id,
        "note_finale": n.note_finale,
        "certitude": n.certitude,
        "valide": n.valide,
        "examen_id": e.id,
        "examen_titre": e.titre,
        "module": e.module,
        "semestre": e.semestre
    } for n, e in notes]
