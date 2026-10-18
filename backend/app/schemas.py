"""Pydantic schemas for request/response validation."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    field_of_study: str | None = None
    graduation_year: int | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    field_of_study: str | None = None
    graduation_year: int | None = None
    target_role: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfileUpdate(BaseModel):
    name: str | None = None
    field_of_study: str | None = None
    graduation_year: int | None = None
    target_role: str | None = None


# ---------- Skills ----------


class SkillIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    level: int = Field(default=3, ge=1, le=5)


class SkillsUpdateRequest(BaseModel):
    skills: list[SkillIn]


class SkillOut(BaseModel):
    id: int
    name: str
    level: int
    source: str

    model_config = {"from_attributes": True}


# ---------- Resume ----------


class ResumeOut(BaseModel):
    id: int
    filename: str
    detected_skills: list
    detected_projects: list
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# ---------- Analysis ----------


class AnalysisRequest(BaseModel):
    target_role: str | None = None


class RoadmapStepOut(BaseModel):
    id: int
    phase: int
    phase_title: str
    step_order: int
    title: str
    description: str
    resources: list
    estimated_hours: int
    skills: list
    done: bool

    model_config = {"from_attributes": True}


class ProjectRecOut(BaseModel):
    id: int
    title: str
    description: str
    skills: list
    difficulty: str
    why: str

    model_config = {"from_attributes": True}


class InterviewPrepOut(BaseModel):
    id: int
    category: str
    item: str
    done: bool

    model_config = {"from_attributes": True}


class AnalysisOut(BaseModel):
    id: int
    target_role: str
    readiness_score: float
    matched_skills: list
    missing_skills: list
    role_matches: list
    ai_summary: str
    created_at: datetime
    resume_id: int | None = None

    model_config = {"from_attributes": True}


class AnalysisDetailOut(AnalysisOut):
    roadmap_steps: list[RoadmapStepOut] = []
    project_recs: list[ProjectRecOut] = []
    interview_prep: list[InterviewPrepOut] = []


# ---------- Roles ----------


class RoleOut(BaseModel):
    id: int
    title: str
    category: str
    description: str

    model_config = {"from_attributes": True}


# ---------- Companies / Jobs ----------


class PostingOut(BaseModel):
    id: int
    title: str
    location: str
    mode: str
    salary_min: int | None = None
    salary_max: int | None = None
    experience: str
    apply_url: str
    role_title: str = ""

    model_config = {"from_attributes": True}


class CompanyOut(BaseModel):
    id: int
    name: str
    industry: str
    headquarters: str
    website: str
    careers_url: str
    size: str
    description: str
    hiring_roles: list[str] = []
    modes: list[str] = []
    locations: list[str] = []
    match_score: float = 0.0
    match_reasons: list[str] = []
    sample_postings: list[PostingOut] = []

    model_config = {"from_attributes": True}


# ---------- Misc ----------


class HealthOut(BaseModel):
    status: str
    database: str
    ai_available: bool
    ai_model: str
