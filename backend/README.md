# ComplyNext

**RBI/NBFC Compliance Intelligence System** — Minor Project, 7th Semester B.Tech CSE
Maharaja Surajmal Institute of Technology, New Delhi | Supervisor: Dr. Poonam

A full-stack, multi-tenant compliance automation platform for Indian NBFCs and co-operative banks. Combines a deterministic rule engine for NPA/asset classification with a RAG-based semantic search pipeline over live-scraped RBI circulars.

## Repository Structure
ComplyNext/
├── backend/ # FastAPI + SQLAlchemy + ChromaDB — see backend/README.md
└── frontend/ # Next.js 14 (App Router) + Tailwind


## What's Built

### Backend (Phase 2 — complete)
- JWT auth with multi-tenant data isolation
- Full CRUD: loan accounts, company profile
- Deterministic NPA/Asset Classification engine (RBI IRACP norms)
- RBI circular scraper (live data)
- RAG pipeline: embeddings + ChromaDB semantic search

### Frontend (Phase 3 — in progress)
- Auth pages: `/login`, `/signup`
- Protected pages (behind JWT guard): `/dashboard`, `/classify`, `/circulars`, `/search`, `/company`
- Shared layout: `AppLayout`, `Navbar`, `Sidebar`
- All pages integrated with live backend API calls (see backend README for exact endpoints/schemas)

## Regulatory Sources

- [RBI Master Circular - IRACP Norms](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12472&Mode=0)
- [RBI Master Direction - KYC, 2016](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=11566&Mode=0)

# ComplyNext Backend

FastAPI backend — auth, multi-tenant loan account management, deterministic NPA classification, RBI circular scraping, RAG semantic search.

## Tech Stack

- **Framework**: FastAPI · **Package Manager**: `uv` · **DB**: SQLite + SQLAlchemy ORM
- **Auth**: JWT (`python-jose`) + bcrypt (`passlib`)
 - **Scraping**: `requests` + BeautifulSoup4
- **Embeddings/Vector Store**: `sentence-transformers` (`all-MiniLM-L6-v2`) + ChromaDB

## Folder Structure
backend/
├── src/
│ ├── api/ # Route definitions
│ │ ├── main.py # App entrypoint, router registration
│ │ ├── auth_routes.py # /auth/*
│ │ ├── loan_routes.py # /api/loan-accounts/*
│ │ ├── company_routes.py # /api/company/*
│ │ └── circular_routes.py # /api/circulars/*
│ ├── auth/
│ │ ├── security.py # hash_password, verify_password, JWT create/decode
│ │ └── dependencies.py # get_current_user (HTTPBearer-based)
│ ├── db/
│ │ ├── database.py # engine, SessionLocal, get_db, Base
│ │ ├── models.py # Company, User, LoanAccount, Circular
│ │ ├── init_db.py # creates tables — run once / after model changes
│ │ └── seed_data.py # seeds sample loan accounts across companies
│ ├── rules_engine/
│ │ └── npa_engine.py # deterministic Standard/SMA-0/1/2/NPA classifier
│ ├── scraper/
│ │ └── rbi_scraper.py # fetch → chunk → persist RBI circulars
│ ├── embeddings/
│ │ └── vector_store.py # embed chunks, build/query ChromaDB collection
│ ├── schemas/ # Pydantic request/response shapes
│ │ ├── auth.py # CompanySignup, UserLogin, Token, UserOut
│ │ ├── loan.py # LoanAccountCreate, LoanAccountUpdate, LoanAccountOut
│ │ ├── company.py # CompanyUpdate, CompanyOut
│ │ ├── circular.py # CircularSummary
│ │ └── search.py # CircularSearchResult
│ └── agents/ # reserved for Phase 3 LangGraph Policy Gap agent (not yet built)
├── data/
├── chroma_data/ # ChromaDB persistent storage (vectors)
├── complynext.db # SQLite database file
├── .env # JWT_SECRET_KEY, JWT_ALGORITHM
└── pyproject.toml / uv.lock


## Database Models (`src/db/models.py`)

| Table | Key Fields |
|---|---|
| `Company` | `id`, `name` (unique), `created_at` |
| `User` | `id`, `email` (unique), `hashed_password`, `company_id` (FK) |
| `LoanAccount` | `id`, `account_id`, `borrower_name`, `account_type`, `days_past_due`, `outstanding_amount`, `existing_classification`, `company_id` (FK) |
| `Circular` | `id`, `source_name`, `source_url`, `chunk_index`, `chunk_text`, `scraped_at` |

Every `LoanAccount` row is scoped to a `company_id` — this is the multi-tenant isolation boundary. Every query filters by the `company_id` extracted from the JWT, never from client input.

