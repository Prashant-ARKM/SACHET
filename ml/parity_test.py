"""Parity test: Python predict() vs frontend/src/ml/score.js on ml/parity_samples.txt.
One sample per line; the line <EMPTY> means the empty string.
Usage (from repo root):  python ml/parity_test.py
Needs: python with scikit-learn, and node on PATH.
"""
import json, subprocess, sys, tempfile
from pathlib import Path

ML = Path(__file__).resolve().parent
ROOT = ML.parent
sys.path.insert(0, str(ML))
from predict import predict  # noqa: E402

lines = (ML / "parity_samples.txt").read_text(encoding="utf-8").split("\n")
if lines and lines[-1] == "":
    lines.pop()
samples = ["" if l.strip() == "<EMPTY>" else l.rstrip("\r") for l in lines]
expected = [{"text": t, **predict(t)} for t in samples]
print(f"{len(samples)} samples scored by Python")

# the app and the python model must be the same file
a, b = (ML / "model.json").read_bytes(), (ROOT / "frontend" / "public" / "model.json").read_bytes()
if a != b:
    print("FAIL: ml/model.json and frontend/public/model.json are different files"); sys.exit(1)

with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
    json.dump(expected, f, ensure_ascii=False)
    tmp = f.name
sys.exit(subprocess.call(["node", str(ML / "parity_check.mjs"), tmp, str(ROOT)]))
