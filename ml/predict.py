"""Reference inference from model.json. score.js must match this.

predict(text) -> {"label", "score", "scam_type", "highlights"}

Rules (agreed defaults, sync 1):
- Analyzer: sklearn char_wb, lowercase, ngram 2-5 (we call sklearn's own analyzer
  so this file IS the reference).
- x = counts * idf, L2-normalised. score = sigmoid(coef . x + intercept).
- label = "scam" if score >= 0.5 else "genuine".
- scam_type: argmax over classes of (coef_k . x + intercept_k); ties -> first class
  in "classes" order. null for genuine. "other" if the model has no "type".
- highlights: n-grams with contribution x_j*coef_j > 0, top 5 by contribution
  (ties -> n-gram ascending). Words = text collapsed on whitespace, split on
  whitespace. For each top n-gram in rank order, pick the FIRST word whose
  padded lowercase form " word " contains it and whose lowercase form is not
  already picked. Return picked words (original casing) in message order.
  At most 5, may be fewer. Computed for every message, including genuine.

Usage: python ml/predict.py "message text"   |   from predict import predict
"""
import json
import math
import re
import sys
from collections import Counter
from functools import lru_cache
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer

MODEL_PATH = Path(__file__).resolve().parent / "model.json"
THRESHOLD = 0.5
TOP_K = 5
_WS = re.compile(r"\s\s+")


@lru_cache(maxsize=1)
def _load(path=str(MODEL_PATH)):
    m = json.loads(Path(path).read_text(encoding="utf-8"))
    analyzer = TfidfVectorizer(analyzer="char_wb", ngram_range=tuple(m["ngram_range"]),
                               lowercase=m["lowercase"]).build_analyzer()
    return m, analyzer


def _sigmoid(z):
    return 1 / (1 + math.exp(-z)) if z >= 0 else math.exp(z) / (1 + math.exp(z))


def vectorize(text, m, analyzer):
    counts = Counter(g for g in analyzer(text) if g in m["vocab"])
    x = {m["vocab"][g]: c * m["idf"][m["vocab"][g]] for g, c in counts.items()}
    norm = math.sqrt(sum(v * v for v in x.values()))
    if norm > 0:
        x = {j: v / norm for j, v in x.items()}
    return x


def _highlights(text, x, coef, inv_vocab):
    contrib = [(x[j] * coef[j], inv_vocab[j]) for j in x if x[j] * coef[j] > 0]
    contrib.sort(key=lambda t: (-t[0], t[1]))
    top = [g for _, g in contrib[:TOP_K]]
    words = _WS.sub(" ", text).split()
    padded = [f" {w.lower()} " for w in words]
    picked = {}  # word position -> word
    used = set()  # lowercase words already chosen
    for g in top:  # strongest n-gram first
        for i, pw in enumerate(padded):
            if g in pw and pw not in used:
                picked[i] = words[i]
                used.add(pw)
                break
    return [picked[i] for i in sorted(picked)]


@lru_cache(maxsize=1)
def _inv_vocab(path=str(MODEL_PATH)):
    m, _ = _load(path)
    return {i: g for g, i in m["vocab"].items()}


def predict(text: str) -> dict:
    m, analyzer = _load()
    x = vectorize(text or "", m, analyzer)
    coef = m["scam"]["coef"]
    z = sum(v * coef[j] for j, v in x.items()) + m["scam"]["intercept"]
    score = _sigmoid(z)
    label = "scam" if score >= THRESHOLD else "genuine"

    scam_type = None
    if label == "scam":
        t = m.get("type")
        if t is None:
            scam_type = "other"
        else:
            best, best_z = None, -math.inf
            for k, cls in enumerate(t["classes"]):
                zk = sum(v * t["coef"][k][j] for j, v in x.items()) + t["intercept"][k]
                if zk > best_z:  # strict '>' keeps the first class on ties
                    best, best_z = cls, zk
            scam_type = best

    return {"label": label, "score": score, "scam_type": scam_type,
            "highlights": _highlights(text or "", x, coef, _inv_vocab())}


if __name__ == "__main__":
    msgs = sys.argv[1:] or [
        "Dear customer your SBI KYC is pending, account will be blocked today. Update at http://sbi-kyc.in",
        "आपका खाता आज बंद हो जाएगा, तुरंत KYC अपडेट करें: bit.ly/kyc-upd",
        "Main CBI officer bol raha hoon, aapke naam pe parcel mein drugs mile hain, video call pe aao",
        "HDFC Bank: Rs 2,499 debited from a/c XX1234 on 23-11-26. Not you? Call 18002586161",
        "Your OTP for Zepto login is 482913. Do not share it with anyone.",
        "Bhai kal shaam 6 baje milte hain chai pe",
    ]
    for t in msgs:
        print(json.dumps({"text": t[:70], **predict(t)}, ensure_ascii=False))
