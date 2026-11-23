# Signed QR alerts: what the backend needs (for Prashant / Piyush)

The frontend already works without this: it signs with a **demo key** and every screen says "Demo signature".
These steps switch it to the **official key**, so citizens see "✓ Genuine SACHET alert".

## 1. Make a key pair once (on your own laptop)

```bash
pip install cryptography
python - <<'PY'
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
k = ec.generate_private_key(ec.SECP256R1())
pem = k.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption())
pub = k.public_key().public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
print("PRIVATE (server env ALERT_PRIVATE_KEY):\n" + pem.decode())
print("PUBLIC (frontend env VITE_ALERT_PUBLIC_KEY):", base64.urlsafe_b64encode(pub).rstrip(b"=").decode())
PY
```

- `ALERT_PRIVATE_KEY` goes **only** in the Render/server environment. Never commit it, never put it in Vercel.
- `VITE_ALERT_PUBLIC_KEY` goes in the Vercel frontend environment (a public key is safe to be public).

## 2. Endpoint

`POST /api/alerts/sign`  body `{ "payload": "<base64url string>" }` → `{ "signature": "<base64url>" }`

The signature is ECDSA P-256 / SHA-256 over the **payload string's bytes** (the base64url text itself, not the decoded JSON),
returned as raw `r||s` (64 bytes), base64url without `=`. Python gives DER, so convert:

```python
import base64, json, os
from fastapi import HTTPException
from pydantic import BaseModel
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature

_KEY = serialization.load_pem_private_key(os.environ["ALERT_PRIVATE_KEY"].encode(), password=None) \
    if os.environ.get("ALERT_PRIVATE_KEY") else None

class SignIn(BaseModel):
    payload: str

def _b64u_decode(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))

def _unpack(b: bytes) -> str:
    # Frontend packing: ASCII as is, 0x80-0xFF = Devanagari U+0900+(b-0x80), 0x01 + 3 bytes = any other char
    out, i = [], 0
    while i < len(b):
        if b[i] == 1:
            out.append(chr(int.from_bytes(b[i + 1:i + 4], "big"))); i += 4
        else:
            out.append(chr(b[i]) if b[i] < 0x80 else chr(0x900 + b[i] - 0x80)); i += 1
    return "".join(out)

@app.post("/api/alerts/sign")
def sign_alert(body: SignIn):
    if _KEY is None:
        raise HTTPException(503, "signing key not configured")
    data = json.loads(_unpack(_b64u_decode(body.payload)))  # check it is a SACHET alert
    if data.get("v") != 1 or not data.get("d") or not data.get("t"):
        raise HTTPException(400, "bad payload")
    der = _KEY.sign(body.payload.encode(), ec.ECDSA(hashes.SHA256()))
    r, s = decode_dss_signature(der)
    raw = r.to_bytes(32, "big") + s.to_bytes(32, "big")
    return {"signature": base64.urlsafe_b64encode(raw).rstrip(b"=").decode()}
```

Add `cryptography>=42` to `server/requirements.txt`.

Before a real launch, put this endpoint behind official login: right now anyone who can reach the server could ask it to sign.

## Payload (for reference)

`{"v":1,"d":"raipur","t":"otp","i":"2026-11-23","x":"2026-12-23","n":"a1b2c3d4","m":"…","k":["…"],"b":["p|9876543210|5"]}`
d = district id (`shared/districts.js`), t = scam type id, i = issued, x = expires, n = random,
m = short quote of the real scam message, k = up to 5 words our ML model picked from it,
b = up to 6 reported scammer IDs the official approved, as "p|9876543210|5" (p phone, u UPI, l link; last part = report count). All optional.
