"""
ComplyNext - Deterministic NPA / Asset Classification Rule Engine.

Design decision: this engine is INTENTIONALLY rule-based (no LLM call here),
because RBI's day-past-due thresholds are fixed legal rules, not something
that needs semantic reasoning. Keeping this deterministic also makes every
classification decision fully auditable and reproducible - which is exactly
what a compliance/audit trail requires.

Source: RBI Master Circular - Prudential Norms on Income Recognition, Asset
Classification and Provisioning (IRACP norms), Oct 1, 2021, clarified Nov 12, 2021.
"""

from dataclasses import dataclass
from enum import Enum

class AccountType(Enum):
    """
    Two account types because RBI applies DIFFERENT classification bases to each:
    - TERM_LOAN: classified by days the principal/interest payment is overdue.
    - REVOLVING: (cash credit / overdraft) classified by days the outstanding
      balance has stayed above the sanctioned limit / drawing power.
    """
    TERM_LOAN = "term_loan"
    REVOLVING = "revolving"


class Classification(Enum):
    """The five possible classification buckets defined by RBI's IRACP norms."""
    STANDARD = "Standard"
    SMA_0 = "SMA-0"
    SMA_1 = "SMA-1"
    SMA_2 = "SMA-2"
    NPA = "NPA"

@dataclass
class LoanAccount:
    """
    Represents one loan record as it would come from a bank's core system.
    'existing_classification' is what the bank's OWN record currently says -
    we keep it separate from our computed answer so we can detect mismatches.
    """
    account_id: str
    borrower_name: str
    account_type: AccountType
    days_past_due: int              # meaning depends on account_type (see AccountType docstring)
    outstanding_amount: float
    existing_classification: str = None   # optional - bank's current tag, if any

@dataclass
class ClassificationResult:
    """The output of running one account through the engine - this is what
    gets shown in the dashboard and written into the audit trail."""
    account_id: str
    borrower_name: str
    days_past_due: int
    computed_classification: str
    existing_classification: str
    is_misclassified: bool
    rule_reference: str     # which RBI circular this decision is based on (for audit trail)
    reasoning: str          # human-readable explanation of why this classification was chosen

def classify_term_loan(dpd: int) -> Classification:
    """
    Apply RBI's term-loan thresholds directly.
    dpd = days past due (principal or interest overdue).
    """
    if dpd <= 0:
        return Classification.STANDARD
    elif dpd <= 30:
        return Classification.SMA_0
    elif dpd <= 60:
        return Classification.SMA_1
    elif dpd <= 90:
        return Classification.SMA_2
    return Classification.NPA

def classify_revolving(days_over_limit: int) -> Classification:
    """
    Apply RBI's revolving-facility thresholds.
    Note: SMA-0 does not exist for revolving accounts per RBI norms -
    it jumps straight from Standard to SMA-1 at day 31.
    """
    if days_over_limit <= 30:
        return Classification.STANDARD
    elif days_over_limit <= 60:
        return Classification.SMA_1
    elif days_over_limit <= 90:
        return Classification.SMA_2
    return Classification.NPA


# Kept as a constant so every result cites the exact same source -
# this becomes the "clause citation" mentioned in the audit trail requirement.
RULE_REF = "RBI Master Circular - IRACP Norms (Oct 1, 2021)"

def evaluate_account(acc: LoanAccount) -> ClassificationResult:
    """
    Core function: takes one LoanAccount, runs the correct rule based on its
    type, and packages the result along with a plain-English reasoning string
    (this reasoning is what the 'Explainable Audit Trail' feature will show).
    """
    if acc.account_type == AccountType.TERM_LOAN:
        result = classify_term_loan(acc.days_past_due)
        reasoning = f"Overdue {acc.days_past_due} day(s) -> '{result.value}' per IRACP norms."
    else:
        result = classify_revolving(acc.days_past_due)
        reasoning = f"Over limit/DP for {acc.days_past_due} day(s) -> '{result.value}'."

    # Compare our computed answer against what the bank's own record says.
    # This comparison is the "flags misclassifications in existing records"
    # feature from the proposal.
    mismatch = (
        acc.existing_classification is not None
        and acc.existing_classification.strip().upper() != result.value.upper()
    )

    return ClassificationResult(
        acc.account_id, acc.borrower_name, acc.days_past_due,
        result.value, acc.existing_classification or "—",
        mismatch, RULE_REF, reasoning
    )


def run_batch(accounts):
    """Convenience wrapper to classify a whole list of accounts at once -
    this is what the API endpoint and CSV upload feature will call."""
    return [evaluate_account(a) for a in accounts]

# ---------------------------------------------------------------------
# Demo / test run.
# This block only executes when the file is run directly
# (e.g. `python npa_engine.py`), NOT when it's imported elsewhere
# (e.g. later when FastAPI imports run_batch from this file).
# ---------------------------------------------------------------------
if __name__ == "__main__":

    # Sample loan accounts - mimicking what real bank/NBFC loan data looks like.
    # Some accounts have a WRONG existing_classification on purpose,
    # so we can prove the mismatch-detection logic actually works.
    sample_accounts = [
        LoanAccount("LN001", "Ramesh Traders", AccountType.TERM_LOAN,
                    days_past_due=0, outstanding_amount=250000,
                    existing_classification="Standard"),          # correct

        LoanAccount("LN002", "Sunita Enterprises", AccountType.TERM_LOAN,
                    days_past_due=22, outstanding_amount=180000,
                    existing_classification="Standard"),          # WRONG: should be SMA-0

        LoanAccount("LN003", "Verma Textiles", AccountType.TERM_LOAN,
                    days_past_due=45, outstanding_amount=500000,
                    existing_classification="SMA-1"),              # correct

        LoanAccount("LN004", "Global Auto Spares", AccountType.TERM_LOAN,
                    days_past_due=75, outstanding_amount=320000,
                    existing_classification="SMA-1"),              # WRONG: should be SMA-2

        LoanAccount("LN005", "Krishna Dairy Farm", AccountType.TERM_LOAN,
                    days_past_due=95, outstanding_amount=150000,
                    existing_classification="SMA-2"),              # WRONG: should be NPA

        LoanAccount("LN006", "Om Sai Constructions", AccountType.TERM_LOAN,
                    days_past_due=120, outstanding_amount=900000,
                    existing_classification="NPA"),                # correct

        LoanAccount("LN007", "Metro Cash & Carry", AccountType.REVOLVING,
                    days_past_due=65, outstanding_amount=700000,
                    existing_classification="SMA-1"),              # WRONG: revolving 65 days -> SMA-2
    ]

    # Run every account through the engine at once.
    results = run_batch(sample_accounts)

    # Print a simple readable table - good enough to screenshot for the report.
    print(f"{'Acc ID':<8}{'Borrower':<22}{'DPD':<6}{'Computed':<10}{'Existing':<10}{'Mismatch?'}")
    print("-" * 70)
    for r in results:
        flag = "YES" if r.is_misclassified else "no"
        print(f"{r.account_id:<8}{r.borrower_name:<22}{r.days_past_due:<6}"
              f"{r.computed_classification:<10}{r.existing_classification:<10}{flag}")

    # Summary line - useful for the report ("system caught X misclassified accounts")
    flagged = [r for r in results if r.is_misclassified]
    print(f"\n{len(flagged)} of {len(results)} accounts were misclassified in existing records.")