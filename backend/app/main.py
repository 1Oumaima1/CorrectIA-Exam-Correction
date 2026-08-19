from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from app.routers import admin, examen, professeur, etudiant
from app.api import api_router

app = FastAPI(title="Système de Correction d'Examens", version="2.0.0")

app.add_middleware(SessionMiddleware, secret_key="SECRET_KEY_EXAM_APP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

templates = Jinja2Templates(directory="templates")

app.include_router(admin.router)
app.include_router(professeur.router)
app.include_router(etudiant.router)
app.include_router(examen.router)
app.include_router(api_router, prefix="/api")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})
