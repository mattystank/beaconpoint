import uuid
import datetime
from app.database import SessionLocal
from app.models import User
from sqlalchemy.exc import IntegrityError
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def create_admin(email: str, password: str):
    db = SessionLocal()
    try:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=hash_password(password),
            role="admin",
            created_at=datetime.datetime.utcnow()
        )
        db.add(user)
        db.commit()
        print(f"Admin user created: {email}")
    except IntegrityError:
        db.rollback()
        print("User with this email already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    import getpass
    email = input("Enter admin email: ")
    password = getpass.getpass("Enter admin password: ")
    create_admin(email, password)
