# Backend — Système de Correction d'Examens

FastAPI + SQLAlchemy + MySQL + IA (Hugging Face)

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Configuration base de données

Modifier `app/database.py` selon votre config MySQL :

```python
DATABASE_URL = "mysql+pymysql://root:VOTRE_MOT_DE_PASSE@localhost/db_exam"
```

Créer la base de données :
```sql
CREATE DATABASE db_exam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Créer les tables

```bash
python -c "from app.database import Base, engine; from app import models; Base.metadata.create_all(engine)"
```

## Créer un admin

```bash
python scripts/create_admin.py
```

## Lancement

```bash
uvicorn app.main:app --reload --port 8000
```

L'API sera disponible sur http://localhost:8000  
Documentation Swagger : http://localhost:8000/docs

## Routes API REST (pour le frontend React)

### Admin
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET  /api/admin/me`
- `GET  /api/admin/dashboard`
- `GET/POST /api/admin/filieres`
- `DELETE /api/admin/filieres/{id}`
- `GET/POST /api/admin/classes`
- `GET/POST /api/admin/professeurs`
- `DELETE /api/admin/professeurs/{id}`
- `GET/POST /api/admin/etudiants`
- `DELETE /api/admin/etudiants/{id}`

### Professeur
- `POST /api/professeur/login`
- `GET  /api/professeur/me`
- `GET/POST /api/professeur/examens`
- `GET  /api/professeur/examens/{id}/resultats`
- `POST /api/professeur/examens/{id}/upload`

### Étudiant
- `POST /api/etudiant/login`
- `GET  /api/etudiant/me`
- `GET  /api/etudiant/resultats`
