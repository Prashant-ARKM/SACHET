# SACHET model: held-out evaluation

- **Model:** `ml/model.json`, sha256 `af98425845ac…` (TF-IDF char n-grams 2–5 + logistic regression, threshold 0.36)
- **Evaluated** on the locked original test split. Training and threshold fitting use separate splits.

## Headline (held-out test)

| Metric | Value |
|---|---|
| Test messages | 3586 (2143 template groups) |
| Accuracy | 92.4% |
| Scam precision | 89.2% |
| Scam recall | 95.0% |
| Scam F1 | 0.920 |

## Confusion matrix

Rows = actual, columns = predicted. Label order: genuine, scam.

| | pred genuine | pred scam |
|---|---|---|
| **actual genuine** | 1736 | 190 (false alarms) |
| **actual scam** | 83 (missed scams) | 1577 |

## Accuracy by language (held-out test)

| Language | Accuracy | n |
|---|---|---|
| en | 98.0% | 1915 |
| hi | 99.1% | 965 |
| hinglish | 68.1% | 706 |

Scam-type accuracy on correctly flagged scams: 92.5% (n=1577). The `other` class is large, so this overstates real type-detection skill.

## Dataset

Original dataset rows: 16867. See ml/README.md for supplemental data and the baseline comparison.

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

- (0.97, hi) URGENT: आपका पार्सल कस्टम्स में फंस गया है। ड्यूटी जमा न करने पर वापस भेज दिया जाएगा। भुगतान करें: indiapost-tracking-update.xyz/pay
- (0.95, en) Discount of Rs 100 is now YOURS! Get 126 Channels, worth Rs 319 in just Rs 219 on your Airtel Digital TV account 3037252019! Limited Period …
- (0.91, hinglish) Dhyan se suniye Aapka order deliver ho chuka hai. Feedback de dena.
- (0.88, hinglish) Ji haan suniye Aapka order deliver ho chuka hai. Feedback de dena.
- (0.87, hinglish) Ji namaskar Aapka order deliver ho chuka hai. Feedback de dena.
- (0.87, hinglish) Namaste sir Aapka order deliver ho chuka hai. Feedback de dena.
- (0.86, hinglish) Sir ek minute suniye Aapka order deliver ho chuka hai. Feedback de dena.
- (0.86, hinglish) Hello ji Aapka order deliver ho chuka hai. Feedback de dena.

**Missed scams (scam passed as genuine):**

- (0.02, en) <#> Your OTP code is 537005. We welcome you to Fi! We're excited that you're about to see what financial freedom looks like. 82275JXpmM1 -Ep…
- (0.02, en) Namaste, this is ICICI Bank. A debit of INR 7,850 was made today. To cancel, reply with OTP 642913 within 5 minutes. Regards, Customer Care.
- (0.02, en) Friendship is a prized gift that gives our heart a lift  a blessing we just cant do without because friendship is what living is all about!
- (0.03, hi) G8METCHES का स्वर 4 सभी भीड़ के सामने ८०० से लेकर 8007 रुपये के शीर्षकों के साथ प्रतिक्रिया: कमीन, SELYICT, HELCT: GS. Govoviviviva.
- (0.07, en) Hi this be Donald Trump Jr The Democrats be obsess with impeach my father We CA N'T let them succeed Take a stand NOW givered.co/ Standwith …
- (0.07, hi) किसी आईपोड को जीतने का मौका देने के लिए 2 सप्ताह में मुफ्त प्रविष्टि. टी. टी. वी.
- (0.08, en) FreeMsg: [Emma] What do you think boys? myporndebut.mp4 hitip:// verl.me/e.php?uid=4c375997 18+ Stop? h3lp@mobjizz.com Mobjizz
- (0.10, hi) हाय, यह Mandddy SOMIX FM से कॉल कर रहा है...... आप हमारे ईस्टर इनाम के लिए $05 डॉलर प्राप्त करने के लिए चुना जाता है...
