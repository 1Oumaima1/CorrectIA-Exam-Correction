from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import date
from app.database import SessionLocal
from app import models
from app.auth import hash_password
from .auth import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_admin(current=Depends(get_current_user)):
    if current["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux admins")
    return current


# ==================== STATS ====================

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    return {
        "professeurs": db.query(models.Professeur).count(),
        "etudiants": db.query(models.Etudiant).count(),
        "filieres": db.query(models.Filiere).count(),
        "classes": db.query(models.Classe).count(),
        "examens": db.query(models.Examen).count(),
    }


# ==================== FILIERE ====================

@router.get("/filieres")
def list_filieres(db: Session = Depends(get_db), _=Depends(require_admin)):
    filieres = db.query(models.Filiere).all()
    return [
        {
            "id": f.id,
            "nom": f.nom,
            "nb_classes": len(f.classes)
        }
        for f in filieres
    ]


class FiliereCreate(BaseModel):
    nom: str


@router.post("/filieres", status_code=201)
def create_filiere(data: FiliereCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    nom = data.nom.strip().upper()
    if db.query(models.Filiere).filter_by(nom=nom).first():
        raise HTTPException(status_code=400, detail="Filière déjà existante")
    filiere = models.Filiere(nom=nom)
    db.add(filiere)
    db.commit()
    db.refresh(filiere)
    return {"id": filiere.id, "nom": filiere.nom}


@router.put("/filieres/{id}")
def update_filiere(id: int, data: FiliereCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    filiere = db.query(models.Filiere).filter_by(id=id).first()
    if not filiere:
        raise HTTPException(status_code=404, detail="Filière non trouvée")
    filiere.nom = data.nom.strip().upper()
    db.commit()
    return {"id": filiere.id, "nom": filiere.nom}


@router.delete("/filieres/{id}")
def delete_filiere(id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    filiere = db.query(models.Filiere).filter_by(id=id).first()
    if not filiere:
        raise HTTPException(status_code=404, detail="Filière non trouvée")
    db.delete(filiere)
    db.commit()
    return {"message": "Filière supprimée"}


# ==================== CLASSE ====================

@router.get("/classes")
def list_classes(db: Session = Depends(get_db), _=Depends(require_admin)):
    classes = db.query(models.Classe).all()
    return [
        {
            "id": c.id,
            "nom": c.nom,
            "niveau": c.niveau,
            "filiere_id": c.filiere_id,
            "filiere_nom": c.filiere.nom if c.filiere else None,
            "nb_etudiants": len(c.etudiants)
        }
        for c in classes
    ]


class ClasseCreate(BaseModel):
    nom: str
    niveau: int
    filiere_id: int


class ClasseUpdate(BaseModel):
    nom: str
    niveau: int
    filiere_id: int


@router.post("/classes", status_code=201)
def create_classe(data: ClasseCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if not db.get(models.Filiere, data.filiere_id):
        raise HTTPException(status_code=404, detail="Filière introuvable")
    classe = models.Classe(nom=data.nom.strip().upper(), niveau=data.niveau, filiere_id=data.filiere_id)
    db.add(classe)
    db.commit()
    db.refresh(classe)
    return {"id": classe.id, "nom": classe.nom}


@router.put("/classes/{id}")
def update_classe(id: int, data: ClasseUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    classe = db.get(models.Classe, id)
    if not classe:
        raise HTTPException(status_code=404, detail="Classe non trouvée")
    if not db.get(models.Filiere, data.filiere_id):
        raise HTTPException(status_code=404, detail="Filière introuvable")

    classe.nom = data.nom.strip().upper()
    classe.niveau = data.niveau
    classe.filiere_id = data.filiere_id

    db.commit()
    db.refresh(classe)
    return {
        "id": classe.id,
        "nom": classe.nom,
        "niveau": classe.niveau,
        "filiere_id": classe.filiere_id,
        "filiere_nom": classe.filiere.nom if classe.filiere else None,
    }


# ==================== PROFESSEUR ====================

@router.get("/professeurs")
def list_professeurs(
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    profs = db.query(models.Professeur).all()

    return [
        {
            "id": p.id,
            "nom": p.nom,
            "prenom": p.prenom,
            "email": p.email,
            "specialite": p.specialite,
            "date_naissance": str(p.date_naissance)
                if p.date_naissance else None,

            # Nombre de classes
            "nb_classes": len(p.classes),

            # Classes du professeur
            "classes": [
                {
                    "id": c.id,
                    "nom": c.nom,
                    "niveau": c.niveau,
                    "filiere_id": c.filiere_id,
                    "filiere_nom": c.filiere.nom
                        if c.filiere else None
                }
                for c in p.classes
            ]
        }
        for p in profs
    ]


class ProfesseurCreate(BaseModel):
    nom: str
    prenom: str
    date_naissance: date
    specialite: str
    email: EmailStr
    password: str

    # Classes enseignées par le professeur
    classes_ids: list[int] = []


@router.post("/professeurs", status_code=201)
def create_professeur(
    data: ProfesseurCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):

    # Vérifier email
    if db.query(models.Professeur).filter_by(
        email=data.email
    ).first():

        raise HTTPException(
            status_code=400,
            detail="Email déjà utilisé"
        )

    # Vérifier les classes
    classes = []

    for class_id in data.classes_ids:

        classe = db.get(models.Classe, class_id)

        if not classe:
            raise HTTPException(
                status_code=404,
                detail=f"Classe avec id {class_id} introuvable"
            )

        classes.append(classe)

    # Créer professeur
    prof = models.Professeur(
        nom=data.nom.strip(),
        prenom=data.prenom.strip(),
        date_naissance=data.date_naissance,
        specialite=data.specialite.strip(),
        email=data.email,
        password_hash=hash_password(data.password)
    )

    # ⭐ LIAISON PROFESSEUR ↔ CLASSES
    prof.classes = classes

    db.add(prof)
    db.commit()
    db.refresh(prof)

    return {
        "id": prof.id,
        "nom": prof.nom,
        "prenom": prof.prenom,
        "nb_classes": len(prof.classes),
        "classes": [
            {
                "id": c.id,
                "nom": c.nom
            }
            for c in prof.classes
        ]
    }


@router.put("/professeurs/{id}")
def update_professeur(
    id: int,
    data: ProfesseurCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):

    prof = db.get(models.Professeur, id)

    if not prof:
        raise HTTPException(
            status_code=404,
            detail="Professeur non trouvé"
        )

    # Vérifier email utilisé par un autre professeur
    existing = db.query(models.Professeur).filter(
        models.Professeur.email == data.email,
        models.Professeur.id != id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email déjà utilisé"
        )

    # Vérifier classes
    classes = []

    for class_id in data.classes_ids:

        classe = db.get(models.Classe, class_id)

        if not classe:
            raise HTTPException(
                status_code=404,
                detail=f"Classe avec id {class_id} introuvable"
            )

        classes.append(classe)

    # Informations professeur
    prof.nom = data.nom.strip()
    prof.prenom = data.prenom.strip()
    prof.date_naissance = data.date_naissance
    prof.specialite = data.specialite.strip()
    prof.email = data.email

    # Mot de passe seulement s'il est fourni
    if data.password:
        prof.password_hash = hash_password(data.password)

    # ⭐ Mettre à jour les classes
    prof.classes = classes

    db.commit()
    db.refresh(prof)

    return {
        "message": "Professeur mis à jour",
        "id": prof.id,
        "nb_classes": len(prof.classes),
        "classes": [
            {
                "id": c.id,
                "nom": c.nom
            }
            for c in prof.classes
        ]
    }


@router.delete("/classes/{id}")
def delete_classe(id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    classe = db.get(models.Classe, id)
    if not classe:
        raise HTTPException(status_code=404, detail="Classe non trouvée")
    db.delete(classe)
    db.commit()
    return {"message": "Classe supprimée"}


@router.delete("/professeurs/{id}")
def delete_professeur(
    id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):

    prof = db.get(models.Professeur, id)

    if not prof:
        raise HTTPException(
            status_code=404,
            detail="Professeur non trouvé"
        )

    db.delete(prof)
    db.commit()

    return {
        "message": "Professeur supprimé"
    }

# ==================== ETUDIANT ====================

@router.get("/etudiants")
def list_etudiants(db: Session = Depends(get_db), _=Depends(require_admin)):
    etudiants = db.query(models.Etudiant).all()
    return [
        {
            "id": e.id,
            "nom": e.nom,
            "prenom": e.prenom,
            "email": e.email,
            "cne": e.cne,
            "date_naissance": str(e.date_naissance) if e.date_naissance else None,
            "classe_id": e.classe_id,
            "classe_nom": e.classe.nom if e.classe else None,
            "filiere_nom": e.classe.filiere.nom if e.classe and e.classe.filiere else None,
        }
        for e in etudiants
    ]


class EtudiantCreate(BaseModel):
    nom: str
    prenom: str
    date_naissance: date
    cne: str
    email: EmailStr
    password: str
    classe_id: int


class EtudiantUpdate(BaseModel):
    nom: str
    prenom: str
    date_naissance: date
    cne: str
    email: EmailStr
    password: str | None = None
    classe_id: int


@router.post("/etudiants", status_code=201)
def create_etudiant(data: EtudiantCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(models.Etudiant).filter_by(email=data.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    if db.query(models.Etudiant).filter_by(cne=data.cne).first():
        raise HTTPException(status_code=400, detail="CNE déjà utilisé")
    if not db.get(models.Classe, data.classe_id):
        raise HTTPException(status_code=404, detail="Classe introuvable")
    etu = models.Etudiant(
        nom=data.nom,
        prenom=data.prenom,
        date_naissance=data.date_naissance,
        cne=data.cne,
        email=data.email,
        password_hash=hash_password(data.password),
        classe_id=data.classe_id
    )
    db.add(etu)
    db.commit()
    db.refresh(etu)
    return {"id": etu.id, "nom": etu.nom, "prenom": etu.prenom}


@router.put("/etudiants/{id}")
def update_etudiant(id: int, data: EtudiantUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    etu = db.get(models.Etudiant, id)
    if not etu:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    if db.query(models.Etudiant).filter(models.Etudiant.email == data.email, models.Etudiant.id != id).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    if db.query(models.Etudiant).filter(models.Etudiant.cne == data.cne, models.Etudiant.id != id).first():
        raise HTTPException(status_code=400, detail="CNE déjà utilisé")
    if not db.get(models.Classe, data.classe_id):
        raise HTTPException(status_code=404, detail="Classe introuvable")

    etu.nom = data.nom.strip()
    etu.prenom = data.prenom.strip()
    etu.date_naissance = data.date_naissance
    etu.cne = data.cne.strip()
    etu.email = data.email
    etu.classe_id = data.classe_id
    if data.password:
        etu.password_hash = hash_password(data.password)

    db.commit()
    db.refresh(etu)
    return {
        "id": etu.id,
        "nom": etu.nom,
        "prenom": etu.prenom,
        "email": etu.email,
        "cne": etu.cne,
        "classe_id": etu.classe_id,
    }


@router.delete("/etudiants/{id}")
def delete_etudiant(id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    etu = db.get(models.Etudiant, id)
    if not etu:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    db.delete(etu)
    db.commit()
    return {"message": "Étudiant supprimé"}
