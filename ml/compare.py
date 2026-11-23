"""Compare the two exports on fixed evaluation sets."""
import argparse
from pathlib import Path

import pandas as pd

from predict import MODEL_PATH, predict
from supplement import load_supplement, message_key
from train import DATA, ML, SPLITS, metrics


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", required=True, type=Path)
    parser.add_argument("--supplement", required=True, type=Path)
    args = parser.parse_args()

    original = pd.read_csv(DATA, keep_default_na=False)
    splits = pd.read_csv(SPLITS).set_index("template_id").split
    everyday = pd.read_csv(ML / "data" / "everyday_train.txt", sep="\t", names=["text"])
    extra = load_supplement(args.supplement, pd.concat([original, everyday]))
    challenge = pd.read_csv(ML / "data" / "everyday_test.tsv", sep="\t")
    seen = pd.concat([original.text, everyday.text, extra.text]).map(message_key)
    if challenge.text.map(message_key).isin(seen).any():
        raise ValueError("An everyday test message overlaps with another dataset")

    sets = {
        "Original test": original[original.template_id.map(splits).eq("test")],
        "ScamShield test": extra[extra.split.eq("test")],
    }
    for name, path in [("Original", args.baseline), ("Updated", MODEL_PATH)]:
        print(f"\n{name}")
        for cohort, data in sets.items():
            labels = [predict(text, model_path=str(path.resolve()))["label"] for text in data.text]
            report = metrics(data.label, labels)
            print(cohort, report)
        labels = [predict(text, model_path=str(path.resolve()))["label"] for text in challenge.text]
        print("Everyday test\n" + pd.crosstab(challenge.kind, labels).to_string())


if __name__ == "__main__":
    main()
