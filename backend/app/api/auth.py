import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pydantic import BaseModel
from app.database import SessionLocal
from app import models
from app.auth import verify_password

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_JWT_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_JWT_KEY manquant. Ajoute SECRET_JWT_KEY=... dans ton fichier .env "
        "(voir .env.example)."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 heures

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if role == "admin":
        user = db.query(models.Admin).filter(models.Admin.id == user_id).first()
    elif role == "professeur":
        user = db.query(models.Professeur).filter(models.Professeur.id == user_id).first()
    elif role == "etudiant":
        user = db.query(models.Etudiant).filter(models.Etudiant.id == user_id).first()
    else:
        raise credentials_exception

    if not user:
        raise credentials_exception

    return {"user": user, "role": role}


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str  # "admin" | "professeur" | "etudiant"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    nom: str
    prenom: str


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    role = req.role.lower()

    if role == "admin":
        user = db.query(models.Admin).filter(models.Admin.email == req.email).first()
    elif role == "professeur":
        user = db.query(models.Professeur).filter(models.Professeur.email == req.email).first()
    elif role == "etudiant":
        user = db.query(models.Etudiant).filter(models.Etudiant.email == req.email).first()
    else:
        raise HTTPException(status_code=400, detail="Rôle invalide")

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token_data = {
        "user_id": user.id,
        "email": user.email,
        "role": role,
    }
    token = create_access_token(token_data, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "user_id": user.id,
        "nom": user.nom,
        "prenom": user.prenom,
    }


@router.get("/me")
def get_me(current=Depends(get_current_user)):
    user = current["user"]
    role = current["role"]
    return {
        "id": user.id,
        "nom": user.nom,
        "prenom": user.prenom,
        "email": user.email,
        "role": role,
    }
