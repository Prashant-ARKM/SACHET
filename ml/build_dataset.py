"""Build ml/data/messages.csv (contract: text,label,language,scam_type,template_id)
from the two source CSVs. Deterministic (fixed seed).

Usage: python ml/build_dataset.py SCAMSHIELD_FULL.csv SCAM_MESSAGES.csv
"""
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.sparse.csgraph import connected_components
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

SEED = 42
OUT = Path(__file__).resolve().parent / "data" / "messages.csv"

LANG = {"English": "en", "Hindi": "hi", "Hinglish": "hinglish"}

TYPE_MAP = {
    "OTP / Credential Theft": "otp", "fake_bank_otp": "otp",
    "Fake KYC": "kyc", "fake_kyc": "kyc", "Bank Account Freeze": "kyc",
    "Loan Scam": "loan_app", "loan_offer": "loan_app",
    "Lottery / Prize": "fake_scheme", "lottery": "fake_scheme",
}
DIGITAL_ARREST = re.compile(
    r"\b(cbi|police|arrest(ed)?|narcotics|warrant|cyber cell|crime branch|enforcement directorate)\b"
    r"|गिरफ्तार|पुलिस|सीबीआई|वारंट",
    re.I,
)

# Caps per English scam category (keeps one category from dominating).
EN_CAT_CAP = 700
GENERAL_SPAM_CAP = 1500
EN_CASUAL_GENUINE = 3000   # Smishing/UCI personal chat
HI_CASUAL_GENUINE = 1500   # Kaggle Hindi chat


def scam_type(row):
    if DIGITAL_ARREST.search(row.text):
        return "digital_arrest"
    return TYPE_MAP.get(row.cat, "other")


def mask(t: str) -> str:
    t = t.lower()
    t = re.sub(r"https?://\S+|www\.\S+|\S+\.(in|com|xyz|top|info|link|ly)\S*", " URL ", t)
    t = re.sub(r"\S+@\S+", " UPI ", t)
    t = re.sub(r"(rs\.?|inr|₹)\s*[\d,]+(\.\d+)?", " AMT ", t)
    t = re.sub(r"[x*]{2,}\d+", " ACCT ", t)
    t = re.sub(r"[\d०-९]+", "0", t)
    t = re.sub(r"[^\w\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def template_ids(texts, threshold=0.75):
    """Group near-duplicate messages: word TF-IDF on masked text,
    link pairs with cosine >= threshold, take connected components."""
    masked = [mask(t) for t in texts]
    X = TfidfVectorizer(analyzer="word", ngram_range=(1, 2), min_df=1).fit_transform(masked)
    nn = NearestNeighbors(radius=1 - threshold, metric="cosine", algorithm="brute", n_jobs=-1)
    nn.fit(X)
    graph = nn.radius_neighbors_graph(X, mode="connectivity")
    n, labels = connected_components(graph, directed=False)
    return [f"t{l:05d}" for l in labels], n


def main(full_path, scam_path):
    full = pd.read_csv(full_path).dropna(subset=["text"])
    full = full.rename(columns={"head2_scam_intent": "cat"})
    full["label"] = np.where(full.is_scam == 1, "scam", "genuine")

    extra = pd.read_csv(scam_path).dropna(subset=["text"])
    extra = extra[~extra.text.isin(full.text)].rename(columns={"scam_category": "cat"})
    extra["source_dataset"] = extra.get("source_dataset", "scam_messages")

    df = pd.concat([full[["text", "label", "language", "cat", "source_dataset"]],
                    extra[["text", "label", "language", "cat", "source_dataset"]]],
                   ignore_index=True)
    df = df[df.language.isin(LANG)].copy()
    df["language"] = df.language.map(LANG)
    df["text"] = df.text.astype(str).str.strip()
    df = df[df.text.str.len() >= 8]

    # Drop exact duplicates; drop texts that appear with both labels.
    conflict = df.groupby("text").label.nunique()
    df = df[~df.text.isin(conflict[conflict > 1].index)].drop_duplicates("text")

    rng = np.random.RandomState(SEED)
    parts = []
    scam = df[df.label == "scam"]
    gen = df[df.label == "genuine"]

    # Scams: all Hindi/Hinglish; English capped per category.
    parts.append(scam[scam.language != "en"])
    en = scam[scam.language == "en"]
    for cat, sub in en.groupby("cat"):
        if cat == "General Spam / Telemarketing":
            phishy = sub[sub.text.str.contains(r"http|www\.|\.in\b|\.com\b|click|verify|login|blocked|suspend",
                                               case=False, regex=True)]
            parts.append(phishy.sample(min(GENERAL_SPAM_CAP, len(phishy)), random_state=rng))
        else:
            parts.append(sub.sample(min(EN_CAT_CAP, len(sub)), random_state=rng))

    # Genuine: all hard/Indian sources; casual chat sampled.
    hard_sources = ["Synthetic_Tier_C", "Indian_Telecom_SMS", "ysangam/Indian_Cyber_Scam_Hinglish",
                    "Benchmark_Ground_Truth"]
    parts.append(gen[gen.source_dataset.isin(hard_sources)])
    casual_en = gen[gen.source_dataset.isin(["Smishing_Dataset", "UCI_SMS_Spam"])]
    parts.append(casual_en.sample(min(EN_CASUAL_GENUINE, len(casual_en)), random_state=rng))
    casual_hi = gen[gen.source_dataset == "Kaggle_Hindi_Merged"]
    parts.append(casual_hi.sample(min(HI_CASUAL_GENUINE, len(casual_hi)), random_state=rng))

    out = pd.concat(parts, ignore_index=True)
    out["scam_type"] = [scam_type(r) if r.label == "scam" else "" for r in out.itertuples()]
    out["template_id"], n_groups = template_ids(out.text.tolist())
    out = out.sample(frac=1, random_state=SEED).reset_index(drop=True)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    out[["text", "label", "language", "scam_type", "template_id", "source_dataset"]].to_csv(
        OUT.with_name("messages_with_source.csv"), index=False)
    out[["text", "label", "language", "scam_type", "template_id"]].to_csv(OUT, index=False)

    print(f"rows={len(out)} template_groups={n_groups}")
    print(pd.crosstab(out.language, out.label, margins=True).to_string())
    print(out[out.label == "scam"].scam_type.value_counts().to_string())
    sizes = out.template_id.value_counts()
    print("largest groups:", sizes.head(5).to_dict())


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
