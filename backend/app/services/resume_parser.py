"""Resume parsing: PDF text extraction, skill detection, project extraction.

Uses PyMuPDF for text extraction and the curated skills taxonomy for
deterministic, keyword-based skill detection with word boundaries.
"""

import re

import pymupdf as fitz  # PyMuPDF

from .skills_taxonomy import SKILLS, canonicalize_many, skill_category

# ---------- PDF extraction ----------


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF's raw bytes."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    try:
        pages = [page.get_text("text") for page in doc]
    finally:
        doc.close()
    return "\n".join(pages)


# ---------- Skill detection ----------

# Build one big regex: alternation of every canonical name and alias,
# with word boundaries so "c" never matches inside "react".
def _build_skill_pattern() -> re.Pattern:
    parts: list[str] = []
    for canonical, meta in SKILLS.items():
        variants = [canonical, *meta["aliases"]]
        for v in variants:
            escaped = re.escape(v.lower())
            # boundary: not preceded/followed by alnum or most symbols,
            # but allow + and # inside the token itself (c++, c#)
            parts.append(r"(?<![a-z0-9])" + escaped + r"(?![a-z0-9])")
    # longest first so "react native" wins over "react"
    parts.sort(key=len, reverse=True)
    return re.compile("|".join(parts))


_SKILL_PATTERN = _build_skill_pattern()
_CANONICAL_BY_LOWER = {c.lower(): c for c in SKILLS}

# alias(lower) -> canonical, for resolving regex matches back to canonicals
_ALIAS_LOOKUP: dict[str, str] = {}
for _c, _m in SKILLS.items():
    _ALIAS_LOOKUP[_c.lower()] = _c
    for _a in _m["aliases"]:
        _ALIAS_LOOKUP[_a.lower()] = _c


def detect_skills(text: str) -> list[str]:
    """Detect canonical skills mentioned anywhere in the text."""
    found: dict[str, None] = {}
    for match in _SKILL_PATTERN.finditer(text.lower()):
        canonical = _ALIAS_LOOKUP.get(match.group(0))
        if canonical:
            found.setdefault(canonical, None)
    return list(found.keys())


# ---------- Project extraction ----------

_SECTION_HEADERS = {
    "summary", "objective", "profile", "about", "about me",
    "experience", "work experience", "professional experience", "internships",
    "education", "academics",
    "skills", "technical skills", "key skills", "technologies",
    "projects", "personal projects", "academic projects", "key projects",
    "certifications", "certificates", "courses",
    "achievements", "awards", "accomplishments",
    "links", "contact", "personal details", "details", "declarations",
    "strengths", "hobbies", "languages", "volunteer", "publications",
}


def _is_section_header(line: str) -> bool:
    stripped = line.strip().strip("•-–*#:> ").lower()
    stripped = re.sub(r"\s+", " ", stripped)
    if not stripped or len(stripped) > 40:
        return False
    if stripped in _SECTION_HEADERS:
        return True
    # ALL-CAPS or Title Case headers
    raw = line.strip().strip("•-–*#:> ")
    letters = [c for c in raw if c.isalpha()]
    if letters and all(c.isupper() for c in letters) and stripped not in ("", "i"):
        return stripped in _SECTION_HEADERS or raw.isupper()
    return False


def _is_header_like(line: str) -> bool:
    """Section header OR a person/details line (email/phone present)."""
    if _is_section_header(line):
        return True
    return bool(re.search(r"[\w.+-]+@[\w-]+\.[\w.]+|\+?\d[\d\s()-]{8,}", line))


_BULLET_PREFIX = re.compile(r"^\s*(?:[•●▪◦\-\*–]|\d+[.)])\s+")


def extract_projects(text: str) -> list[str]:
    """Extract project entry texts from the Projects section of a resume."""
    lines = text.splitlines()
    in_projects = False
    projects: list[str] = []
    current: list[str] = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if _is_section_header(line):
            if in_projects and current:
                projects.append(" ".join(current).strip())
                current = []
            in_projects = stripped.lower().strip("•-–*#>: ").replace(" ", "") in (
                "projects", "personalprojects", "academicprojects", "keyprojects"
            ) or stripped.lower().strip("•-–*#>: ") in (
                "projects", "personal projects", "academic projects", "key projects"
            )
            continue
        if not in_projects:
            continue
        # A new bullet or a non-bullet line starts a new project entry;
        # indented continuation lines are appended to the current entry.
        if _BULLET_PREFIX.match(stripped) or not current:
            if current:
                projects.append(" ".join(current).strip())
            current = [stripped]
        elif len(current) and not _is_header_like(stripped):
            current.append(stripped)
        else:
            if current:
                projects.append(" ".join(current).strip())
            current = []

    if current:
        projects.append(" ".join(current).strip())

    # Clean up: drop trivially short entries, cap length and count
    cleaned = []
    for p in projects:
        p = _BULLET_PREFIX.sub("", p)
        p = re.sub(r"\s+", " ", p).strip()
        if len(p) >= 15:
            cleaned.append(p[:400])
    return cleaned[:12]


def analyze_resume_text(text: str) -> dict:
    """Full analysis of resume text: skills + projects + skills used in projects."""
    skills = detect_skills(text)
    projects = extract_projects(text)
    project_skills = detect_skills(" ".join(projects)) if projects else []
    return {
        "skills": skills,
        "projects": projects,
        "project_skills": project_skills,
        "char_count": len(text),
    }


def skills_with_categories(skills: list[str]) -> list[dict]:
    return [{"name": s, "category": skill_category(s)} for s in sorted(skills)]
