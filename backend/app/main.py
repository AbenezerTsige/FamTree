import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas, database
from app.services import FamilyTreeService
from app.auth import hash_password, verify_password, create_access_token, decode_token

app = FastAPI(title="Family Tree API")
security = HTTPBearer(auto_error=False)

# CORS: set ALLOWED_ORIGINS in production (e.g. https://yourdomain.com)
_allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _allowed_origins.split(",")] if _allowed_origins != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(database.get_db),
) -> models.User:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    username = payload["sub"]
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def get_current_admin(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user


@app.get("/")
def read_root():
    return {"message": "Family Tree API"}


# ----- Auth -----
@app.post("/api/auth/register", response_model=schemas.Token)
def register(data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """Create a new user account."""
    if db.query(models.User).filter(models.User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    user = models.User(
        username=data.username,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "username": user.username}


@app.post("/api/auth/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    """Log in and get an access token."""
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "username": user.username}


@app.post("/api/auth/change-password")
def change_password(
    data: schemas.PasswordChange,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    """Change password for the current user."""
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@app.get("/api/auth/me", response_model=schemas.MeResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Return current user info (username, is_admin)."""
    return {"username": current_user.username, "is_admin": getattr(current_user, "is_admin", False)}


# ----- Admin only -----
@app.post("/api/admin/users", response_model=schemas.UserResponse)
def admin_create_user(
    data: schemas.UserCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_admin),
):
    """Create a new user account (admin only)."""
    if db.query(models.User).filter(models.User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    user = models.User(
        username=data.username,
        password_hash=hash_password(data.password),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/api/admin/users", response_model=List[schemas.UserResponse])
def admin_list_users(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_admin),
):
    """List all users (admin only)."""
    return db.query(models.User).all()


# ----- Protected API (require login, scoped to owner) -----
@app.get("/api/tree", response_model=schemas.PersonTree)
def get_family_tree(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get the current user's family tree."""
    service = FamilyTreeService(db, owner_id=current_user.id)
    tree = service.build_tree()
    if not tree:
        raise HTTPException(status_code=404, detail="No family tree data found")
    return tree


@app.get("/api/persons", response_model=List[schemas.PersonResponse])
def get_all_persons(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all persons owned by the current user."""
    persons = db.query(models.Person).filter(models.Person.owner_id == current_user.id).all()
    return persons

@app.post("/api/persons", response_model=schemas.PersonResponse)
def create_person(
    person: schemas.PersonCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new person (owned by current user). Root or child uses normal auto-increment."""
    person_dict = person.dict()
    person_dict["owner_id"] = current_user.id
    db_person = models.Person(**person_dict)
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person


def _require_owner(db: Session, person_id: int, current_user: models.User) -> models.Person:
    """Return person if owned by current user; else 404."""
    db_person = db.query(models.Person).filter(
        models.Person.id == person_id,
        models.Person.owner_id == current_user.id,
    ).first()
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    return db_person


@app.get("/api/persons/{person_id}", response_model=schemas.PersonResponse)
def get_person(
    person_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a specific person by ID (must be owned by current user)."""
    return _require_owner(db, person_id, current_user)


@app.put("/api/persons/{person_id}", response_model=schemas.PersonResponse)
def update_person(
    person_id: int,
    person: schemas.PersonCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update a person (must be owned by current user)."""
    db_person = _require_owner(db, person_id, current_user)
    for key, value in person.dict().items():
        if key != "owner_id":
            setattr(db_person, key, value)
    db.commit()
    db.refresh(db_person)
    return db_person


@app.delete("/api/persons/{person_id}")
def delete_person(
    person_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a person and all their descendants (must be owned by current user)."""
    from sqlalchemy import text

    db_person = _require_owner(db, person_id, current_user)
    
    try:
        # Delete the person - CASCADE DELETE will automatically delete all descendants
        db.delete(db_person)
        db.flush()  # Flush to ensure deletion happens before we check max_id
        
        # Reset the ID sequence to start from the next available ID
        # This ensures IDs are sequential after deletions
        # Get the maximum ID after deletion (but before commit)
        max_id_result = db.execute(text("SELECT COALESCE(MAX(id), -1) FROM persons"))
        max_id = max_id_result.scalar()
        
        if max_id == -1:
            db.execute(text("SELECT setval('persons_id_seq', 1, false)"))
        else:
            db.execute(text("SELECT setval('persons_id_seq', :max_id, true)"), {"max_id": max_id})
        
        # Commit everything together (deletion + sequence reset)
        db.commit()
        
        return {"message": "Person and all descendants deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete person: {str(e)}")
