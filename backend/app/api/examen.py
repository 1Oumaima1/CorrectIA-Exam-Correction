from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os, re, shutil, json
from app.database import SessionLocal
from app import models
from .auth import get_current_user
from scripts.process_corrige_prof import process_corrige_prof
from scripts.generate_students_json import generate_students_json
from scripts.compare_answers_HF import correct_exam

router = APIRouter()

UPLOAD_EXAMENS = "uploads/examens"
UPLOAD_CORRIGES = "uploads/corriges"
UPLOAD_COPIES = "uploads/copies"

os.makedirs(UPLOAD_EXAMENS, exist_ok=True)
os.makedirs(UPLOAD_CORRIGES, exist_ok=True)
os.makedirs(UPLOAD_COPIES, exist_ok=True)


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


def extract_cne_from_filename(filename: str):
    if not filename:
        return None

    stem = os.path.splitext(os.path.basename(filename))[0]
    if not stem:
        return None

    for token in re.split(r"[^A-Za-z0-9]+", stem):
        if re.fullmatch(r"(?i)[A-Z]\d{9}", token):
            return token.upper()

    match = re.search(r"(?i)([A-Z]\d{9})", stem)
    if match:
        return match.group(1).upper()

    return None


@router.post("/creer")
async def creer_examen(
    titre: str = Form(...),
    module: str = Form(...),
    semestre: str = Form(...),
    classes: List[int] = Form(...),
    pdf: UploadFile = File(...),
    db: Session = Depends(get_db),
    current=Depends(require_professeur)
):
    prof_id = current["user"].id

    if not pdf.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Le fichier doit être un PDF")

    pdf_path = os.path.join(UPLOAD_EXAMENS, f"{prof_id}_{pdf.filename}")
    with open(pdf_path, "wb") as f:
        shutil.copyfileobj(pdf.file, f)

    examen = models.Examen(
        titre=titre,
        module=module,
        semestre=semestre,
        pdf_path=pdf_path,
        professeur_id=prof_id
    )
    db.add(examen)
    db.commit()
    db.refresh(examen)

    for classe_id in classes:
        classe = db.get(models.Classe, classe_id)
        if classe:
            examen.classes.append(classe)
    db.commit()

    return {"id": examen.id, "titre": examen.titre, "message": "Examen créé avec succès"}


@router.post("/{examen_id}/upload-correction")
async def upload_correction(
    examen_id: int,
    corrige: UploadFile = File(...),
    copies: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current=Depends(require_professeur)
):
    prof_id = current["user"].id
    examen = db.query(models.Examen).filter_by(id=examen_id, professeur_id=prof_id).first()
    if not examen:
        raise HTTPException(status_code=404, detail="Examen introuvable")

    corrige_path = f"{UPLOAD_CORRIGES}/{examen_id}_{corrige.filename}"
    with open(corrige_path, "wb") as f:
        shutil.copyfileobj(corrige.file, f)
    examen.corrige_path = corrige_path
    db.commit()

    saved_copies = []
    saved_copy_paths = []
    for file in copies:
        cne = extract_cne_from_filename(file.filename)
        if not cne:
            continue

        etudiant = db.query(models.Etudiant).filter_by(cne=cne).first()
        if not etudiant:
            continue

        filename = f"{examen_id}_{etudiant.id}_{file.filename}"
        path = os.path.join(UPLOAD_COPIES, filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        copie = models.Copie(etudiant_id=etudiant.id, examen_id=examen_id, pdf_path=path)
        db.add(copie)
        saved_copies.append(cne)
        saved_copy_paths.append(path)
    db.commit()

    if not saved_copies:
        raise HTTPException(
            status_code=400,
            detail="Aucune copie étudiante valide n'a été associée à un CNE connu. Vérifiez les noms de fichiers envoyés."
        )

    os.makedirs("uploads/json", exist_ok=True)
    try:
        corrige_json_path = process_corrige_prof(corrige_path, examen.module, examen.id)
        with open(corrige_json_path, encoding="utf-8") as f:
            corrige_payload = json.load(f)

        if not corrige_payload.get("questions"):
            raise HTTPException(
                status_code=400,
                detail="Le corrigé ne contient aucune question exploitable. Vérifiez le format du PDF (Question X + points)."
            )

        students_json_path = generate_students_json(
            UPLOAD_COPIES,
            examen.module,
            examen.id,
            copy_paths=saved_copy_paths,
        )
        correct_exam(corrige_json_path, students_json_path)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Échec de la correction IA: {str(exc)}"
        ) from exc

    return {
        "message": "Correction uploadée et évaluée avec succès",
        "copies_traitées": saved_copies
    }


