from sqlalchemy.orm import Session
from . import models


def log_activity(db: Session, type: str, message: str):
    """
    Enregistre une nouvelle activité dans la base de données.
    """
    try:
        activity = models.ActivityLog(type=type, message=message)
        db.add(activity)
        db.commit()
    except Exception as e:
        print(f"Erreur lors de la journalisation de l'activité : {e}")
        db.rollback()