<div align="center">

# 📡 ResumeRadar  
# This this my Mini project 

### Find your gap. Close it. Get hired.

**AI-powered skill-gap analyzer, career roadmap builder and job-match platform —
powered by a private, local LLM that never sends your data anywhere.**

[![CI](https://github.com/amiskin1409/resumeradar/actions/workflows/ci.yml/badge.svg)](https://github.com/amiskin1409/resumeradar/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white)](https://python.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Ollama](https://img.shields.io/badge/Local_AI-Ollama-fff?logo=ollama&logoColor=black)](https://ollama.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## ✨ What it does

| Feature | Description |
|---|---|
| 🔐 **Auth & Profiles** | Custom JWT auth with bcrypt-hashed passwords. Students register with name, email, field of study & graduation year. |
| 📄 **Resume Intelligence** | Upload a PDF resume — skills and projects are extracted **locally** (PyMuPDF) with a 185-skill taxonomy and word-boundary matching. |
| 🎯 **Skill Gap Analysis** | Pick a target role and get an **exact readiness %** (deterministic weighted coverage — not an AI guess), matched ✅ vs missing ❌ skills, and best-fit roles ranked across 18 careers. |
| 🗺️ **AI Roadmap** | A 3-phase personalized plan (bridge gaps → core skills → job-ready) with resources, estimated hours and progress checkboxes. |
| 💡 **Project Recommender** | Role-specific portfolio projects chosen to force-close your gaps, with a resume-vs-skills consistency angle. |
| 🏢 **Company Matchmaker** | 55 curated Indian companies (298 job postings) filtered by remote/hybrid/onsite, industry and city — each with an explainable **fit score** and one-click **Apply** links. |
| 🎙️ **Mock Interview Prep** | Role-tailored checklist + one-click launch into [incruit.online](https://incruit.online) AI mock interviews. |
| 🤖 **Private AI layer** | An open-source LLM running locally via **Ollama** generates summaries, roadmaps, projects and prep items. Works fully offline with high-quality template fallbacks until Ollama is installed. |

## 🏗️ Architecture

```
┌────────────────────────────┐        ┌──────────────────────────────────────┐
│   Frontend (React 19)      │  /api  │        Backend (FastAPI)             │
│  Vite · Tailwind v4        │ ─────► │  JWT auth · SQLAlchemy · SQLite      │
│  Framer Motion · Recharts  │  CORS  │                                      │
└────────────────────────────┘        │  ┌────────────────────────────────┐  │
                                      │  │ Deterministic engine           │  │
                                      │  │ • resume parser (PyMuPDF)      │  │
                                      │  │ • 185-skill taxonomy           │  │
                                      │  │ • weighted gap scoring         │  │
                                      │  │ • company feasibility scores   │  │
                                      │  └────────────────────────────────┘  │
                                      │  ┌────────────────────────────────┐  │   ┌─────────────────┐
                                      │  │ AI layer (Ollama, local)       │◄──┼──►│ qwen2.5:3b /    │
                                      │  │ roadmaps · projects · summaries│   │   │ llama3.2 (CPU)  │
                                      │  └────────────────────────────────┘   │   └─────────────────┘
                                      │  ┌────────────────────────────────┐  │
                                      │  │ Data: curated India dataset +  │  │
                                      │  │ optional Kaggle LinkedIn ETL   │  │
                                      │  └────────────────────────────────┘  │
                                      └──────────────────────────────────────┘
```

**Why two AI layers?** Numbers you can trust: readiness %, skill gaps and fit scores are
computed by transparent, testable Python code. The local LLM handles the *human* parts —
coaching summaries, roadmap phrasing, project ideas — and can be swapped or upgraded freely.

## 🚀 Quick start

### Prerequisites
- **Python 3.11+** · **Node 18+** · (optional) [Ollama](https://ollama.com) for AI features

### ⚡ Shortcuts (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start_dev.ps1       # start backend + frontend together
powershell -ExecutionPolicy Bypass -File scripts\setup_ollama.ps1   # download, run & pull a model (no admin needed)
powershell -ExecutionPolicy Bypass -File scripts\start_ollama.ps1   # just (re)start the local AI server
```

### 1️⃣ Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env        # macOS/Linux: cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
The first boot auto-seeds 18 roles + the curated company dataset. Full reset:
```bash
python data_pipeline/etl.py --reset
```

### 2️⃣ Frontend
```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173 (proxies /api to :8000)
```

### 3️⃣ Private AI (optional but recommended)
```bash
# Install Ollama: https://ollama.com/download
ollama pull qwen2.5:1.5b     # recommended on CPU-only laptops (~1 GB, snappy)
# or: ollama pull qwen2.5:3b  # better wording, ~2x slower on CPU
# or: ollama pull qwen2.5:7b  # best quality, needs a GPU to be usable
```
The app detects Ollama automatically and upgrades summaries, roadmaps, projects and
interview prep to model-generated versions via the ✨ *Enhance with private AI* button.

> **Measured on a CPU-only laptop** (i5-1334U, 16 GB, no GPU) with `qwen2.5:1.5b`:
> ~30 tok/s generation; a full enhance call (summary + roadmap + projects + prep)
> takes about 1–2 minutes. The first call is slower while the model loads into RAM.
> Point `OLLAMA_MODEL` in `backend/.env` at whichever model you pull — no code changes.
>
> Want the AI always available? Create a shortcut to `scripts\start_ollama.ps1` in your
> Startup folder — press `Win+R`, type `shell:startup`, and drop it in.

<details>
<summary><strong>No admin rights? Use the portable build</strong></summary>

```powershell
# 1. Download the portable build (~1.4 GB)
curl.exe -L -o "$env:TEMP\ollama.zip" https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.zip

# 2. Extract somewhere permanent
Expand-Archive "$env:TEMP\ollama.zip" "$env:LOCALAPPDATA\Programs\Ollama" -Force

# 3. Start the server (leave this window open, or add it to startup)
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" serve

# 4. In another terminal, pull a model
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" pull qwen2.5:3b
```
Smaller/faster alternatives: `qwen2.5:1.5b` (~1 GB), `llama3.2:1b` (~1.3 GB).
Swap models any time by editing `OLLAMA_MODEL` in `backend/.env`.
</details>


### 4️⃣ Optional: global job data from Kaggle
The curated India dataset loads automatically. To add ~124K global LinkedIn postings:
```bash
cd backend
python data_pipeline/download_kaggle.py     # or download CSVs manually — see the file's docstring
python data_pipeline/etl.py
```

### ✅ Verify everything works
```bash
cd backend
python smoke_test.py     # 28 end-to-end checks against the running server
```

## 🧮 How scoring works (transparency)

- Every role has 13–20 skills, each with an **importance weight** (0–1) and a
  `required`/`preferred` flag, curated against real job-posting patterns.
- Your **readiness %** = weighted coverage of the target role's skills, where each
  matched skill counts by your self-rated proficiency level (★–★★★★★).
- **Company fit** = hiring-for-your-role (45pts) + your skill coverage (35pts) +
  work-mode flexibility (10pts) + hiring volume (10pts) — every point explained in the UI.

## 📁 Project structure

```
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app + auto-seed lifespan
│   │   ├── models.py             # SQLAlchemy models (users, analyses, companies…)
│   │   ├── routers/              # auth · profile · analysis · companies
│   │   └── services/
│   │       ├── skills_taxonomy.py   # 185 skills + aliases
│   │       ├── roles_taxonomy.py    # 18 roles × weighted skills
│   │       ├── resume_parser.py     # PDF → skills & projects
│   │       ├── scoring.py           # deterministic gap engine
│   │       ├── ai.py                # Ollama client + template fallbacks
│   │       └── recommender.py       # company feasibility scoring
│   ├── data_pipeline/            # ETL + Kaggle download helper
│   ├── data/india_companies.json # curated India market dataset (55 companies)
│   └── smoke_test.py             # 28-check E2E test suite
└── frontend/
    └── src/
        ├── pages/                # Landing · Auth · Dashboard · Skills · Analysis · Companies · Profile
        ├── components/           # AppLayout · ProgressRing · ProtectedRoute
        ├── context/AuthContext.jsx
        └── api/client.js         # axios + JWT interceptor
```

## 🗺️ API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` | JWT auth |
| GET/PUT | `/api/me` | Profile & goal role |
| GET/POST/DELETE | `/api/me/skills` | Skill management |
| POST | `/api/resume/upload` | PDF parsing & skill extraction |
| POST | `/api/analysis` | Run the gap analysis |
| POST | `/api/analysis/{id}/enhance` | Regenerate with local AI |
| GET | `/api/companies?role=&mode=&city=&sort=` | Ranked company matches |
| GET | `/api/meta/roles` · `/api/meta/skills` | Catalogues |
| GET | `/api/health` | DB + AI status |

Interactive docs at **http://localhost:8000/docs** 🎉

## 🚧 Ideas for next steps

- [ ] Live job APIs (Adzuna/JSearch) as a live-data enrichment source
- [ ] Email reminders for roadmap streaks
- [ ] Direct integration with incruit.online's API for in-app mock sessions
- [ ] PostgreSQL + Docker Compose for one-command deployment
- [ ] Playwright UI tests in CI

## 📊 Data & ethics

- Skills/roles taxonomy: hand-curated, license-free.
- Company dataset: curated from public information; optional Kaggle ingestion uses the
  public [LinkedIn Job Postings (2023–2024)](https://www.kaggle.com/datasets/arshkon/linkedin-job-postings) dataset.
- Resume files and personal data never leave your machine. No third-party AI APIs are called.

## 📄 License

[MIT](LICENSE) — built by [Anmol Miskin](https://github.com/amiskin1409). Mock interviews via [incruit.online](https://incruit.online).
