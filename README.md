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

```text
ComplyNext-Minor_Project/
│
├── README.md                        # project overview, setup and run instructions
│
├── backend/                         # FastAPI backend (Python 3.11+)
│   ├── requirements.txt             # Python dependencies
│   ├── pyproject.toml               # project configuration
│   └── src/
│       ├── api/                     # REST API routes (FastAPI routers)
│       │   ├── main.py              # app entry point — routers, CORS, table creation on startup
│       │   ├── auth_routes.py       # signup / login (JWT)
│       │   ├── loan_routes.py       # loan CRUD + CSV bulk upload, classification run
│       │   ├── circular_routes.py   # scrape circulars, list corpus, update checks
│       │   ├── policy_routes.py     # policy upload + gap analysis trigger
│       │   ├── audit_routes.py      # audit trail listing + PDF export
│       │   └── company_routes.py    # institution (tenant) profile
│       │
│       ├── agents/                  # Policy Gap Detection — LangGraph multi-agent pipeline
│       │   └── gap_graph.py         # retriever → comparer → explainer graph (Groq LLM)
│       │
│       ├── rules_engine/            # NPA classification
│       │   └── npa_engine.py        # deterministic IRACP rule engine (DPD thresholds)
│       │
│       ├── scraper/                 # RBI circular ingestion
│       │   └── rbi_scraper.py       # scrapes rbi.org.in circulars, splits into chunks
│       │
│       ├── embeddings/              # vector search (RAG)
│       │   └── vector_store.py      # ChromaDB store + all-MiniLM-L6-v2 embeddings
│       │
│       ├── monitor/                 # circular change monitoring
│       │   └── change_monitor.py    # SHA-256 snapshot comparison, runs every 12 hours
│       │
│       ├── db/                      # database layer (SQLAlchemy + SQLite)
│       │   ├── database.py          # engine and session setup
│       │   ├── models.py            # 9 tables — companies, users, loan_accounts, circulars,
│       │   │                        #   policy_documents, gap_findings, audit_logs,
│       │   │                        #   source_snapshots, change_alerts
│       │   ├── init_db.py           # database initialisation
│       │   └── seed_data.py         # demo seed data
│       │
│       ├── auth/                    # security
│       │   ├── security.py          # password hashing + JWT token creation
│       │   └── dependencies.py      # current-user guard — enforces tenant (company) scope
│       │
│       ├── schemas/                 # request / response models (Pydantic)
│       │   ├── auth.py              #   signup / login payloads
│       │   ├── loan.py              #   loan account payloads
│       │   ├── circular.py          #   circular + change-alert responses
│       │   ├── policy.py            #   policy document + gap finding responses
│       │   ├── audit_logs.py        #   audit trail responses
│       │   ├── company.py           #   institution profile responses
│       │   └── search.py            #   semantic search responses
│       │
│       └── eval/                    # evaluation harness
│           └── evaluate.py          # 25 hand-labelled NPA cases + 6 planted-gap policy clauses
│
└── frontend/                        # Next.js frontend (TypeScript, App Router)
    ├── package.json                 # Node dependencies and scripts
    ├── tsconfig.json                # TypeScript configuration
    ├── next.config.ts               # Next.js configuration
    │
    ├── app/                         # pages
    │   ├── page.tsx                 # landing page (public homepage)
    │   ├── layout.tsx               # root layout — fonts + application shell
    │   ├── globals.css              # design system (petrol-teal theme, CSS variables)
    │   ├── (auth)/
    │   │   ├── login/page.tsx       # sign in
    │   │   └── signup/page.tsx      # create workspace (register institution)
    │   ├── dashboard/page.tsx       # compliance overview (command centre)
    │   ├── classify/page.tsx        # add loans, CSV bulk upload, run classification
    │   ├── circulars/page.tsx       # indexed circulars + change alerts
    │   ├── search/page.tsx          # regulatory semantic search ("Ask the corpus")
    │   ├── policy-check/page.tsx    # upload policy, view gap findings with citations
    │   ├── audit/page.tsx           # audit trail + PDF export
    │   ├── company/page.tsx         # entity (institution) profile
    │   ├── privacy/page.tsx         # privacy policy
    │   ├── not-found.tsx            # 404 page
    │   ├── robots.ts                # search-engine robots rules
    │   └── sitemap.ts               # sitemap generation
    │
    ├── components/                  # shared UI components
    │   ├── AppLayout.tsx            # sidebar shell (hides itself on public pages)
    │   ├── Sidebar.tsx              # navigation sidebar + mobile drawer
    │   ├── Navbar.tsx               # top navigation (public pages)
    │   └── ui.tsx                   # shared primitives — Card, PageHeader, Pill, Spinner
    │
    └── lib/                         # frontend helpers
        ├── api.ts                   # axios instance + JWT interceptor (NEXT_PUBLIC_API_URL)
        └── auth.ts                  # logout helper
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