"""Deterministic skill-gap scoring engine.

Computes, for any user skill set and job role:
  * matched / missing skills (canonical names)
  * readiness score 0-100 (weighted skill coverage, level-aware)
  * ranked role fit across every known role

All numbers here are exact and reproducible — the LLM layer never
touches these calculations.
"""

from .roles_taxonomy import ROLES, get_role

# How much a user's self-rated skill level counts toward coverage.
LEVEL_FACTOR = {1: 0.5, 2: 0.7, 3: 0.85, 4: 0.95, 5: 1.0}


def compute_role_fit(
    user_skills: set[str],
    role_title: str,
    skill_levels: dict[str, int] | None = None,
) -> dict:
    """Score how ready a user is for one role."""
    role = get_role(role_title)
    if role is None:
        raise ValueError(f"Unknown role: {role_title}")
    skill_levels = skill_levels or {}

    matched, missing = [], []
    achieved, total = 0.0, 0.0

    for skill, (weight, importance) in role["skills"].items():
        total += weight
        if skill in user_skills:
            level = skill_levels.get(skill, 3)
            factor = LEVEL_FACTOR.get(level, 0.85)
            achieved += weight * factor
            matched.append(
                {"skill": skill, "weight": weight, "importance": importance, "level": level}
            )
        else:
            missing.append({"skill": skill, "weight": weight, "importance": importance})

    # Sort: most important missing first; matched most important first
    matched.sort(key=lambda m: -m["weight"])
    missing.sort(key=lambda m: -m["weight"])

    score = round(100.0 * achieved / total, 1) if total else 0.0
    return {
        "role": role["title"],
        "category": role["category"],
        "description": role["description"],
        "score": score,
        "matched": matched,
        "missing": missing,
        "matched_count": len(matched),
        "missing_count": len(missing),
        "required_missing": [m["skill"] for m in missing if m["importance"] == "required"][:8],
        "coverage_pct": round(100.0 * len(matched) / len(role["skills"]), 1)
        if role["skills"]
        else 0.0,
    }


def rank_roles(
    user_skills: set[str],
    skill_levels: dict[str, int] | None = None,
    top_n: int = 6,
) -> list[dict]:
    """Rank every role by readiness score, best fit first."""
    results = []
    for role in ROLES:
        try:
            fit = compute_role_fit(user_skills, role["title"], skill_levels)
        except ValueError:
            continue
        results.append(fit)
    results.sort(key=lambda r: -r["score"])
    return results[:top_n]


def readiness_label(score: float) -> str:
    if score >= 80:
        return "Job Ready"
    if score >= 60:
        return "Interview Ready"
    if score >= 40:
        return "Job Competitive"
    if score >= 20:
        return "Getting Started"
    return "Early Stage"
