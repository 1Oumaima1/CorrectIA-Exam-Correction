from fastapi import APIRouter, Depends, Form, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from app.auth import verify_password

router = APIRouter(prefix="/etudiant", tags=["Etudiant"])
templates = Jinja2Templates(directory="templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Page login Etudiant
@router.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse("etudiant_login.html", {"request": request})

# Form submit login Etudiant
@router.post("/login/form")
async def login_form(request: Request, email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    etu = db.query(models.Etudiant).filter(models.Etudiant.email == email).first()
    # Le mot de passe pour les étudiants générés par le seed est leur nom de famille.
    # La vérification doit donc comparer le mot de passe fourni avec le nom de famille.
    # La fonction verify_password est utilisée pour les mots de passe hachés.
    if not etu or not verify_password(password, etu.password_hash): # ou `password != etu.nom` si le hash n'est pas bon
        return templates.TemplateResponse(
            "etudiant_login.html",
            {"request": request, "error": "Email ou mot de passe incorrect"}
        )
    # ✅ Ajouter l'étudiant dans la session
    request.session["etudiant_id"] = etu.id
    return RedirectResponse("/etudiant/dashboard", status_code=303)


# Dashboard Etudiant
@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, db: Session = Depends(get_db)):
    # 🔐 Vérifier session étudiant
    etudiant_id = request.session.get("etudiant_id")
    if not etudiant_id:
        return RedirectResponse("/etudiant/login", status_code=303)
    # Récupérer infos étudiant
    etudiant = db.query(models.Etudiant).filter(models.Etudiant.id == etudiant_id).first()

    # 🧾 Récupérer résultats (note + examen)
    resultats = (
        db.query(models.Note, models.Examen)
        .join(models.Examen, models.Note.examen_id == models.Examen.id)
        .filter(models.Note.etudiant_id == etudiant_id)
        .all()
    )

    return templates.TemplateResponse(
        "etudiant_dashboard.html",
        {
            "request": request,
            "etudiant": etudiant,
            "resultats": resultats
        }
    )

@router.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/etudiant/login", status_code=303)

@router.get("/resultats", response_class=HTMLResponse)
async def etudiant_resultats(request: Request, db: Session = Depends(get_db)):
    # 🔐 Vérifier session étudiant
    etudiant_id = request.session.get("etudiant_id")
    if not etudiant_id:
        return RedirectResponse("/etudiant/login", status_code=303)
    
    # 🧾 Récupérer toutes les notes de cet étudiant avec infos examen
    resultats = (
        db.query(models.Note, models.Examen)
        .join(models.Examen, models.Note.examen_id == models.Examen.id)
        .filter(models.Note.etudiant_id == etudiant_id)
        .all()
    )
    
    return templates.TemplateResponse(
        "etudiant_resultats.html",
        {"request": request, "resultats": resultats}
    )