"""Train the on-device scam detector and retain the project's template splits.

Pass --supplement and --baseline to train with the ScamShield CSV and select
the decision threshold using development data only.
"""
import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import GroupShuffleSplit

from predict import _load, _sigmoid, vectorize
from supplement import load_supplement, message_key

ML = Path(__file__).resolve().parent
DATA = ML / "data" / "messages.csv"
SPLITS = ML / "data" / "splits.csv"
ARTIFACT = ML / "artifacts" / "model.joblib"
SEED = 42
DEFAULT_THRESHOLD = 0.5


def make_vectorizer():
    return TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), lowercase=True,
                           max_features=20000, sublinear_tf=False, norm="l2")


def assign_splits(df):
    """Keep existing group assignments and put newly added groups in train."""
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


def fit(train, supplemental=None):
    vec = make_vectorizer()
    binary_train = train if supplemental is None else pd.concat([train, supplemental], ignore_index=True)
    X = vec.fit_transform(binary_train.text)
    y = binary_train.label.eq("scam").astype(int)
    scam_clf = LogisticRegression(C=4.0, max_iter=1000, random_state=SEED)
    weights = np.ones(len(binary_train))
    if supplemental is not None:
        weights[len(train):] = supplemental.weight.to_numpy()
    scam_clf.fit(X, y, sample_weight=weights)

    scams = train.label.eq("scam")
    type_clf = None
    if train.loc[scams, "scam_type"].nunique() >= 2:
        type_clf = LogisticRegression(C=4.0, class_weight="balanced", max_iter=1000, random_state=SEED)
        type_clf.fit(X[:len(train)][scams.to_numpy()], train.loc[scams, "scam_type"])
    return vec, scam_clf, type_clf


def baseline_predictions(model, dev):
    old, analyzer = _load(str(model.resolve()))
    baseline = [
        _sigmoid(sum(value * old["scam"]["coef"][index]
                     for index, value in vectorize(text, old, analyzer).items())
                 + old["scam"]["intercept"])
        for text in dev.text
    ]
    return np.asarray(baseline) >= old.get("threshold", DEFAULT_THRESHOLD)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--supplement", type=Path, help="ScamShield CSV with supplied splits")
    parser.add_argument("--baseline", type=Path, help="Original exported model for dev recall comparison")
    args = parser.parse_args()
    if bool(args.supplement) != bool(args.baseline):
        parser.error("--supplement and --baseline must be supplied together")

    df = pd.read_csv(DATA, keep_default_na=False)
    df["split"] = assign_splits(df)
    check_no_overlap(df)
    train, dev = df[df.split == "train"], df[df.split == "dev"]
    holdout_keys = set(df.loc[df.split.ne("train"), "text"].map(message_key))
    train = train[~train.text.map(message_key).isin(holdout_keys)]
    everyday = pd.read_csv(ML / "data" / "everyday_train.txt", sep="\t", names=["text"])
    everyday = everyday[~everyday.text.map(message_key).isin(set(df.text.map(message_key)))]
    everyday = everyday.assign(label="genuine", weight=5.0)
    card_alerts = pd.read_csv(ML / "data" / "card_alert_train.tsv", sep="\t")
    card_alerts = card_alerts[~card_alerts.text.map(message_key).isin(holdout_keys)]
    authored = pd.concat([everyday, card_alerts.assign(weight=25.0)], ignore_index=True)
    extra = authored
    if args.supplement:
        supplement = load_supplement(args.supplement, pd.concat([df, authored]))
        extra = pd.concat([supplement[supplement.split == "train"].assign(weight=0.65), authored])
        print("Supplement counts:", supplement.groupby(["split", "label"]).size().to_dict())
    vec, scam_clf, type_clf = fit(train, extra)

    probabilities = scam_clf.predict_proba(vec.transform(dev.text))[:, 1]
    threshold = DEFAULT_THRESHOLD
    if args.baseline:
        baseline = baseline_predictions(args.baseline, dev)
        scams = dev.label.eq("scam").to_numpy()
        recall_target = baseline[scams].mean() - 0.02
        extra_dev = supplement[supplement.split == "dev"]
        extra_scores = scam_clf.predict_proba(vec.transform(extra_dev.text))[:, 1]
        extra_scams = extra_dev.label.eq("scam").to_numpy()
        candidates = []
        for cutoff in np.linspace(0.05, 0.95, 91).round(2):
            predicted = probabilities >= cutoff
            recall = predicted[scams].mean()
            extra_prediction = extra_scores >= cutoff
            extra_recall = extra_prediction[extra_scams].mean()
            if recall >= recall_target and extra_recall >= 0.98:
                false_alarm = (predicted[~scams].mean() + extra_prediction[~extra_scams].mean()) / 2
                candidates.append((false_alarm, -recall, float(cutoff)))
        if not candidates:
            raise RuntimeError("No candidate threshold met both dev recall targets")
        threshold = min(candidates)[2]

    pred = np.where(probabilities >= threshold, "scam", "genuine")
    m = metrics(dev.label.values, pred)
    m["threshold"] = threshold
    m["by_language"] = {lang: metrics(group.label, pred[dev.language.eq(lang)])["accuracy"]
                        for lang, group in dev.groupby("language")}
    if type_clf is not None:
        scams = dev[dev.label == "scam"]
        types = type_clf.predict(vec.transform(scams.text))
        m["type_accuracy_on_dev_scams"] = round(float((types == scams.scam_type).mean()), 4)
    print("DEV metrics:", json.dumps(m, indent=2))

    ARTIFACT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"vec": vec, "scam": scam_clf, "type": type_clf, "threshold": threshold}, ARTIFACT)
    (ML / "artifacts" / "dev_metrics.json").write_text(json.dumps(m, indent=2))
    print(f"saved {ARTIFACT}")


if __name__ == "__main__":
    main()
