from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from app.auth import verify_password

router = APIRouter()

@router.post("/admin/login")
def admin_login(email: str = Form(...), password: str = Form(...)):
    db: Session = SessionLocal()
    admin = db.query(models.Admin).filter(models.Admin.email == email).first()
    if not admin or not verify_password(password, admin.password_hash):
        return HTMLResponse("<h2>Login failed! Email ou mot de passe incorrect.</h2>")
    # Ici tu peux rediriger vers le dashboard admin
    return RedirectResponse("/admin/dashboard", status_code=303)
