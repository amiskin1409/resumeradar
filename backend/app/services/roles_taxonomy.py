"""Curated job-role taxonomy with weighted skill requirements.

Weights (0-1) express how important each skill is for the role and are used
by the deterministic scoring engine to compute readiness percentages.
Skill names must exist in skills_taxonomy.SKILLS.
"""

ROLES: list[dict] = [
    {
        "title": "Frontend Developer",
        "category": "Software Development",
        "description": "Builds the user-facing part of web applications — layout, interactivity and performance.",
        "skills": {
            "JavaScript": (1.0, "required"), "HTML": (0.9, "required"), "CSS": (0.9, "required"),
            "React": (0.85, "required"), "TypeScript": (0.6, "preferred"), "Responsive Design": (0.65, "required"),
            "Git": (0.55, "preferred"), "Tailwind CSS": (0.45, "preferred"), "Next.js": (0.4, "preferred"),
            "Redux": (0.35, "preferred"), "Web Accessibility": (0.3, "preferred"), "Vite": (0.25, "preferred"),
            "Jest": (0.25, "preferred"), "Node.js": (0.3, "preferred"), "Figma": (0.2, "preferred"),
            "GraphQL": (0.2, "preferred"), "Webpack": (0.2, "preferred"), "Framer Motion": (0.15, "preferred"),
        },
    },
    {
        "title": "Backend Developer",
        "category": "Software Development",
        "description": "Designs and builds server-side logic, APIs, databases and integrations.",
        "skills": {
            "SQL": (0.95, "required"), "REST APIs": (0.9, "required"), "Python": (0.7, "required"),
            "Java": (0.65, "required"), "JavaScript": (0.6, "required"), "Git": (0.6, "preferred"),
            "Docker": (0.55, "preferred"), "Microservices": (0.5, "preferred"), "PostgreSQL": (0.55, "preferred"),
            "MySQL": (0.5, "preferred"), "Node.js": (0.5, "preferred"), "Spring Boot": (0.45, "preferred"),
            "FastAPI": (0.4, "preferred"), "Django": (0.35, "preferred"), "Express.js": (0.4, "preferred"),
            "Linux": (0.45, "preferred"), "CI/CD": (0.4, "preferred"), "Redis": (0.3, "preferred"),
            "MongoDB": (0.35, "preferred"), "System Design": (0.35, "preferred"),
        },
    },
    {
        "title": "Full Stack Developer",
        "category": "Software Development",
        "description": "Works across the entire stack — from database and API to polished frontend.",
        "skills": {
            "JavaScript": (1.0, "required"), "React": (0.85, "required"), "Node.js": (0.8, "required"),
            "HTML": (0.8, "required"), "CSS": (0.8, "required"), "SQL": (0.75, "required"),
            "REST APIs": (0.75, "required"), "Express.js": (0.65, "preferred"), "Git": (0.6, "preferred"),
            "TypeScript": (0.55, "preferred"), "MongoDB": (0.5, "preferred"), "PostgreSQL": (0.5, "preferred"),
            "Docker": (0.5, "preferred"), "Next.js": (0.45, "preferred"), "CI/CD": (0.35, "preferred"),
            "Tailwind CSS": (0.35, "preferred"), "Redux": (0.3, "preferred"), "Linux": (0.35, "preferred"),
            "AWS": (0.35, "preferred"), "Jest": (0.25, "preferred"),
        },
    },
    {
        "title": "Mobile App Developer",
        "category": "Software Development",
        "description": "Builds native or cross-platform mobile applications for Android and iOS.",
        "skills": {
            "Android SDK": (0.8, "required"), "Kotlin": (0.75, "required"), "Swift": (0.75, "required"),
            "iOS Development": (0.75, "required"), "Flutter": (0.6, "preferred"), "React Native": (0.6, "preferred"),
            "Dart": (0.5, "preferred"), "REST APIs": (0.6, "required"), "Firebase": (0.5, "preferred"),
            "Git": (0.5, "preferred"), "Jetpack Compose": (0.45, "preferred"), "UI/UX Design": (0.35, "preferred"),
            "SQL": (0.4, "preferred"), "Unit Testing": (0.35, "preferred"),
        },
    },
    {
        "title": "Data Analyst",
        "category": "Data & Analytics",
        "description": "Turns raw data into dashboards, reports and insights that drive decisions.",
        "skills": {
            "SQL": (1.0, "required"), "Excel Advanced": (0.85, "required"), "Python": (0.8, "required"),
            "Power BI": (0.8, "required"), "Tableau": (0.7, "preferred"), "Statistics": (0.7, "required"),
            "Data Visualization": (0.75, "required"), "Pandas": (0.7, "preferred"), "Data Cleaning": (0.75, "required"),
            "Business Analysis": (0.5, "preferred"), "Communication Skills": (0.55, "preferred"),
            "ETL": (0.4, "preferred"), "Google Analytics": (0.3, "preferred"), "A/B Testing": (0.3, "preferred"),
        },
    },
    {
        "title": "Data Scientist",
        "category": "Data & Analytics",
        "description": "Builds predictive models and extracts knowledge from complex datasets.",
        "skills": {
            "Python": (1.0, "required"), "Machine Learning": (1.0, "required"), "Statistics": (0.9, "required"),
            "SQL": (0.75, "required"), "Pandas": (0.85, "required"), "Scikit-learn": (0.8, "required"),
            "NumPy": (0.7, "preferred"), "Deep Learning": (0.6, "preferred"), "Data Visualization": (0.65, "preferred"),
            "PyTorch": (0.55, "preferred"), "TensorFlow": (0.55, "preferred"), "Natural Language Processing": (0.4, "preferred"),
            "Computer Vision": (0.35, "preferred"), "Git": (0.4, "preferred"), "Communication Skills": (0.45, "preferred"),
            "BigQuery": (0.3, "preferred"), "MLOps": (0.3, "preferred"),
        },
    },
    {
        "title": "Machine Learning Engineer",
        "category": "AI & Engineering",
        "description": "Productionizes ML models — training pipelines, deployment and monitoring at scale.",
        "skills": {
            "Machine Learning": (1.0, "required"), "Python": (1.0, "required"), "Deep Learning": (0.8, "required"),
            "TensorFlow": (0.7, "preferred"), "PyTorch": (0.7, "preferred"), "MLOps": (0.7, "preferred"),
            "Docker": (0.6, "preferred"), "AWS": (0.6, "preferred"), "SQL": (0.6, "required"),
            "Pandas": (0.6, "preferred"), "Statistics": (0.65, "required"), "MLflow": (0.5, "preferred"),
            "Scikit-learn": (0.65, "preferred"), "CI/CD": (0.45, "preferred"), "Linux": (0.45, "preferred"),
            "Feature Engineering": (0.55, "preferred"), "Kubernetes": (0.35, "preferred"),
        },
    },
    {
        "title": "DevOps Engineer",
        "category": "DevOps & Cloud",
        "description": "Automates delivery pipelines, infrastructure and reliability for engineering teams.",
        "skills": {
            "Linux": (1.0, "required"), "Docker": (1.0, "required"), "Kubernetes": (0.9, "required"),
            "CI/CD": (0.9, "required"), "AWS": (0.8, "required"), "Terraform": (0.8, "required"),
            "Azure": (0.6, "preferred"), "GCP": (0.6, "preferred"), "Jenkins": (0.6, "preferred"),
            "Ansible": (0.6, "preferred"), "Python": (0.6, "preferred"), "Shell Scripting": (0.7, "preferred"),
            "Git": (0.6, "preferred"), "Prometheus": (0.5, "preferred"), "Grafana": (0.5, "preferred"),
            "Nginx": (0.45, "preferred"), "Helm": (0.4, "preferred"), "Computer Networking": (0.45, "preferred"),
        },
    },
    {
        "title": "Cloud Engineer",
        "category": "DevOps & Cloud",
        "description": "Designs and manages cloud infrastructure, networking and cost-efficient architectures.",
        "skills": {
            "AWS": (1.0, "required"), "Linux": (0.85, "required"), "Azure": (0.7, "preferred"),
            "GCP": (0.65, "preferred"), "Terraform": (0.7, "required"), "Docker": (0.7, "required"),
            "Kubernetes": (0.6, "preferred"), "Python": (0.55, "preferred"), "CI/CD": (0.55, "preferred"),
            "Computer Networking": (0.6, "required"), "Git": (0.5, "preferred"), "CloudFormation": (0.45, "preferred"),
            "Nginx": (0.4, "preferred"), "Cybersecurity Fundamentals": (0.35, "preferred"),
        },
    },
    {
        "title": "Cybersecurity Analyst",
        "category": "Security",
        "description": "Defends systems and data — monitoring, testing and responding to threats.",
        "skills": {
            "Cybersecurity Fundamentals": (1.0, "required"), "Network Security": (0.9, "required"),
            "OWASP": (0.85, "required"), "Ethical Hacking": (0.75, "preferred"),
            "Linux": (0.75, "required"), "SIEM": (0.7, "preferred"), "Python": (0.65, "preferred"),
            "Penetration Testing": (0.7, "preferred"), "Vulnerability Assessment": (0.7, "required"),
            "Cryptography": (0.6, "preferred"), "Incident Response": (0.65, "required"),
            "Kali Linux": (0.5, "preferred"), "Burp Suite": (0.55, "preferred"),
            "Computer Networking": (0.6, "required"), "IAM": (0.45, "preferred"),
        },
    },
    {
        "title": "QA / Test Engineer",
        "category": "Quality Assurance",
        "description": "Ensures product quality through test automation, frameworks and rigorous testing.",
        "skills": {
            "Test Automation": (1.0, "required"), "Selenium": (0.9, "required"),
            "Manual Testing": (0.75, "required"), "API Testing": (0.8, "required"), "Postman": (0.7, "preferred"),
            "Java": (0.6, "preferred"), "Python": (0.6, "preferred"), "SQL": (0.55, "preferred"),
            "Jest": (0.5, "preferred"), "Cypress": (0.5, "preferred"), "Playwright": (0.5, "preferred"),
            "Git": (0.45, "preferred"), "JMeter": (0.4, "preferred"), "Agile/Scrum": (0.45, "preferred"),
            "Unit Testing": (0.5, "preferred"), "Jira": (0.35, "preferred"),
        },
    },
    {
        "title": "UI/UX Designer",
        "category": "Design",
        "description": "Designs intuitive, beautiful product experiences backed by user research.",
        "skills": {
            "UI/UX Design": (1.0, "required"), "Figma": (1.0, "required"), "Wireframing": (0.9, "required"),
            "Prototyping": (0.85, "required"), "User Research": (0.75, "required"),
            "Responsive Design": (0.6, "preferred"), "Adobe Photoshop": (0.5, "preferred"),
            "Adobe XD": (0.5, "preferred"), "HTML": (0.45, "preferred"), "CSS": (0.45, "preferred"),
            "Communication Skills": (0.5, "preferred"), "Attention to Detail": (0.45, "preferred"),
            "Motion Graphics": (0.3, "preferred"), "Sketch": (0.3, "preferred"),
        },
    },
    {
        "title": "Data Engineer",
        "category": "Data & Analytics",
        "description": "Builds the data pipelines and warehouses that make analytics and ML possible.",
        "skills": {
            "SQL": (1.0, "required"), "Python": (0.95, "required"), "Apache Spark": (0.85, "required"),
            "ETL": (0.9, "required"), "Apache Airflow": (0.75, "preferred"), "Apache Kafka": (0.7, "preferred"),
            "Data Warehousing": (0.8, "required"), "AWS": (0.7, "preferred"), "dbt": (0.6, "preferred"),
            "Snowflake": (0.6, "preferred"), "Data Modeling": (0.75, "required"), "Linux": (0.5, "preferred"),
            "Git": (0.45, "preferred"), "Data Cleaning": (0.65, "preferred"), "Hadoop": (0.5, "preferred"),
        },
    },
    {
        "title": "Product Manager",
        "category": "Product",
        "description": "Owns the product vision — discovery, prioritization, delivery and outcomes.",
        "skills": {
            "Product Management": (1.0, "required"), "Stakeholder Management": (0.85, "required"),
            "Requirements Gathering": (0.85, "required"), "Competitive Analysis": (0.8, "required"),
            "Communication Skills": (0.9, "required"), "Business Analysis": (0.75, "preferred"),
            "Agile/Scrum": (0.7, "required"), "Leadership": (0.6, "preferred"),
            "User Research": (0.55, "preferred"), "A/B Testing": (0.5, "preferred"),
            "Data Visualization": (0.45, "preferred"), "SQL": (0.4, "preferred"), "Jira": (0.4, "preferred"),
        },
    },
    {
        "title": "Business Analyst",
        "category": "Business",
        "description": "Bridges business needs and technology — processes, requirements and reporting.",
        "skills": {
            "Business Analysis": (1.0, "required"), "Requirements Gathering": (1.0, "required"),
            "SQL": (0.8, "required"), "Excel Advanced": (0.85, "required"),
            "Data Visualization": (0.7, "preferred"), "Power BI": (0.65, "preferred"),
            "Communication Skills": (0.85, "required"), "Stakeholder Management": (0.8, "required"),
            "Agile/Scrum": (0.65, "preferred"), "Tableau": (0.5, "preferred"),
            "Statistics": (0.45, "preferred"), "Jira": (0.4, "preferred"), "Competitive Analysis": (0.5, "preferred"),
        },
    },
    {
        "title": "Java Developer",
        "category": "Software Development",
        "description": "Builds enterprise-grade applications on the Java ecosystem.",
        "skills": {
            "Java": (1.0, "required"), "Spring Boot": (0.95, "required"), "SQL": (0.8, "required"),
            "REST APIs": (0.8, "required"), "Microservices": (0.7, "preferred"), "Git": (0.6, "preferred"),
            "Docker": (0.55, "preferred"), "Maven": (0.6, "required"), "Hibernate": (0.55, "preferred"),
            "JUnit": (0.5, "preferred"), "MySQL": (0.5, "preferred"), "Linux": (0.4, "preferred"),
            "CI/CD": (0.4, "preferred"), "JavaScript": (0.35, "preferred"),
        },
    },
    {
        "title": "Python Developer",
        "category": "Software Development",
        "description": "Builds web applications, automation and tooling with Python.",
        "skills": {
            "Python": (1.0, "required"), "Django": (0.75, "preferred"), "Flask": (0.75, "preferred"),
            "FastAPI": (0.75, "preferred"), "SQL": (0.8, "required"), "REST APIs": (0.8, "required"),
            "Git": (0.6, "preferred"), "Docker": (0.5, "preferred"), "Pandas": (0.5, "preferred"),
            "pytest": (0.45, "preferred"), "Linux": (0.4, "preferred"), "PostgreSQL": (0.5, "preferred"),
            "MySQL": (0.45, "preferred"), "CI/CD": (0.35, "preferred"), "JavaScript": (0.35, "preferred"),
        },
    },
    {
        "title": "Data Entry / Operations Analyst",
        "category": "Business",
        "description": "Keeps business data accurate and operations running smoothly.",
        "skills": {
            "Excel Advanced": (1.0, "required"), "Communication Skills": (0.7, "required"),
            "Attention to Detail": (0.85, "required"), "SQL": (0.5, "preferred"),
            "Data Cleaning": (0.7, "required"), "Power BI": (0.45, "preferred"),
            "Accounting": (0.4, "preferred"), "Customer Service": (0.45, "preferred"),
            "Google Analytics": (0.25, "preferred"), "Business Analysis": (0.35, "preferred"),
        },
    },
]

ROLE_TITLES: list[str] = [r["title"] for r in ROLES]

# role title -> {skill: weight} helper for quick lookups
ROLE_WEIGHTS: dict[str, dict[str, float]] = {
    r["title"]: {s: w for s, (w, _imp) in r["skills"].items()} for r in ROLES
}


def get_role(title: str) -> dict | None:
    """Case-insensitive role lookup by title."""
    t = (title or "").strip().lower()
    for r in ROLES:
        if r["title"].lower() == t:
            return r
    return None
