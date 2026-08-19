# 📝 ExamCorrect — Système de Correction d'Examens par IA

Projet complet avec **backend FastAPI** + **frontend React** moderne.

---

## 📁 Structure du projet

```
projet_correction/
├── backend/                  ← FastAPI (ton code original + nouvelles API REST)
│   ├── app/
│   │   ├── main.py           ← Point d'entrée (CORS + Session + Routes)
│   │   ├── models.py         ← Modèles SQLAlchemy
│   │   ├── schemas.py        ← Schémas Pydantic
│   │   ├── database.py       ← Connexion MySQL
│   │   ├── auth.py           ← Hash / verify password
│   │   ├── routers/          ← Routes HTML originales (Jinja2)
│   │   │   ├── admin.py
│   │   │   ├── professeur.py
│   │   │   ├── etudiant.py
│   │   │   └── examen.py
│   │   └── api/              ← 🆕 Nouvelles routes REST JSON (pour React)
│   │       ├── __init__.py
│   │       ├── auth.py       ← POST /api/auth/login → JWT token
│   │       ├── admin.py      ← CRUD professeurs, étudiants, filières, classes
│   │       ├── professeur.py ← Dashboard prof, examens, résultats
│   │       ├── etudiant.py   ← Dashboard étudiant, notes
│   │       └── examen.py     ← Créer examen, uploader correction
│   ├── scripts/              ← Scripts IA de correction (inchangés)
│   ├── templates/            ← Templates HTML originaux (inchangés)
│   └── requirements.txt
│
└── frontend/                 ← React + Vite (interface moderne)
    ├── src/
    │   ├── App.jsx            ← Router principal
    │   ├── context/
    │   │   └── AuthContext.jsx ← Gestion JWT + état global
    │   ├── services/
    │   │   └── api.js         ← Axios avec intercepteurs JWT
    │   ├── components/
    │   │   ├── UI.jsx         ← Composants réutilisables (Btn, Card, Modal, Table...)
    │   │   └── Layout.jsx     ← Sidebar + navigation
    │   └── pages/
    │       ├── LoginPage.jsx       ← Connexion (Admin / Prof / Étudiant)
    │       ├── AdminDashboard.jsx  ← Gestion complète
    │       ├── ProfesseurDashboard.jsx ← Examens + correction IA
    │       └── EtudiantDashboard.jsx   ← Résultats + notes
    ├── index.html
    ├── package.json
    └── vite.config.js         ← Proxy vers backend :8000
```

---

## 🚀 Installation et démarrage

### 1. Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate       # Linux/Mac
venv\Scripts\activate          # Windows

# Installer les dépendances
pip install -r requirements.txt
#creer tables

python -c "from app.database import engine, Base; from app import models; Base.metadata.create_all(bind=engine); print('Tables created successfully')"

# Configurer la base de données MySQL dans app/database.py
# DATABASE_URL = "mysql+pymysql://root:PASSWORD@localhost/db_exam"

# Créer un admin (script fourni)
 python -m scripts.create_admin

# Lancer le serveur
python -m uvicorn app.main:app --reload --port 8000

```

### 2. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
# → http://localhost:5173
```

---

## 🔐 Authentification

Le frontend utilise **JWT Bearer tokens** via `/api/auth/login`.

| Rôle        | URL de connexion | Permissions                     |
|-------------|------------------|---------------------------------|
| Admin       | `/login`         | CRUD tout                       |
| Professeur  | `/login`         | Créer examens, uploader copies  |
| Étudiant    | `/login`         | Voir ses résultats              |

---

## 🌐 API REST (nouvelles routes)

| Méthode | Endpoint                              | Description                    |
|---------|---------------------------------------|--------------------------------|
| POST    | `/api/auth/login`                     | Connexion → JWT token          |
| GET     | `/api/auth/me`                        | Profil utilisateur connecté    |
| GET     | `/api/admin/stats`                    | Statistiques globales          |
| GET/POST| `/api/admin/professeurs`              | Liste / créer professeur       |
| GET/POST| `/api/admin/etudiants`                | Liste / créer étudiant         |
| GET/POST| `/api/admin/filieres`                 | Liste / créer filière          |
| GET/POST| `/api/admin/classes`                  | Liste / créer classe           |
| GET     | `/api/professeur/dashboard`           | Dashboard prof + stats         |
| GET     | `/api/professeur/examens`             | Mes examens                    |
| GET     | `/api/professeur/examens/{id}/resultats` | Résultats d'un examen       |
| POST    | `/api/examen/creer`                   | Créer un examen (multipart)    |
| POST    | `/api/examen/{id}/upload-correction`  | Uploader corrigé + copies      |
| GET     | `/api/etudiant/dashboard`             | Notes et infos étudiant        |

---

## 🧠 Fonctionnement de la correction IA

1. Le professeur upload le **corrigé type** (PDF) + les **copies étudiantes** (PDFs nommés par CNE)
2. Le backend extrait le texte des PDFs (`process_corrige_prof`, `generate_students_json`)
3. Les réponses sont comparées via **Sentence Transformers** (HuggingFace) dans `compare_answers_HF.py`
4. Les **notes et certitudes** sont stockées dans la table `note`
5. Les étudiants voient leurs résultats en temps réel

---

## ⚙️ Configuration

### Base de données (`backend/app/database.py`)
```python
DATABASE_URL = "mysql+pymysql://root:VOTRE_MDP@localhost/db_exam"
```

### CORS (`backend/app/main.py`)
```python
allow_origins=["http://localhost:5173"]  # Ajouter votre domaine en production
```
