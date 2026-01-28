from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, database
from app.services import FamilyTreeService

app = FastAPI(title="Family Tree API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Family Tree API"}

@app.get("/api/tree", response_model=schemas.PersonTree)
def get_family_tree(db: Session = Depends(database.get_db)):
    """Get the entire family tree formatted for fan chart visualization"""
    service = FamilyTreeService(db)
    tree = service.build_tree()
    if not tree:
        raise HTTPException(status_code=404, detail="No family tree data found")
    return tree

@app.get("/api/persons", response_model=List[schemas.PersonResponse])
def get_all_persons(db: Session = Depends(database.get_db)):
    """Get all persons in the database"""
    persons = db.query(models.Person).all()
    return persons

@app.post("/api/persons", response_model=schemas.PersonResponse)
def create_person(person: schemas.PersonCreate, db: Session = Depends(database.get_db)):
    """Create a new person"""
    db_person = models.Person(**person.dict())
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person

@app.get("/api/persons/{person_id}", response_model=schemas.PersonResponse)
def get_person(person_id: int, db: Session = Depends(database.get_db)):
    """Get a specific person by ID"""
    person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

@app.put("/api/persons/{person_id}", response_model=schemas.PersonResponse)
def update_person(person_id: int, person: schemas.PersonCreate, db: Session = Depends(database.get_db)):
    """Update a person"""
    db_person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    for key, value in person.dict().items():
        setattr(db_person, key, value)
    
    db.commit()
    db.refresh(db_person)
    return db_person

@app.delete("/api/persons/{person_id}")
def delete_person(person_id: int, db: Session = Depends(database.get_db)):
    """Delete a person"""
    db_person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    # Check if person has children
    children = db.query(models.Person).filter(models.Person.parent_id == person_id).count()
    if children > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete person with {children} child(ren). Please delete or reassign children first."
        )
    
    db.delete(db_person)
    db.commit()
    return {"message": "Person deleted successfully"}
