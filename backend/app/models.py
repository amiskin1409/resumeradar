"""ORM models for ResumeRadar."""

from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    field_of_study: Mapped[str | None] = mapped_column(String(120), nullable=True)
    graduation_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    target_role: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    skills: Mapped[list["UserSkill"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    resumes: Mapped[list["Resume"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    analyses: Mapped[list["Analysis"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class UserSkill(Base):
    __tablename__ = "user_skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))  # canonical skill name
    level: Mapped[int] = mapped_column(Integer, default=3)  # 1 beginner .. 5 expert
    source: Mapped[str] = mapped_column(String(20), default="manual")  # manual | resume

    user: Mapped["User"] = relationship(back_populates="skills")


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    extracted_text: Mapped[str] = mapped_column(Text, default="")
    detected_skills: Mapped[list] = mapped_column(JSON, default=list)
    detected_projects: Mapped[list] = mapped_column(JSON, default=list)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship(back_populates="resumes")


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    resume_id: Mapped[int | None] = mapped_column(ForeignKey("resumes.id"), nullable=True)
    target_role: Mapped[str] = mapped_column(String(120))
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0-100
    matched_skills: Mapped[list] = mapped_column(JSON, default=list)
    missing_skills: Mapped[list] = mapped_column(JSON, default=list)
    role_matches: Mapped[list] = mapped_column(JSON, default=list)  # ranked fit list
    ai_summary: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship(back_populates="analyses")
    roadmap_steps: Mapped[list["RoadmapStep"]] = relationship(
        back_populates="analysis", cascade="all, delete-orphan"
    )
    project_recs: Mapped[list["ProjectRecommendation"]] = relationship(
        back_populates="analysis", cascade="all, delete-orphan"
    )
    interview_prep: Mapped[list["InterviewPrepItem"]] = relationship(
        back_populates="analysis", cascade="all, delete-orphan"
    )


class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"), index=True)
    phase: Mapped[int] = mapped_column(Integer, default=1)
    phase_title: Mapped[str] = mapped_column(String(160), default="")
    step_order: Mapped[int] = mapped_column(Integer, default=0)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    resources: Mapped[list] = mapped_column(JSON, default=list)  # [{title, url, type}]
    estimated_hours: Mapped[int] = mapped_column(Integer, default=0)
    skills: Mapped[list] = mapped_column(JSON, default=list)
    done: Mapped[bool] = mapped_column(Boolean, default=False)

    analysis: Mapped["Analysis"] = relationship(back_populates="roadmap_steps")


class ProjectRecommendation(Base):
    __tablename__ = "project_recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    skills: Mapped[list] = mapped_column(JSON, default=list)
    difficulty: Mapped[str] = mapped_column(String(20), default="intermediate")
    why: Mapped[str] = mapped_column(Text, default="")

    analysis: Mapped["Analysis"] = relationship(back_populates="project_recs")


class InterviewPrepItem(Base):
    __tablename__ = "interview_prep_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"), index=True)
    category: Mapped[str] = mapped_column(String(80), default="General")
    item: Mapped[str] = mapped_column(Text)
    done: Mapped[bool] = mapped_column(Boolean, default=False)

    analysis: Mapped["Analysis"] = relationship(back_populates="interview_prep")


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    industry: Mapped[str] = mapped_column(String(160), default="")
    headquarters: Mapped[str] = mapped_column(String(160), default="")
    website: Mapped[str] = mapped_column(String(300), default="")
    careers_url: Mapped[str] = mapped_column(String(300), default="")
    size: Mapped[str] = mapped_column(String(60), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    country_focus: Mapped[str] = mapped_column(String(60), default="India")

    postings: Mapped[list["JobPosting"]] = relationship(
        back_populates="company", cascade="all, delete-orphan"
    )


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(120), default="")
    description: Mapped[str] = mapped_column(Text, default="")

    skills: Mapped[list["RoleSkill"]] = relationship(
        back_populates="role", cascade="all, delete-orphan"
    )
    postings: Mapped[list["JobPosting"]] = relationship(back_populates="role")


class RoleSkill(Base):
    __tablename__ = "role_skills"

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id"), primary_key=True, index=True
    )
    skill: Mapped[str] = mapped_column(String(120), primary_key=True)
    weight: Mapped[float] = mapped_column(Float, default=0.5)  # 0-1 importance
    importance: Mapped[str] = mapped_column(String(20), default="preferred")  # required|preferred

    role: Mapped["Role"] = relationship(back_populates="skills")


class JobPosting(Base):
    __tablename__ = "job_postings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    location: Mapped[str] = mapped_column(String(160), default="")
    mode: Mapped[str] = mapped_column(String(20), default="onsite")  # onsite|hybrid|remote
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    experience: Mapped[str] = mapped_column(String(60), default="")
    apply_url: Mapped[str] = mapped_column(String(400), default="")
    source: Mapped[str] = mapped_column(String(60), default="curated")
    posted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    company: Mapped["Company"] = relationship(back_populates="postings")
    role: Mapped["Role"] = relationship(back_populates="postings")
