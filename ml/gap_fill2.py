"""Round 2 gap-fill: genuine English bank/UPI/ATM alerts in the INR / SMS-BLOCK style
(the SBI-style alert that v1.5 scored ~56% scam). New template groups -> train only,
so the locked held-out test is untouched.

Usage: python ml/gap_fill2.py   (appends to ml/data/messages.csv; refuses to run twice)
"""
import csv, hashlib, random
from pathlib import Path

DATA = Path(__file__).resolve().parent / "data" / "messages.csv"
random.seed(11)
BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Bank of Baroda", "PNB", "Canara Bank", "Union Bank"]
MERCH = ["AMAZON", "SWIGGY", "ZOMATO", "FLIPKART", "IRCTC", "BIGBASKET", "UBER", "JIO"]


def tid(s):
    return "gapB" + hashlib.md5(s.encode()).hexdigest()[:8]


def d():
    return f"{random.randint(1,28):02d}{random.choice(['Nov','Oct','Dec'])}{random.choice([25,26])}"


def acct():
    return random.randint(1000, 9999)


def amt():
    return f"{random.choice([100,250,500,750,1200,2000,3500,10000])}.00"


def bal():
    return f"{random.randint(1500,95000):,}.{random.randint(0,99):02d}"


def rows():
    out = []
    T = [
        ("inr_debit", lambda b: f"{b}: INR {amt()} debited from A/c XX{acct()} on {d()}. Info: UPI/{random.randint(10**11,10**12-1)}. Bal INR {bal()}. If not done by you, SMS BLOCK {acct()} to 9223966666."),
        ("inr_credit", lambda b: f"{b}: INR {amt()} credited to A/c XX{acct()} on {d()} by transfer. Avl Bal INR {bal()}."),
        ("atm", lambda b: f"{b}: Rs {amt()} withdrawn at ATM on {d()} from A/c XX{acct()}. Avl Bal Rs {bal()}. Not you? Call 1800 1234 immediately."),
        ("sms_block", lambda b: f"Dear Customer, A/c XX{acct()} debited by Rs. {amt()} on {d()} trf to {random.choice(MERCH)}. Not you? SMS BLOCK to 567676. -{b}"),
        ("upi_dr", lambda b: f"Rs.{amt()} debited from A/c *{acct()} on {d()} and credited to {random.choice(MERCH).title()} via UPI Ref {random.randint(10**11,10**12-1)}. -{b}"),
        ("emi", lambda b: f"{b}: EMI of INR {amt()} for loan A/c XX{acct()} has been auto-debited on {d()}. Thank you for banking with us."),
        ("neft", lambda b: f"{b}: Your NEFT of INR {amt()} to beneficiary ending {acct()} was processed on {d()}. UTR {random.randint(10**9,10**10-1)}."),
        ("minstmt", lambda b: f"{b}: Your a/c XX{acct()} balance as on {d()} is INR {bal()}. Download the official app for statements."),
    ]
    for name, f in T:
        t = tid(name)
        for b in BANKS:
            out.append((f(b), "genuine", "en", "", t))
    return out


def main():
    if "gapB" in DATA.read_text(encoding="utf-8"):
        print("already applied - not appending again"); return
    r = rows()
    with DATA.open("a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        for x in r: w.writerow(x)
    print(f"appended {len(r)} rows, {len({x[4] for x in r})} new groups")


if __name__ == "__main__":
    main()
