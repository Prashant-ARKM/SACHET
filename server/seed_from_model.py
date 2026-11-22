import argparse
import csv
import random
import sys
from contextlib import closing
from datetime import datetime, timedelta
from pathlib import Path

if __package__:
    from .main import IST, db, init_db
else:
    from main import IST, db, init_db

ROOT = Path(__file__).resolve().parents[1]
DISTRICTS = (
    ["Raipur"] * 12 + ["Bilaspur", "Durg", "Korba"] * 11
    + ["Raigarh", "Rajnandgaon", "Janjgir-Champa", "Surguja", "Dhamtari"] * 7
    + ["Jagdalpur", "Kanker", "Mahasamund", "Kawardha", "Ambikapur", "Jashpur",
       "Balod", "Bemetara", "Mungeli", "Gariaband"] * 2
)


def main():
    parser = argparse.ArgumentParser(description="Seed demo reports using the M1 model.")
    parser.add_argument("--csv", type=Path, default=ROOT / "ml/data/messages.csv")
    args = parser.parse_args()

    model_dir = ROOT / "ml"
    for path in (model_dir / "predict.py", model_dir / "model.json", args.csv):
        if not path.is_file():
            parser.error(f"missing {path}")

    sys.path.insert(0, str(model_dir))
    from predict import predict

    with args.csv.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        if not {"label", "text"}.issubset(reader.fieldnames or ()):
            parser.error("CSV must contain label and text columns")
        scam_texts = [row["text"] for row in reader if row["label"] == "scam"]

    rng = random.Random(42)
    now = datetime.now(IST)
    reports = []
    for message in rng.sample(scam_texts, min(250, len(scam_texts))):
        result = predict(message)
        if result["label"] != "scam":
            continue
        timestamp = now - timedelta(days=rng.randrange(14))
        # DEMO DATA: amounts and scammer identifiers are synthetic. Phones are masked,
        # UPI handles are invented, URLs use the reserved .example domain.
        n = len(reports)
        lost = rng.choice([0, 0, 0, 500, 1200, 2500, 4999, 9800, 15000, 32000, 75000])
        phone = f"{rng.choice(['98', '97', '96', '90', '88'])}XXXXXX{rng.randrange(10, 99)}"
        upi = rng.choice([None, f"quickcash{rng.randrange(100, 999)}@okaxis", f"refund.desk{rng.randrange(10, 99)}@ybl"])
        url = rng.choice([None, None, f"http://kyc-update-{rng.randrange(100, 999)}.example/login"])
        reports.append((
            f"seed-{n}", result["scam_type"] or "other", rng.choice(DISTRICTS),
            rng.choice(["sms", "whatsapp"]), timestamp.isoformat(timespec="seconds"),
            lost, phone, upi, url,
        ))

    if not reports:
        parser.error("the model flagged none of the sampled messages as scams")

    init_db()
    with closing(db()) as conn, conn:
        conn.execute("DELETE FROM reports WHERE id GLOB 'seed-[0-9]*'")
        conn.executemany(
            """
            INSERT INTO reports (id, scam_type, district, channel, created_at,
                                 amount_lost, phone, upi_id, url, consent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """,
            reports,
        )
    print(f"Seeded {len(reports)} model-scored demo reports")


if __name__ == "__main__":
    main()
