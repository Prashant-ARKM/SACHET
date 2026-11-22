"""Templated synthetic rows to cover gaps the real/scraped data has none of:
  - mule_recruitment (0 rows currently) - Chhattisgarh-named per the plan
  - digital_arrest - more Hindi/Hinglish variety
  - hard genuine English bank-debit alerts (closes the "0.51 borderline" gap)
Each template produces several variants (bank/amount/name swapped) sharing one
template_id, so the group-split still treats them as one group.

Usage: python ml/gap_fill.py   (appends to ml/data/messages.csv)
"""
import csv
import hashlib
import random
from pathlib import Path

DATA = Path(__file__).resolve().parent / "data" / "messages.csv"
SEED = 7
random.seed(SEED)

BANKS = ["HDFC Bank", "SBI", "ICICI Bank", "Axis Bank", "Bank of Baroda", "Punjab National Bank",
         "Union Bank of India", "Canara Bank"]
APPS = ["PhonePe", "Google Pay", "Paytm", "Amazon Pay"]
NAMES_HI = ["राजेश", "सुनीता", "अनिल", "प्रिया"]
DISTRICTS = ["Raipur", "Bilaspur", "Durg", "Korba", "Raigarh", "Jagdalpur", "Dhamtari"]


def tid(seed):
    return "gap" + hashlib.md5(seed.encode()).hexdigest()[:8]


def rows():
    out = []

    # ---- mule_recruitment: scam, en/hi/hinglish ----
    t = tid("mule_en")
    for _ in range(6):
        amt = random.choice([5000, 8000, 10000, 15000])
        out.append((
            f"Earn Rs {amt} per week! Just lend your bank account for fund transfers, "
            f"we handle everything. No work needed. WhatsApp 7{random.randint(100000000,999999999)} to start.",
            "scam", "en", "mule_recruitment", t))
    t = tid("mule_en2")
    for _ in range(6):
        out.append((
            f"Urgent requirement: students/jobless can earn commission by allowing their savings "
            f"account to receive and forward payments. {random.randint(3,8)}% cut on every transaction. DM to join.",
            "scam", "en", "mule_recruitment", t))
    t = tid("mule_hi")
    for _ in range(6):
        out.append((
            f"घर बैठे कमाओ! अपना बैंक खाता किराए पर दें, हर ट्रांसफर पर {random.randint(500,2000)} रुपये कमीशन। "
            f"जानकारी के लिए व्हाट्सएप करें।",
            "scam", "hi", "mule_recruitment", t))
    t = tid("mule_hinglish")
    for _ in range(6):
        out.append((
            f"Bina kaam kiye paisa kamao bhai! Apna account kuch din ke liye de do, {random.randint(2,6)} "
            f"transactions pe {random.randint(1000,3000)} rupay milega. Interested ho to WhatsApp karo.",
            "scam", "hinglish", "mule_recruitment", t))

    # ---- digital_arrest: more hi/hinglish variety ----
    t = tid("darrest_hi")
    for name in NAMES_HI:
        out.append((
            f"{name} जी, मैं साइबर क्राइम ब्रांच से बोल रहा हूँ। आपके आधार कार्ड का गलत इस्तेमाल हुआ है एक "
            f"मनी लॉन्ड्रिंग केस में। वीडियो कॉल पर आइए नहीं तो वारंट जारी होगा।",
            "scam", "hi", "digital_arrest", t))
    t = tid("darrest_hinglish2")
    for _ in range(6):
        out.append((
            f"Yeh CBI cyber cell se call hai. Aapke naam se ek parcel customs mein pakda gaya hai jisme "
            f"illegal drugs the. Case band karne ke liye video call pe turant aao, nahi to arrest warrant issue hoga.",
            "scam", "hinglish", "digital_arrest", t))

    # ---- hard genuine: realistic English bank debit alerts ----
    t = tid("genuine_debit")
    for bank in BANKS:
        amt = random.choice([199, 299, 499, 999, 1499, 2499, 4999])
        acct = random.randint(1000, 9999)
        ref = random.randint(100000000000, 999999999999)
        merchant = random.choice(["AMAZON", "SWIGGY", "ZOMATO", "FLIPKART", "BIGBASKET"])
        out.append((
            f"{bank}: Rs {amt}.00 debited from a/c XX{acct} on {random.randint(1,28)}-11-26 "
            f"towards {merchant}. Avl bal Rs {random.randint(2000,80000)}.00. Not you? Call 18002586161.",
            "genuine", "en", "", t))
    t = tid("genuine_upi_success")
    for app in APPS:
        amt = random.choice([50, 99, 150, 300, 599, 999])
        out.append((
            f"{app}: Payment of Rs {amt} to {random.choice(['Zomato','Swiggy','BSES','Jio','Big Bazaar'])} "
            f"was successful. UPI Ref No {random.randint(100000000000,999999999999)}.",
            "genuine", "en", "", t))
    t = tid("genuine_cc_bill")
    for bank in BANKS[:5]:
        out.append((
            f"{bank}: Your credit card statement for {random.choice(['Oct','Nov'])} 2026 is generated. "
            f"Total due Rs {random.choice([2340,5600,8900,12300])}. Min due Rs {random.choice([250,500,900])}. "
            f"Pay by {random.randint(1,28)}-12-26.",
            "genuine", "en", "", t))

    return out


def main():
    new_rows = rows()
    with DATA.open("a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        for text, label, lang, stype, t in new_rows:
            w.writerow([text, label, lang, stype, t])
    print(f"appended {len(new_rows)} rows across {len({r[4] for r in new_rows})} new template groups")


if __name__ == "__main__":
    main()
