import base64
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
import uuid
from contextlib import closing, asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = Path(os.environ.get("SACHET_DB_PATH", Path(__file__).with_name("sachet.db")))
IST = timezone(timedelta(hours=5, minutes=30))
DEFAULT_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"

# ---- Official login (citizens never log in) ----
# Set on the server (Render env vars): SACHET_OFFICIAL_USER, SACHET_OFFICIAL_PASSWORD, SACHET_SECRET.
OFFICIAL_USER = os.environ.get("SACHET_OFFICIAL_USER", "")
OFFICIAL_PASSWORD = os.environ.get("SACHET_OFFICIAL_PASSWORD", "")
# Signs login tokens. If unset, a random one is used and officials must log in again after a restart.
TOKEN_SECRET = (os.environ.get("SACHET_SECRET") or secrets.token_hex(32)).encode()
TOKEN_HOURS = 12


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _unb64(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def make_token(user: str, now: float | None = None) -> tuple[str, int]:
    expires = int((now or time.time()) + TOKEN_HOURS * 3600)
    payload = _b64(json.dumps({"u": user, "exp": expires}).encode())
    sig = _b64(hmac.new(TOKEN_SECRET, payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{sig}", expires


def read_token(token: str, now: float | None = None) -> str | None:
    """Return the user name for a valid, unexpired token, else None."""
    try:
        payload, sig = token.split(".")
        good = _b64(hmac.new(TOKEN_SECRET, payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, good):
            return None
        data = json.loads(_unb64(payload))
        if data["exp"] < (now or time.time()):
            return None
        return data["u"]
    except Exception:
        return None


def check_login(username: str, password: str) -> bool:
    if not OFFICIAL_USER or not OFFICIAL_PASSWORD:
        return False
    user_ok = hmac.compare_digest(username.encode(), OFFICIAL_USER.encode())
    pass_ok = hmac.compare_digest(password.encode(), OFFICIAL_PASSWORD.encode())
    return user_ok and pass_ok
# ---- end official login helpers ----


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
    allow_headers=["Content-Type", "Authorization"],
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


class Login(BaseModel):
    username: str = Field(max_length=100)
    password: str = Field(max_length=200)


def require_official(authorization: str | None = Header(default=None)) -> str:
    token = authorization[7:] if authorization and authorization.startswith("Bearer ") else ""
    user = read_token(token) if token else None
    if not user:
        raise HTTPException(401, "official login required")
    return user


@app.post("/api/login")
def login(body: Login):
    if not OFFICIAL_USER or not OFFICIAL_PASSWORD:
        raise HTTPException(503, "official login is not configured on the server")
    if not check_login(body.username, body.password):
        time.sleep(0.5)  # slow down password guessing
        raise HTTPException(401, "wrong username or password")
    token, expires = make_token(body.username)
    return {"token": token, "expires_at": expires}


# Citizens: open, anonymous, no login.
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


# Officials only: report details include scammer phone / UPI / link.
@app.get("/api/reports")
def list_reports(limit: int = Query(default=50, ge=0), _official: str = Depends(require_official)):
    with closing(db()) as conn:
        rows = conn.execute(
            """
            SELECT id, scam_type, district, channel, amount_lost, created_at,
                   phone, upi_id, url
            FROM reports ORDER BY created_at DESC, rowid DESC LIMIT ?
            """,
            (limit,),
        ).fetchall()
    # Contract report format: scammer identifiers are included; no victim data is stored.
    return [
        {
            "id": r["id"], "scam_type": r["scam_type"], "district": r["district"],
            "channel": r["channel"], "amount_lost": r["amount_lost"], "created_at": r["created_at"],
            "scammer": {"phone": r["phone"], "upi_id": r["upi_id"], "url": r["url"]},
        }
        for r in rows
    ]


# Public: anonymised counts only.
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
