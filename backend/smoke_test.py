"""End-to-end smoke test for the ResumeRadar API.

Usage (backend running on :8000):
    python smoke_test.py
"""

import sys

import httpx

BASE = "http://localhost:8000"
c = httpx.Client(base_url=BASE, timeout=180)
ok, fail = 0, 0


def check(name, cond, extra=""):
    global ok, fail
    if cond:
        ok += 1
        print(f"  PASS  {name}")
    else:
        fail += 1
        print(f"  FAIL  {name} {extra}")


def _ensure_sample_pdf() -> None:
    """Generate test_resume.pdf on the fly so fresh clones can run the test."""
    import os

    if os.path.exists("test_resume.pdf"):
        return
    import pymupdf

    doc = pymupdf.open()
    page = doc.new_page()
    text = (
        "ARJUN SHARMA\narjun.sharma@email.com | +91 98765 43210 | Bengaluru, India\n\n"
        "SKILLS\nPython, JavaScript, React, HTML, CSS, SQL, Git, Docker, REST APIs, MySQL\n\n"
        "PROJECTS\n"
        "1. E-Commerce Website - Full stack site with React, Node.js and MongoDB. Cart, "
        "checkout and admin dashboard with JWT authentication.\n"
        "2. Student Result Management System - Django web app with MySQL backend, "
        "role-based login and PDF report generation.\n"
        "3. Portfolio Website - Personal portfolio using HTML, CSS, JavaScript with "
        "responsive design and dark mode toggle.\n"
    )
    page.insert_text((60, 80), text, fontsize=10.5, fontname="helv")
    doc.save("test_resume.pdf")
    doc.close()


def main() -> int:
    print("== ResumeRadar smoke test ==\n")
    _ensure_sample_pdf()

    h = c.get("/api/health").json()
    check("health", h["status"] == "ok", h)
    print(f"        AI available: {h['ai_available']} (model: {h['ai_model']})")

    email = f"smoke{int(__import__('time').time())}@test.com"
    r = c.post("/api/auth/register", json={
        "name": "Smoke Tester", "email": email, "password": "secret123",
        "field_of_study": "B.Tech CSE", "graduation_year": 2027,
    })
    check("register", r.status_code == 201, r.text[:200])
    tok = r.json()["access_token"]
    H = {"Authorization": f"Bearer {tok}"}

    r = c.post("/api/auth/login", json={"email": email, "password": "secret123"})
    check("login", r.status_code == 200)
    r = c.post("/api/auth/login", json={"email": email, "password": "wrong"})
    check("login rejects bad password", r.status_code == 401)

    r = c.get("/api/me", headers=H)
    check("get profile", r.status_code == 200 and r.json()["email"] == email)

    r = c.get("/api/meta/skills")
    check("skills catalogue", r.status_code == 200 and len(r.json()["skills"]) > 150)
    r = c.get("/api/meta/roles")
    check("roles catalogue", r.status_code == 200 and len(r.json()) == 18)

    r = c.get("/api/analysis/latest", headers=H)
    check("latest analysis empty initially", r.status_code == 200 and r.json() is None)

    # Resume upload with the sample PDF
    try:
        with open("test_resume.pdf", "rb") as f:
            r = c.post("/api/resume/upload", headers=H, files={"file": ("resume.pdf", f, "application/pdf")})
        check("resume upload", r.status_code == 201, r.text[:200])
        detected = r.json()["detected_skills"]
        projects = r.json()["detected_projects"]
        print(f"        Detected skills: {detected}")
        print(f"        Detected projects: {len(projects)}")
        check("resume detected core skills", {"Python", "React", "SQL", "Git", "Docker"} <= set(detected))
        check("resume detected projects", len(projects) >= 2)
    except FileNotFoundError:
        check("resume upload (test_resume.pdf missing)", False)

    r = c.get("/api/me/skills", headers=H)
    check("skills merged from resume", r.status_code == 200 and len(r.json()) >= 8)

    # Analysis
    r = c.post("/api/analysis", json={"target_role": "Full Stack Developer"}, headers=H)
    check("run analysis", r.status_code == 201, r.text[:200])
    d = r.json()
    check("readiness score present", 0 <= d["readiness_score"] <= 100, d["readiness_score"])
    check("roadmap generated", len(d["roadmap_steps"]) >= 5)
    check("project recs generated", len(d["project_recs"]) >= 2)
    check("interview prep generated", len(d["interview_prep"]) >= 5)
    check("role matches ranked", len(d["role_matches"]) >= 5)
    check("ai summary present", len(d["ai_summary"]) > 30)

    step = d["roadmap_steps"][0]
    r = c.post(f"/api/roadmap/steps/{step['id']}/toggle", headers=H)
    check("toggle roadmap step", r.status_code == 200 and r.json()["done"] is True)

    item = d["interview_prep"][0]
    r = c.post(f"/api/interview/prep/{item['id']}/toggle", headers=H)
    check("toggle prep item", r.status_code == 200 and r.json()["done"] is True)

    # Companies
    r = c.get("/api/companies", params={"role": "Full Stack Developer"}, headers=H)
    comps = r.json()
    check("companies list", r.status_code == 200 and len(comps) > 10, f"got {len(comps)}")
    if comps:
        top = comps[0]
        print(f"        Top match: {top['name']} (fit {top['match_score']}) — {top['match_reasons']}")
        check("company has postings", len(top["sample_postings"]) > 0)
        check("company apply url", bool(top["sample_postings"][0]["apply_url"] or top["careers_url"]))

    r = c.get("/api/companies", params={"role": "Full Stack Developer", "mode": "remote"}, headers=H)
    check("remote filter", r.status_code == 200 and all("remote" in x["modes"] for x in r.json()))

    r = c.get("/api/companies/industries")
    check("industries list", r.status_code == 200 and len(r.json()) > 5)

    cid = comps[0]["id"] if comps else None
    if cid:
        r = c.get(f"/api/companies/{cid}", headers=H)
        check("company detail", r.status_code == 200 and len(r.json()["sample_postings"]) > 0)

    # AI enhance (expected to be 503 when Ollama is offline)
    r = c.post(f"/api/analysis/{d['id']}/enhance", headers=H)
    if h["ai_available"]:
        check("AI enhance", r.status_code == 200)
    else:
        check("AI enhance returns graceful 503 when offline", r.status_code == 503)

    print(f"\n== {ok} passed, {fail} failed ==")
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
