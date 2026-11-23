import base64
import binascii
import hmac
import json
import os
import sqlite3
import uuid
from contextlib import closing, asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
from fastapi import FastAPI, Header, HTTPException, Query
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
    allow_headers=["Content-Type", "Authorization"],
)


class AlertSignRequest(BaseModel):
    payload: str = Field(min_length=1, max_length=8192, pattern=r"^[A-Za-z0-9_-]+$")


def unpack_alert(packed: bytes) -> str:
    chars = []
    i = 0
    while i < len(packed):
        byte = packed[i]
        i += 1
        if byte == 1:
            escaped = packed[i:i + 3]
            if len(escaped) != 3:
                raise ValueError("truncated character")
            chars.append(chr(int.from_bytes(escaped, "big")))
            i += 3
        else:
            chars.append(chr(byte if byte < 128 else 0x900 + byte - 128))
    return "".join(chars)


@app.post("/api/alerts/sign")
def sign_alert(body: AlertSignRequest, authorization: str = Header(default="")):
    token = os.environ.get("ALERT_SIGNING_TOKEN")
    pem = os.environ.get("ALERT_PRIVATE_KEY")
    if not token or not pem:
        raise HTTPException(503, "Alert signing is unavailable")
    if not hmac.compare_digest(authorization.encode(), f"Bearer {token}".encode()):
        raise HTTPException(401, "Alert signing requires authorization")

    payload = body.payload
    try:
        packed = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
        data = json.loads(unpack_alert(packed))
    except (ValueError, binascii.Error, RecursionError):
        raise HTTPException(400, "Invalid alert payload") from None
    if (
        not isinstance(data, dict) or type(data.get("v")) is not int or data["v"] != 1
        or any(not isinstance(data.get(field), str) or not data[field] for field in ("d", "t"))
    ):
        raise HTTPException(400, "Invalid alert payload")

    try:
        key = serialization.load_pem_private_key(pem.encode(), password=None)
    except (ValueError, TypeError):
        raise HTTPException(503, "Alert signing key is invalid") from None
    if not isinstance(key, ec.EllipticCurvePrivateKey) or not isinstance(key.curve, ec.SECP256R1):
        raise HTTPException(503, "Alert signing key must use P-256")
    der = key.sign(payload.encode(), ec.ECDSA(hashes.SHA256()))
    r, s = decode_dss_signature(der)
    raw = r.to_bytes(32, "big") + s.to_bytes(32, "big")
    return {"signature": base64.urlsafe_b64encode(raw).rstrip(b"=").decode()}


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
