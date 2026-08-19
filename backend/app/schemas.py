from pydantic import BaseModel, EmailStr
from datetime import date

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class ProfesseurCreate(BaseModel):
    nom: str
    prenom: str
    date_naissance: date
    specialite: str
    email: EmailStr
    password: str

# Pour créer un étudiant
class EtudiantCreate(BaseModel):
    nom: str
    prenom: str
    date_naissance: date
    cne: str
    filiere: str
    email: EmailStr
    password: str