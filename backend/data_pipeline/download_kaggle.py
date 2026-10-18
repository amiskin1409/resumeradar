"""Helper for fetching the optional Kaggle LinkedIn dataset.

Two ways to use it:

A) Kaggle CLI (recommended):
   1. pip install kaggle
   2. Create an API token on kaggle.com -> Settings -> API -> "Create New Token"
      and save kaggle.json to C:\\Users\\<you>\\.kaggle\\ (or %USERPROFILE%\\.kaggle\\)
   3. python data_pipeline/download_kaggle.py

B) Manual download:
   1. Open https://www.kaggle.com/datasets/arshkon/linkedin-job-postings
   2. Download the dataset ZIP and extract these files into backend/data/kaggle_raw/:
        job_postings.csv, companies.csv, skills.csv,
        company_industries.csv, company_specialities.csv
   3. Run: python data_pipeline/etl.py

The app works fully without this step — the curated India dataset is always
loaded. Kaggle data adds global companies/postings for extra coverage.
"""

import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

DATASET = "arshkon/linkedin-job-postings"
RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "kaggle_raw"


def main() -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Downloading Kaggle dataset '{DATASET}' ...")
    try:
        subprocess.run(
            [sys.executable, "-m", "kaggle", "datasets", "download", "-d", DATASET, "-p", str(RAW_DIR)],
            check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(
            "\n⚠ Kaggle CLI not available. Either:\n"
            "  • pip install kaggle  (and place kaggle.json in %USERPROFILE%\\.kaggle\\), or\n"
            "  • download manually from https://www.kaggle.com/datasets/arshkon/linkedin-job-postings\n"
            f"  and extract the CSVs into: {RAW_DIR}"
        )
        return 1

    for zip_path in RAW_DIR.glob("*.zip"):
        print(f"Extracting {zip_path.name} ...")
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(RAW_DIR)
        zip_path.unlink()

    print("\n✅ Done. Now run:  python data_pipeline/etl.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
