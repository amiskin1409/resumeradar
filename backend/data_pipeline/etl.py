"""ETL pipeline for ResumeRadar's job/company database.

Sources:
  1. Curated role taxonomy  -> roles + role_skills tables (always)
  2. data/india_companies.json (curated India market seed)  -> companies + postings
  3. Optional: Kaggle "LinkedIn Job Postings (2023-2024)" CSVs placed in
     data/kaggle_raw/ (job_postings.csv, companies.csv, skills.csv...)

Usage:
    python data_pipeline/etl.py            # run full pipeline
    python data_pipeline/etl.py --reset    # drop & rebuild everything
"""

import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import pandas as pd
from sqlalchemy import select

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.models import Company, JobPosting, Role, RoleSkill  # noqa: E402
from app.services.roles_taxonomy import ROLES  # noqa: E402
from app.services.skills_taxonomy import canonicalize_many  # noqa: E402

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
KAGGLE_RAW_DIR = DATA_DIR / "kaggle_raw"
INDIA_SEED_PATH = DATA_DIR / "india_companies.json"

MAX_KAGGLE_POSTINGS = 2500  # keep the demo DB fast

# ---------------------------------------------------------------------------
# Seed 1: role taxonomy
# ---------------------------------------------------------------------------


def seed_roles(db) -> dict[str, Role]:
    print("• Seeding roles & role skills ...")
    role_map: dict[str, Role] = {}
    for spec in ROLES:
        role = db.scalar(select(Role).where(Role.title == spec["title"]))
        if role is None:
            role = Role(
                title=spec["title"],
                category=spec["category"],
                description=spec["description"],
            )
            db.add(role)
            db.flush()
        role_map[spec["title"]] = role
        # Replace role skills
        db.query(RoleSkill).filter(RoleSkill.role_id == role.id).delete()
        for skill, (weight, importance) in spec["skills"].items():
            db.add(
                RoleSkill(
                    role_id=role.id, skill=skill, weight=weight, importance=importance
                )
            )
    db.commit()
    print(f"  ✓ {len(role_map)} roles")
    return role_map


# ---------------------------------------------------------------------------
# Seed 2: curated India companies
# ---------------------------------------------------------------------------


def _linkedin_search(company: str, role: str) -> str:
    q = "+".join(f"{company}+{role}".split())
    return f"https://www.linkedin.com/jobs/search/?keywords={q}&location=India"


def seed_india_companies(db, role_map: dict[str, Role]) -> int:
    if not INDIA_SEED_PATH.exists():
        print("• India seed file not found — skipping")
        return 0
    print("• Seeding curated India company dataset ...")
    data = json.loads(INDIA_SEED_PATH.read_text(encoding="utf-8"))
    count = 0
    for entry in data.get("companies", []):
        company = db.scalar(select(Company).where(Company.name == entry["name"]))
        if company is None:
            company = Company(
                name=entry["name"],
                industry=entry.get("industry", ""),
                headquarters=entry.get("headquarters", ""),
                website=entry.get("website", ""),
                careers_url=entry.get("careers_url", ""),
                size=entry.get("size", ""),
                description=entry.get("description", ""),
                country_focus="India",
            )
            db.add(company)
            db.flush()
        else:
            db.query(JobPosting).filter(JobPosting.company_id == company.id).delete()

        for role_entry in entry.get("roles", []):
            role = role_map.get(role_entry["title"])
            if role is None:
                continue
            locations = role_entry.get("locations") or ["India"]
            modes = role_entry.get("modes") or ["onsite"]
            for mode in modes:
                posting = JobPosting(
                    company_id=company.id,
                    role_id=role.id,
                    title=role_entry["title"],
                    location=", ".join(locations[:3]),
                    mode=mode,
                    salary_min=role_entry.get("salary_min"),
                    salary_max=role_entry.get("salary_max"),
                    experience=role_entry.get("experience", ""),
                    apply_url=entry.get("careers_url")
                    or _linkedin_search(entry["name"], role_entry["title"]),
                    source="curated-india",
                )
                db.add(posting)
                count += 1
    db.commit()
    print(f"  ✓ {len(data.get('companies', []))} companies, {count} postings")
    return count


# ---------------------------------------------------------------------------
# Seed 3 (optional): Kaggle LinkedIn dataset
# ---------------------------------------------------------------------------

