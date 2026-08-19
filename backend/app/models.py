from datetime import datetime
from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, DateTime, Boolean, Table
from .database import Base
from sqlalchemy.orm import relationship

class Admin(Base):
    __tablename__ = "admin"
    id = Column(Integer, primary_key=True)
    nom = Column(String(100))
    prenom = Column(String(100))
    email = Column(String(150), unique=True)
    password_hash = Column(String(255))

# =====================================================
# FILIERE (IL, MGSI, SITCN, SDBDIA)
# =====================================================
class Filiere(Base):
    __tablename__ = "filiere"

    id = Column(Integer, primary_key=True)
    nom = Column(String(50), unique=True, nullable=False)

    classes = relationship("Classe", back_populates="filiere", cascade="all, delete")


# =====================================================
# CLASSE (IL-1, IL-2, IL-3, etc.)
# =====================================================
class Classe(Base):
    __tablename__ = "classe"

    id = Column(Integer, primary_key=True)
    nom = Column(String(50), nullable=False)        # ex: IL-1
    niveau = Column(Integer, nullable=False)        # 1, 2, 3
    filiere_id = Column(Integer, ForeignKey("filiere.id"), nullable=False)

    filiere = relationship("Filiere", back_populates="classes")
    etudiants = relationship("Etudiant", back_populates="classe")
    examens = relationship(
        "Examen",
        secondary="examen_classe",
        back_populates="classes"
    )
    
# PROFESSEUR
class Professeur(Base):
    __tablename__ = "professeur"

    id = Column(Integer, primary_key=True)
    nom = Column(String(100))
    prenom = Column(String(100))
    date_naissance = Column(Date)
    specialite = Column(String(100))
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    classes = relationship(
        "Classe",
        secondary="professeur_classe",
        back_populates="professeurs"
    )

# TABLE ASSOCIATION PROFESSEUR ↔ CLASSE
professeur_classe = Table(
    "professeur_classe",
    Base.metadata,
    Column("professeur_id", Integer, ForeignKey("professeur.id"), primary_key=True),
    Column("classe_id", Integer, ForeignKey("classe.id"), primary_key=True)
)

Classe.professeurs = relationship(
    "Professeur",
    secondary="professeur_classe",
    back_populates="classes"
)

# ETUDIANT
class Etudiant(Base):
    __tablename__ = "etudiant"

    id = Column(Integer, primary_key=True)
    nom = Column(String(100))
    prenom = Column(String(100))
    date_naissance = Column(Date)
    cne = Column(String(50), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    classe_id = Column(Integer, ForeignKey("classe.id"), nullable=False)
    classe = relationship("Classe", back_populates="etudiants")


class Examen(Base):
    __tablename__ = "examen"
    id = Column(Integer, primary_key=True)
    titre = Column(String(150), nullable=False)
    module = Column(String(100), nullable=False)
    semestre = Column(String(20), nullable=False)
    pdf_path = Column(String(255), nullable=False)
    corrige_path = Column(String(255), nullable=True)
    professeur_id = Column(Integer, ForeignKey("professeur.id"), nullable=False)
    professeur = relationship("Professeur")
    classes = relationship(
        "Classe",
        secondary="examen_classe",
        back_populates="examens"
    )

# =====================================================
# TABLE ASSOCIATION EXAMEN ↔ CLASSE
# =====================================================
examen_classe = Table(
    "examen_classe",
    Base.metadata,
    Column("examen_id", Integer, ForeignKey("examen.id"), primary_key=True),
    Column("classe_id", Integer, ForeignKey("classe.id"), primary_key=True)
)
class Copie(Base):
    __tablename__ = "copie"

    id = Column(Integer, primary_key=True)
    etudiant_id = Column(Integer, ForeignKey("etudiant.id"), nullable=False)
    examen_id = Column(Integer, ForeignKey("examen.id"), nullable=False)
    pdf_path = Column(String(255), nullable=False)

    etudiant = relationship("Etudiant")
    examen = relationship("Examen")
    
# =====================================================
# NOTE / CORRECTION
# =====================================================
class Note(Base):
    __tablename__ = "note"

    id = Column(Integer, primary_key=True)
    etudiant_id = Column(Integer, ForeignKey("etudiant.id"), nullable=False)
    examen_id = Column(Integer, ForeignKey("examen.id"), nullable=False)

    note_finale = Column(Float)
    certitude = Column(Float)
    valide = Column(Integer, default=0)
    copie_id = Column(Integer, ForeignKey("copie.id"), nullable=True)
    etudiant = relationship("Etudiant")
    examen = relationship("Examen")