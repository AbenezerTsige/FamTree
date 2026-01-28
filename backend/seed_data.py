"""
Seed the database with sample family tree data
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Person, Base
from datetime import date
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://famtree_user:famtree_pass@db:5432/famtree_db"
)

def seed_database():
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Person).count() > 0:
            print("Database already seeded. Skipping seed data.")
            return
        
        # Create sample family tree
        # Generation 0 (Oldest - Center)
        great_grandfather = Person(
            first_name="John",
            last_name="Smith",
            birth_date=date(1920, 1, 15),
            gender="male",
            parent_id=None
        )
        db.add(great_grandfather)
        db.flush()
        
        # Generation 1
        grandfather = Person(
            first_name="Robert",
            last_name="Smith",
            birth_date=date(1945, 3, 20),
            gender="male",
            parent_id=great_grandfather.id
        )
        db.add(grandfather)
        db.flush()
        
        uncle = Person(
            first_name="Michael",
            last_name="Smith",
            birth_date=date(1947, 6, 10),
            gender="male",
            parent_id=great_grandfather.id
        )
        db.add(uncle)
        db.flush()
        
        aunt = Person(
            first_name="Sarah",
            last_name="Smith",
            birth_date=date(1950, 9, 5),
            gender="female",
            parent_id=great_grandfather.id
        )
        db.add(aunt)
        db.flush()
        
        # Generation 2
        father = Person(
            first_name="David",
            last_name="Smith",
            birth_date=date(1970, 4, 12),
            gender="male",
            parent_id=grandfather.id
        )
        db.add(father)
        db.flush()
        
        uncle2 = Person(
            first_name="James",
            last_name="Smith",
            birth_date=date(1972, 8, 25),
            gender="male",
            parent_id=grandfather.id
        )
        db.add(uncle2)
        db.flush()
        
        cousin1 = Person(
            first_name="Emma",
            last_name="Smith",
            birth_date=date(1975, 11, 3),
            gender="female",
            parent_id=uncle.id
        )
        db.add(cousin1)
        db.flush()
        
        cousin2 = Person(
            first_name="Oliver",
            last_name="Smith",
            birth_date=date(1978, 2, 18),
            gender="male",
            parent_id=uncle.id
        )
        db.add(cousin2)
        db.flush()
        
        # Generation 3
        me = Person(
            first_name="Alex",
            last_name="Smith",
            birth_date=date(1995, 7, 30),
            gender="male",
            parent_id=father.id
        )
        db.add(me)
        db.flush()
        
        sibling = Person(
            first_name="Sophia",
            last_name="Smith",
            birth_date=date(1998, 12, 15),
            gender="female",
            parent_id=father.id
        )
        db.add(sibling)
        db.flush()
        
        cousin3 = Person(
            first_name="Lucas",
            last_name="Smith",
            birth_date=date(2000, 5, 22),
            gender="male",
            parent_id=uncle2.id
        )
        db.add(cousin3)
        db.flush()
        
        # Generation 4 (Youngest)
        nephew = Person(
            first_name="Noah",
            last_name="Smith",
            birth_date=date(2020, 3, 10),
            gender="male",
            parent_id=me.id
        )
        db.add(nephew)
        db.flush()
        
        niece = Person(
            first_name="Ava",
            last_name="Smith",
            birth_date=date(2022, 9, 5),
            gender="female",
            parent_id=me.id
        )
        db.add(niece)
        db.flush()
        
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