@router.get("/{examen_id}")
async def get_examen(
    examen_id: int,
    db: Session = Depends(get_db),
    current=Depends(require_professeur)
):
    """Récupérer les détails d'un examen."""
    prof_id = current["user"].id
    examen = db.query(models.Examen).filter_by(id=examen_id, professeur_id=prof_id).first()
    if not examen:
        raise HTTPException(status_code=404, detail="Examen introuvable")
    
    return {
        "id": examen.id,
        "titre": examen.titre,
        "module": examen.module,
        "semestre": examen.semestre,
        "pdf_path": examen.pdf_path,
        "corrige_path": examen.corrige_path,
        "classes": [{"id": c.id, "nom": c.nom} for c in examen.classes]
    }


@router.put("/{examen_id}")
async def update_examen(
    examen_id: int,
    titre: str = Form(...),
    module: str = Form(...),
    semestre: str = Form(...),
    classes: List[int] = Form(...),
    db: Session = Depends(get_db),
    current=Depends(require_professeur)
):
    """Mettre à jour un examen (titre, module, semestre, classes)."""
    prof_id = current["user"].id
    examen = db.query(models.Examen).filter_by(id=examen_id, professeur_id=prof_id).first()
    if not examen:
        raise HTTPException(status_code=404, detail="Examen introuvable")
    
    # Mettre à jour les champs
    examen.titre = titre
    examen.module = module
    examen.semestre = semestre
    
    # Mettre à jour les classes
    examen.classes.clear()
    for classe_id in classes:
        classe = db.get(models.Classe, classe_id)
        if classe:
            examen.classes.append(classe)
    
    db.commit()
    db.refresh(examen)
    
    return {
        "id": examen.id,
        "titre": examen.titre,
        "message": "Examen modifié avec succès"
    }


@router.delete("/{examen_id}")
async def delete_examen(
    examen_id: int,
    db: Session = Depends(get_db),
    current=Depends(require_professeur)
):
    """Supprimer un examen et toutes ses données associées."""
    prof_id = current["user"].id
    examen = db.query(models.Examen).filter_by(id=examen_id, professeur_id=prof_id).first()
    if not examen:
        raise HTTPException(status_code=404, detail="Examen introuvable")
    
    # Supprimer les fichiers PDF associés
    if examen.pdf_path and os.path.exists(examen.pdf_path):
        try:
            os.remove(examen.pdf_path)
        except:
            pass
    
    if examen.corrige_path and os.path.exists(examen.corrige_path):
        try:
            os.remove(examen.corrige_path)
        except:
            pass
    
    # Supprimer les copies
    copies = db.query(models.Copie).filter_by(examen_id=examen_id).all()
    for copie in copies:
        if copie.pdf_path and os.path.exists(copie.pdf_path):
            try:
                os.remove(copie.pdf_path)
            except:
                pass
        db.delete(copie)
    
    # Supprimer les notes
    notes = db.query(models.Note).filter_by(examen_id=examen_id).all()
    for note in notes:
        db.delete(note)
    
    # Supprimer les fichiers JSON générés
    try:
        corrige_json = f"uploads/json/{examen_id}_corrige.json"
        students_json = f"uploads/json/{examen_id}_students.json"
        if os.path.exists(corrige_json):
            os.remove(corrige_json)
        if os.path.exists(students_json):
            os.remove(students_json)
    except:
        pass
    
    # Supprimer l'examen
    db.delete(examen)
    db.commit()
    
    return {"message": "Examen supprimé avec succès"}
