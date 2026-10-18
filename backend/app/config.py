"""Application configuration loaded from environment / .env file."""

import os
from pathlib import Path

from dotenv import load_dotenv

# backend/ directory = parent of app/
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me-in-production-9f8a7b")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BACKEND_DIR / 'data' / 'resumeradar.db'}")

UPLOAD_DIR = BACKEND_DIR / "uploads"
DATA_DIR = BACKEND_DIR / "data"
KAGGLE_RAW_DIR = DATA_DIR / "kaggle_raw"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
KAGGLE_RAW_DIR.mkdir(parents=True, exist_ok=True)

# Local AI (Ollama)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
AI_TIMEOUT_SECONDS = float(os.getenv("AI_TIMEOUT_SECONDS", "120"))
