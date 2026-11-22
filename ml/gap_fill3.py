"""Round 3 gap-fill (new template groups -> train only; held-out test untouched):
  - adult/dating/Telegram bait spam (en/hi/hinglish) with t.me / tr.ee / bit.ly links
  - more OTP-refund / prize scams
  - hard GENUINE: "visit branch / post office with ID" notices, delivery notices, family Hinglish
Usage: python ml/gap_fill3.py   (appends to ml/data/messages.csv; refuses to run twice)
"""
import csv, hashlib, random, string
from pathlib import Path

DATA = Path(__file__).resolve().parent / "data" / "messages.csv"
random.seed(23)
BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Bank of Baroda", "PNB", "Canara Bank", "Union Bank"]


def tid(s): return "gapC" + hashlib.md5(s.encode()).hexdigest()[:8]
def slug(n=8): return "".join(random.choice(string.ascii_letters + string.digits) for _ in range(n))
def link(): return random.choice([f"https://t.me/{slug()}bot", f"t.me/{slug()}", f"https://tr.ee/{slug(6)}", f"bit.ly/{slug(7)}", f"https://wa.me/91{random.randint(7000000000,9999999999)}"])
def n(): return random.randint(3, 9)


def rows():
    out = []
    def add(name, label, lang, stype, texts):
        t = tid(name)
        for x in texts: out.append((x, label, lang, stype, t))

    # ---- scam: adult / dating bait ----
    add("adult_en1", "scam", "en", "other", [f"Lonely tonight? {n()*100} verified girls are online and want to meet you. Tap to chat privately: {link()}" for _ in range(8)])
    add("adult_en2", "scam", "en", "other", [f"🔥 Hot local singles in your area 🔞 Free adult videos and private chat 👉 {link()}" for _ in range(8)])
    add("adult_en3", "scam", "en", "other", [f"Want a girlfriend for the night? Dozens of women near you are waiting. Join our bot and get free access: {link()}" for _ in range(8)])
    add("adult_en4", "scam", "en", "other", [f"💋 Exclusive desi content 🔞 18+ only 👇 {link()} 🔥" for _ in range(8)])
    add("adult_hing", "scam", "hinglish", "other", [f"Akele ho kya? {n()} sexy ladkiyan tumse dosti aur raat ke liye baat karna chahti hain. Free join karo {link()}" for _ in range(8)])
    add("adult_hing2", "scam", "hinglish", "other", [f"Desi bhabhi live video call 🔞 pehla chat free, abhi click karo {link()}" for _ in range(8)])
    add("adult_hi", "scam", "hi", "other", [f"अकेलापन महसूस हो रहा है? आपके शहर की {n()*10} लड़कियाँ दोस्ती और डेटिंग के लिए इंतज़ार कर रही हैं। अभी जुड़ें {link()}" for _ in range(8)])
    # ---- scam: telegram task / OTP refund ----
    add("task_en", "scam", "en", "other", [f"Work from home! Earn Rs {random.choice([3000,5000,8000])} per day by rating products. Message our manager on Telegram {link()}" for _ in range(8)])
    add("refund_en", "scam", "en", "otp", [f"Your order refund of Rs {random.randint(1,9)*1000+499} could not be credited. Read out the 6-digit code sent to your mobile to our agent to receive the money." for _ in range(8)])
    add("refund_hing", "scam", "hinglish", "otp", [f"Aapka Rs {random.randint(1,9)*1000+499} ka refund atka hua hai. Paisa wapas lene ke liye apne phone par aaya code hume bata dijiye." for _ in range(8)])
    add("refund_hi", "scam", "hi", "otp", [f"आपका ₹{random.randint(1,9)*1000+499} का रिफंड रुका है। पैसे पाने के लिए आपके फ़ोन पर आया कोड हमारे एजेंट को बताएँ।" for _ in range(8)])
    add("prize_en", "scam", "en", "fake_scheme", [f"You have been selected for a Rs {random.choice([5,10,25])} lakh lucky draw. To claim, pay a small processing fee and share your OTP: {link()}" for _ in range(8)])

    # ---- genuine: "visit in person" notices ----
    add("g_post", "genuine", "en", "", [f"India Post: Your article {random.choice(['EE','RR','CP'])}{random.randint(10**8,10**9-1)}IN could not be delivered as the recipient was unavailable. Please collect it from {random.choice(['Raipur','Bilaspur','Durg','Korba'])} post office with a valid ID." for _ in range(8)])
    add("g_kyc_branch", "genuine", "en", "", [f"Dear customer, periodic KYC update is due for your {b} account. Please visit your home branch with ID and address proof. Do not share OTP or PIN with anyone." for b in BANKS])
    add("g_kyc_hi", "genuine", "hi", "", [f"प्रिय ग्राहक, आपके {b} खाते का केवाईसी अपडेट बाकी है। कृपया पहचान पत्र के साथ अपनी शाखा में आएँ। किसी को OTP न बताएँ।" for b in BANKS])
    add("g_kyc_hing", "genuine", "hinglish", "", [f"Dear customer, aapka {b} account ka KYC update baaki hai. Kripya apni branch mein ID proof ke saath aayein." for b in BANKS])
    add("g_delivery", "genuine", "en", "", [f"{c}: Your order is arriving today between {random.randint(9,12)} AM and {random.randint(1,6)} PM. Delivery partner will call you. Order ID {random.randint(10**8,10**9-1)}." for c in ["Amazon", "Flipkart", "Myntra", "Meesho", "Blinkit"]])
    add("g_gas", "genuine", "en", "", [f"Your LPG cylinder booking is confirmed. Delivery within {random.randint(2,4)} days. Pay cash on delivery only to the uniformed delivery person." for _ in range(8)])
    add("g_family", "genuine", "hinglish", "", [f"{x}" for x in [
        "Beta, bijli ka bill bhar diya kya? Aakhri tareekh kal hai.", "Papa ka phone aaya tha, shaam ko ghar aa jao.",
        "Dukaan ka kiraya aaj tak dena hai, bhej dena.", "Maa ne kaha hai paise bhej do, dawai khareedni hai.",
        "Kal school ki fees ka last date hai, yaad se jama kar dena.", "Bhai, pani ka bill aur gas ka bill dono pending hai.",
        "Didi, shaadi ke card ka photo bhej do WhatsApp par.", "Aaj raat khana bahar khayenge, ready rehna."]])

    # ---- more genuine parcel / courier notices (no link, no fee) and short adult bait ----
    D = ["Raipur", "Bilaspur", "Durg", "Korba", "Raigarh", "Jagdalpur"]
    add("g_post2", "genuine", "en", "", [f"India Post: Speed Post {random.choice(['EE','EK'])}{random.randint(10**8,10**9-1)}IN is out for delivery today in {random.choice(D)}. Postman will deliver at your address." for _ in range(8)])
    add("g_post3", "genuine", "en", "", [f"Your parcel has reached {random.choice(D)} sorting hub and will be delivered in {random.randint(1,3)} days. No payment is required. Track on the official India Post website." for _ in range(8)])
    add("g_post4", "genuine", "en", "", [f"Delivery attempt failed as no one was home. Your parcel is held at the {random.choice(D)} post office for {random.randint(5,10)} days. Bring a photo ID to collect it." for _ in range(8)])
    add("g_post5", "genuine", "hinglish", "", [f"India Post: Aapka parcel {random.choice(D)} post office mein aaya hai. Apna ID proof lekar le jaiye." for _ in range(8)])
    add("g_post6", "genuine", "hi", "", [f"इंडिया पोस्ट: आपका पार्सल {random.choice(D)} डाकघर में पहुँच गया है। कृपया पहचान पत्र लेकर आकर ले जाएँ।" for _ in range(8)])
    add("g_kyc2", "genuine", "en", "", [f"{b}: As per RBI rules your KYC is due for renewal. Visit the branch or use the official {b} app. We never ask for OTP, PIN or card details on calls or links." for b in BANKS])
    add("adult_en5", "scam", "en", "other", [f"Hot girls near you want to chat tonight. Join now: {link()}" for _ in range(8)])
    add("adult_en6", "scam", "en", "other", [f"Sexy girls online now, free chat and videos 🔞 {link()}" for _ in range(8)])
    add("adult_en7", "scam", "en", "other", [f"Hey handsome, I'm bored at home and want to meet. Text me here {link()}" for _ in range(8)])
    return out


def main():
    if "gapC" in DATA.read_text(encoding="utf-8"):
        print("already applied - not appending again"); return
    r = rows()
    with DATA.open("a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        for x in r: w.writerow(x)
    print(f"appended {len(r)} rows, {len({x[4] for x in r})} new groups")

if __name__ == "__main__": main()