_TITLE_PATTERNS: list[tuple[str, str]] = [
    (r"front[\s-]?end", "Frontend Developer"),
    (r"back[\s-]?end", "Backend Developer"),
    (r"full[\s-]?stack", "Full Stack Developer"),
    (r"mobile|android|ios\b|flutter", "Mobile App Developer"),
    (r"machine learning|ml engineer", "Machine Learning Engineer"),
    (r"data scientist", "Data Scientist"),
    (r"data analyst|business intelligence|bi developer", "Data Analyst"),
    (r"data engineer", "Data Engineer"),
    (r"devops|site reliability|sre\b", "DevOps Engineer"),
    (r"cloud engineer|cloud developer", "Cloud Engineer"),
    (r"security|cyber", "Cybersecurity Analyst"),
    (r"qa\b|quality|test engineer|automation tester", "QA / Test Engineer"),
    (r"ui/?ux|product designer|ux designer", "UI/UX Designer"),
    (r"product manager|product owner", "Product Manager"),
    (r"business analyst", "Business Analyst"),
    (r"java developer|java engineer", "Java Developer"),
    (r"python developer|python engineer", "Python Developer"),
]


def _map_title_to_role(title: str) -> str | None:
    t = (title or "").lower()
    for pattern, role in _TITLE_PATTERNS:
        if re.search(pattern, t):
            return role
    return None


def ingest_kaggle(db, role_map: dict[str, Role]) -> int:
    postings_path = KAGGLE_RAW_DIR / "job_postings.csv"
    companies_path = KAGGLE_RAW_DIR / "companies.csv"
    if not postings_path.exists():
        print("• Kaggle CSVs not found in data/kaggle_raw/ — skipping (optional step)")
        return 0
    print("• Ingesting Kaggle LinkedIn job postings ...")

    companies_df = pd.read_csv(companies_path) if companies_path.exists() else pd.DataFrame()
    company_lookup = {}
    if not companies_df.empty:
        for _, row in companies_df.iterrows():
            company_lookup[row.get("company_id")] = {
                "name": str(row.get("name") or "").strip(),
                "industry": str(row.get("industry") or "").strip(),
                "size": str(row.get("company_size") or "").strip(),
                "city": str(row.get("city") or "").strip(),
                "state": str(row.get("state") or "").strip(),
                "linkedin": str(row.get("linkedin_url") or "").strip(),
            }

    df = pd.read_csv(postings_path)
    df = df.drop_duplicates(subset=["title", "company_id"]).head(MAX_KAGGLE_POSTINGS)

    created = 0
    seen_companies: dict[str, Company] = {}
    for _, row in df.iterrows():
        role_title = _map_title_to_role(str(row.get("title") or ""))
        if not role_title:
            continue
        role = role_map.get(role_title)
        cid = row.get("company_id")
        info = company_lookup.get(cid, {})
        name = str(row.get("company_name") or info.get("name") or "").strip()
        if not role or not name:
            continue

        if name not in seen_companies:
            existing = db.scalar(select(Company).where(Company.name == name))
            if existing is None:
                existing = Company(
                    name=name,
                    industry=str(row.get("industry") or info.get("industry") or ""),
                    headquarters=", ".join(
                        p for p in [info.get("city"), info.get("state"), "USA"] if p
                    ),
                    website=info.get("linkedin", ""),
                    careers_url=str(row.get("job_url") or row.get("application_url") or ""),
                    size=info.get("size", ""),
                    description=f"Hiring on LinkedIn — {role_title} and other roles.",
                    country_focus="Global",
                )
                db.add(existing)
                db.flush()
            seen_companies[name] = existing

        remote = row.get("remote_allowed")
        mode = "remote" if (isinstance(remote, float) and remote == 1) or remote == 1 else "onsite"
        location = str(row.get("location") or "").strip() or "United States"
        try:
            sal_min = int(row["min_salary"]) if pd.notna(row.get("min_salary")) else None
            sal_max = int(row["max_salary"]) if pd.notna(row.get("max_salary")) else None
        except (ValueError, TypeError):
            sal_min = sal_max = None

        db.add(
            JobPosting(
                company_id=seen_companies[name].id,
                role_id=role.id,
                title=str(row.get("title") or role_title)[:200],
                location=location[:160],
                mode=mode,
                salary_min=sal_min,
                salary_max=sal_max,
                experience=str(row.get("formatted_experience_level") or ""),
                apply_url=str(row.get("job_url") or "")[:400],
                source="kaggle-linkedin",
            )
        )
        created += 1
    db.commit()
    print(f"  ✓ {created} postings from Kaggle data ({len(seen_companies)} companies)")
    return created


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def run(reset: bool = False) -> None:
    if reset:
        print("• Dropping all tables (--reset) ...")
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        role_map = seed_roles(db)
        seed_india_companies(db, role_map)
        ingest_kaggle(db, role_map)
        total_companies = len(db.query(Company).all())
        total_postings = len(db.query(JobPosting).all())
        print(f"\n✅ ETL complete — {total_companies} companies, {total_postings} job postings in DB")
    finally:
        db.close()


if __name__ == "__main__":
    run(reset="--reset" in sys.argv)
