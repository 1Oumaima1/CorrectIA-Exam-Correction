from fastapi import APIRouter
from .auth import router as auth_router
from .admin import router as admin_router
from .professeur import router as professeur_router
from .etudiant import router as etudiant_router
from .examen import router as examen_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["API Auth"])
api_router.include_router(admin_router, prefix="/admin", tags=["API Admin"])
api_router.include_router(professeur_router, prefix="/professeur", tags=["API Professeur"])
api_router.include_router(etudiant_router, prefix="/etudiant", tags=["API Etudiant"])
api_router.include_router(examen_router, prefix="/examen", tags=["API Examen"])