## Schemas (`src/schemas/`)

- **`auth.py`**: `CompanySignup {company_name, admin_email, admin_password}`, `UserLogin {email, password}`, `Token {access_token, token_type}`, `UserOut {id, email, company_id}`
- **`loan.py`**: `LoanAccountCreate {account_id, borrower_name, account_type, days_past_due, outstanding_amount, existing_classification?}`, `LoanAccountUpdate` (all fields optional, partial update), `LoanAccountOut` (adds `id`)
- **`company.py`**: `CompanyUpdate {name?}`, `CompanyOut {id, name, created_at, total_users, total_loan_accounts}` (counts computed on the fly, not stored)
- **`circular.py`**: `CircularSummary {source_name, source_url, total_chunks, scraped_at}` — one row per unique circular, grouped from chunk-level rows
- **`search.py`**: `CircularSearchResult {source_name, source_url, chunk_index, text}`

## API Endpoints

### Auth (`/auth`) — no token required
| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Creates Company + first admin User in one call |
| POST | `/auth/login` | Verifies credentials, returns JWT (`access_token`) |

### Loan Accounts (`/api/loan-accounts`) — token required, company-scoped
| Method | Path | Description |
|---|---|---|
| GET | `/api/loan-accounts` | List all loan accounts for logged-in company |
| POST | `/api/loan-accounts` | Create one account |
| POST | `/api/loan-accounts/bulk` | Create multiple accounts (array body) |
| PUT | `/api/loan-accounts/{id}` | Partial update (only sent fields change) |
| DELETE | `/api/loan-accounts/{id}` | Delete (ownership-checked, 404 if not owned) |

### NPA Classification
| Method | Path | Description |
|---|---|---|
| GET | `/api/classify` | Runs `npa_engine` on the company's DB accounts; returns computed classification, existing classification, mismatch flag, and human-readable `reasoning` per account |

### Company Profile (`/api/company`) — token required
| Method | Path | Description |
|---|---|---|
| GET | `/api/company/me` | Own company profile + user/account counts |
| PATCH | `/api/company/me` | Update company name |
| DELETE | `/api/company/me` | Cascade-deletes company + its users + loan accounts |

### Circulars (`/api/circulars`) — token required
| Method | Path | Description |
|---|---|---|
| GET | `/api/circulars` | Grouped list: one row per circular source, with `total_chunks` and `scraped_at` |
| POST | `/api/circulars/scrape` | Triggers scraper synchronously, re-ingests + re-embeds |

### RAG Search
| Method | Path | Description |
|---|---|---|
| GET | `/api/search-circulars?query=...` | Semantic search over embedded circular chunks; returns top-3 results with source citation. Not company-filtered — RBI regulation text is shared knowledge across tenants |

## Setup

```bash
cd backend
uv sync
# create .env with JWT_SECRET_KEY, JWT_ALGORITHM=HS256
uv run python -m src.db.init_db
uv run uvicorn src.api.main:app --reload --port 8000
```

Docs at `http://localhost:8000/docs`.

### Ingest RBI circulars (once, or after signup/testing)

```bash
uv run python -m src.scraper.rbi_scraper
uv run python -m src.embeddings.vector_store
```

Or use `POST /api/circulars/scrape` once logged in.

### Seed sample data (for demo)

`src/db/seed_data.py` seeds sample loan accounts into existing companies (edit company names in the script to match your signed-up companies), run with:

```bash
uv run python -m src.db.seed_data
```

## Key Design Decisions

- **Deterministic NPA engine** (no LLM): RBI's day-past-due thresholds are fixed rules — auditability and reproducibility matter more than semantic reasoning here.
- **Multi-tenant isolation**: `company_id` always derived server-side from the JWT (`get_current_user` dependency), never trusted from request body/URL.
- **Local embeddings**: `sentence-transformers` avoids requiring paid OpenAI/Cohere API keys during development.
- **Circulars are shared, loan accounts are tenant-scoped**: `/api/search-circulars` has no company filter (regulatory text is common knowledge); `/api/loan-accounts` and `/api/classify` are always company-filtered.

## Known Limitations / Not Yet Built

- Policy Gap Detection Agent (LangGraph multi-agent RAG comparing uploaded policy docs against circulars) — `src/agents/` reserved but empty
- Live Circular Change Monitor (detect new/updated circulars, flag affected policies)
- Explainable Audit Trail PDF export (reasoning is returned in API responses, but not yet exported as a report)
- Accuracy/precision/recall evaluation against curated test cases
- SQLite used in dev; production target is PostgreSQL
- Scraping is synchronous (blocks the request); no background job queue yet