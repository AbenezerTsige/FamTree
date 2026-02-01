"""
Seed the database with sample family tree data and default login user.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Person, Base, User
from app.auth import hash_password
from datetime import date
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://famtree_user:famtree_pass@db:5432/famtree_db"
)

DEFAULT_USERNAME = "admin"
DEFAULT_PASSWORD = "admin"

def seed_database():
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create default user (admin/admin) if no users exist
        if db.query(User).count() == 0:
            default_user = User(
                username=DEFAULT_USERNAME,
                password_hash=hash_password(DEFAULT_PASSWORD),
                is_admin=True,
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            print(f"Default user created: username={DEFAULT_USERNAME}, password={DEFAULT_PASSWORD} (admin)")

        # Owner for seeded persons: first user (admin)
        owner = db.query(User).order_by(User.id).first()
        owner_id = owner.id if owner else None

        # Check if person data already exists
        if db.query(Person).count() > 0:
            print("Database already seeded. Skipping seed data.")
            return

        if not owner_id:
            print("No user to own seeded data. Skipping seed data.")
            return

        # Create sample family tree (owned by first user)
        # Generation 0 (Oldest - Center)
        great_grandfather = Person(
            owner_id=owner_id,
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
            owner_id=owner_id,
            first_name="Robert",
            last_name="Smith",
            birth_date=date(1945, 3, 20),
            gender="male",
            parent_id=great_grandfather.id
        )
        db.add(grandfather)
        db.flush()
        
        uncle = Person(
            owner_id=owner_id,
            first_name="Michael",
            last_name="Smith",
            birth_date=date(1947, 6, 10),
            gender="male",
            parent_id=great_grandfather.id
        )
        db.add(uncle)
        db.flush()
        
        aunt = Person(
            owner_id=owner_id,
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
            owner_id=owner_id,
            first_name="David",
            last_name="Smith",
            birth_date=date(1970, 4, 12),
            gender="male",
            parent_id=grandfather.id
        )
        db.add(father)
        db.flush()
        
        uncle2 = Person(
            owner_id=owner_id,
            first_name="James",
            last_name="Smith",
            birth_date=date(1972, 8, 25),
            gender="male",
            parent_id=grandfather.id
        )
        db.add(uncle2)
        db.flush()
        
        cousin1 = Person(
            owner_id=owner_id,
            first_name="Emma",
            last_name="Smith",
            birth_date=date(1975, 11, 3),
            gender="female",
            parent_id=uncle.id
        )
        db.add(cousin1)
        db.flush()
        
        cousin2 = Person(
            owner_id=owner_id,
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
            owner_id=owner_id,
            first_name="Alex",
            last_name="Smith",
            birth_date=date(1995, 7, 30),
            gender="male",
            parent_id=father.id
        )
        db.add(me)
        db.flush()
        
        sibling = Person(
            owner_id=owner_id,
            first_name="Sophia",
            last_name="Smith",
            birth_date=date(1998, 12, 15),
            gender="female",
            parent_id=father.id
        )
        db.add(sibling)
        db.flush()
        
        cousin3 = Person(
            owner_id=owner_id,
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
            owner_id=owner_id,
            first_name="Noah",
            last_name="Smith",
            birth_date=date(2020, 3, 10),
            gender="male",
            parent_id=me.id
        )
        db.add(nephew)
        db.flush()
        
        niece = Person(
            owner_id=owner_id,
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
