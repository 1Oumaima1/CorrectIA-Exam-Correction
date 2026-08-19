#  CorrectIA — AI-Powered Exam Correction System

A complete exam management and automatic correction platform: **FastAPI backend** (PostgreSQL) + **React/Vite frontend**, with AI-assisted correction (Sentence Transformers / Hugging Face).

---

## 📁 Project structure

```
CorrectIA-Exam-Correction/
├── docker-compose.yml         ← Orchestrates db + backend + frontend
│
├── backend/                   ← FastAPI application
│   ├── app/
│   │   ├── main.py            ← Entry point (CORS, session, routes)
│   │   ├── models.py          ← SQLAlchemy models (Admin, Filiere, Classe,
│   │   │                         Professeur, Etudiant, Examen, Copie, Note)
│   │   ├── database.py        ← PostgreSQL connection (+ loads .env)
│   │   ├── auth.py            ← Password hashing / verification
│   │   ├── utils.py           ← Utility functions (log_activity, etc.)
│   │   ├── routers/           ← Server-rendered HTML routes (Jinja2)
│   │   │   ├── admin.py       ← /admin/... (login, dashboard, CRUD)
│   │   │   ├── professeur.py
│   │   │   ├── etudiant.py
│   │   │   └── examen.py
│   │   └── api/                ← REST JSON routes consumed by the React frontend
│   │       ├── auth.py         ← POST /api/auth/login → JWT
│   │       ├── admin.py        ← CRUD for teachers, students, programs, classes
│   │       ├── professeur.py   ← Teacher dashboard, exams, results
│   │       ├── etudiant.py     ← Student dashboard, grades
│   │       └── examen.py       ← Create an exam, upload the correction
│   │
│   ├── scripts/                ← AI correction scripts and utilities
│   │   ├── create_admin.py     ← Creates the first admin account
│   │   ├── process_corrige_prof.py
│   │   ├── generate_students_json.py
│   │   ├── compare_answers_HF.py  ← Answer comparison (Sentence Transformers)
│   │   └── text_extractor.py
│   │
│   ├── templates/               ← HTML templates (Jinja2, not committed)
│   ├── uploads/                 ← Uploaded files (not committed)
│   ├── .env.example             ← Configuration template (copy to .env)
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/                    ← React + Vite interface
    ├── src/
    │   ├── App.jsx               ← Main router
    │   ├── context/AuthContext.jsx  ← JWT token handling
    │   ├── services/api.js       ← Axios instance (proxy /api → backend)
    │   ├── components/           ← Layout, reusable UI components
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── AdminDashboard.jsx
    │       ├── ProfesseurDashboard.jsx
    │       └── EtudiantDashboard.jsx
    ├── vite.config.js            ← Proxies /api and /uploads to the backend
    └── package.json
```

---

## 🧱 Tech stack

| Layer | Technologies |
|---|---|
| Backend | FastAPI, SQLAlchemy 2, PostgreSQL, JWT (`python-jose`), `passlib`/`bcrypt` |
| AI | Sentence Transformers, Torch, PyMuPDF, Tesseract OCR (`pytesseract`) |
| Frontend | React 18, Vite, React Router, Axios, Recharts |
| Infra | Docker / Docker Compose |

---

## 🚀 Setup and running the project

### Option A — With Docker (recommended)

This is the simplest way: `docker-compose.yml` starts the PostgreSQL database, the backend, and the frontend together, already wired to each other.

```bash
# 1. Configure secrets
cd backend
cp .env.example .env
# → open .env and replace SECRET_KEY / SECRET_JWT_KEY with real random values
cd ..

# 2. Start all services
docker compose up --build
```

- Backend available at **http://localhost:8000** (Swagger docs: `/docs`)
- Frontend available at **http://localhost:5173**
- PostgreSQL database on `localhost:5432`

> ⚠️ The Vite proxy (`vite.config.js`) points to `http://backend:8000` — this hostname only resolves **inside the Docker network**. If you run the frontend with `npm run dev` outside Docker, change `backend` to `localhost` in `vite.config.js`, or run the frontend through Docker as well.

### Option B — Without Docker (local development)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Configuration
cp .env.example .env
# → fill in SECRET_KEY, SECRET_JWT_KEY, and DATABASE_URL (a local PostgreSQL database)

# Create the tables
python -c "from app.database import engine, Base; from app import models; Base.metadata.create_all(bind=engine)"

# Create the first admin account
python -m scripts.create_admin

# Start the server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🔐 Configuration (`.env`)

The backend reads its configuration from `backend/.env` (never committed to Git — see `.gitignore`). Copy `.env.example` to get started:

```env
SECRET_KEY=...          # session key (starlette SessionMiddleware)
SECRET_JWT_KEY=...      # JWT signing key
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/db_exam
HF_TOKEN=...            # Hugging Face token (if used by the AI correction scripts)
```

Without `SECRET_KEY` or `SECRET_JWT_KEY`, the application refuses to start (`RuntimeError`) — this is intentional, to avoid forgetting to configure these values.

Generate secure random keys with:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 🔑 Authentication

The React frontend uses **JWT tokens** via `POST /api/auth/login` (file `backend/app/api/auth.py`).

| Role | Permissions |
|---|---|
| Admin | Full management: programs, classes, teachers, students |
| Teacher | Create exams, upload student papers and the answer key, view results |
| Student | View their own grades and results |

There is also a server-rendered HTML interface (Jinja2) available at `/admin/login`, independent from the React frontend — useful for direct administration without going through the frontend.

---

## 🌐 Main REST API routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login → returns a JWT token |
| GET | `/api/auth/me` | Profile of the logged-in user |
| GET | `/api/admin/stats` | Global statistics |
| GET/POST/PUT/DELETE | `/api/admin/filieres` | Manage academic programs |
| GET/POST/PUT/DELETE | `/api/admin/classes` | Manage classes |
| GET/POST/PUT/DELETE | `/api/admin/professeurs` | Manage teachers |
| GET/POST/PUT/DELETE | `/api/admin/etudiants` | Manage students |
| GET | `/api/professeur/dashboard` | Teacher dashboard |
| GET | `/api/professeur/examens` | List of the teacher's exams |
| PUT | `/api/professeur/examens/{id}/etudiants/{id}/note` | Edit a grade |
| POST | `/api/examen/creer` | Create an exam |
| POST | `/api/examen/{id}/upload-correction` | Upload the answer key + student papers |
| GET | `/api/etudiant/dashboard` | Logged-in student's results |


---

## 🧠 How automatic correction works

1. The teacher uploads the **reference answer key** (PDF) and the **student papers** (PDFs named by student ID/CNE).
2. The backend extracts text from the PDFs (`text_extractor.py`, `process_corrige_prof.py`, `generate_students_json.py`).
3. Student answers are compared to the reference answers using **Sentence Transformers** (`compare_answers_HF.py`).
4. Grades and confidence scores are stored in the `note` table.
5. Students view their results from their dashboard in real time.

---

## 🗄️ Database

PostgreSQL 16 (via Docker: `postgres:16-alpine`). Main tables: `admin`, `filiere`, `classe`, `professeur`, `etudiant`, `examen`, `copie`, `note`.

Create the tables manually (without Docker):
```bash
python -c "from app.database import Base, engine; from app import models; Base.metadata.create_all(engine)"
```

👩‍💻 Amlou Oumaima
