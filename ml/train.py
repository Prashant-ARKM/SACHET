"""Train the SACHET scam detector.

- Splits by template_id (GroupShuffleSplit): 20% of groups -> locked held-out
  test, then 15% of the remaining groups -> dev. Assignment saved to
  ml/data/splits.csv so every later run uses the same held-out groups.
- Fits vectorizer + binary model (+ scam-type model on scam rows) on TRAIN only.
- Reports dev metrics. Held-out test is only scored by evaluate.py (final v2).

Usage: python ml/train.py
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import GroupShuffleSplit

ML = Path(__file__).resolve().parent
DATA = ML / "data" / "messages.csv"
SPLITS = ML / "data" / "splits.csv"
ARTIFACT = ML / "artifacts" / "model.joblib"
SEED = 42
THRESHOLD = 0.5  # fixed by contract; not tuned


def make_vectorizer():
    return TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), lowercase=True,
                           max_features=20000, sublinear_tf=False, norm="l2")


def assign_splits(df):
    """Group-level split. Existing groups keep their split; new groups go to train
    unless they are new (so the held-out test never changes once created)."""
    if SPLITS.exists():
        known = pd.read_csv(SPLITS).set_index("template_id").split.to_dict()
        new = sorted(set(df.template_id) - set(known))
        if new:
            print(f"note: {len(new)} new template groups -> train")
            known.update({g: "train" for g in new})
        return df.template_id.map(known)

    groups = df.template_id.values
    idx = np.arange(len(df))
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED)
    rest, test = next(gss.split(idx, groups=groups))
    gss2 = GroupShuffleSplit(n_splits=1, test_size=0.15, random_state=SEED)
    tr, dev = next(gss2.split(rest, groups=groups[rest]))
    split = np.empty(len(df), dtype=object)
    split[test], split[rest[tr]], split[rest[dev]] = "test", "train", "dev"
    s = pd.Series(split, index=df.index)
    pd.DataFrame({"template_id": df.template_id, "split": s}).drop_duplicates("template_id") \
        .to_csv(SPLITS, index=False)
    return s


def check_no_overlap(df):
    g = df.groupby("split").template_id.apply(set)
    for a, b in [("train", "dev"), ("train", "test"), ("dev", "test")]:
        assert not (g[a] & g[b]), f"group overlap between {a} and {b}"


def metrics(y_true, y_pred):
    p, r, f, _ = precision_recall_fscore_support(y_true, y_pred, pos_label="scam", average="binary")
    cm = confusion_matrix(y_true, y_pred, labels=["genuine", "scam"])
    return {"n": int(len(y_true)), "accuracy": round(accuracy_score(y_true, y_pred), 4),
            "scam_precision": round(p, 4), "scam_recall": round(r, 4), "scam_f1": round(f, 4),
            "confusion_matrix_labels": ["genuine", "scam"], "confusion_matrix": cm.tolist()}


def fit(train):
    vec = make_vectorizer()
    X = vec.fit_transform(train.text)
    y = (train.label == "scam").astype(int).values
    scam_clf = LogisticRegression(C=4.0, class_weight="balanced", max_iter=2000, random_state=SEED)
    scam_clf.fit(X, y)

    s = train.label == "scam"
    type_clf = None
    if train[s].scam_type.nunique() >= 2:
        type_clf = LogisticRegression(C=4.0, class_weight="balanced", max_iter=2000, random_state=SEED)
        type_clf.fit(X[s.values], train[s].scam_type.values)
    return vec, scam_clf, type_clf


def main():
    df = pd.read_csv(DATA, keep_default_na=False)
    df["split"] = assign_splits(df)
    check_no_overlap(df)
    print(pd.crosstab([df.split, df.language], df.label).to_string())
    print("groups per split:", df.groupby("split").template_id.nunique().to_dict())

    train, dev = df[df.split == "train"], df[df.split == "dev"]
    vec, scam_clf, type_clf = fit(train)

    p = scam_clf.predict_proba(vec.transform(dev.text))[:, 1]
    pred = np.where(p >= THRESHOLD, "scam", "genuine")
    m = metrics(dev.label.values, pred)
    m["by_language"] = {lang: metrics(dev.label.values[dev.language.values == lang],
                                      pred[dev.language.values == lang])["accuracy"]
                        for lang in sorted(dev.language.unique())}
    if type_clf is not None:
        ds = dev.label == "scam"
        tp = type_clf.predict(vec.transform(dev[ds].text))
        m["type_accuracy_on_dev_scams"] = round(float((tp == dev[ds].scam_type.values).mean()), 4)
    print("DEV metrics:", json.dumps(m, indent=2))

    ARTIFACT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"vec": vec, "scam": scam_clf, "type": type_clf}, ARTIFACT)
    (ML / "artifacts" / "dev_metrics.json").write_text(json.dumps(m, indent=2))
    print(f"saved {ARTIFACT}")


if __name__ == "__main__":
    main()
