"""Final evaluation of the SHIPPED model (ml/model.json) via predict.py.

  python ml/evaluate.py --split dev            # dry run on the dev split (safe, any time)
  python ml/evaluate.py --split test --final   # held-out test. Run ONCE, after the model is frozen.

The test run writes ml/results.md. Nothing here trains or tunes anything.
"""
import argparse, hashlib, json, sys
from collections import Counter
from pathlib import Path

import pandas as pd
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support

ML = Path(__file__).resolve().parent
sys.path.insert(0, str(ML))
from predict import predict  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--split", choices=["dev", "test"], default="dev")
ap.add_argument("--final", action="store_true", help="required for the held-out test split")
args = ap.parse_args()
if args.split == "test" and not args.final:
    sys.exit("Refusing to touch the held-out test split without --final (run it once, after the freeze).")

df = pd.read_csv(ML / "data" / "messages.csv", keep_default_na=False)
sp = pd.read_csv(ML / "data" / "splits.csv").set_index("template_id").split.to_dict()
df["split"] = df.template_id.map(sp).fillna("train")      # groups added later went to train
ev = df[df.split == args.split].reset_index(drop=True)

preds = [predict(t) for t in ev.text]
ev["pred"] = [p["label"] for p in preds]
ev["score"] = [p["score"] for p in preds]
ev["pred_type"] = [p["scam_type"] for p in preds]

y, yp = ev.label.values, ev.pred.values
p, r, f, _ = precision_recall_fscore_support(y, yp, pos_label="scam", average="binary")
cm = confusion_matrix(y, yp, labels=["genuine", "scam"])
acc = accuracy_score(y, yp)
by_lang = {l: (round(accuracy_score(g.label, g.pred), 4), len(g)) for l, g in ev.groupby("language")}
sc = ev[(ev.label == "scam") & (ev.pred == "scam")]
type_acc = float((sc.pred_type == sc.scam_type).mean()) if len(sc) else float("nan")
sha = hashlib.sha256((ML / "model.json").read_bytes()).hexdigest()[:12]

print(f"split={args.split} n={len(ev)} groups={ev.template_id.nunique()} model={sha}")
print(f"accuracy={acc:.4f} scam_precision={p:.4f} scam_recall={r:.4f} f1={f:.4f}")
print("confusion [genuine, scam] x [pred genuine, pred scam]:", cm.tolist())
print("by language:", by_lang)
print(f"scam-type accuracy on correctly flagged scams: {type_acc:.4f} (n={len(sc)})")
if args.split != "test":
    print("(dry run: results.md not written)"); sys.exit(0)

lang_label = pd.crosstab(df.language, df.label)
split_tbl = pd.crosstab(df.split, df.label)
groups = df.groupby("split").template_id.nunique()
synthetic_rows = int(df.template_id.str.startswith("gap").sum())
fp = ev[(ev.label == "genuine") & (ev.pred == "scam")].sort_values("score", ascending=False).head(8)
fn = ev[(ev.label == "scam") & (ev.pred == "genuine")].sort_values("score").head(8)
cut = lambda t: t.replace("\n", " ")[:140] + ("…" if len(t) > 140 else "")

L = []
L += [f"# SACHET model v2: held-out evaluation", "",
      f"- **Model:** `ml/model.json`, sha256 `{sha}…` (TF-IDF char n-grams 2–5 + logistic regression, threshold 0.5, not tuned)",
      "- **Evaluated once** on the locked held-out test split, after the model was frozen. Nothing was trained or tuned on it.", ""]
L += ["## Headline (held-out test)", "", "| Metric | Value |", "|---|---|",
      f"| Test messages | {len(ev)} ({ev.template_id.nunique()} template groups) |",
      f"| Accuracy | {acc:.1%} |", f"| Scam precision | {p:.1%} |", f"| Scam recall | {r:.1%} |", f"| Scam F1 | {f:.3f} |", ""]
L += ["## Confusion matrix", "", "Rows = actual, columns = predicted. Label order: genuine, scam.", "",
      "| | pred genuine | pred scam |", "|---|---|---|",
      f"| **actual genuine** | {cm[0][0]} | {cm[0][1]} (false alarms) |",
      f"| **actual scam** | {cm[1][0]} (missed scams) | {cm[1][1]} |", ""]
L += ["## Accuracy by language (held-out test)", "", "| Language | Accuracy | n |", "|---|---|---|"]
L += [f"| {l} | {a:.1%} | {n} |" for l, (a, n) in by_lang.items()]
L += ["", f"Scam-type accuracy on correctly flagged scams: {type_acc:.1%} (n={len(sc)}). The `other` class is large, so this overstates real type-detection skill.", ""]
L += ["## Dataset", "", f"Total rows: {len(df)}", "", "| Language | genuine | scam |", "|---|---|---|"]
L += [f"| {l} | {row.get('genuine',0)} | {row.get('scam',0)} |" for l, row in lang_label.iterrows()]
L += ["", "| Split | genuine | scam | template groups |", "|---|---|---|---|"]
L += [f"| {s} | {row.get('genuine',0)} | {row.get('scam',0)} | {groups[s]} |" for s, row in split_tbl.iterrows()]
L += ["", "**Split method:** `GroupShuffleSplit` by `template_id` (20% of groups held out as test, then 15% of the rest as dev, seed 42). All variants/near-duplicates of a template share one `template_id`, so no group appears in two splits (asserted in `train.py`). Groups added after the first split were assigned to train only.", ""]
L += ["## Disclosures", "",
      "- Data comes from public SMS/spam datasets (English), Hindi/Hinglish scam and genuine sets, a few real contributed messages, and templated synthetic rows.",
      f"- **{synthetic_rows} rows are synthetic gap-fill** (mule recruitment, digital arrest variants, bank alerts, adult/Telegram bait, in-person notices). They were added to train only.",
      "- Gap-fill templates were written after finding failures in dev checks and in the live app (e.g. SBI-style debit alerts, Telegram adult spam). That means the **dev** score is optimistic. The held-out test was never used for those decisions.",
      "- Held-out messages are drawn from the same sources as training, so real-world accuracy on unseen scam styles will be lower than the numbers above.",
      "- The citizen-app demo and the officials-dashboard reports use simulated data: demo reports are scored by this model, but district, channel, amounts and scammer identifiers are synthetic.", ""]
L += ["## Representative errors (held-out test)", "", "**False alarms (genuine flagged as scam):**", ""]
L += [f"- ({r_.score:.2f}, {r_.language}) {cut(r_.text)}" for r_ in fp.itertuples()]
L += ["", "**Missed scams (scam passed as genuine):**", ""]
L += [f"- ({r_.score:.2f}, {r_.language}) {cut(r_.text)}" for r_ in fn.itertuples()]
(ML / "results.md").write_text("\n".join(L) + "\n", encoding="utf-8")
print("wrote ml/results.md")
