import json
from typing import List
from fastapi import APIRouter, Request, Depends, Form, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from scripts import generate_students_json, process_corrige_prof
from sqlalchemy.orm import Session, joinedload
from datetime import date
import os
import shutil
from app.database import SessionLocal
from app import models
from scripts.process_corrige_prof import process_corrige_prof
from scripts.generate_students_json import generate_students_json
from fastapi.responses import JSONResponse
from scripts.compare_answers_HF import correct_exam

router = APIRouter(prefix="/examen", tags=["Examen"])
templates = Jinja2Templates(directory="templates")

# ======================
# DB Dependency
# ======================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ======================
# DOSSIERS UPLOAD
# ======================
UPLOAD_EXAMENS = "uploads/examens"
UPLOAD_CORRIGES = "uploads/corriges"
UPLOAD_ETUDIANTS = "uploads/copies"

os.makedirs(UPLOAD_EXAMENS, exist_ok=True)
os.makedirs(UPLOAD_CORRIGES, exist_ok=True)
os.makedirs(UPLOAD_ETUDIANTS, exist_ok=True)
# ======================
# GET : afficher formulaire
# ======================
@router.get("/creer", response_class=HTMLResponse)
def creer_examen_page(request: Request, db: Session = Depends(get_db)):
    # AJOUTEZ TOUT CE CODE :
    # Récupérer le professeur connecté depuis la session
    professeur_id = request.session.get("professeur_id")
    if not professeur_id:
        return RedirectResponse("/professeur/login", status_code=303)
    # Récupérer le professeur avec ses classes
    professeur = db.query(models.Professeur)\
        .options(joinedload(models.Professeur.classes))\
        .filter(models.Professeur.id == professeur_id)\
        .first()
    if not professeur:
        return RedirectResponse("/professeur/login", status_code=303)
    # Récupérer les classes du professeur
    classes = professeur.classes
    # MODIFIEZ le return pour ajouter "classes" :
    return templates.TemplateResponse(
        "creer_examen.html",
        {
            "request": request,
            "classes": classes
        }
    )

# ======================
# POST : créer examen
# ======================
@router.post("/create")
async def creer_examen(
    # AJOUTEZ CES PARAMÈTRES :
    request: Request,  # ← AJOUTEZ
    titre: str = Form(...),
    module: str = Form(...),
    semestre: str = Form(...),
    classes: list[int] = Form(...),  # ← AJOUTEZ CE PARAMÈTRE
    pdf: UploadFile = File(...),  # ← CHANGEZ "fichier_questions" en "pdf"
    db: Session = Depends(get_db)
):
    # MODIFIEZ le début de la fonction :
    # Récupérer le professeur connecté depuis la session
    professeur_id = request.session.get("professeur_id")
    if not professeur_id:
        return RedirectResponse("/professeur/login", status_code=303)
    professeur = db.query(models.Professeur).filter(models.Professeur.id == professeur_id).first()
    if not professeur:
        return HTMLResponse("Professeur non trouvé", status_code=400)
    # Vérifier que le fichier est un PDF
    if not pdf.filename.lower().endswith('.pdf'):
        return HTMLResponse("Le fichier doit être un PDF", status_code=400)
    # MODIFIEZ la sauvegarde des fichiers :
    questions_path = os.path.join(UPLOAD_EXAMENS, pdf.filename)  # ← CHANGEZ "fichier_questions" en "pdf"
    with open(questions_path, "wb") as buffer:
        shutil.copyfileobj(pdf.file, buffer)  # ← CHANGEZ "fichier_questions" en "pdf"
    # MODIFIEZ la création de l'examen :
    examen = models.Examen(
        titre=titre,
        module=module,
        semestre=semestre,
        pdf_path=questions_path,
        professeur_id=professeur.id
    )
    db.add(examen)
    db.commit()
    db.refresh(examen)  # ← AJOUTEZ CETTE LIGNE pour obtenir l'ID
    # AJOUTEZ CE BLOC pour associer les classes :
    for classe_id in classes:
        classe = db.query(models.Classe).filter(models.Classe.id == classe_id).first()
        if classe:
            examen.classes.append(classe)
    db.commit()  # ← AJOUTEZ CETTE LIGNE
    return RedirectResponse(
        url="/professeur/dashboard",
        status_code=303
    )

@router.get("/mes-examens", response_class=HTMLResponse)
def liste_examens_prof(
    request: Request,
    db: Session = Depends(get_db)
):
    professeur_id = request.session.get("professeur_id")

    if not professeur_id:
        return RedirectResponse("/professeur/login", status_code=303)

    examens = db.query(models.Examen).filter(
        models.Examen.professeur_id == professeur_id
    ).all()

    return templates.TemplateResponse(
        "liste_examens.html",
        {
            "request": request,
            "examens": examens
        }
    )
@router.get("/corriger/{examen_id}", response_class=HTMLResponse)
def page_correction(examen_id: int, request: Request, db: Session = Depends(get_db)):
    # Récupérer l'examen
    examen = db.query(models.Examen).filter(models.Examen.id == examen_id).first()
    if not examen:
        return HTMLResponse("Examen introuvable", status_code=404)

    return templates.TemplateResponse(
        "corriger_examen.html",  # ton fichier de formulaire
        {
            "request": request,
            "examen": examen  # on passe l'examen au template
        }
    )

