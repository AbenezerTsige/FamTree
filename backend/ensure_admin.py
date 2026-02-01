"""
Ensure admin user exists with password 'admin'. Run inside backend container if login fails.
Usage: docker exec famtree_backend python3 ensure_admin.py
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.auth import hash_password

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://famtree_user:famtree_pass@db:5432/famtree_db"
)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin"

def main():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == ADMIN_USERNAME).first()
        if user:
            user.password_hash = hash_password(ADMIN_PASSWORD)
            db.commit()
            print(f"Password reset for user '{ADMIN_USERNAME}'.")
        else:
            user = User(username=ADMIN_USERNAME, password_hash=hash_password(ADMIN_PASSWORD))
            db.add(user)
            db.commit()
            print(f"User '{ADMIN_USERNAME}' created.")
        print(f"Login with username: {ADMIN_USERNAME}, password: {ADMIN_PASSWORD}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
