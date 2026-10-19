"""One-off migration: add enhanced-resume columns to an existing SQLite DB,
then wipe all registered user data (accounts, skills, resumes, analyses,
roadmap/project/interview rows, uploaded PDFs). Keeps roles & companies."""

import sys
import sqlite3
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # backend/ on path

from sqlalchemy import func, select

from app.config import DATABASE_URL, UPLOAD_DIR
from app.database import SessionLocal
from app.models import (
    Analysis,
    Company,
    InterviewPrepItem,
    ProjectRecommendation,
    Resume,
    RoadmapStep,
    Role,
    User,
    UserSkill,
)

# ---------- 1. schema migration ----------
db_path = DATABASE_URL.replace("sqlite:///", "")
con = sqlite3.connect(db_path)
cols = [r[1] for r in con.execute("PRAGMA table_info(resumes)")]
wanted = {
    "suggested_role": "TEXT",
    "critique": "TEXT",
    "corrections": "JSON",
    "highlights": "JSON",
}
for name, typ in wanted.items():
    if name not in cols:
        con.execute(f"ALTER TABLE resumes ADD COLUMN {name} {typ}")
        print("added column:", name)
con.execute("UPDATE resumes SET corrections = '[]' WHERE corrections IS NULL")
con.execute("UPDATE resumes SET highlights = '[]' WHERE highlights IS NULL")
con.commit()
con.close()
print("resumes schema OK")

# ---------- 2. wipe registered data ----------
db = SessionLocal()
users = list(db.scalars(select(User)))
print(f"deleting {len(users)} accounts ...")
for u in users:
    db.delete(u)  # cascades: skills, resumes, analyses -> roadmap/projects/prep
db.commit()

removed = 0
if UPLOAD_DIR.exists():
    for f in UPLOAD_DIR.glob("*.pdf"):
        f.unlink()
        removed += 1
print("uploaded PDFs removed:", removed)

print()
for M in (User, UserSkill, Resume, Analysis, RoadmapStep, ProjectRecommendation, InterviewPrepItem):
    print(f"{M.__name__:24s}: {db.scalar(select(func.count()).select_from(M))}")
print(
    "kept -> Role:",
    db.scalar(select(func.count()).select_from(Role)),
    "| Company:",
    db.scalar(select(func.count()).select_from(Company)),
)
db.close()
