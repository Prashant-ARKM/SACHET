# SACHET scam detector retraining

The project ZIP ships the updated model in `frontend/public/model.json` for the citizen app and `ml/model.json` for Python. The browser runs inference locally and precaches the model in the production PWA. The verdict “No strong scam signals” describes the model output and does not verify the sender or links.

## Reproduce the update

Use Python 3.12 and install `ml/requirements.txt`. Save `ml/model.json` from the original SACHET ZIP as `/path/to/original-model.json`. Supply the original attached ScamShield CSV as the supplemental input. The attached `messages(2).csv` has the same records as the existing `ml/data/messages.csv`.

```sh
python -m pip install -r ml/requirements.txt
OPENBLAS_NUM_THREADS=1 python ml/train.py --supplement '/path/to/scamshield_full(2).csv' --baseline /path/to/original-model.json
python ml/export.py
python ml/parity_test.py
python ml/compare.py --supplement '/path/to/scamshield_full(2).csv' --baseline /path/to/original-model.json
```

The binary classifier adds 37,820 distinct supplemental training messages and 46 authored English, Hindi, and Hinglish examples covering jokes, conversations, routine notices, and benign financial language. Supplemental rows labeled “General Spam / Telemarketing” are excluded because that label does not establish fraud. Existing labels and template split assignments are retained. The supplemental loader removes blank and conflicting normalized messages, excludes overlaps with the original dataset, and prefers test and development over training when the same normalized text crosses supplemental splits. Normalization covers Unicode, case, whitespace, and digit runs. It can still miss paraphrases and other near duplicates. The scam-type classifier uses the original typed training data.

The decision threshold of 0.36 was selected on development data. Selection minimizes the mean false-positive rate across both development sets, with scam recall at least 98% on supplemental development data and within two percentage points of the original model on the original development set. The archived test comparisons were rerun after revising this development selection rule.

## Evaluation against the original export

| Evaluation set | False alarms, original → updated | Scams detected, original → updated |
|---|---:|---:|
| Original test (3,586 messages) | 195 → 190 of 1,926 | 1,599 → 1,577 of 1,660 |
| Filtered ScamShield test (4,750 messages) | 142 → 47 of 4,585 | 165 → 164 of 165 |
| Authored everyday check (30 benign examples) | 2 → 2 of 30 | — |

Both models passed 9 of 10 jokes, 10 of 10 casual chats, and 9 of 10 routine messages in the authored check. This small check does not establish a joke-specific improvement. The original test mixes fraud with legacy spam labels. The filtered ScamShield results apply to the dataset subset used here, while the original test shows the tradeoff in recall on legacy messages.

Python and browser model parity passed on 56 samples. The citizen checker flagged all four built-in scam examples and correctly passed its legitimate bank SMS. The frontend production build succeeded.
