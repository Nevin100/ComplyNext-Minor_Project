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

# ComplyNext Frontend

Next.js 14 (App Router) frontend for ComplyNext — auth, dashboard, and all backend-integrated pages.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **HTTP Client**: axios
- **Auth**: JWT stored client-side, attached to API calls via `Authorization: Bearer <token>`

## Folder Structure
frontend/
├── app/
│ ├── (auth)/
│ │ ├── login/page.tsx # Login form → POST /auth/login
│ │ └── signup/page.tsx # Signup form → POST /auth/signup
│ ├── dashboard/page.tsx # NPA classification results → GET /api/classify
│ ├── classify/page.tsx # Loan entry (single + bulk upload) → POST /api/loan-accounts, /api/loan-accounts/bulk
│ ├── circulars/page.tsx # Scraped circulars list → GET /api/circulars
│ ├── search/page.tsx # RAG semantic search UI → GET /api/search-circulars
│ ├── company/page.tsx # Company profile → GET/PATCH /api/company/me
│ ├── layout.tsx # Root layout
│ ├── page.tsx # Landing page
│ └── globals.css
├── components/
│ ├── AppLayout.tsx # Wraps protected pages with Navbar + Sidebar
│ ├── Navbar.tsx
│ └── Sidebar.tsx
├── lib/
│ └── auth.ts # getToken(), logout() helpers
├── public/
├── .env.local # NEXT_PUBLIC_API_URL
└── package.json

## Pages & Backend Integration

| Page | Route | Backend Endpoint(s) | Auth |
|---|---|---|---|
| Login | `/login` | `POST /auth/login` | No |
| Signup | `/signup` | `POST /auth/signup` | No |
| Dashboard | `/dashboard` | `GET /api/classify` | Yes |
| Classify / Loan Entry | `/classify` | `POST /api/loan-accounts`, `POST /api/loan-accounts/bulk`, `GET /api/loan-accounts` | Yes |
| Circulars | `/circulars` | `GET /api/circulars`, `POST /api/circulars/scrape` | Yes |
| Search (RAG) | `/search` | `GET /api/search-circulars?query=...` | Yes |
| Company | `/company` | `GET/PATCH /api/company/me` | Yes |

## Auth Flow

1. User signs up (`/signup`) → backend creates `Company` + admin `User`, returns `company_id`
2. User logs in (`/login`) → backend returns `access_token` (JWT)
3. Token is stored client-side (via `lib/auth.ts`) and attached to every protected API call as `Authorization: Bearer <token>`
4. Protected pages (`dashboard`, `classify`, `circulars`, `search`, `company`) check for a valid token before rendering — no token redirects to `/login`
5. `company_id` is never sent by the frontend — the backend always derives it from the decoded JWT, enforcing multi-tenant isolation server-side

## Setup

```bash
cd frontend
npm install
```

Create `.env.local`:
NEXT_PUBLIC_API_URL=http://localhost:8000


Run dev server:
```bash
npm run dev
```

Opens at `http://localhost:3000`. Backend must be running at the URL in `NEXT_PUBLIC_API_URL` (see `../backend/README.md`).

## Known Limitations / Not Yet Built

- Settings page for DaisyUI theme switching (planned, client-side only via localStorage — no backend dependency)
- Visual/UX polish pass (current pages are functional-first; a Gemini-assisted enhancement pass is planned)
- No global state management (e.g. React Context/Zustand) yet — auth state is read per-page via `lib/auth.ts`
- No client-side form validation library — relies on backend validation errors
