# ComplyNext Backend

FastAPI backend for ComplyNext — handles authentication, multi-tenant loan account management, deterministic NPA classification, RBI circular scraping, and RAG-based semantic search.

## Tech Stack

- **Framework**: FastAPI
- **Package Manager**: [`uv`](https://docs.astral.sh/uv/)
- **Database**: SQLite via SQLAlchemy ORM
- **Auth**: JWT (`python-jose`) + bcrypt password hashing (`passlib`)
- **Scraping**: `requests` + BeautifulSoup4
- **Embeddings / Vector Store**: `sentence-transformers` (`all-MiniLM-L6-v2`) + ChromaDB

## Project Structure
backend/
├── src/
│ ├── api/ # FastAPI route definitions
│ │ ├── main.py
│ │ ├── auth_routes.py
│ │ ├── loan_routes.py
│ │ ├── company_routes.py
│ │ └── circular_routes.py
│ ├── auth/ # Password hashing, JWT, auth dependency
│ │ ├── security.py
│ │ └── dependencies.py
│ ├── db/ # SQLAlchemy models and DB session setup
│ │ ├── database.py
│ │ ├── models.py
│ │ ├── init_db.py
│ │ └── seed_data.py
│ ├── rules_engine/ # Deterministic NPA classification engine
│ │ └── npa_engine.py
│ ├── scraper/ # RBI circular scraper
│ │ └── rbi_scraper.py
│ ├── embeddings/ # Embedding pipeline + vector store
│ │ └── vector_store.py
│ └── schemas/ # Pydantic request/response schemas
│ ├── auth.py
│ ├── loan.py
│ ├── company.py
│ └── circular.py
├── data/
├── pyproject.toml
└── uv.lock


## Setup

### 1. Install `uv`

```bash
# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Mac/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Install dependencies

```bash
cd backend
uv sync
```

### 3. Set up environment variables

Create a `.env` file in `backend/`: