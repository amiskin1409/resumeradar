"""Analysis routes: run gap analysis, roadmap, projects, interview prep."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import get_current_user
from ..models import (
    Analysis,
    InterviewPrepItem,
    ProjectRecommendation,
    Resume,
    RoadmapStep,
    User,
)
from ..schemas import (
    AnalysisDetailOut,
    AnalysisOut,
    AnalysisRequest,
    InterviewPrepOut,
    ProjectRecOut,
    RoadmapStepOut,
    RoleOut,
)
from ..services import ai
from ..services.roles_taxonomy import ROLES, get_role
from ..services.resume_parser import detect_skills
from ..services.scoring import compute_role_fit, rank_roles

router = APIRouter(prefix="/api", tags=["analysis"])


def _user_skill_map(user: User) -> dict[str, int]:
    """Combined skill map from manual + resume-extracted skills."""
    skills: dict[str, int] = {}
    for s in user.skills:
        skills[s.name] = max(skills.get(s.name, 0), s.level)
    return skills


def _build_context(user: User, fit: dict, resume_projects: list[str]) -> dict:
    levels = _user_skill_map(user)
    return {
        "target_role": fit["role"],
        "readiness": fit["score"],
        "matched": [m["skill"] for m in fit["matched"]],
        "missing": [m["skill"] for m in fit["missing"]],
        "missing_detail": [
            {"skill": m["skill"], "importance": m["importance"]} for m in fit["missing"]
        ],
        "existing_projects": resume_projects,
        "background": f"{user.field_of_study or ''} student, graduating {user.graduation_year or 'n/a'}",
    }


def _persist_roadmap(db: Session, analysis: Analysis, phases: list[dict]) -> None:
    db.query(RoadmapStep).filter(RoadmapStep.analysis_id == analysis.id).delete()
    for phase in phases:
        for step in phase.get("steps", []):
            db.add(
                RoadmapStep(
                    analysis_id=analysis.id,
                    phase=step.get("phase", phase.get("phase", 1)),
                    phase_title=phase.get("phase_title", ""),
                    step_order=step.get("step_order", 0),
                    title=step["title"],
                    description=step.get("description", ""),
                    resources=step.get("resources", []),
                    estimated_hours=step.get("estimated_hours", 0),
                    skills=step.get("skills", []),
                )
            )


def _persist_projects(db: Session, analysis: Analysis, projects: list[dict]) -> None:
    db.query(ProjectRecommendation).filter(
        ProjectRecommendation.analysis_id == analysis.id
    ).delete()
    for p in projects:
        db.add(
            ProjectRecommendation(
                analysis_id=analysis.id,
                title=p["title"],
                description=p.get("description", ""),
                skills=p.get("skills", []),
                difficulty=p.get("difficulty", "intermediate"),
                why=p.get("why", ""),
            )
        )


def _persist_prep(db: Session, analysis: Analysis, items: list[dict]) -> None:
    db.query(InterviewPrepItem).filter(
        InterviewPrepItem.analysis_id == analysis.id
    ).delete()
    for it in items:
        db.add(
            InterviewPrepItem(
                analysis_id=analysis.id,
                category=it.get("category", "General"),
                item=it["item"],
            )
        )


# ---------------- Roles ----------------


@router.get("/roles", response_model=list[RoleOut])
def list_roles(db: Session = Depends(get_db)):
    return db.scalars(select(Role).order_by(Role.category, Role.title)).all()


# ---------------- Run analysis ----------------


@router.post("/analysis", response_model=AnalysisDetailOut, status_code=201)
def run_analysis(
    payload: AnalysisRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_role = (payload.target_role or user.target_role or "").strip()
    if not get_role(target_role):
        raise HTTPException(
            status_code=400,
            detail="Pick a valid target role first (see GET /api/roles)",
        )
    levels = _user_skill_map(user)
    if not levels:
        raise HTTPException(
            status_code=400,
            detail="Add your skills or upload your resume before running the analysis",
        )

    user.target_role = target_role
    fit = compute_role_fit(set(levels.keys()), target_role, levels)
    ranked = rank_roles(set(levels.keys()), levels, top_n=5)

    latest_resume = db.scalar(
        select(Resume)
        .where(Resume.user_id == user.id)
        .order_by(Resume.id.desc())
    )
    resume_projects = latest_resume.detected_projects if latest_resume else []

    analysis = Analysis(
        user_id=user.id,
        resume_id=latest_resume.id if latest_resume else None,
        target_role=target_role,
        readiness_score=fit["score"],
        matched_skills=[
            {"skill": m["skill"], "level": m["level"], "importance": m["importance"]}
            for m in fit["matched"]
        ],
        missing_skills=[
            {"skill": m["skill"], "importance": m["importance"]} for m in fit["missing"]
        ],
        role_matches=[
            {
                "role": r["role"],
                "category": r["category"],
                "score": r["score"],
                "matched_count": r["matched_count"],
                "missing_count": r["missing_count"],
            }
            for r in ranked
        ],
        ai_summary=ai.build_summary(target_role, fit["score"], fit["matched"], fit["missing"]),
    )
    db.add(analysis)
    db.flush()

    _persist_roadmap(db, analysis, ai.build_roadmap(target_role, fit["missing"], fit["matched"]))
    _persist_projects(db, analysis, ai.build_project_recs(target_role, fit["missing"]))
    _persist_prep(db, analysis, ai.build_interview_prep(target_role, fit["missing"]))
    db.commit()

    return _analysis_detail(db, analysis.id)


# ---------------- Read analyses ----------------


def _get_owned_analysis(db: Session, analysis_id: int, user: User) -> Analysis:
    analysis = db.get(Analysis, analysis_id)
    if analysis is None or analysis.user_id != user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


def _analysis_detail(db: Session, analysis_id: int) -> AnalysisDetailOut:
    analysis = db.scalar(
        select(Analysis)
        .options(
            selectinload(Analysis.roadmap_steps),
            selectinload(Analysis.project_recs),
            selectinload(Analysis.interview_prep),
        )
        .where(Analysis.id == analysis_id)
    )
    detail = AnalysisDetailOut.model_validate(analysis)
    detail.roadmap_steps.sort(key=lambda s: (s.phase, s.step_order))
    return detail


@router.get("/analysis/latest", response_model=AnalysisDetailOut | None)
def latest_analysis(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analysis = db.scalar(
        select(Analysis)
        .options(
            selectinload(Analysis.roadmap_steps),
            selectinload(Analysis.project_recs),
            selectinload(Analysis.interview_prep),
        )
        .where(Analysis.user_id == user.id)
        .order_by(Analysis.id.desc())
    )
    if analysis is None:
        return None
    detail = AnalysisDetailOut.model_validate(analysis)
    detail.roadmap_steps.sort(key=lambda s: (s.phase, s.step_order))
    return detail


@router.get("/analysis/{analysis_id}", response_model=AnalysisDetailOut)
def get_analysis(
    analysis_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_analysis(db, analysis_id, user)
    return _analysis_detail(db, analysis_id)


# ---------------- AI enhance (requires local Ollama) ----------------


@router.post("/analysis/{analysis_id}/enhance", response_model=AnalysisDetailOut)
def enhance_analysis(
    analysis_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = _get_owned_analysis(db, analysis_id, user)
    if not ai.is_ai_available():
        raise HTTPException(
            status_code=503,
            detail="Local AI (Ollama) is not running. Start it with `ollama serve` and try again.",
        )

    latest_resume = db.scalar(
        select(Resume)
        .where(Resume.user_id == user.id)
        .order_by(Resume.id.desc())
    )
    ctx = _build_context(
        user,
        {
            "role": analysis.target_role,
            "score": analysis.readiness_score,
            "matched": [{"skill": m["skill"]} for m in analysis.matched_skills],
            "missing": [{"skill": m["skill"], "importance": m.get("importance", "preferred")}
                        for m in analysis.missing_skills],
        },
        latest_resume.detected_projects if latest_resume else [],
    )

    summary = ai.ai_role_summary(ctx)
    if summary:
        analysis.ai_summary = summary

    phases = ai.ai_roadmap(ctx)
    if phases:
        _persist_roadmap(db, analysis, phases)

    projects = ai.ai_projects(ctx)
    if projects:
        _persist_projects(db, analysis, projects)

    prep = ai.ai_interview_prep(ctx)
    if prep:
        _persist_prep(db, analysis, prep)

    db.commit()
    return _analysis_detail(db, analysis.id)


# ---------------- Roadmap & prep toggles ----------------


@router.post("/roadmap/steps/{step_id}/toggle", response_model=RoadmapStepOut)
def toggle_step(
    step_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    step = db.get(RoadmapStep, step_id)
    if step is None:
        raise HTTPException(status_code=404, detail="Step not found")
    _get_owned_analysis(db, step.analysis_id, user)
    step.done = not step.done
    db.commit()
    db.refresh(step)
    return step


@router.post("/interview/prep/{item_id}/toggle", response_model=InterviewPrepOut)
def toggle_prep(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.get(InterviewPrepItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    _get_owned_analysis(db, item.analysis_id, user)
    item.done = not item.done
    db.commit()
    db.refresh(item)
    return item


@router.get("/projects/recommended", response_model=list[ProjectRecOut])
def recommended_projects(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = db.scalar(
        select(Analysis).where(Analysis.user_id == user.id).order_by(Analysis.id.desc())
    )
    if analysis is None:
        raise HTTPException(status_code=400, detail="Run an analysis first")
    return analysis.project_recs
