from app.database import SessionLocal
from app import models
from app.auth import hash_password

def create_admin():
    db = SessionLocal()

    email = "admin@edu.uiz.ac.ma"

    # Vérifier si l'admin existe déjà
    existing_admin = db.query(models.Admin).filter(
        models.Admin.email == email
    ).first()

    if existing_admin:
        print("❌ Admin already exists")
        return

    admin = models.Admin(
        nom="Admin",
        prenom="System",
        email=email,
        password_hash=hash_password("admin123")
    )

    db.add(admin)
    db.commit()
    db.close()

    print("✅ Admin created successfully")
    print("📧 Email:", email)
    print("🔑 Password: admin123")

if __name__ == "__main__":
    create_admin()
