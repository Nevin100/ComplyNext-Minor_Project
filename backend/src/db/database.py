"""
ComplyNext - Database connection setup.

Using SQLite for now (single file, zero setup) instead of PostgreSQL
(which is in the original tech stack) - the SQLAlchemy code below works
identically with both, so switching to Postgres later is just a
one-line change to DATABASE_URL, no other code needs to change.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file will be created at backend/complynext.db
DATABASE_URL = "sqlite:///./complynext.db"

# check_same_thread=False is needed only for SQLite, because FastAPI
# can handle requests on different threads.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# SessionLocal is a factory - every API request will create its own
# session from this, to talk to the database.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is what our model classes (Company, User, LoanAccount) will inherit
# from, so SQLAlchemy knows they represent database tables.
Base = declarative_base()

def get_db():
    """
    Dependency function for FastAPI - gives each request a fresh DB session
    and guarantees it gets closed afterward, even if an error occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()