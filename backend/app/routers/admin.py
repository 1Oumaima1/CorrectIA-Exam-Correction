from fastapi import APIRouter, Depends, HTTPException, Form, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.database import SessionLocal
from app import models
from app.auth import hash_password, verify_password
from app.utils import log_activity

router = APIRouter(prefix="/admin", tags=["Admin"])
templates = Jinja2Templates(directory="templates")


# =====================================================
# DB DEPENDENCY
# =====================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# LOGIN ADMIN
# =====================================================
@router.get("/login")
def admin_login_page(request: Request):
    return templates.TemplateResponse(
        "admin_login.html",
        {"request": request}
    )


@router.post("/login/form")
def admin_login_form(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    admin = db.query(models.Admin).filter(
        models.Admin.email == email
    ).first()

    if not admin or not verify_password(password, admin.password_hash):
        return templates.TemplateResponse(
            "admin_login.html",
            {
                "request": request,
                "error": "Email ou mot de passe incorrect"
            }
        )

    return RedirectResponse("/admin/dashboard", status_code=303)


# =====================================================
# DASHBOARD
# =====================================================
@router.get("/dashboard")
def admin_dashboard(request: Request, db: Session = Depends(get_db)):
    professeurs = db.query(models.Professeur).all()
    etudiants = db.query(models.Etudiant).all()
    filieres = db.query(models.Filiere).all()
    classes = db.query(models.Classe).all()

    return templates.TemplateResponse(
        "admin_dashboard.html",
        {
            "request": request,
            "professeurs": professeurs,
            "etudiants": etudiants,
            "filieres": filieres,
            "classes": classes
        }
    )


# =====================================================
# FILIERE
# =====================================================
@router.get("/filiere/create")
def show_create_filiere_form(request: Request):
    return templates.TemplateResponse("create_filiere.html", {"request": request})

@router.post("/filiere/create")
def create_filiere(request: Request, nom: str = Form(...), db: Session = Depends(get_db)):
    nom = nom.strip().upper()
    if db.query(models.Filiere).filter_by(nom=nom).first():
        return templates.TemplateResponse(
            "admin_dashboard.html",
            {
                "request": request,
                "error": "Filière déjà existante",
                "professeurs": db.query(models.Professeur).all(),
                "etudiants": db.query(models.Etudiant).all(),
                "filieres": db.query(models.Filiere).all(),
                "classes": db.query(models.Classe).all(),
            }
        )

    filiere = models.Filiere(nom=nom)
    db.add(filiere)
    log_activity(db, "filiere", f"Nouvelle filière créée : {nom}")
    db.commit()
    return RedirectResponse("/admin/dashboard", status_code=303)

# =====================================================
# LISTE DES FILIERES
# =====================================================
@router.get("/filieres")
def list_filieres(request: Request, db: Session = Depends(get_db)):
    filieres = db.query(models.Filiere).all()
    # Charger les classes pour chaque filière
    for filiere in filieres:
        # Cette ligne assure que les classes sont chargées
        db.refresh(filiere)

    return templates.TemplateResponse(
        "list_filieres.html",
        {
            "request": request,
            "filieres": filieres
        }
    )
    
from fastapi import APIRouter, Depends, HTTPException, Form, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime

from app.database import SessionLocal
from app import models
from app.auth import hash_password, verify_password

router = APIRouter(prefix="/admin", tags=["Admin"])
templates = Jinja2Templates(directory="templates")


# =====================================================
# DB DEPENDENCY
# =====================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# LOGIN ADMIN
# =====================================================
@router.get("/login")
def admin_login_page(request: Request):
    return templates.TemplateResponse(
        "admin_login.html",
        {"request": request}
    )


@router.post("/login/form")
def admin_login_form(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    admin = db.query(models.Admin).filter(
        models.Admin.email == email
    ).first()

    if not admin or not verify_password(password, admin.password_hash):
        return templates.TemplateResponse(
            "admin_login.html",
            {
                "request": request,
                "error": "Email ou mot de passe incorrect"
            }
        )

    return RedirectResponse("/admin/dashboard", status_code=303)


# =====================================================
# DASHBOARD
# =====================================================
@router.get("/dashboard")
def admin_dashboard(request: Request, db: Session = Depends(get_db)):
    professeurs = db.query(models.Professeur).all()
    etudiants = db.query(models.Etudiant).all()
    filieres = db.query(models.Filiere).all()
    classes = db.query(models.Classe).all()

    return templates.TemplateResponse(
        "admin_dashboard.html",
        {
            "request": request,
            "professeurs": professeurs,
            "etudiants": etudiants,
            "filieres": filieres,
            "classes": classes
        }
    )


# =====================================================
# FILIERE - CREATE
# =====================================================
@router.get("/filiere/create")
def show_create_filiere_form(request: Request):
    return templates.TemplateResponse("create_filiere.html", {"request": request})

@router.post("/filiere/create")
def create_filiere(request: Request, nom: str = Form(...), db: Session = Depends(get_db)):
    nom = nom.strip().upper()
    if db.query(models.Filiere).filter_by(nom=nom).first():
        return templates.TemplateResponse(
            "admin_dashboard.html",
            {
                "request": request,
                "error": "Filière déjà existante",
                "professeurs": db.query(models.Professeur).all(),
                "etudiants": db.query(models.Etudiant).all(),
                "filieres": db.query(models.Filiere).all(),
                "classes": db.query(models.Classe).all(),
            }
        )

    filiere = models.Filiere(nom=nom)
    db.add(filiere)
    db.commit()
    return RedirectResponse("/admin/dashboard", status_code=303)


# =====================================================
# LISTE DES FILIERES
# =====================================================
@router.get("/filieres")
def list_filieres(request: Request, db: Session = Depends(get_db)):
    filieres = db.query(models.Filiere).all()
    # Charger les classes pour chaque filière
    for filiere in filieres:
        # Cette ligne assure que les classes sont chargées
        filiere.classes  # Cette instruction force le chargement
    
    return templates.TemplateResponse(
        "list_filieres.html",
        {
            "request": request,
            "filieres": filieres
        }
    )


# =====================================================
# FILIERE - EDIT
# =====================================================
@router.get("/filiere/{id}/edit")
def edit_filiere_page(id: int, request: Request, db: Session = Depends(get_db)):
    filiere = db.query(models.Filiere).filter(models.Filiere.id == id).first()
    
    if not filiere:
        raise HTTPException(status_code=404, detail="Filière non trouvée")
    
    # Récupérer les classes associées
    classes = db.query(models.Classe).filter(models.Classe.filiere_id == id).all()
    
    return templates.TemplateResponse(
        "edit_filiere.html",
        {
            "request": request,
            "filiere": filiere,
            "classes": classes
        }
    )
@router.post("/filiere/{id}/update")
def update_filiere(
    id: int,
    request: Request,
    nom: str = Form(...),
    db: Session = Depends(get_db)
):
    filiere = db.query(models.Filiere).filter(models.Filiere.id == id).first()
    
    if not filiere:
        raise HTTPException(status_code=404, detail="Filière non trouvée")
    
    nom = nom.strip().upper()
    
    # Validation
    if not nom:
        return templates.TemplateResponse(
            "edit_filiere.html",
            {
                "request": request,
                "filiere": filiere,
                "error": "Le nom de la filière est obligatoire"
            }
        )
    
    # Vérifier si le nom existe déjà (sauf pour la filière actuelle)
    existing_filiere = db.query(models.Filiere).filter(
        models.Filiere.nom == nom,
        models.Filiere.id != id
    ).first()
    
    if existing_filiere:
        return templates.TemplateResponse(
            "edit_filiere.html",
            {
                "request": request,
                "filiere": filiere,
                "error": "Une filière avec ce nom existe déjà"
            }
        )
    
    try:
        # Mettre à jour la filière
        filiere.nom = nom
        db.commit()
        
        return RedirectResponse("/admin/filieres?success=Filière modifiée avec succès", status_code=303)
        
    except Exception as e:
        db.rollback()
        return templates.TemplateResponse(
            "edit_filiere.html",
            {
                "request": request,
                "filiere": filiere,
                "error": f"Erreur lors de la modification : {str(e)}"
            }
        )

# FILIERE - DELETE
# =====================================================
@router.post("/filiere/{id}/delete")
def delete_filiere(id: int, db: Session = Depends(get_db)):
    filiere = db.query(models.Filiere).filter(models.Filiere.id == id).first()
    
    if not filiere:
        raise HTTPException(status_code=404, detail="Filière non trouvée")
    
    try:
        # Vérifier s'il y a des classes associées
        if filiere.classes:
            # Désassocier les classes (mettre filiere_id à NULL)
            for classe in filiere.classes:
                classe.filiere_id = None
                db.add(classe)
        
        db.delete(filiere)
        db.commit()
        
        return RedirectResponse("/admin/filieres?success=Filière supprimée avec succès", status_code=303)
        
    except Exception as e:
        db.rollback()
        return RedirectResponse(f"/admin/filieres?error=Erreur lors de la suppression : {str(e)}", status_code=303)

# =====================================================
# CLASSE
# =====================================================
@router.get("/classe/create")
def show_create_classe_form(request: Request, db: Session = Depends(get_db)):
    # Récupérer toutes les filières pour le formulaire
    filieres = db.query(models.Filiere).all()
    return templates.TemplateResponse("create_classe.html", {
        "request": request,
        "filieres": filieres
    })
    
@router.post("/classe/create")
def create_classe(
    request: Request,
    nom: str = Form(...),
    niveau: int = Form(...),
    filiere_id: int = Form(...),
    db: Session = Depends(get_db)
):
    if not db.get(models.Filiere, filiere_id):
        raise HTTPException(status_code=404, detail="Filière introuvable")

    classe = models.Classe(nom=nom.strip().upper(), niveau=niveau, filiere_id=filiere_id)
    db.add(classe)
    log_activity(db, "classe", f"Nouvelle classe créée : {classe.nom}")
    db.commit()
    return RedirectResponse("/admin/dashboard", status_code=303)


# =====================================================
# PROFESSEUR
# =====================================================
@router.get("/create_professeur")
def create_professeur_page(request: Request):
    return templates.TemplateResponse("create_professeur.html", {"request": request})


@router.post("/professeur/form")
def create_professeur(
    request: Request,
    nom: str = Form(...),
    prenom: str = Form(...),
    date_naissance: str = Form(...),
    specialite: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    if db.query(models.Professeur).filter_by(email=email).first():
        return templates.TemplateResponse(
            "create_professeur.html",
            {"request": request, "error": "Email déjà utilisé"}
        )

    professeur = models.Professeur(
        nom=nom.strip(),
        prenom=prenom.strip(),
        date_naissance=datetime.strptime(date_naissance, "%Y-%m-%d"),
        specialite=specialite.strip(),
        email=email,
        password_hash=hash_password(password)
    )

    db.add(professeur)
    log_activity(db, "professeur", f"Nouveau professeur ajouté : {professeur.prenom} {professeur.nom}")
    db.commit()
    return RedirectResponse("/admin/dashboard", status_code=303)

# LISTE DES PROFESSEURS
# =====================================================
@router.get("/professeurs")
def list_professeurs(request: Request, db: Session = Depends(get_db)):
    professeurs = db.query(models.Professeur).all()
    
    # Charger les classes pour chaque professeur
    for professeur in professeurs:
        # Force le chargement des classes associées
        professeur.classes
    
    return templates.TemplateResponse(
        "list_professeurs.html",
        {
            "request": request,
            "professeurs": professeurs
        }
    )
# =====================================================
# ETUDIANT
# =====================================================
@router.get("/create_etudiant")
def create_etudiant_page(request: Request, db: Session = Depends(get_db)):
    classes = db.query(models.Classe).all()
    return templates.TemplateResponse("create_etudiant.html", {"request": request, "classes": classes})


@router.post("/etudiant/form")
def create_etudiant(
    request: Request,
    nom: str = Form(...),
    prenom: str = Form(...),
    date_naissance: str = Form(...),
    cne: str = Form(...),
    classe_id: int = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    if db.query(models.Etudiant).filter_by(email=email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    if db.query(models.Etudiant).filter_by(cne=cne).first():
        raise HTTPException(status_code=400, detail="CNE déjà utilisé")
    if not db.get(models.Classe, classe_id):
        raise HTTPException(status_code=404, detail="Classe introuvable")

    etudiant = models.Etudiant(
        nom=nom.strip(),
        prenom=prenom.strip(),
        date_naissance=datetime.strptime(date_naissance, "%Y-%m-%d"),
        cne=cne,
        classe_id=classe_id,
        email=email,
        password_hash=hash_password(password)
    )
    db.add(etudiant)
    log_activity(db, "etudiant", f"Nouvel étudiant inscrit : {etudiant.prenom} {etudiant.nom}")
    db.commit()
    return RedirectResponse("/admin/dashboard", status_code=303)


# =====================================================
# EDIT PROFESSEUR
# =====================================================
@router.get("/professeur/edit/{id}")
def edit_professeur_page(id: int, request: Request, db: Session = Depends(get_db)):
    professeur = db.get(models.Professeur, id)
    if not professeur:
        raise HTTPException(status_code=404, detail="Professeur non trouvé")
    return templates.TemplateResponse("edit_professeur.html", {"request": request, "professeur": professeur})


@router.post("/professeur/edit/{id}")
def edit_professeur(
    id: int,
    nom: str = Form(...),
    prenom: str = Form(...),
    date_naissance: str = Form(...),
    specialite: str = Form(...),
    email: str = Form(...),
    password: str = Form(""),
    db: Session = Depends(get_db)
):
    professeur = db.get(models.Professeur, id)
    if not professeur:
        raise HTTPException(status_code=404, detail="Professeur non trouvé")

    professeur.nom = nom.strip()
    professeur.prenom = prenom.strip()
    professeur.date_naissance = datetime.strptime(date_naissance, "%Y-%m-%d")
    professeur.specialite = specialite.strip()
    professeur.email = email
    if password:
        professeur.password_hash = hash_password(password)

    db.commit()
    return RedirectResponse("/admin/dashboard", status_code=303)


# =====================================================
# EDIT ETUDIANT
# =====================================================
@router.get("/etudiant/edit/{id}")
def edit_etudiant_page(id: int, request: Request, db: Session = Depends(get_db)):
    etudiant = db.get(models.Etudiant, id)
    classes = db.query(models.Classe).all()
    if not etudiant:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    return templates.TemplateResponse("edit_etudiant.html", {"request": request, "etudiant": etudiant, "classes": classes})


@router.post("/etudiant/edit/{id}")
def edit_etudiant(
    id: int,
    nom: str = Form(...),
    prenom: str = Form(...),
    date_naissance: str = Form(...),
    cne: str = Form(...),
    classe_id: int = Form(...),
    email: str = Form(...),
    password: str = Form(""),
    db: Session = Depends(get_db)
):
    etudiant = db.get(models.Etudiant, id)
    if not etudiant:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")

    etudiant.nom = nom.strip()
    etudiant.prenom = prenom.strip()
    etudiant.date_naissance = datetime.strptime(date_naissance, "%Y-%m-%d")
    etudiant.cne = cne
    etudiant.classe_id = classe_id
    etudiant.email = email
    if password:
        etudiant.password_hash = hash_password(password)

    db.commit()
    return RedirectResponse("/admin/dashboard", status_code=303)
# =====================================================
# LISTE DES ÉTUDIANTS
# =====================================================
@router.get("/etudiants")
def list_etudiants(request: Request, db: Session = Depends(get_db)):
    etudiants = db.query(models.Etudiant).all()
    
    # Charger la classe pour chaque étudiant
    for etudiant in etudiants:
        etudiant.classe  # Force le chargement de la classe
        if etudiant.classe:
            etudiant.classe.filiere  # Force le chargement de la filière
    
    return templates.TemplateResponse(
        "list_etudiants.html",
        {
            "request": request,
            "etudiants": etudiants
        }
    )


# =====================================================
# SUPPRIMER ÉTUDIANT
# =====================================================
@router.post("/etudiant/{id}/delete")
def delete_etudiant(id: int, db: Session = Depends(get_db)):
    etudiant = db.query(models.Etudiant).filter(models.Etudiant.id == id).first()
    if not etudiant:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    try:
        db.delete(etudiant)
        db.commit()
        return RedirectResponse("/admin/etudiants?success=Étudiant supprimé avec succès", status_code=303)
    except Exception as e:
        db.rollback()
        return RedirectResponse(f"/admin/etudiants?error=Erreur lors de la suppression : {str(e)}", status_code=303)

# =====================================================
# LIAISON PROFESSEUR ↔ CLASSES
# =====================================================
@router.get("/professeur/{professeur_id}/classes")
def professeur_classes_page(professeur_id: int, request: Request, db: Session = Depends(get_db)):
    professeur = db.get(models.Professeur, professeur_id)
    all_classes = db.query(models.Classe).all()
    if not professeur:
        raise HTTPException(status_code=404, detail="Professeur non trouvé")
    return templates.TemplateResponse("professeur_classes.html", {"request": request, "professeur": professeur, "classes": all_classes})


@router.post("/professeur/{professeur_id}/classes")
def assign_classes_to_professeur(
    professeur_id: int,
    classes_ids: list[int] = Form(...),
    db: Session = Depends(get_db)
):
    professeur = db.get(models.Professeur, professeur_id)
    if not professeur:
        raise HTTPException(status_code=404, detail="Professeur non trouvé")

    # Reset classes
    professeur.classes = []
    for class_id in classes_ids:
        classe = db.get(models.Classe, class_id)
        if classe:
            professeur.classes.append(classe)

    db.commit()
    return RedirectResponse("/admin/dashboard", status_code=303)
