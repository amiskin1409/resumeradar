"""Company & job-posting recommender.

Ranks companies hiring for the user's target role using a transparent,
explainable feasibility score (0-100).
"""

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..models import Company, JobPosting, Role
from .roles_taxonomy import get_role


def _skill_overlap_score(user_skills: set[str], role_title: str) -> tuple[float, list[str]]:
    """How much of the role's skill demand the user already covers (0-1)."""
    role = get_role(role_title)
    if not role or not role["skills"]:
        return 0.0, []
    total = sum(w for w, _ in role["skills"].values())
    have = sum(w for s, (w, _imp) in role["skills"].items() if s in user_skills)
    covered = [s for s in role["skills"] if s in user_skills][:5]
    return (have / total if total else 0.0), covered


def score_company(
    company: Company,
    postings: list[JobPosting],
    user_skills: set[str],
    target_role: str,
) -> dict:
    """Explainable feasibility score for one company."""
    target = (target_role or "").strip().lower()
    role_postings = [p for p in postings if p.role.title.strip().lower() == target]
    reasons: list[str] = []

    # 1) Hiring for the target role (45 pts)
    role_score = 45.0 if role_postings else 0.0
    if role_postings:
        reasons.append(f"Hiring for {target_role}")

    # 2) Your skill coverage of that role's demand (35 pts)
    overlap, covered = _skill_overlap_score(user_skills, target_role)
    skill_score = 35.0 * overlap
    if overlap >= 0.6:
        reasons.append(f"You match {round(overlap * 100)}% of the role's skills")
    elif overlap >= 0.35:
        reasons.append("Partial skill match — reachable with your roadmap")

    # 3) Work-mode flexibility (10 pts)
    modes = {p.mode for p in (role_postings or postings)}
    mode_score = 0.0
    if "remote" in modes:
        mode_score += 6.0
        reasons.append("Offers remote work")
    if "hybrid" in modes:
        mode_score += 4.0
        reasons.append("Offers hybrid work")

    # 4) Hiring volume / activity (10 pts) — more open roles = easier entry
    volume_score = min(10.0, len(postings) * 2.0)
    if len(postings) >= 4:
        reasons.append(f"{len(postings)} open roles in our dataset")

    total = round(role_score + skill_score + mode_score + volume_score, 1)
    if not reasons:
        reasons.append("Growing hiring presence in your domain")
    return {"score": total, "reasons": reasons}


def filter_and_rank_companies(
    db: Session,
    user_skills: set[str],
    target_role: str,
    mode: str | None = None,
    industry: str | None = None,
    city: str | None = None,
    search: str | None = None,
    sort: str = "match",
) -> list[dict]:
    """Return companies ranked/filtered for the user, with postings summary."""
    query = (
        select(Company)
        .options(selectinload(Company.postings).selectinload(JobPosting.role))
    )
    if industry:
        query = query.where(Company.industry.ilike(f"%{industry}%"))
    if search:
        query = query.where(Company.name.ilike(f"%{search}%"))
    companies = db.scalars(query).unique().all()

    target = (target_role or "").strip().lower()
    results = []
    for company in companies:
        postings = list(company.postings)

        # Apply mode / city filters against postings
        relevant = postings
        if mode:
            relevant = [p for p in relevant if p.mode == mode]
        if city:
            relevant = [
                p for p in relevant if city.lower() in (p.location or "").lower()
            ]
        if not relevant:
            continue
        if target and not any(p.role.title.strip().lower() == target for p in relevant):
            # Company has roles but not the target one — skip when a role is set
            continue

        fit = score_company(company, postings, user_skills, target_role or "")
        hiring_roles = sorted({p.role.title for p in relevant})
        modes = sorted({p.mode for p in relevant})
        locations = sorted({p.location for p in relevant if p.location})[:5]

        sample = sorted(
            relevant,
            key=lambda p: (
                0 if p.role.title.strip().lower() == target else 1,
                -(p.salary_max or 0),
            ),
        )[:4]

        results.append(
            {
                "id": company.id,
                "name": company.name,
                "industry": company.industry,
                "headquarters": company.headquarters,
                "website": company.website,
                "careers_url": company.careers_url,
                "size": company.size,
                "description": company.description,
                "hiring_roles": hiring_roles,
                "modes": modes,
                "locations": locations,
                "match_score": fit["score"],
                "match_reasons": fit["reasons"],
                "sample_postings": [
                    {
                        "id": p.id,
                        "title": p.title,
                        "location": p.location,
                        "mode": p.mode,
                        "salary_min": p.salary_min,
                        "salary_max": p.salary_max,
                        "experience": p.experience,
                        "apply_url": p.apply_url or company.careers_url,
                        "role_title": p.role.title,
                    }
                    for p in sample
                ],
            }
        )

    if sort == "match":
        results.sort(key=lambda r: -r["match_score"])
    elif sort == "name":
        results.sort(key=lambda r: r["name"].lower())
    elif sort == "openings":
        results.sort(key=lambda r: -len(r["sample_postings"]))
    return results
