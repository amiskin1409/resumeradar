"""Local AI layer backed by Ollama, with intelligent deterministic fallbacks.

Every AI function returns AI-generated content when Ollama is running,
otherwise a high-quality template-based fallback so the app never breaks.
"""

import json
import re

import httpx

from ..config import AI_TIMEOUT_SECONDS, OLLAMA_BASE_URL, OLLAMA_MODEL
from .roles_taxonomy import get_role
from .skills_taxonomy import skill_category

# ---------------------------------------------------------------------------
# Ollama client
# ---------------------------------------------------------------------------

_ollama_available: bool | None = None


def is_ai_available() -> bool:
    """Probe the local Ollama server (cached after first success)."""
    global _ollama_available
    if _ollama_available:
        return True
    try:
        resp = httpx.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=2.0)
        _ollama_available = resp.status_code == 200
    except Exception:
        _ollama_available = False
    return _ollama_available


def ai_generate(prompt: str, system: str = "", json_mode: bool = False) -> str | None:
    """Call the local model. Returns text, or None on any failure."""
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.4, "num_predict": 1400},
        }
        if system:
            payload["system"] = system
        if json_mode:
            payload["format"] = "json"
        resp = httpx.post(
            f"{OLLAMA_BASE_URL}/api/generate", json=payload, timeout=AI_TIMEOUT_SECONDS
        )
        if resp.status_code != 200:
            return None
        return resp.json().get("response", "").strip()
    except Exception:
        return None


def parse_json_object(text: str | None) -> dict | None:
    """Robustly extract a JSON object from LLM output."""
    if not text:
        return None
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    try:
        obj = json.loads(text)
        return obj if isinstance(obj, dict) else None
    except json.JSONDecodeError:
        pass
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end > start:
        try:
            obj = json.loads(text[start : end + 1])
            return obj if isinstance(obj, dict) else None
        except json.JSONDecodeError:
            return None
    return None


# ---------------------------------------------------------------------------
# Resource helpers for deterministic fallbacks
# ---------------------------------------------------------------------------

_DOCS_URLS = {
    "Python": "https://docs.python.org/3/tutorial/",
    "Java": "https://docs.oracle.com/javase/tutorial/",
    "JavaScript": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    "TypeScript": "https://www.typescriptlang.org/docs/",
    "SQL": "https://www.sqltutorial.org/",
    "HTML": "https://developer.mozilla.org/en-US/docs/Learn/HTML",
    "CSS": "https://developer.mozilla.org/en-US/docs/Learn/CSS",
    "React": "https://react.dev/learn",
    "Next.js": "https://nextjs.org/learn",
    "Node.js": "https://nodejs.org/en/learn",
    "Django": "https://docs.djangoproject.com/en/stable/intro/tutorial01/",
    "FastAPI": "https://fastapi.tiangolo.com/tutorial/",
    "Flask": "https://flask.palletsprojects.com/en/stable/quickstart/",
    "Spring Boot": "https://spring.io/guides/gs/spring-boot",
    "Docker": "https://docs.docker.com/get-started/",
    "Kubernetes": "https://kubernetes.io/docs/tutorials/",
    "AWS": "https://aws.amazon.com/getting-started/",
    "Terraform": "https://developer.hashicorp.com/terraform/tutorials",
    "Git": "https://git-scm.com/doc",
    "Linux": "https://linuxjourney.com/",
    "MongoDB": "https://www.mongodb.com/docs/",
    "PostgreSQL": "https://www.postgresql.org/docs/current/tutorial.html",
    "MySQL": "https://dev.mysql.com/doc/mysql-tutorial-excerpt/8.0/en/",
    "Pandas": "https://pandas.pydata.org/docs/user_guide/10min.html",
    "Scikit-learn": "https://scikit-learn.org/stable/tutorial/",
    "TensorFlow": "https://www.tensorflow.org/tutorials",
    "PyTorch": "https://pytorch.org/tutorials/",
    "Figma": "https://help.figma.com/hc/en-us",
    "Power BI": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi",
    "Tailwind CSS": "https://tailwindcss.com/docs",
    "Redux": "https://redux.js.org/tutorials/essentials/part-1-overview-concepts",
    "Flutter": "https://docs.flutter.dev/get-started/install",
    "Kotlin": "https://kotlinlang.org/docs/home.html",
    "Selenium": "https://www.selenium.dev/documentation/",
    "Apache Airflow": "https://airflow.apache.org/docs/apache-airflow/stable/tutorial.html",
    "Apache Spark": "https://spark.apache.org/docs/latest/api/python/getting_started/",
}

