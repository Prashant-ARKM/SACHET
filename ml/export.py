"""Export ml/artifacts/model.joblib -> model.json (contract format, version 1).

Writes ml/model.json and frontend/public/model.json (if frontend/ exists).
Floats are rounded to 7 significant digits; predict.py and score.js both read
this JSON, so parity is defined against the exported numbers.

Usage: python ml/export.py
"""
import hashlib
import json
from pathlib import Path

import joblib
import numpy as np

ML = Path(__file__).resolve().parent
ROOT = ML.parent


def r(x):
    return float(f"{float(x):.7g}")


def main():
    a = joblib.load(ML / "artifacts" / "model.joblib")
    vec, scam, typ = a["vec"], a["scam"], a["type"]
    vocab = {k: int(v) for k, v in sorted(vec.vocabulary_.items(), key=lambda kv: kv[1])}

    model = {
        "version": 1,
        "threshold": a.get("threshold", 0.5),
        "analyzer": "char_wb",
        "ngram_range": [2, 5],
        "lowercase": True,
        "norm": "l2",
        "vocab": vocab,
        "idf": [r(x) for x in vec.idf_],
        # scam.classes_ == [0, 1]; coef_ is oriented toward class 1 == "scam".
        "scam": {"coef": [r(x) for x in scam.coef_[0]], "intercept": r(scam.intercept_[0])},
    }
    if typ is not None:
        coef, icpt = typ.coef_, typ.intercept_
        if coef.shape[0] == 1:  # binary LR: expand to one row per class
            coef = np.vstack([np.zeros_like(coef[0]), coef[0]])
            icpt = np.array([0.0, icpt[0]])
        model["type"] = {"classes": [str(c) for c in typ.classes_],
                         "coef": [[r(x) for x in row] for row in coef],
                         "intercept": [r(x) for x in icpt]}

    blob = json.dumps(model, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    outs = [ML / "model.json"]
    if (ROOT / "frontend").exists():
        (ROOT / "frontend" / "public").mkdir(parents=True, exist_ok=True)
        outs.append(ROOT / "frontend" / "public" / "model.json")
    for p in outs:
        p.write_bytes(blob)
    print(f"wrote {', '.join(map(str, outs))}  size={len(blob)/1e6:.2f} MB  "
          f"sha256={hashlib.sha256(blob).hexdigest()[:12]}  vocab={len(vocab)}  "
          f"type={'yes' if 'type' in model else 'no'}")


if __name__ == "__main__":
    main()
