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
    from sqlalchemy import text
    
    person_dict = person.dict()
    
    # If this is a root/founder (no parent), check if table is empty
    # If empty, assign ID 0; otherwise use auto-increment
    if person_dict.get('parent_id') is None:
        count = db.query(models.Person).count()
        print(f"Creating root - current count: {count}")
        if count == 0:
            # Table is empty - create root with ID 0
            # Use raw SQL to bypass SQLAlchemy's auto-increment restriction
            try:
                first_name = person_dict.get('first_name')
                last_name = person_dict.get('last_name', '') or ''
                birth_date = person_dict.get('birth_date')
                gender = person_dict.get('gender')
                color = person_dict.get('color') or None
                font_size = person_dict.get('font_size') or None
                font_family = person_dict.get('font_family') or None
                
                # Use raw SQL with proper parameter binding
                result = db.execute(text("""
                    INSERT INTO persons (id, first_name, last_name, birth_date, gender, parent_id, color, font_size, font_family)
                    VALUES (0, :first_name, :last_name, :birth_date, :gender, NULL, :color, :font_size, :font_family)
                    RETURNING id, first_name, last_name, birth_date, gender, parent_id, color, font_size, font_family
                """), {
                    'first_name': first_name,
                    'last_name': last_name,
                    'birth_date': birth_date,
                    'gender': gender,
                    'color': color,
                    'font_size': font_size,
                    'font_family': font_family
                })
                db.flush()
                
                # Reset sequence to start from 1 (next ID after 0)
                # Can't set sequence to 0, so set it to 1 (next value will be 1)
                try:
                    db.execute(text("SELECT setval('persons_id_seq', 1, false)"))
                    db.flush()
                    print(f"Sequence reset to 1 after creating root with ID 0")
                except Exception as seq_err:
                    print(f"Warning: Could not reset sequence: {seq_err}")
                    import traceback
                    print(traceback.format_exc())
                
                # Commit the transaction first
                db.commit()
                
                # Now query the created person from the database (it's now in the session)
                db_person = db.query(models.Person).filter(models.Person.id == 0).first()
                if not db_person:
                    raise HTTPException(status_code=500, detail="Failed to create root person - could not retrieve created record")
            except HTTPException:
                raise
            except Exception as e:
                db.rollback()
                import traceback
                error_details = traceback.format_exc()
                print(f"Error creating root person: {error_details}")
                raise HTTPException(status_code=500, detail=f"Failed to create root person: {str(e)}")
        else:
            # Table has data - use auto-increment
            db_person = models.Person(**person_dict)
            db.add(db_person)
            db.commit()
            db.refresh(db_person)
    else:
        # Regular child - use auto-increment
        db_person = models.Person(**person_dict)
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
    """Delete a person and all their descendants (cascade delete), then reset ID sequence"""
    from sqlalchemy import text
    
    db_person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    
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
            # Table is empty - reset sequence to 1 (next value will be 1)
            # We'll manually insert ID 0 when creating root in empty table
            db.execute(text("SELECT setval('persons_id_seq', 1, false)"))
            print(f"Table is empty - sequence reset to 1")
        else:
            # Reset the sequence to start from max_id + 1
            # Use true to set the last_value, so next value will be max_id + 1
            db.execute(text(f"SELECT setval('persons_id_seq', {max_id}, true)"))
            print(f"Sequence reset to {max_id}, next value will be {max_id + 1}")
        
        # Commit everything together (deletion + sequence reset)
        db.commit()
        
        return {"message": "Person and all descendants deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete person: {str(e)}")