@router.post("/corriger/{examen_id}")
async def importer_copie(
    examen_id: int,
    etudiant_id: int = Form(...),
    fichier_copie: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 🔹 type fichier
    if fichier_copie.content_type == "application/pdf":
        type_fichier = "pdf"
    elif fichier_copie.content_type.startswith("image/"):
        type_fichier = "image"
    else:
        return HTMLResponse("Type de fichier non autorisé", status_code=400)

    # 🔹 chemin
    filename = f"{examen_id}_{etudiant_id}_{fichier_copie.filename}"
    path = os.path.join("uploads/copies", filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(fichier_copie.file, buffer)

    copie = models.Copie(
        examen_id=examen_id,
        etudiant_id=etudiant_id,
        fichier_path=path,
        type_fichier=type_fichier,
        valide=False
    )

    db.add(copie)
    db.commit()

    return RedirectResponse(
        url=f"/examen/corriger/{examen_id}",
        status_code=303
    )
@router.post("/corriger")
def corriger_par_titre(
    titre: str = Form(...),
    db: Session = Depends(get_db)
):
    examen = db.query(models.Examen).filter(
        models.Examen.titre == titre
    ).first()

    if not examen:
        return HTMLResponse("Examen introuvable", status_code=404)

    # 🔐 Redirection interne avec l'id
    return RedirectResponse(
        url=f"/examen/corriger/{examen.id}",
        status_code=303
    )
@router.get("/upload_exam", response_class=HTMLResponse)
def page_upload_exam(request: Request):
    # Vérifier si le professeur est connecté
    professeur_id = request.session.get("professeur_id")
    if not professeur_id:
        return RedirectResponse("/professeur/login", status_code=303)
    
    return templates.TemplateResponse(
        "corriger_examen.html",
        {"request": request}
    )

@router.post("/upload_exam/")
async def upload_exam(
    request: Request,
    module: str = Form(...),
    exam_id: int = Form(...),
    corrige: UploadFile = File(...),
    copies: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    # 🔐 Vérifier session professeur
    professeur_id = request.session.get("professeur_id")
    if not professeur_id:
        return RedirectResponse("/professeur/login", status_code=303)

    # 📌 Vérifier l'examen
    examen = db.query(models.Examen).filter_by(id=exam_id).first()
    if not examen:
        return JSONResponse({"error": "Examen introuvable"}, status_code=404)

    # =============================
    # 📄 Sauvegarder le corrigé PDF
    # =============================
    os.makedirs("uploads/corriges", exist_ok=True)
    corrige_path = f"uploads/corriges/{exam_id}_{corrige.filename}"
    with open(corrige_path, "wb") as f:
        shutil.copyfileobj(corrige.file, f)
    examen.corrige_path = corrige_path
    db.commit()

    # =============================
    # 📑 Traiter les copies étudiantes
    # =============================
    os.makedirs("uploads/copies", exist_ok=True)
    for file in copies:
        # Extraire CNE depuis le nom du fichier (ex: "CNE.pdf")
        cne = os.path.splitext(file.filename)[0]
        etudiant = db.query(models.Etudiant).filter_by(cne=cne).first()
        if not etudiant:
            print(f"⚠️ Étudiant non trouvé pour CNE: {cne}")
            continue

        filename = f"{exam_id}_{etudiant.id}_{file.filename}"
        path = os.path.join("uploads/copies", filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        copie = models.Copie(
            etudiant_id=etudiant.id,
            examen_id=exam_id,
            pdf_path=path
        )
        db.add(copie)
    db.commit()

    # =============================
    # 🧠 Générer JSON et lancer la correction
    # =============================
    os.makedirs("uploads/json", exist_ok=True)

    # Générer fichiers JSON pour le corrigé et les étudiants
    corrige_json_path = process_corrige_prof(corrige_path, module, exam_id)
    students_json_path = generate_students_json("uploads/copies", module, exam_id)

    # Vérifier que les chemins sont bien des strings
    if isinstance(corrige_json_path, dict):
        corrige_json_path = f"uploads/json/{exam_id}_corrige.json"
    if isinstance(students_json_path, dict):
        students_json_path = f"uploads/json/{exam_id}_students.json"

    # Lancer la correction pour cet examen uniquement
    correct_exam(corrige_json_path, students_json_path)

    return JSONResponse({
        "status": "success",
        "message": "Copies insérées, JSON générés et examen corrigé avec succès"
    })

@router.get("/resultats/{examen_id}", response_class=HTMLResponse)
async def examen_resultats(examen_id: int, request: Request, db: Session = Depends(get_db)):
    # 🔐 Vérifier session professeur
    professeur_id = request.session.get("professeur_id")
    if not professeur_id:
        return RedirectResponse("/professeur/login", status_code=303)

    # 🔍 Vérifier examen
    examen = db.query(models.Examen).filter_by(id=examen_id, professeur_id=professeur_id).first()
    if not examen:
        return HTMLResponse("Examen introuvable", status_code=404)

    # 🧾 Récupérer les copies corrigées avec notes et infos étudiants
    copies = (
        db.query(models.Copie, models.Etudiant, models.Note)
        .join(models.Etudiant, models.Copie.etudiant_id == models.Etudiant.id)
        .join(models.Note, (models.Note.etudiant_id == models.Etudiant.id) & (models.Note.examen_id == examen_id))
        .filter(models.Copie.examen_id == examen_id)
        .all()
    )

    return templates.TemplateResponse(
        "resultats_exam.html",
        {
            "request": request,
            "examen": examen,
            "copies": copies
        }
    )