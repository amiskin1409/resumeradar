"""Curated skills taxonomy: canonical names, aliases and categories.

This drives resume skill extraction, user skill normalization and
role-based gap analysis. ~200 employable skills.
"""

SKILLS: dict[str, dict] = {
    # ---------------- Programming languages ----------------
    "Python": {"aliases": ["python3", "py"], "category": "Programming Languages"},
    "Java": {"aliases": ["java se", "java ee"], "category": "Programming Languages"},
    "JavaScript": {"aliases": ["js", "es6", "ecmascript"], "category": "Programming Languages"},
    "TypeScript": {"aliases": ["ts"], "category": "Programming Languages"},
    "C": {"aliases": ["ansi c"], "category": "Programming Languages"},
    "C++": {"aliases": ["cpp", "c plus plus"], "category": "Programming Languages"},
    "C#": {"aliases": ["csharp", "c sharp", ".net"], "category": "Programming Languages"},
    "Go": {"aliases": ["golang"], "category": "Programming Languages"},
    "Rust": {"aliases": [], "category": "Programming Languages"},
    "PHP": {"aliases": ["php8"], "category": "Programming Languages"},
    "Ruby": {"aliases": [], "category": "Programming Languages"},
    "Kotlin": {"aliases": ["kotlinlang"], "category": "Programming Languages"},
    "Swift": {"aliases": [], "category": "Programming Languages"},
    "Scala": {"aliases": [], "category": "Programming Languages"},
    "R": {"aliases": ["rlang", "r programming"], "category": "Programming Languages"},
    "MATLAB": {"aliases": [], "category": "Programming Languages"},
    "Dart": {"aliases": [], "category": "Programming Languages"},
    "SQL": {"aliases": ["t-sql", "plsql", "pl/sql", "structured query language"], "category": "Programming Languages"},
    "Shell Scripting": {"aliases": ["shell", "sh"], "category": "Programming Languages"},
    # ---------------- Frontend ----------------
    "HTML": {"aliases": ["html5", "hypertext markup language"], "category": "Frontend"},
    "CSS": {"aliases": ["css3"], "category": "Frontend"},
    "React": {"aliases": ["reactjs", "react js"], "category": "Frontend"},
    "Angular": {"aliases": ["angularjs"], "category": "Frontend"},
    "Vue.js": {"aliases": ["vuejs", "vue"], "category": "Frontend"},
    "Next.js": {"aliases": ["nextjs", "next"], "category": "Frontend"},
    "Redux": {"aliases": ["react redux"], "category": "Frontend"},
    "Tailwind CSS": {"aliases": ["tailwind", "tailwindcss"], "category": "Frontend"},
    "Bootstrap": {"aliases": [], "category": "Frontend"},
    "SASS/SCSS": {"aliases": ["sass", "scss"], "category": "Frontend"},
    "Webpack": {"aliases": [], "category": "Frontend"},
    "Vite": {"aliases": [], "category": "Frontend"},
    "jQuery": {"aliases": [], "category": "Frontend"},
    "Responsive Design": {"aliases": ["responsive web design", "responsive layouts"], "category": "Frontend"},
    "Web Accessibility": {"aliases": ["a11y", "wcag", "accessible design"], "category": "Frontend"},
    "Three.js": {"aliases": ["threejs"], "category": "Frontend"},
    "Framer Motion": {"aliases": ["framer"], "category": "Frontend"},
    # ---------------- Backend ----------------
    "Node.js": {"aliases": ["nodejs", "node"], "category": "Backend"},
    "Express.js": {"aliases": ["expressjs", "express"], "category": "Backend"},
    "Django": {"aliases": ["django rest framework", "drf"], "category": "Backend"},
    "Flask": {"aliases": [], "category": "Backend"},
    "FastAPI": {"aliases": ["fast api"], "category": "Backend"},
    "Spring Boot": {"aliases": ["spring", "springboot", "spring mvc"], "category": "Backend"},
    "Ruby on Rails": {"aliases": ["rails", "ror"], "category": "Backend"},
    "ASP.NET": {"aliases": ["asp.net core", "aspnet", "dotnet core"], "category": "Backend"},
    "GraphQL": {"aliases": ["apollo graphql"], "category": "Backend"},
    "REST APIs": {"aliases": ["rest api", "restful", "rest apis", "rest"], "category": "Backend"},
    "WebSockets": {"aliases": ["websocket", "socket.io"], "category": "Backend"},
    "Microservices": {"aliases": ["micro services", "microservice architecture"], "category": "Backend"},
    "System Design": {"aliases": ["system architecture", "distributed systems"], "category": "Backend"},
    "Maven": {"aliases": ["gradle"], "category": "Backend"},
    "Hibernate": {"aliases": ["jpa", "java persistence"], "category": "Backend"},
    # ---------------- Mobile ----------------
    "Flutter": {"aliases": [], "category": "Mobile"},
    "React Native": {"aliases": ["reactnative"], "category": "Mobile"},
    "Android SDK": {"aliases": ["android development", "android", "android studio"], "category": "Mobile"},
    "iOS Development": {"aliases": ["ios", "ios programming", "iphone development"], "category": "Mobile"},
    "Jetpack Compose": {"aliases": ["compose"], "category": "Mobile"},
    "Firebase": {"aliases": [], "category": "Mobile"},
    # ---------------- Database ----------------
    "MySQL": {"aliases": ["mysql workbench", "mariadb"], "category": "Databases"},
    "PostgreSQL": {"aliases": ["postgres", "postgresql sql"], "category": "Databases"},
    "MongoDB": {"aliases": ["mongo", "mongoose"], "category": "Databases"},
    "Redis": {"aliases": [], "category": "Databases"},
    "SQLite": {"aliases": [], "category": "Databases"},
    "Oracle DB": {"aliases": ["oracle", "oracle database"], "category": "Databases"},
    "Microsoft SQL Server": {"aliases": ["mssql", "sql server"], "category": "Databases"},
    "DynamoDB": {"aliases": ["dynamo db"], "category": "Databases"},
    "Elasticsearch": {"aliases": ["elastic search", "elk stack"], "category": "Databases"},
    "Neo4j": {"aliases": ["graph databases", "cypher"], "category": "Databases"},
    "Database Design": {"aliases": ["database management", "rdbms", "database administration"], "category": "Databases"},
    # ---------------- Data Science / ML ----------------
    "Machine Learning": {"aliases": ["ml", "supervised learning", "unsupervised learning"], "category": "AI & Data Science"},
    "Deep Learning": {"aliases": ["dl", "neural networks"], "category": "AI & Data Science"},
    "Natural Language Processing": {"aliases": ["nlp"], "category": "AI & Data Science"},
    "Computer Vision": {"aliases": ["opencv", "image processing"], "category": "AI & Data Science"},
    "TensorFlow": {"aliases": ["tf", "tensor flow"], "category": "AI & Data Science"},
    "PyTorch": {"aliases": ["torch", "py torch"], "category": "AI & Data Science"},
    "Scikit-learn": {"aliases": ["sklearn", "scikit learn"], "category": "AI & Data Science"},
    "Pandas": {"aliases": ["pandas python", "dataframes"], "category": "AI & Data Science"},
    "NumPy": {"aliases": ["numpy", "numeric python"], "category": "AI & Data Science"},
    "Statistics": {"aliases": ["statistical analysis", "statistical modeling"], "category": "AI & Data Science"},
    "Data Visualization": {"aliases": ["dataviz", "visualization", "storytelling with data"], "category": "AI & Data Science"},
    "Power BI": {"aliases": ["powerbi", "microsoft power bi"], "category": "AI & Data Science"},
    "Tableau": {"aliases": [], "category": "AI & Data Science"},
    "Hugging Face": {"aliases": ["huggingface", "transformers library"], "category": "AI & Data Science"},
    "LangChain": {"aliases": ["lang chain"], "category": "AI & Data Science"},
    "RAG": {"aliases": ["retrieval augmented generation", "retrieval-augmented generation"], "category": "AI & Data Science"},
    "Prompt Engineering": {"aliases": ["prompt design", "prompting"], "category": "AI & Data Science"},
    "LLM Fine-tuning": {"aliases": ["lora", "fine tuning", "finetuning", "peft"], "category": "AI & Data Science"},
    "MLOps": {"aliases": ["ml ops"], "category": "AI & Data Science"},
    "MLflow": {"aliases": [], "category": "AI & Data Science"},
    "Feature Engineering": {"aliases": ["feature selection"], "category": "AI & Data Science"},
    "A/B Testing": {"aliases": ["ab testing", "experimentation"], "category": "AI & Data Science"},
    "Time Series Analysis": {"aliases": ["time series forecasting", "forecasting"], "category": "AI & Data Science"},
    "Keras": {"aliases": [], "category": "AI & Data Science"},
    "Matplotlib": {"aliases": [], "category": "AI & Data Science"},
    # ---------------- Data Engineering ----------------
    "ETL": {"aliases": ["etl pipelines", "extract transform load"], "category": "Data Engineering"},
    "Apache Spark": {"aliases": ["spark", "pyspark", "spark mllib"], "category": "Data Engineering"},
    "Apache Airflow": {"aliases": ["airflow"], "category": "Data Engineering"},
    "Apache Kafka": {"aliases": ["kafka", "confluent"], "category": "Data Engineering"},
    "Hadoop": {"aliases": ["mapreduce", "hdfs"], "category": "Data Engineering"},
    "Data Warehousing": {"aliases": ["data warehouse", "warehouse design"], "category": "Data Engineering"},
    "Snowflake": {"aliases": [], "category": "Data Engineering"},
    "dbt": {"aliases": ["data build tool"], "category": "Data Engineering"},
    "BigQuery": {"aliases": ["google bigquery"], "category": "Data Engineering"},
    "Data Modeling": {"aliases": ["data modelling", "star schema", "snowflake schema"], "category": "Data Engineering"},
    "Data Cleaning": {"aliases": ["data wrangling", "data preprocessing", "data munging"], "category": "Data Engineering"},
    "Excel Advanced": {"aliases": ["excel", "advanced excel", "microsoft excel", "vlookup", "pivot tables"], "category": "Data Engineering"},
    # ---------------- DevOps & Cloud ----------------
    "AWS": {"aliases": ["amazon web services", "aws cloud"], "category": "DevOps & Cloud"},
    "Azure": {"aliases": ["microsoft azure", "azure cloud"], "category": "DevOps & Cloud"},
    "GCP": {"aliases": ["google cloud", "google cloud platform"], "category": "DevOps & Cloud"},
    "Docker": {"aliases": ["docker containers", "containerization"], "category": "DevOps & Cloud"},
    "Kubernetes": {"aliases": ["k8s"], "category": "DevOps & Cloud"},
    "Terraform": {"aliases": ["iac", "infrastructure as code"], "category": "DevOps & Cloud"},
    "Ansible": {"aliases": [], "category": "DevOps & Cloud"},
    "Jenkins": {"aliases": [], "category": "DevOps & Cloud"},
    "GitHub Actions": {"aliases": ["github actions ci", "gh actions"], "category": "DevOps & Cloud"},
    "CI/CD": {"aliases": ["cicd", "continuous integration", "continuous delivery", "continuous deployment"], "category": "DevOps & Cloud"},
    "Linux": {"aliases": ["ubuntu", "unix", "centos"], "category": "DevOps & Cloud"},
    "Nginx": {"aliases": ["engine x"], "category": "DevOps & Cloud"},
    "Prometheus": {"aliases": [], "category": "DevOps & Cloud"},
    "Grafana": {"aliases": [], "category": "DevOps & Cloud"},
    "Helm": {"aliases": ["helm charts"], "category": "DevOps & Cloud"},
    "CloudFormation": {"aliases": ["aws cloudformation"], "category": "DevOps & Cloud"},
    "Computer Networking": {"aliases": ["networking", "tcp/ip", "dns", "load balancing"], "category": "DevOps & Cloud"},
    # ---------------- Cybersecurity ----------------
    "Cybersecurity Fundamentals": {"aliases": ["cybersecurity", "information security", "infosec", "security fundamentals"], "category": "Cybersecurity"},
    "Network Security": {"aliases": ["firewalls", "ids ips"], "category": "Cybersecurity"},
    "Penetration Testing": {"aliases": ["pentesting", "pen testing", "ethical penetration"], "category": "Cybersecurity"},
    "Ethical Hacking": {"aliases": ["white hat hacking", "ethical hacker"], "category": "Cybersecurity"},
    "OWASP": {"aliases": ["owasp top 10", "owasp mobile top 10"], "category": "Cybersecurity"},
    "Burp Suite": {"aliases": ["burpsuite", "burp"], "category": "Cybersecurity"},
    "Kali Linux": {"aliases": ["kali"], "category": "Cybersecurity"},
    "Cryptography": {"aliases": ["crypto", "encryption"], "category": "Cybersecurity"},
    "SIEM": {"aliases": ["splunk", "siem tools", "log analysis"], "category": "Cybersecurity"},
    "Incident Response": {"aliases": ["incident management", "ir"], "category": "Cybersecurity"},
    "Vulnerability Assessment": {"aliases": ["vulnerability scanning", "vapt"], "category": "Cybersecurity"},
    "IAM": {"aliases": ["identity and access management", "identity access management"], "category": "Cybersecurity"},
    # ---------------- Testing & QA ----------------
    "Selenium": {"aliases": ["selenium webdriver"], "category": "Testing & QA"},
    "Cypress": {"aliases": [], "category": "Testing & QA"},
    "Playwright": {"aliases": [], "category": "Testing & QA"},
    "Jest": {"aliases": [], "category": "Testing & QA"},
    "pytest": {"aliases": ["py test"], "category": "Testing & QA"},
    "JUnit": {"aliases": [], "category": "Testing & QA"},
    "Unit Testing": {"aliases": ["unit tests", "test driven development", "tdd"], "category": "Testing & QA"},
    "API Testing": {"aliases": ["api test", "接口测试"], "category": "Testing & QA"},
    "Postman": {"aliases": [], "category": "Testing & QA"},
    "JMeter": {"aliases": ["apache jmeter", "load testing"], "category": "Testing & QA"},
    "Manual Testing": {"aliases": ["manual test", "functional testing"], "category": "Testing & QA"},
    "Test Automation": {"aliases": ["automation testing", "automation framework", "selenium automation"], "category": "Testing & QA"},
    "Appium": {"aliases": [], "category": "Testing & QA"},
    # ---------------- Design ----------------
    "Figma": {"aliases": [], "category": "Design"},
    "Adobe XD": {"aliases": ["xd"], "category": "Design"},
    "Sketch": {"aliases": [], "category": "Design"},
    "UI/UX Design": {"aliases": ["ui ux", "ux design", "ui design", "user experience design", "user interface design"], "category": "Design"},
    "Wireframing": {"aliases": ["wireframes", "wireframe"], "category": "Design"},
    "Prototyping": {"aliases": ["prototype", "interactive prototype"], "category": "Design"},
    "User Research": {"aliases": ["ux research", "usability testing", "user interviews"], "category": "Design"},
    "Adobe Photoshop": {"aliases": ["photoshop", "ps"], "category": "Design"},
    "Adobe Illustrator": {"aliases": ["illustrator", "ai tools design"], "category": "Design"},
    "Motion Graphics": {"aliases": ["after effects", "motion design"], "category": "Design"},
    # ---------------- Tools & Platforms ----------------
    "Git": {"aliases": ["git version control", "version control", "gitflow"], "category": "Tools & Platforms"},
    "GitHub": {"aliases": [], "category": "Tools & Platforms"},
    "GitLab": {"aliases": [], "category": "Tools & Platforms"},
    "Jira": {"aliases": [], "category": "Tools & Platforms"},
    "Agile/Scrum": {"aliases": ["agile", "scrum", "sdlc", "agile methodology"], "category": "Tools & Platforms"},
    "Kanban": {"aliases": [], "category": "Tools & Platforms"},
    "VS Code": {"aliases": ["vscode", "visual studio code"], "category": "Tools & Platforms"},
    "Swagger": {"aliases": ["openapi", "swagger ui"], "category": "Tools & Platforms"},
    "Salesforce": {"aliases": ["sfdc", "salesforce crm"], "category": "Tools & Platforms"},
    "ServiceNow": {"aliases": [], "category": "Tools & Platforms"},
    "SAP": {"aliases": [], "category": "Tools & Platforms"},
    "Google Analytics": {"aliases": ["ga4", "analytics"], "category": "Tools & Platforms"},
    "SEO": {"aliases": ["search engine optimization", "digital marketing"], "category": "Tools & Platforms"},
    "Technical Writing": {"aliases": ["documentation", "tech writing"], "category": "Tools & Platforms"},
    # ---------------- Business & Soft skills ----------------
    "Communication Skills": {"aliases": ["communication", "presentation skills", "public speaking"], "category": "Business & Soft Skills"},
    "Leadership": {"aliases": ["team leadership", "leading teams"], "category": "Business & Soft Skills"},
    "Problem Solving": {"aliases": ["problem-solving", "analytical thinking"], "category": "Business & Soft Skills"},
    "Team Collaboration": {"aliases": ["teamwork", "collaboration", "cross functional collaboration"], "category": "Business & Soft Skills"},
    "Attention to Detail": {"aliases": ["detail oriented", "meticulous"], "category": "Business & Soft Skills"},
    "Project Management": {"aliases": ["project manager", "pm tools", "project planning"], "category": "Business & Soft Skills"},
    "Stakeholder Management": {"aliases": ["stakeholders"], "category": "Business & Soft Skills"},
    "Business Analysis": {"aliases": ["business analyst", "business analytics"], "category": "Business & Soft Skills"},
    "Requirements Gathering": {"aliases": ["requirement gathering", "brd", "user stories"], "category": "Business & Soft Skills"},
    "Competitive Analysis": {"aliases": ["market research", "market analysis"], "category": "Business & Soft Skills"},
    "Product Management": {"aliases": ["product manager", "product strategy", "product roadmap"], "category": "Business & Soft Skills"},
    "Customer Service": {"aliases": ["customer support", "client handling"], "category": "Business & Soft Skills"},
    "Financial Modeling": {"aliases": ["finance", "financial analysis", "valuation"], "category": "Business & Soft Skills"},
    "Accounting": {"aliases": ["tally", "gst", "bookkeeping"], "category": "Business & Soft Skills"},
}


