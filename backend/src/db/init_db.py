"""
Run this once to create all database tables based on the models
defined in src/db/models.py. Safe to run multiple times - it only
creates tables that don't already exist.
"""
from src.db.database import engine, Base
from src.db.models import Company, User, LoanAccount  # noqa: F401 (imports needed so Base knows about these tables)

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")