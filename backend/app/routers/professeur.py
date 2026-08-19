from fastapi import APIRouter, Depends, Form, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from app.auth import verify_password
from fastapi.responses import HTMLResponse


router = APIRouter(prefix="/professeur", tags=["Professeur"])
templates = Jinja2Templates(directory="templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Page login Professeur
@router.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse("professeur_login.html", {"request": request})

# Form submit login Professeur
#@router.post("/login/form")
#def login_form(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    #prof = db.query(models.Professeur).filter(models.Professeur.email == email).first()
    #if not prof or not verify_password(password, prof.password_hash):
        #return HTMLResponse("<h2>Login failed! Email ou mot de passe incorrect.</h2>")
    #return RedirectResponse("/professeur/dashboard", status_code=303)


@router.post("/login/form")
def login_form(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    prof = db.query(models.Professeur).filter(
        models.Professeur.email == email
    ).first()
    if not prof or not verify_password(password, prof.password_hash):
        return HTMLResponse("<h2>Email ou mot de passe incorrect</h2>")
    # ✅ Stocker le prof connecté
    request.session["professeur_id"] = prof.id
    return RedirectResponse("/professeur/dashboard", status_code=303)

#Dashboard Professeur
@router.get("/dashboard")
def dashboard(request: Request):
    return templates.TemplateResponse("professeur_dashboard.html", {"request": request})