def _norm(text: str) -> str:
    """Normalize a skill string for fuzzy alias matching (keeps + and #)."""
    keep = {c for c in "+#"}
    return "".join(c for c in text.lower().strip() if c.isalnum() or c in keep)


# Precomputed alias -> canonical map
_ALIAS_TO_CANONICAL: dict[str, str] = {}
for _canonical, _meta in SKILLS.items():
    _ALIAS_TO_CANONICAL[_norm(_canonical)] = _canonical
    for _alias in _meta["aliases"]:
        _ALIAS_TO_CANONICAL[_norm(_alias)] = _canonical

ALL_SKILLS: list[str] = sorted(SKILLS.keys())
ALL_CATEGORIES: list[str] = sorted({m["category"] for m in SKILLS.values()})


def normalize_skill(raw: str) -> str | None:
    """Return the canonical skill name for a raw string, or None if unknown."""
    if not raw:
        return None
    return _ALIAS_TO_CANONICAL.get(_norm(raw))


def canonicalize_many(raw_skills: list[str]) -> list[str]:
    """Normalize a list of raw skill strings, deduplicated, preserving order."""
    seen: dict[str, None] = {}
    for raw in raw_skills:
        canonical = normalize_skill(raw)
        if canonical:
            seen.setdefault(canonical, None)
    return list(seen.keys())


def skill_category(canonical: str) -> str:
    return SKILLS.get(canonical, {}).get("category", "Other")
