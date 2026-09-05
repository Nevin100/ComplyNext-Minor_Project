"""
ComplyNext - One-time script to seed sample loan accounts into the database,
split across the two companies created during signup testing.

Run this ONCE after signup - it looks up companies by name and attaches
loan accounts to each, so we can demonstrate that each company only sees
its own data.
"""

from src.db.database import SessionLocal
from src.db.models import Company, LoanAccount

db = SessionLocal()

# Look up the two companies created earlier via /auth/signup.
# Adjust these names if you used different ones during signup.
company_a = db.query(Company).filter(Company.name == "Test NBFC").first()
company_b = db.query(Company).filter(Company.name == "Test Cooperative Bank").first()

if not company_a or not company_b:
    print("Companies not found. Make sure you've signed up both companies first.")
    exit()

# Company A gets these accounts.
company_a_accounts = [
    LoanAccount(account_id="LN001", borrower_name="Ramesh Traders", account_type="term_loan",
                days_past_due=0, outstanding_amount=250000, existing_classification="Standard",
                company_id=company_a.id),
    LoanAccount(account_id="LN002", borrower_name="Sunita Enterprises", account_type="term_loan",
                days_past_due=22, outstanding_amount=180000, existing_classification="Standard",
                company_id=company_a.id),
    LoanAccount(account_id="LN003", borrower_name="Verma Textiles", account_type="term_loan",
                days_past_due=45, outstanding_amount=500000, existing_classification="SMA-1",
                company_id=company_a.id),
]

# Company B gets DIFFERENT accounts - this is what proves isolation in the demo.
company_b_accounts = [
    LoanAccount(account_id="LN101", borrower_name="Global Auto Spares", account_type="term_loan",
                days_past_due=75, outstanding_amount=320000, existing_classification="SMA-1",
                company_id=company_b.id),
    LoanAccount(account_id="LN102", borrower_name="Krishna Dairy Farm", account_type="term_loan",
                days_past_due=95, outstanding_amount=150000, existing_classification="SMA-2",
                company_id=company_b.id),
    LoanAccount(account_id="LN103", borrower_name="Metro Cash & Carry", account_type="revolving",
                days_past_due=65, outstanding_amount=700000, existing_classification="SMA-1",
                company_id=company_b.id),
]

db.add_all(company_a_accounts + company_b_accounts)
db.commit()

print(f"Seeded {len(company_a_accounts)} accounts for '{company_a.name}'")
print(f"Seeded {len(company_b_accounts)} accounts for '{company_b.name}'")

db.close()