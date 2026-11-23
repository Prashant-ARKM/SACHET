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

## 2. Enable official signing

- Set an independently generated random `ALERT_SIGNING_TOKEN` in Render. For example, generate one locally with `python -c "import secrets; print(secrets.token_urlsafe(32))"`.
- Share the token privately with authorized campaign operators. In the Campaign kit, enter it under **Official signing token** and select **Apply token**. It stays in memory for the current page.
- Deploy the backend and frontend with their respective environment variables. Publish only after the Campaign kit shows the official signature and a citizen device verifies the QR.
- `POST /api/alerts/sign` accepts a bearer token and a JSON body with a base64url `payload` field. It signs the encoded text with ECDSA P-256/SHA-256 and returns a base64url raw 64-byte signature.
- Rotate the shared token when access changes. Use individual operator accounts for a production multi-operator deployment.

## 3. Seed campaign reports

Run `python server/seed_from_model.py` against a demo database. To include phones, pass `--demo-phones NUMBER NUMBER NUMBER` with three controlled test numbers approved for public posters. The seed reuses district-specific demo UPI IDs and reserved example links.

## Payload (for reference)

`{"v":1,"d":"raipur","t":"otp","i":"2026-11-23","x":"2026-12-23","n":"a1b2c3d4","m":"…","k":["…"],"b":["p|9876543210|5"]}`
d = district id (`shared/districts.js`), t = scam type id, i = issued, x = expires, n = random,
m = short quote of the real scam message, k = up to 5 words our ML model picked from it,
b = up to 6 reported scammer IDs the official approved, as "p|9876543210|5" (p phone, u UPI, l link; last part = report count). All optional.