_ROADMAP_SH_SLUGS = {
    "Frontend Developer": "frontend",
    "Backend Developer": "backend",
    "DevOps Engineer": "devops",
    "Data Analyst": "data-analyst",
    "Data Scientist": "data-scientist",
    "Machine Learning Engineer": "ai-engineer",
    "Mobile App Developer": "android",
    "QA / Test Engineer": "qa",
    "Product Manager": "product-manager",
    "Business Analyst": "business-analyst",
    "Cybersecurity Analyst": "cyber-security",
    "UI/UX Designer": "ux-design",
}


def _skill_resources(skill: str) -> list[dict]:
    resources = []
    if skill in _DOCS_URLS:
        resources.append({"title": f"Official {skill} docs", "url": _DOCS_URLS[skill], "type": "docs"})
    resources.append({
        "title": f"FreeCodeCamp: {skill}",
        "url": f"https://www.freecodecamp.org/news/search?query={skill.replace(' ', '+')}",
        "type": "articles",
    })
    resources.append({
        "title": f"YouTube: learn {skill}",
        "url": f"https://www.youtube.com/results?search_query=learn+{skill.replace(' ', '+')}+for+beginners",
        "type": "video",
    })
    return resources


# ---------------------------------------------------------------------------
# Deterministic fallbacks
# ---------------------------------------------------------------------------


