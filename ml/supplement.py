"""Prepare supplemental data without changing the original template split."""
import re
import unicodedata

import pandas as pd


def message_key(text):
    normalized = unicodedata.normalize("NFKC", text).casefold()
    return " ".join(re.sub(r"\d+", "#", normalized).split())


def load_supplement(path, original):
    data = pd.read_csv(path, encoding="utf-8-sig", keep_default_na=False)
    data = data[
        data.is_scam.isin([0, 1])
        & data.split.isin(["train", "val", "test"])
        & data.head2_scam_intent.ne("General Spam / Telemarketing")
    ].copy()
    data["label"] = data.is_scam.map({0: "genuine", 1: "scam"})
    data["split"] = data.split.replace({"val": "dev"})
    data["key"] = data.text.map(message_key)
    data = data[data.key.ne("") & ~data.key.isin(original.text.map(message_key))]
    consistent = data.groupby("key").label.transform("nunique").eq(1)
    # Keep the latest holdout assignment if a duplicate crosses input splits.
    priority = data.split.map({"test": 0, "dev": 1, "train": 2})
    return data[consistent].assign(priority=priority).sort_values(
        "priority", kind="stable"
    ).drop_duplicates("key").drop(columns=["priority"])
