import os
import sqlite3
import uuid
from contextlib import closing, asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = Path(os.environ.get("SACHET_DB_PATH", Path(__file__).with_name("sachet.db")))
IST = timezone(timedelta(hours=5, minutes=30))
DEFAULT_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with closing(db()) as conn, conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                scam_type TEXT,
                district TEXT,
                channel TEXT,
                phone TEXT,
                upi_id TEXT,
                url TEXT,
                amount_lost REAL DEFAULT 0,
                created_at TEXT,
                consent INTEGER DEFAULT 1
            )
        """)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.environ.get("SACHET_CORS_ORIGINS", DEFAULT_ORIGINS).split(",")
        if origin.strip()
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class Scammer(BaseModel):
    phone: str | None = None
    upi_id: str | None = None
    url: str | None = None


class Report(BaseModel):
    scam_type: str
    district: str
    channel: str
    scammer: Scammer = Field(default_factory=Scammer)
    amount_lost: float = Field(default=0, ge=0, allow_inf_nan=False)
    consent: bool = True


@app.post("/api/reports")
def create_report(report: Report):
    if not report.consent:
        raise HTTPException(400, "consent required")
    report_id = str(uuid.uuid4())
    with closing(db()) as conn, conn:
        conn.execute(
            """
            INSERT INTO reports (
                id, scam_type, district, channel, phone, upi_id, url,
                amount_lost, created_at, consent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                report_id, report.scam_type, report.district, report.channel,
                report.scammer.phone, report.scammer.upi_id, report.scammer.url,
                report.amount_lost, datetime.now(IST).isoformat(timespec="seconds"), 1,
            ),
        )
    return {"id": report_id, "status": "saved"}


@app.get("/api/reports")
def list_reports(limit: int = Query(default=50, ge=0)):
    with closing(db()) as conn:
        rows = conn.execute(
            """
            SELECT id, scam_type, district, channel, amount_lost, created_at
            FROM reports ORDER BY created_at DESC, rowid DESC LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]


@app.get("/api/stats")
def stats(district: str | None = None, type: str | None = None):
    where, params = [], []
    if district:
        where.append("district = ?")
        params.append(district)
    if type:
        where.append("scam_type = ?")
        params.append(type)
    clause = "WHERE " + " AND ".join(where) if where else ""
    with closing(db()) as conn:
        rows = conn.execute(
            f"""
            SELECT scam_type, district, substr(created_at, 1, 10) AS day, COUNT(*) AS count
            FROM reports {clause}
            GROUP BY scam_type, district, day
            """,
            params,
        ).fetchall()

    by_type, by_district, by_day = {}, {}, {}
    for row in rows:
        count = row["count"]
        by_type[row["scam_type"]] = by_type.get(row["scam_type"], 0) + count
        by_district[row["district"]] = by_district.get(row["district"], 0) + count
        by_day[row["day"]] = by_day.get(row["day"], 0) + count

    return {
        "total": sum(by_day.values()),
        "by_type": by_type,
        "by_district": by_district,
        "trend": [{"date": day, "count": count} for day, count in sorted(by_day.items())],
    }
