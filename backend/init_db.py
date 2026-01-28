"""
Initialize database: run migrations and seed data
"""
import os
import time
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://famtree_user:famtree_pass@db:5432/famtree_db"
)

def wait_for_db(max_retries=30, delay=2):
    """Wait for database to be ready"""
    engine = create_engine(DATABASE_URL)
    for i in range(max_retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("Database is ready!")
            return True
        except OperationalError:
            print(f"Waiting for database... ({i+1}/{max_retries})")
            time.sleep(delay)
    return False

if __name__ == "__main__":
    if wait_for_db():
        # Run migrations
        print("Running database migrations...")
        os.system("alembic upgrade head")
        
        # Seed data
        print("Seeding database...")
        from seed_data import seed_database
        seed_database()
    else:
        print("Failed to connect to database!")
        exit(1)
