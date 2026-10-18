"""Company & job listing routes."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import get_current_user
from ..models import Company, JobPosting, User
from ..schemas import CompanyOut
from ..services.recommender import filter_and_rank_companies

router = APIRouter(prefix="/api", tags=["companies"])


def _user_skills(user: User) -> set[str]:
    return {s.name for s in user.skills}


@router.get("/companies", response_model=list[CompanyOut])
def list_companies(
    role: str | None = Query(default=None),
    mode: str | None = Query(default=None, pattern="^(onsite|hybrid|remote)$"),
    industry: str | None = None,
    city: str | None = None,
    search: str | None = None,
    sort: str = Query(default="match", pattern="^(match|name|openings)$"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_role = role or user.target_role or ""
    results = filter_and_rank_companies(
        db,
        user_skills=_user_skills(user),
        target_role=target_role,
        mode=mode,
        industry=industry,
        city=city,
        search=search,
        sort=sort,
    )
    return results[:80]


@router.get("/companies/industries", response_model=list[str])
def list_industries(db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Company.industry).where(Company.industry != "").order_by(Company.industry)
    ).unique().all()
    return sorted(set(rows))


@router.get("/companies/{company_id}", response_model=CompanyOut)
def get_company(
    company_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company = db.scalar(
        select(Company)
        .options(selectinload(Company.postings).selectinload(JobPosting.role))
        .where(Company.id == company_id)
    )
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    postings = list(company.postings)
    from ..services.recommender import score_company

    fit = score_company(company, postings, _user_skills(user), user.target_role or "")
    return {
        "id": company.id,
        "name": company.name,
        "industry": company.industry,
        "headquarters": company.headquarters,
        "website": company.website,
        "careers_url": company.careers_url,
        "size": company.size,
        "description": company.description,
        "hiring_roles": sorted({p.role.title for p in postings}),
        "modes": sorted({p.mode for p in postings}),
        "locations": sorted({p.location for p in postings if p.location})[:6],
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
            for p in sorted(postings, key=lambda p: p.role.title)[:20]
        ],
    }
