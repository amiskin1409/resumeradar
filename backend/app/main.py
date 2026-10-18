"""ResumeRadar FastAPI application entry point.

Run from backend/:
    uvicorn app.main:app --reload --port 8000
"""

import sys
from contextlib import asynccontextmanager

# Windows consoles default to cp1252 — make prints (✓, ⚠, emoji) safe everywhere
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from . import models  # noqa: F401  (ensure models are registered)
from .config import OLLAMA_MODEL
from .database import Base, SessionLocal, engine
from .routers import analysis, auth, companies, profile
from .schemas import HealthOut
from .services import ai
from .services.roles_taxonomy import ROLES


def _startup_seed() -> None:
    """Create tables and seed the role + company dataset on first run."""
    Base.metadata.create_all(bind=engine)
    from .models import Role

    db = SessionLocal()
    try:
        if db.scalar(select(Role.id).limit(1)) is None:
            print("First run: seeding roles & company dataset ...")
            seeded = False
            try:
                import sys
                from pathlib import Path

                sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
                from data_pipeline.etl import seed_india_companies, seed_roles

                role_map = seed_roles(db)
                seed_india_companies(db, role_map)
                seeded = True
            except Exception as exc:  # pragma: no cover
                print(f"⚠ Could not run dataset seed automatically ({exc}).")
                print("  You can run it manually:  python data_pipeline/etl.py")
            if seeded:
                print("✅ Seed complete")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    _startup_seed()
    yield


app = FastAPI(
    title="ResumeRadar API",
    description=(
        "AI-powered skill-gap analyzer and job-match platform. "
        "All AI features run on a local, private Ollama model."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(analysis.router)
app.include_router(companies.router)


@app.get("/api/health", response_model=HealthOut, tags=["meta"])
def health() -> HealthOut:
    try:
        db_ok = engine.connect() is not None
    except Exception:
        db_ok = False
    return HealthOut(
        status="ok" if db_ok else "degraded",
        database="connected" if db_ok else "unavailable",
        ai_available=ai.is_ai_available(),
        ai_model=OLLAMA_MODEL,
    )


@app.get("/api/meta/skills", tags=["meta"])
def skills_catalogue():
    """Full skills taxonomy (for chips/autocomplete UIs)."""
    from .services.skills_taxonomy import ALL_CATEGORIES, SKILLS

    return {
        "categories": ALL_CATEGORIES,
        "skills": [
            {"name": name, "category": meta["category"], "aliases": meta["aliases"]}
            for name, meta in sorted(SKILLS.items())
        ],
    }


@app.get("/api/meta/roles", tags=["meta"])
def roles_catalogue():
    """Role list with skill weights (used by the role picker UI)."""
    return [
        {
            "title": r["title"],
            "category": r["category"],
            "description": r["description"],
            "skill_count": len(r["skills"]),
            "required": [s for s, (_w, imp) in r["skills"].items() if imp == "required"],
        }
        for r in ROLES
    ]
