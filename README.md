# ComplyNext

**RBI/NBFC Compliance Intelligence System**

A full-stack, multi-tenant compliance automation platform for Indian NBFCs and co-operative banks, built around RBI regulatory circulars. ComplyNext combines a deterministic rule engine for NPA/asset classification with a RAG-based semantic search pipeline over live-scraped RBI circulars.

Minor Project — 7th Semester, B.Tech CSE
Maharaja Surajmal Institute of Technology, New Delhi

## Team

- Nevin Bali (31)
- Sanidhya Vats (05)
- Ayush Tomer (51)

Under the supervision of Dr. Poonam (mentor).

## Problem Statement

Small and mid-sized NBFCs and co-operative banks struggle to keep internal policies aligned with RBI's constantly-updated circulars, and lack affordable tools to classify loan accounts per RBI's exact prudential norms. ComplyNext addresses this with an affordable, explainable, multi-tenant platform.

## Architecture
# ComplyNext — Project Folder Structure

RBI/NBFC Compliance Intelligence System — FastAPI backend + Next.js frontend.

## Folder Structure

```text
backend/
├── src/
│   ├── api/                  # Route definitions
│   │   ├── main.py           # App entrypoint, router registration, CORS, table creation
│   │   ├── auth_routes.py    # /auth/*
│   │   ├── loan_routes.py    # /api/loan-accounts/* + CSV bulk upload + classification
│   │   ├── company_routes.py # /api/company/*
│   │   ├── circular_routes.py# /api/circulars/*
│   │   ├── policy_routes.py  # /api/policies/* — policy upload + gap analysis
│   │   └── audit_routes.py   # /api/audit/* — audit trail + PDF export
│   ├── auth/
│   │   ├── security.py       # hash_password, verify_password, JWT create/decode
│   │   └── dependencies.py   # get_current_user (HTTPBearer-based)
│   ├── db/
│   │   ├── database.py       # engine, SessionLocal, get_db, Base
│   │   ├── models.py         # 9 tables — Company, User, LoanAccount, Circular, PolicyDocument,
│   │   │                     #   GapFinding, AuditLog, SourceSnapshot, ChangeAlert
│   │   ├── init_db.py        # creates tables — run once / after model changes
│   │   └── seed_data.py      # seeds sample loan accounts across companies
│   ├── rules_engine/
│   │   └── npa_engine.py     # deterministic Standard/SMA-0/1/2/NPA classifier
│   ├── scraper/
│   │   └── rbi_scraper.py    # fetch → chunk → persist RBI circulars
│   ├── embeddings/
│   │   └── vector_store.py   # embed chunks, build/query ChromaDB collection
│   ├── schemas/              # Pydantic request/response shapes
│   │   ├── auth.py           # CompanySignup, UserLogin, Token, UserOut
│   │   ├── loan.py           # LoanAccountCreate, LoanAccountUpdate, LoanAccountOut
│   │   ├── company.py        # CompanyUpdate, CompanyOut
│   │   ├── circular.py       # CircularSummary, ChangeAlertOut
│   │   ├── policy.py         # PolicyDocumentOut, GapFindingOut, AnalyzeResponse
│   │   ├── audit_logs.py     # AuditLogOut
│   │   └── search.py         # CircularSearchResult
│   ├── agents/               # Policy Gap Detection — LangGraph multi-agent pipeline
│   │   └── gap_graph.py      # retriever → comparer → explainer (Groq llama-3.3-70b)
│   ├── monitor/
│   │   └── change_monitor.py # SHA-256 circular change monitor (every 12 hours)
│   └── eval/
│       └── evaluate.py       # 25 NPA test cases + 6 planted-gap clauses → eval_results.json
├── data/                     # runtime data
├── chroma_data/              # ChromaDB persistent storage (vectors)
├── complynext.db             # SQLite database file
├── .env                      # JWT_SECRET_KEY, JWT_ALGORITHM, GROQ_API_KEY
├── requirements.txt
└── pyproject.toml / uv.lock
```

## Current Features (Progress Report - Phase 2)

- **RBI Circular Scraper** — live scraping of real RBI Master Circulars (IRACP norms, KYC Master Direction), with clean text extraction and chunking
- **Deterministic NPA/Asset Classification Engine** — rule-based classification (Standard / SMA-0 / SMA-1 / SMA-2 / NPA) per RBI's exact day-past-due thresholds, with misclassification detection against existing records
- **RAG Retrieval Pipeline** — scraped circulars are embedded (`sentence-transformers`) and stored in ChromaDB for semantic search, with source-traceable citations
- **Multi-tenant Auth & Data Isolation** — JWT-based authentication, bcrypt password hashing, and company-scoped data access (each NBFC/bank only sees its own loan accounts)
- **Full CRUD APIs** — loan account management (single + bulk upload), company profile management
- **Dashboard (Next.js)** — live classification results with color-coded status and misclassification flags

## Planned (Later Phases)

- Policy Gap Detection agent (LangGraph multi-agent RAG pipeline comparing internal policy docs against RBI circulars)
- Live Circular Change Monitor (detects newly published circulars, flags affected policies)
- Explainable Audit Trail export (PDF reports)
- Frontend pages: company profile UI, data upload UI, circulars listing UI, RAG query UI, theming
- Production deployment (Docker, cloud hosting)

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy, SQLite |
| Auth | JWT (`python-jose`), `passlib`/bcrypt |
| Scraping | `requests`, BeautifulSoup4 |
| Embeddings / Vector Store | `sentence-transformers`, ChromaDB |
| Frontend | Next.js 14 (App Router), Tailwind CSS, Recharts |
| Package Management | `uv` (backend), npm (frontend) |

## Getting Started

See [`backend/README.md`](./backend/README.md) for backend setup, and [`frontend/README.md`](./frontend/README.md) for frontend setup.

## Regulatory Sources

- [RBI Master Circular - Prudential Norms on Income Recognition, Asset Classification and Provisioning (IRACP)](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12472&Mode=0)
- [RBI Master Direction - Know Your Customer (KYC), 2016](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=11566&Mode=0)