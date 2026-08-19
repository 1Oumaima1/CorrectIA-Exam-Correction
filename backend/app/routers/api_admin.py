"""
API REST pour le frontend React - Admin
Routes sous /api/admin/...
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from app.auth import hash_password, verify_password
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["API Admin"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------- SCHEMAS -----------
class AdminLoginSchema(BaseModel):
    email: str
    password: str


class FiliereCreateSchema(BaseModel):
    nom: str


class ClasseCreateSchema(BaseModel):
    nom: str
    niveau: int
    filiere_id: int


class ClasseUpdateSchema(BaseModel):
    nom: str
    niveau: int
    filiere_id: int


class ProfesseurCreateSchema(BaseModel):
    nom: str
    prenom: str
    date_naissance: str
    specialite: str
    email: str
    password: str
    classes_ids: list[int] = []


class EtudiantCreateSchema(BaseModel):
    nom: str
    prenom: str
    date_naissance: str
    cne: str
    classe_id: int
    email: str
    password: str


class EtudiantUpdateSchema(BaseModel):
    nom: str
    prenom: str
    date_naissance: str
    cne: str
    classe_id: int
    email: str
    password: str | None = None


# ----------- AUTH -----------
@router.post("/login")
def api_admin_login(data: AdminLoginSchema, request: Request, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.email == data.email).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    request.session["admin_id"] = admin.id
    return {"success": True, "admin": {
        "id": admin.id, "nom": admin.nom, "prenom": admin.prenom, "email": admin.email
    }}


@router.post("/logout")
def api_admin_logout(request: Request):
    request.session.pop("admin_id", None)
    return {"success": True}


@router.get("/me")
def api_admin_me(request: Request, db: Session = Depends(get_db)):
    admin_id = request.session.get("admin_id")
    if not admin_id:
        raise HTTPException(status_code=401, detail="Non authentifié")
    admin = db.get(models.Admin, admin_id)
    if not admin:
        raise HTTPException(status_code=404)
    return {"id": admin.id, "nom": admin.nom, "prenom": admin.prenom, "email": admin.email}


# ----------- DASHBOARD STATS -----------
@router.get("/dashboard")
def api_dashboard(request: Request, db: Session = Depends(get_db)):
    admin_id = request.session.get("admin_id")
    if not admin_id:
        raise HTTPException(status_code=401, detail="Non authentifié")
    return {
        "nb_professeurs": db.query(models.Professeur).count(),
        "nb_etudiants": db.query(models.Etudiant).count(),
        "nb_filieres": db.query(models.Filiere).count(),
        "nb_classes": db.query(models.Classe).count(),
        "nb_examens": db.query(models.Examen).count(),
    }


# ----------- FILIERES -----------
@router.get("/filieres")
def api_list_filieres(request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    filieres = db.query(models.Filiere).all()
    return [{"id": f.id, "nom": f.nom, "nb_classes": len(f.classes)} for f in filieres]


@router.post("/filieres")
def api_create_filiere(data: FiliereCreateSchema, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    nom = data.nom.strip().upper()
    if db.query(models.Filiere).filter_by(nom=nom).first():
        raise HTTPException(status_code=400, detail="Filière déjà existante")
    f = models.Filiere(nom=nom)
    db.add(f)
    db.commit()
    db.refresh(f)
    return {"id": f.id, "nom": f.nom, "nb_classes": 0}


@router.put("/filieres/{id}")
def api_update_filiere(id: int, data: FiliereCreateSchema, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    f = db.get(models.Filiere, id)
    if not f:
        raise HTTPException(status_code=404, detail="Filière non trouvée")
    nom = data.nom.strip().upper()
    existing = db.query(models.Filiere).filter(models.Filiere.nom == nom, models.Filiere.id != id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Filière déjà existante")
    f.nom = nom
    db.commit()
    db.refresh(f)
    return {"id": f.id, "nom": f.nom, "nb_classes": len(f.classes)}


@router.delete("/filieres/{id}")
def api_delete_filiere(id: int, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    f = db.query(models.Filiere).filter(models.Filiere.id == id).first()
    if not f:
        raise HTTPException(status_code=404)
    db.delete(f)
    db.commit()
    return {"success": True}


# ----------- CLASSES -----------
@router.get("/classes")
def api_list_classes(request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    classes = db.query(models.Classe).all()
    return [{
        "id": c.id, "nom": c.nom, "niveau": c.niveau,
        "filiere_id": c.filiere_id,
        "filiere_nom": c.filiere.nom if c.filiere else None,
        "nb_etudiants": len(c.etudiants)
    } for c in classes]


@router.post("/classes")
def api_create_classe(data: ClasseCreateSchema, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    if not db.get(models.Filiere, data.filiere_id):
        raise HTTPException(status_code=404, detail="Filière introuvable")
    c = models.Classe(nom=data.nom.strip().upper(), niveau=data.niveau, filiere_id=data.filiere_id)
    db.add(c)
    db.commit()
    db.refresh(c)
    return {
        "id": c.id, "nom": c.nom, "niveau": c.niveau,
        "filiere_id": c.filiere_id,
        "filiere_nom": c.filiere.nom if c.filiere else None,
        "nb_etudiants": 0
    }


@router.put("/classes/{id}")
def api_update_classe(id: int, data: ClasseUpdateSchema, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    c = db.get(models.Classe, id)
    if not c:
        raise HTTPException(status_code=404, detail="Classe non trouvée")
    if not db.get(models.Filiere, data.filiere_id):
        raise HTTPException(status_code=404, detail="Filière introuvable")

    c.nom = data.nom.strip().upper()
    c.niveau = data.niveau
    c.filiere_id = data.filiere_id
    db.commit()
    db.refresh(c)
    return {
        "id": c.id, "nom": c.nom, "niveau": c.niveau,
        "filiere_id": c.filiere_id,
        "filiere_nom": c.filiere.nom if c.filiere else None,
        "nb_etudiants": len(c.etudiants)
    }


# ----------- PROFESSEURS -----------
@router.get("/professeurs")
def api_list_professeurs(request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    profs = db.query(models.Professeur).all()
    return [{
        "id": p.id, "nom": p.nom, "prenom": p.prenom,
        "email": p.email, "specialite": p.specialite,
        "date_naissance": str(p.date_naissance),
        "nb_classes": len(p.classes),
        "classes": [{"id": c.id, "nom": c.nom, "niveau": c.niveau} for c in p.classes],
        "classes_ids": [c.id for c in p.classes],
    } for p in profs]


@router.post("/professeurs")
def api_create_professeur(data: ProfesseurCreateSchema, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    if db.query(models.Professeur).filter_by(email=data.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    p = models.Professeur(
        nom=data.nom.strip(), prenom=data.prenom.strip(),
        date_naissance=datetime.strptime(data.date_naissance, "%Y-%m-%d"),
        specialite=data.specialite.strip(), email=data.email,
        password_hash=hash_password(data.password)
    )

    selected_classes = []
    for class_id in data.classes_ids:
        classe = db.get(models.Classe, class_id)
        if not classe:
            raise HTTPException(status_code=404, detail=f"Classe avec id {class_id} introuvable")
        selected_classes.append(classe)
    p.classes = selected_classes

    db.add(p)
    db.commit()
    db.refresh(p)
    return {
        "id": p.id, "nom": p.nom, "prenom": p.prenom,
        "email": p.email, "specialite": p.specialite,
        "classes_ids": [c.id for c in p.classes],
    }


@router.put("/professeurs/{id}")
def api_update_professeur(id: int, data: ProfesseurCreateSchema, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    p = db.get(models.Professeur, id)
    if not p:
        raise HTTPException(status_code=404, detail="Professeur non trouvé")
    if db.query(models.Professeur).filter(models.Professeur.email == data.email, models.Professeur.id != id).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    p.nom = data.nom.strip()
    p.prenom = data.prenom.strip()
    p.date_naissance = datetime.strptime(data.date_naissance, "%Y-%m-%d")
    p.specialite = data.specialite.strip()
    p.email = data.email
    if data.password:
        p.password_hash = hash_password(data.password)

    selected_classes = []
    for class_id in data.classes_ids if hasattr(data, 'classes_ids') else []:
        classe = db.get(models.Classe, class_id)
        if not classe:
            raise HTTPException(status_code=404, detail=f"Classe avec id {class_id} introuvable")
        selected_classes.append(classe)
    p.classes = selected_classes

    db.commit()
    db.refresh(p)
    return {
        "id": p.id,
        "nom": p.nom,
        "prenom": p.prenom,
        "email": p.email,
        "specialite": p.specialite,
        "nb_classes": len(p.classes),
        "classes_ids": [c.id for c in p.classes],
    }


@router.delete("/classes/{id}")
def api_delete_classe(id: int, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    c = db.get(models.Classe, id)
    if not c:
        raise HTTPException(status_code=404, detail="Classe non trouvée")
    db.delete(c)
    db.commit()
    return {"success": True}


@router.delete("/professeurs/{id}")
def api_delete_professeur(id: int, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    p = db.get(models.Professeur, id)
    if not p:
        raise HTTPException(status_code=404)
    db.delete(p)
    db.commit()
    return {"success": True}


# ----------- ETUDIANTS -----------
@router.get("/etudiants")
def api_list_etudiants(request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    etudiants = db.query(models.Etudiant).all()
    return [{
        "id": e.id, "nom": e.nom, "prenom": e.prenom,
        "email": e.email, "cne": e.cne,
        "date_naissance": str(e.date_naissance),
        "classe_id": e.classe_id,
        "classe_nom": e.classe.nom if e.classe else None,
        "filiere_nom": e.classe.filiere.nom if (e.classe and e.classe.filiere) else None
    } for e in etudiants]


@router.post("/etudiants")
def api_create_etudiant(data: EtudiantCreateSchema, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    if db.query(models.Etudiant).filter_by(email=data.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    if db.query(models.Etudiant).filter_by(cne=data.cne).first():
        raise HTTPException(status_code=400, detail="CNE déjà utilisé")
    if not db.get(models.Classe, data.classe_id):
        raise HTTPException(status_code=404, detail="Classe introuvable")
    e = models.Etudiant(
        nom=data.nom.strip(), prenom=data.prenom.strip(),
        date_naissance=datetime.strptime(data.date_naissance, "%Y-%m-%d"),
        cne=data.cne, classe_id=data.classe_id,
        email=data.email, password_hash=hash_password(data.password)
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return {"id": e.id, "nom": e.nom, "prenom": e.prenom, "email": e.email, "cne": e.cne}


@router.put("/etudiants/{id}")
def api_update_etudiant(id: int, data: EtudiantUpdateSchema, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    e = db.get(models.Etudiant, id)
    if not e:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    if db.query(models.Etudiant).filter(models.Etudiant.email == data.email, models.Etudiant.id != id).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    if db.query(models.Etudiant).filter(models.Etudiant.cne == data.cne, models.Etudiant.id != id).first():
        raise HTTPException(status_code=400, detail="CNE déjà utilisé")
    if not db.get(models.Classe, data.classe_id):
        raise HTTPException(status_code=404, detail="Classe introuvable")

    e.nom = data.nom.strip()
    e.prenom = data.prenom.strip()
    e.date_naissance = datetime.strptime(data.date_naissance, "%Y-%m-%d")
    e.cne = data.cne.strip()
    e.email = data.email
    e.classe_id = data.classe_id
    if data.password:
        e.password_hash = hash_password(data.password)

    db.commit()
    db.refresh(e)
    return {
        "id": e.id, "nom": e.nom, "prenom": e.prenom,
        "email": e.email, "cne": e.cne, "classe_id": e.classe_id,
        "classe_nom": e.classe.nom if e.classe else None,
        "filiere_nom": e.classe.filiere.nom if (e.classe and e.classe.filiere) else None,
    }


@router.delete("/etudiants/{id}")
def api_delete_etudiant(id: int, request: Request, db: Session = Depends(get_db)):
    if not request.session.get("admin_id"):
        raise HTTPException(status_code=401)
    e = db.get(models.Etudiant, id)
    if not e:
        raise HTTPException(status_code=404)
    db.delete(e)
    db.commit()
    return {"success": True}
