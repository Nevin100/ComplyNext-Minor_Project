"""
ComplyNext - SQLAlchemy database models.

These classes define the actual database TABLES. Each class = one table.
Relationships (ForeignKey) are how we link a user/loan account to a specific
company - this linkage is the entire mechanism behind data isolation.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from src.db.database import Base


class Company(Base):
    """
    Represents one tenant (e.g. an NBFC or co-operative bank).
    Every user and every loan account will belong to exactly one company.
    """
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    # relationship() doesn't create a DB column - it's a convenience so that
    # in Python we can do `company.users` to get all users of that company.
    users = relationship("User", back_populates="company")
    loan_accounts = relationship("LoanAccount", back_populates="company")


class User(Base):
    """
    A login account. Linked to exactly one company via company_id -
    this is what makes login "know" which company's data to show.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)   # never store plain text passwords

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    company = relationship("Company", back_populates="users")


class LoanAccount(Base):
    """
    Same fields as our original in-memory LoanAccount from npa_engine.py,
    but now as a real DB table, WITH company_id added - this is the field
    that enforces data isolation: every query will filter by this.
    """
    __tablename__ = "loan_accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String, nullable=False)
    borrower_name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)      # "term_loan" or "revolving"
    days_past_due = Column(Integer, nullable=False)
    outstanding_amount = Column(Float, nullable=False)
    existing_classification = Column(String, nullable=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    company = relationship("Company", back_populates="loan_accounts")