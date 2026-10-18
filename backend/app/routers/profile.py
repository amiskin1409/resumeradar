"""Profile, skills and resume upload routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import UPLOAD_DIR
from ..database import get_db
from ..deps import get_current_user
from ..models import Resume, User, UserSkill
from ..schemas import ProfileUpdate, ResumeOut, SkillOut, SkillsUpdateRequest, UserOut
from ..services.resume_parser import analyze_resume_text, extract_text_from_pdf
from ..services.skills_taxonomy import normalize_skill

router = APIRouter(prefix="/api", tags=["profile"])

MAX_RESUME_BYTES = 8 * 1024 * 1024  # 8 MB


# ---------------- Profile ----------------


@router.get("/me", response_model=UserOut)
def get_profile(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if value is not None:
            setattr(user, key, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------------- Skills ----------------


@router.get("/me/skills", response_model=list[SkillOut])
def list_skills(user: User = Depends(get_current_user)):
    return sorted(user.skills, key=lambda s: s.name)


@router.post("/me/skills", response_model=list[SkillOut])
def replace_skills(
    payload: SkillsUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Replace the user's manually-added skills (resume skills are kept)."""
    manual = [s for s in user.skills if s.source == "manual"]
    for s in manual:
        db.delete(s)
    db.flush()
    for item in payload.skills:
        canonical = normalize_skill(item.name) or item.name.strip()[:120]
        db.add(
            UserSkill(user_id=user.id, name=canonical, level=item.level, source="manual")
        )
    db.commit()
    db.refresh(user)
    return sorted(user.skills, key=lambda s: s.name)


@router.delete("/me/skills/{skill_id}", status_code=204)
def delete_skill(
    skill_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    skill = db.get(UserSkill, skill_id)
    if skill is None or skill.user_id != user.id:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()


# ---------------- Resume ----------------


@router.post("/resume/upload", response_model=ResumeOut, status_code=201)
async def upload_resume(
    file: UploadFile,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")
    content = await file.read()
    if len(content) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 8 MB)")
    try:
        text = extract_text_from_pdf(content)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read this PDF file")
    if len(text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="No readable text found in the PDF (image-only resumes are not supported)",
        )

    result = analyze_resume_text(text)

    safe_name = f"{uuid.uuid4().hex}.pdf"
    (UPLOAD_DIR / safe_name).write_bytes(content)

    resume = Resume(
        user_id=user.id,
        filename=file.filename or safe_name,
        extracted_text=text,
        detected_skills=result["skills"],
        detected_projects=result["projects"],
    )
    db.add(resume)

    # Merge detected skills into the user's skill set (source="resume")
    existing = {s.name for s in user.skills}
    for skill in result["skills"]:
        if skill not in existing:
            db.add(UserSkill(user_id=user.id, name=skill, level=3, source="resume"))
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/resume/latest", response_model=ResumeOut | None)
def latest_resume(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalar(
        select(Resume).where(Resume.user_id == user.id).order_by(Resume.id.desc())
    )
