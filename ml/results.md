# SACHET model v2: held-out evaluation

- **Model:** `ml/model.json`, sha256 `9493ac4f49de…` (TF-IDF char n-grams 2–5 + logistic regression, threshold 0.5, not tuned)
- **Evaluated once** on the locked held-out test split, after the model was frozen. Nothing was trained or tuned on it.

## Headline (held-out test)

| Metric | Value |
|---|---|
| Test messages | 3586 (2143 template groups) |
| Accuracy | 92.9% |
| Scam precision | 89.1% |
| Scam recall | 96.3% |
| Scam F1 | 0.926 |

## Confusion matrix

Rows = actual, columns = predicted. Label order: genuine, scam.

| | pred genuine | pred scam |
|---|---|---|
| **actual genuine** | 1731 | 195 (false alarms) |
| **actual scam** | 61 (missed scams) | 1599 |

## Accuracy by language (held-out test)

| Language | Accuracy | n |
|---|---|---|
| en | 98.1% | 1915 |
| hi | 99.3% | 965 |
| hinglish | 70.0% | 706 |

Scam-type accuracy on correctly flagged scams: 92.3% (n=1599). The `other` class is large, so this overstates real type-detection skill.

## Dataset

Total rows: 16867

| Language | genuine | scam |
|---|---|---|
| en | 4464 | 5549 |
| hi | 2790 | 718 |
| hinglish | 1537 | 1809 |

| Split | genuine | scam | template groups |
|---|---|---|---|
| dev | 1035 | 883 | 1286 |
| test | 1926 | 1660 | 2143 |
| train | 5830 | 5533 | 7349 |

**Split method:** `GroupShuffleSplit` by `template_id` (20% of groups held out as test, then 15% of the rest as dev, seed 42). All variants/near-duplicates of a template share one `template_id`, so no group appears in two splits (asserted in `train.py`). Groups added after the first split were assigned to train only.

## Disclosures

- Data comes from public SMS/spam datasets (English), Hindi/Hinglish scam and genuine sets, a few real contributed messages, and templated synthetic rows.
- **336 rows are synthetic gap-fill** (mule recruitment, digital arrest variants, bank alerts, adult/Telegram bait, in-person notices). They were added to train only.
- Gap-fill templates were written after finding failures in dev checks and in the live app (e.g. SBI-style debit alerts, Telegram adult spam). That means the **dev** score is optimistic. The held-out test was never used for those decisions.
- Held-out messages are drawn from the same sources as training, so real-world accuracy on unseen scam styles will be lower than the numbers above.
- The citizen-app demo and the officials-dashboard reports use simulated data: demo reports are scored by this model, but district, channel, amounts and scammer identifiers are synthetic.

## Representative errors (held-out test)

**False alarms (genuine flagged as scam):**

- (0.98, en) Dear TOSIN   Fund your account and win N1000 when you download and carry out a transaction with the Diamond Mobile App. For enquiries call 0…
- (0.98, en) Free Msg Wells Fargo: Recently, we discovered unusual activity or updates on your account that we believe may be unauthorized. For your secu…
- (0.96, hi) URGENT: आपका पार्सल कस्टम्स में फंस गया है। ड्यूटी जमा न करने पर वापस भेज दिया जाएगा। भुगतान करें: indiapost-tracking-update.xyz/pay
- (0.96, en) Hello, I'm Michael Hendrix from OPN Architects Inc, We found your contact on Indeed employment resume. We need a virtual Data clerk employee…
- (0.96, en) Discount of Rs 100 is now YOURS! Get 126 Channels, worth Rs 319 in just Rs 219 on your Airtel Digital TV account 3037252019! Limited Period …
- (0.95, en) Get a SPECIAL DATA DEAL of 2GB for Sh100 valid 24hrs by clicking on https://bit.ly/Safaricomapp or Dial *544*21# and keep the connections go…
- (0.85, en) Hey mum, i've just broken my phone im messaging from a friends phone please contact my new number on whatsapp its urgent 0485 862 540 xx
- (0.80, en) Transfer 08XXXXXX08 200 2580

**Missed scams (scam passed as genuine):**

- (0.08, en) Namaste, this is ICICI Bank. A debit of INR 7,850 was made today. To cancel, reply with OTP 642913 within 5 minutes. Regards, Customer Care.
- (0.14, en) Friendship is a prized gift that gives our heart a lift  a blessing we just cant do without because friendship is what living is all about!
- (0.15, en) Hi this be Donald Trump Jr The Democrats be obsess with impeach my father We CA N'T let them succeed Take a stand NOW givered.co/ Standwith …
- (0.16, en) <#> Your OTP code is 537005. We welcome you to Fi! We're excited that you're about to see what financial freedom looks like. 82275JXpmM1 -Ep…
- (0.19, hi) हाय, यह Mandddy SOMIX FM से कॉल कर रहा है...... आप हमारे ईस्टर इनाम के लिए $05 डॉलर प्राप्त करने के लिए चुना जाता है...
- (0.20, hi) किसी आईपोड को जीतने का मौका देने के लिए 2 सप्ताह में मुफ्त प्रविष्टि. टी. टी. वी.
- (0.24, hi) G8METCHES का स्वर 4 सभी भीड़ के सामने ८०० से लेकर 8007 रुपये के शीर्षकों के साथ प्रतिक्रिया: कमीन, SELYICT, HELCT: GS. Govoviviviva.
- (0.24, en) <#> 1347 is your OTP to login into Airtel Thanks app. OTP valid for 15 mins. Do not share with anyone. If this was not you click i.airtel.in…