def build_roadmap(
    target_role: str, missing: list[dict], matched: list[dict]
) -> list[dict]:
    """3-phase skill roadmap: fill fundamentals → core role skills → job-ready."""
    role = get_role(target_role)
    role_title = role["title"] if role else target_role

    missing_sorted = sorted(missing, key=lambda m: -m["weight"])
    required_missing = [m for m in missing_sorted if m["importance"] == "required"]
    preferred_missing = [m for m in missing_sorted if m["importance"] == "preferred"]

    third = max(1, len(missing_sorted) // 3 + 1)
    phase1_skills = required_missing[:third] or missing_sorted[:1]
    phase2_skills = (required_missing[third:] + preferred_missing)[: max(third, 2)]
    phase3_skills = preferred_missing[max(third, 2) :]

    def steps_for(skills: list[dict], phase: int) -> list[dict]:
        steps = []
        for i, m in enumerate(skills, start=1):
            skill = m["skill"]
            cat = skill_category(skill)
            hours = 12 + int((1 - m["weight"]) * 20)
            steps.append(
                {
                    "phase": phase,
                    "step_order": i,
                    "title": f"Learn {skill}",
                    "description": (
                        f"{skill} ({cat}) is a {'required' if m['importance'] == 'required' else 'recommended'} "
                        f"skill for {role_title}. Follow a beginner-friendly course, take notes, "
                        f"and build one tiny example to lock it in."
                    ),
                    "resources": _skill_resources(skill),
                    "estimated_hours": hours,
                    "skills": [skill],
                }
            )
        return steps

    slug = _ROADMAP_SH_SLUGS.get(role_title)
    extra = []
    if slug:
        extra.append({
            "title": f"Follow the community {role_title} roadmap",
            "url": f"https://roadmap.sh/{slug}",
            "type": "roadmap",
        })

    phase1 = {
        "phase": 1,
        "phase_title": "Bridge the critical gaps",
        "steps": steps_for(phase1_skills, 1),
    }
    phase2 = {
        "phase": 2,
        "phase_title": "Strengthen core role skills",
        "steps": steps_for(phase2_skills, 2),
    }
    phase3 = {
        "phase": 3,
        "phase_title": "Job-ready: projects, practice & interview prep",
        "steps": (
            steps_for(phase3_skills, 3)
            + [
                {
                    "phase": 3,
                    "step_order": 90,
                    "title": "Build 2 portfolio projects covering your missing skills",
                    "description": (
                        "Open the Projects tab and complete two recommended projects. "
                        "Projects that use your gap skills are the fastest way to close them."
                    ),
                    "resources": extra,
                    "estimated_hours": 40,
                    "skills": [m["skill"] for m in missing_sorted[:4]],
                },
                {
                    "phase": 3,
                    "step_order": 91,
                    "title": "Practice mock interviews for " + role_title,
                    "description": (
                        "Use incruit.online for AI mock interviews targeting "
                        f"{role_title}. Do at least 3 sessions and review every answer."
                    ),
                    "resources": [{"title": "incruit.online", "url": "https://incruit.online", "type": "practice"}],
                    "estimated_hours": 6,
                    "skills": [],
                },
            ]
        ),
    }
    return [phase1, phase2, phase3]


# Curated fallback project ideas per role (used when Ollama is offline)
_ROLE_PROJECTS: dict[str, list[dict]] = {
    "Frontend Developer": [
        {"title": "Portfolio & Dashboard SPA", "description": "Build a responsive portfolio plus an admin dashboard with charts, dark mode and form validation.", "skills": ["React", "TypeScript", "Tailwind CSS", "Redux", "Jest"], "difficulty": "intermediate", "why": "Covers the entire modern frontend stack recruiters screen for."},
        {"title": "Real-time Chat App UI", "description": "A chat interface with live messaging via WebSockets, message search and accessibility passes.", "skills": ["React", "WebSockets", "Web Accessibility", "Node.js"], "difficulty": "intermediate", "why": "Shows async state handling and accessibility awareness."},
    ],
    "Backend Developer": [
        {"title": "REST API with Auth & Docs", "description": "A production-style API with JWT auth, pagination, rate limiting and OpenAPI docs.", "skills": ["FastAPI", "SQL", "PostgreSQL", "REST APIs", "Docker"], "difficulty": "intermediate", "why": "Demonstrates the exact backend skills listed in most job posts."},
        {"title": "Microservices with Docker Compose", "description": "Split an app into 3 services (auth, orders, notifications) orchestrated with Docker Compose.", "skills": ["Microservices", "Docker", "Redis", "CI/CD", "Linux"], "difficulty": "advanced", "why": "Microservices + containers are the #1 backend differentiator."},
    ],
    "Full Stack Developer": [
        {"title": "Full-stack E-commerce Site", "description": "Storefront + admin panel with cart, payments sandbox, auth and product search.", "skills": ["React", "Node.js", "Express.js", "MongoDB", "REST APIs"], "difficulty": "intermediate", "why": "One project touching frontend, API and database — the classic full-stack proof."},
        {"title": "SaaS Dashboard with Billing", "description": "Multi-tenant dashboard with subscription logic, role-based access and email workflows.", "skills": ["Next.js", "PostgreSQL", "TypeScript", "Docker", "CI/CD"], "difficulty": "advanced", "why": "Mirrors real SaaS work — strong interview talking point."},
    ],
    "Mobile App Developer": [
        {"title": "Expense Tracker App", "description": "Offline-first expense app with charts, categories, notifications and local database.", "skills": ["Flutter", "Dart", "Firebase", "REST APIs"], "difficulty": "beginner", "why": "A complete mobile lifecycle project with storage and API calls."},
        {"title": "Social Feed App", "description": "Infinite-scroll feed with image upload, likes and push notifications.", "skills": ["React Native", "Firebase", "Android SDK", "iOS Development"], "difficulty": "intermediate", "why": "Shows cross-platform delivery — highly valued by hiring teams."},
    ],
    "Data Analyst": [
        {"title": "Sales Analytics Dashboard", "description": "Clean a messy sales dataset, compute KPIs and publish an interactive Power BI dashboard.", "skills": ["Power BI", "SQL", "Excel Advanced", "Data Cleaning", "Statistics"], "difficulty": "beginner", "why": "Exactly the workflow analyst teams run every week."},
        {"title": "A/B Test Analysis Report", "description": "Analyze an experiment dataset: hypothesis, significance testing, visualization, recommendation.", "skills": ["Python", "Pandas", "Statistics", "A/B Testing", "Data Visualization"], "difficulty": "intermediate", "why": "Experimentation analysis is a favorite interview case study."},
    ],
    "Data Scientist": [
        {"title": "End-to-End ML Prediction App", "description": "Train a model on real data, deploy as an API and serve a simple frontend.", "skills": ["Python", "Machine Learning", "Scikit-learn", "Flask", "Pandas"], "difficulty": "intermediate", "why": "Proves you can take a model from notebook to production."},
        {"title": "NLP Resume Ranker", "description": "Vectorize resumes and rank them against a job description using TF-IDF / embeddings.", "skills": ["Natural Language Processing", "Python", "Scikit-learn", "Pandas"], "difficulty": "advanced", "why": "NLP project with a hiring theme — instant interview hook."},
    ],
    "Machine Learning Engineer": [
        {"title": "MLOps Training Pipeline", "description": "Automated training pipeline with experiment tracking, model registry and Dockerized serving.", "skills": ["MLOps", "MLflow", "Docker", "Python", "CI/CD"], "difficulty": "advanced", "why": "MLOps is the top differentiator for ML engineering roles."},
        {"title": "Fine-tune an LLM on Custom Data", "description": "LoRA fine-tune a small open model and evaluate it with a held-out set.", "skills": ["PyTorch", "LLM Fine-tuning", "Hugging Face", "Python"], "difficulty": "advanced", "why": "Shows modern deep learning skills employers actively seek."},
    ],
    "DevOps Engineer": [
        {"title": "CI/CD Pipeline for a Web App", "description": "GitHub Actions pipeline: lint, test, build Docker image, deploy to a cloud VM.", "skills": ["GitHub Actions", "Docker", "CI/CD", "Linux", "AWS"], "difficulty": "intermediate", "why": "A working pipeline is the single best DevOps portfolio piece."},
        {"title": "Kubernetes Cluster with Monitoring", "description": "Deploy an app on k3s with Helm charts, Prometheus metrics and Grafana dashboards.", "skills": ["Kubernetes", "Helm", "Prometheus", "Grafana", "Terraform"], "difficulty": "advanced", "why": "Covers the full infra stack asked in DevOps interviews."},
    ],
    "Cloud Engineer": [
        {"title": "Terraform AWS Infrastructure", "description": "VPC, EC2, RDS and S3 defined as code with remote state and CI validation.", "skills": ["Terraform", "AWS", "Linux", "CI/CD"], "difficulty": "intermediate", "why": "IaC on a real cloud is the core cloud-engineering skill."},
        {"title": "Serverless Data API", "description": "API Gateway + Lambda + DynamoDB stack with monitoring and cost alerts.", "skills": ["AWS", "Python", "Docker", "Computer Networking"], "difficulty": "intermediate", "why": "Demonstrates serverless architecture and cost awareness."},
    ],
    "Cybersecurity Analyst": [
        {"title": "Vulnerability Scan & Report", "description": "Run a structured assessment of a lab web app (OWASP Top 10) and write a professional report.", "skills": ["OWASP", "Burp Suite", "Vulnerability Assessment", "Linux"], "difficulty": "intermediate", "why": "Reporting is the real deliverable in security roles."},
        {"title": "Home SIEM Lab", "description": "Forward logs to a SIEM, build detection rules and simulate incident response.", "skills": ["SIEM", "Incident Response", "Python", "Network Security"], "difficulty": "advanced", "why": "Hands-on SOC skills you can discuss with concrete detail."},
    ],
    "QA / Test Engineer": [
        {"title": "Selenium Test Automation Suite", "description": "Page-object framework covering a live site with 25+ tests and CI execution.", "skills": ["Selenium", "Test Automation", "Git", "CI/CD"], "difficulty": "intermediate", "why": "Automation frameworks are the core QA interview topic."},
        {"title": "API Test Suite with Postman + Code", "description": "Collection-driven API tests with schema validation and data-driven runs.", "skills": ["API Testing", "Postman", "Python", "SQL"], "difficulty": "beginner", "why": "API testing demand has overtaken pure UI testing."},
    ],
    "UI/UX Designer": [
        {"title": "End-to-End App Redesign Case Study", "description": "Research, personas, wireframes, hi-fi prototype and a usability test write-up in Figma.", "skills": ["Figma", "Wireframing", "Prototyping", "User Research", "UI/UX Design"], "difficulty": "intermediate", "why": "A full case study is what design hiring managers actually review."},
        {"title": "Design System Starter", "description": "Tokens, components, variants and documentation for a small product.", "skills": ["Figma", "UI/UX Design", "Attention to Detail", "Motion Graphics"], "difficulty": "advanced", "why": "Design systems signal senior-level thinking."},
    ],
    "Data Engineer": [
        {"title": "Batch + Streaming ETL Pipeline", "description": "Ingest public data with Airflow, transform with dbt-style steps, stream events via Kafka.", "skills": ["Apache Airflow", "ETL", "Apache Kafka", "SQL", "Python"], "difficulty": "advanced", "why": "Airflow + Kafka appear in most data-engineering job posts."},
        {"title": "Data Warehouse on Cloud", "description": "Model a star schema, load dimensional tables and publish BI-ready views.", "skills": ["Data Warehousing", "Data Modeling", "Snowflake", "dbt", "SQL"], "difficulty": "intermediate", "why": "Warehouse modeling is the bread-and-butter DE skill."},
    ],
    "Product Manager": [
        {"title": "Product Teardown & Strategy Doc", "description": "Deep-dive a real product: metrics, competitors, roadmap and a 1-page PRD.", "skills": ["Product Management", "Competitive Analysis", "Requirements Gathering", "Data Visualization"], "difficulty": "beginner", "why": "Teardowns are the standard PM portfolio artifact."},
        {"title": "Clickable MVP Prototype", "description": "Figma prototype of an MVP with success metrics and an A/B test plan.", "skills": ["Prototyping", "User Research", "A/B Testing", "Figma"], "difficulty": "intermediate", "why": "Combines discovery, design and measurement skills."},
    ],
    "Business Analyst": [
        {"title": "Process Mining & BRD", "description": "Map an as-is process, identify gaps and write a full business requirements document.", "skills": ["Business Analysis", "Requirements Gathering", "Stakeholder Management", "Communication Skills"], "difficulty": "beginner", "why": "A BRD is the canonical BA deliverable."},
        {"title": "Executive KPI Dashboard", "description": "Build a Power BI dashboard over a public dataset with drill-downs and alerts.", "skills": ["Power BI", "SQL", "Excel Advanced", "Data Visualization"], "difficulty": "intermediate", "why": "Shows the reporting skill every BA posting requests."},
    ],
    "Java Developer": [
        {"title": "Spring Boot Banking API", "description": "Accounts, transfers and audit trail with Spring Security, JPA and integration tests.", "skills": ["Spring Boot", "Java", "Hibernate", "SQL", "JUnit"], "difficulty": "intermediate", "why": "Spring + JPA + tests is the exact Java stack hiring managers want."},
        {"title": "Microservices Order System", "description": "Catalog, order and payment services with an API gateway and Docker deployment.", "skills": ["Microservices", "Docker", "Maven", "REST APIs", "CI/CD"], "difficulty": "advanced", "why": "Shows modern Java architecture beyond CRUD."},
    ],
    "Python Developer": [
        {"title": "FastAPI Service with Auth & Tests", "description": "Typed API with OAuth2, SQLAlchemy models, pytest suite and Docker image.", "skills": ["FastAPI", "Python", "pytest", "SQL", "Docker"], "difficulty": "intermediate", "why": "FastAPI + pytest is the most requested Python web stack."},
        {"title": "Web Scraping & Data Pipeline", "description": "Scrape, clean and store data on a schedule; expose it via REST.", "skills": ["Python", "Pandas", "REST APIs", "MySQL", "Linux"], "difficulty": "beginner", "why": "Practical automation work that impresses in interviews."},
    ],
    "Data Entry / Operations Analyst": [
        {"title": "Automated Report Workbook", "description": "Macro-assisted Excel workbook that cleans raw data and produces weekly reports.", "skills": ["Excel Advanced", "Data Cleaning", "Attention to Detail"], "difficulty": "beginner", "why": "Directly mirrors operations analyst day-to-day work."},
        {"title": "Ops KPI Dashboard", "description": "Power BI dashboard tracking turnaround time, backlog and SLA breaches.", "skills": ["Power BI", "Data Visualization", "SQL", "Business Analysis"], "difficulty": "beginner", "why": "Shows you can measure and improve operations."},
    ],
}

_DEFAULT_PROJECTS = [
    {"title": "Skill-building capstone project", "description": "Combine your top missing skills into one small but complete product with a README.", "skills": [], "difficulty": "intermediate", "why": "A single coherent project beats scattered tutorials."},
    {"title": "Contribute to an open-source repo", "description": "Fix an issue or improve docs in a popular repo in your target stack.", "skills": ["Git", "Communication Skills"], "difficulty": "beginner", "why": "Public contribution history signals real collaboration skills."},
]


def build_project_recs(target_role: str, missing: list[dict]) -> list[dict]:
    role = get_role(target_role)
    key = role["title"] if role else target_role
    recs = list(_ROLE_PROJECTS.get(key, _DEFAULT_PROJECTS))
    missing_names = {m["skill"] for m in missing}
    out = []
    for r in recs:
        r = dict(r)
        r["skills"] = [s for s in r["skills"] if s in missing_names] or r["skills"][:3]
        out.append(r)
    return out


def build_interview_prep(target_role: str, missing: list[dict]) -> list[dict]:
    role = get_role(target_role)
    role_title = role["title"] if role else target_role
    required_missing = [m["skill"] for m in missing if m["importance"] == "required"][:4]
    top_skills = list(role["skills"].keys())[:6] if role else []

    items = [
        {"category": "Resume", "item": "Prepare a crisp 2-minute 'tell me about yourself' anchored on your target role."},
        {"category": "Resume", "item": "Re-read every line of your resume — be ready to explain each project in 3 minutes."},
    ]
    items += [{"category": "Technical", "item": f"Revise core {s} concepts and 5 likely interview questions on it."} for s in top_skills[:4]]
    items += [
        {"category": "Gap Handling", "item": f"You are missing {s} (required for {role_title}) — prepare an honest 'here's how I'm learning it' answer."}
        for s in required_missing
    ]
    items += [
        {"category": "Projects", "item": "Pick one recommended project and be able to defend its architecture and trade-offs."},
        {"category": "Behavioral", "item": "Prepare 3 STAR stories: a conflict, a failure, and a difficult deadline."},
        {"category": "Mock Interview", "item": "Attempt at least 3 timed mock interviews on incruit.online for this role."},
        {"category": "Mock Interview", "item": "Record one mock session and review your filler words, pace and clarity."},
    ]
    return items


def build_summary(target_role: str, readiness: float, matched: list[dict], missing: list[dict]) -> str:
    role = get_role(target_role)
    role_title = role["title"] if role else target_role
    req_missing = [m["skill"] for m in missing if m["importance"] == "required"]
    top_matched = [m["skill"] for m in matched[:5]]
    parts = [
        f"You are currently at {readiness:.0f}% readiness for a {role_title} role.",
    ]
    if top_matched:
        parts.append(f"Your strongest matching skills: {', '.join(top_matched)}.")
    if req_missing:
        parts.append(f"Top gaps to close: {', '.join(req_missing[:4])}.")
    else:
        parts.append("You already cover every required skill — focus on depth, projects and interview practice.")
    parts.append("Follow your roadmap in order and complete the recommended projects to push readiness above 80%.")
    return " ".join(parts)


# ---------------------------------------------------------------------------
# AI-enhanced generators (used when Ollama is available)
# ---------------------------------------------------------------------------

_SYSTEM = (
    "You are ResumeRadar's career co-pilot. You are precise, practical and encouraging. "
    "You always answer in valid JSON exactly matching the requested schema. No markdown, no commentary."
)


def ai_role_summary(ctx: dict) -> str | None:
    prompt = (
        f"Write a short, motivating career-readiness summary (max 90 words, plain text, no JSON).\n"
        f"Target role: {ctx['target_role']}\n"
        f"Readiness: {ctx['readiness']}%\n"
        f"Matched skills: {ctx['matched']}\n"
        f"Missing skills: {ctx['missing']}\n"
        f"User background: {ctx.get('background') or 'not specified'}"
    )
    return ai_generate(prompt, system=_SYSTEM)


def ai_roadmap(ctx: dict) -> list[dict] | None:
    prompt = (
        "Create a 3-phase learning roadmap to become job-ready for the target role.\n"
        f"Target role: {ctx['target_role']}\n"
        f"Missing skills (with importance): {json.dumps(ctx['missing_detail'][:12])}\n"
        f"Already known: {ctx['matched']}\n\n"
        'Return JSON: {"phases":[{"phase":1,"phase_title":"...","steps":[{"title":"...",'
        '"description":"1-2 sentences","estimated_hours":15,"skills":["Skill"],'
        '"resources":[{"title":"...","url":"https://...","type":"video|docs|article|roadmap"}]}]}]}\n'
        "Phase 1 = close required gaps, Phase 2 = strengthen core skills, Phase 3 = projects, mock interviews and job prep. 2-4 steps per phase."
    )
    data = parse_json_object(ai_generate(prompt, system=_SYSTEM, json_mode=True))
    if not data or not isinstance(data.get("phases"), list):
        return None
    cleaned = []
    for i, phase in enumerate(data["phases"][:3], start=1):
        steps = []
        for j, step in enumerate(phase.get("steps", [])[:5], start=1):
            if not step.get("title"):
                continue
            steps.append({
                "phase": i,
                "step_order": j,
                "title": str(step["title"])[:200],
                "description": str(step.get("description", ""))[:600],
                "resources": [
                    {"title": str(r.get("title", "Resource"))[:150],
                     "url": str(r.get("url", ""))[:400],
                     "type": str(r.get("type", "article"))[:30]}
                    for r in (step.get("resources") or [])[:3]
                    if r.get("url")
                ],
                "estimated_hours": int(step.get("estimated_hours") or 15),
                "skills": [str(s) for s in (step.get("skills") or [])][:6],
            })
        if steps:
            cleaned.append({
                "phase": i,
                "phase_title": str(phase.get("phase_title") or f"Phase {i}")[:160],
                "steps": steps,
            })
    return cleaned or None


def ai_projects(ctx: dict) -> list[dict] | None:
    prompt = (
        "Recommend 3 portfolio projects for a user targeting a specific role.\n"
        f"Target role: {ctx['target_role']}\n"
        f"Missing skills to cover: {ctx['missing']}\n"
        f"Known skills: {ctx['matched']}\n"
        f"Existing projects on resume (avoid duplicating): {ctx.get('existing_projects', [])[:5]}\n\n"
        'Return JSON: {"projects":[{"title":"...","description":"2 sentences",'
        '"skills":["Skill","Skill"],"difficulty":"beginner|intermediate|advanced","why":"1 sentence"}]}\n'
        "Each project must force the user to practice at least 2 of their missing skills."
    )
    data = parse_json_object(ai_generate(prompt, system=_SYSTEM, json_mode=True))
    if not data or not isinstance(data.get("projects"), list):
        return None
    out = []
    for p in data["projects"][:4]:
        if not p.get("title"):
            continue
        out.append({
            "title": str(p["title"])[:200],
            "description": str(p.get("description", ""))[:600],
            "skills": [str(s) for s in (p.get("skills") or [])][:6],
            "difficulty": str(p.get("difficulty", "intermediate"))[:20],
            "why": str(p.get("why", ""))[:400],
        })
    return out or None


def ai_interview_prep(ctx: dict) -> list[dict] | None:
    prompt = (
        "Generate a mock-interview preparation checklist.\n"
        f"Target role: {ctx['target_role']}\n"
        f"Missing skills: {ctx['missing']}\n"
        f"Known skills: {ctx['matched'][:10]}\n\n"
        'Return JSON: {"items":[{"category":"Resume|Technical|Gap Handling|Projects|Behavioral|Mock Interview",'
        '"item":"one concrete actionable checklist item"}]}\n'
        "Return 10-12 items. Be specific to the role, not generic."
    )
    data = parse_json_object(ai_generate(prompt, system=_SYSTEM, json_mode=True))
    if not data or not isinstance(data.get("items"), list):
        return None
    out = []
    for it in data["items"][:14]:
        if not it.get("item"):
            continue
        out.append({"category": str(it.get("category", "General"))[:80], "item": str(it["item"])[:400]})
    return out or None
