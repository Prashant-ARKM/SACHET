import { useState, useEffect } from 'react'
import { useLocation, useOutletContext, Link } from 'react-router-dom'
import { SCAM_TYPES } from '../../shared/scamTypes.js'
import { saveCitizenReport } from '../lib/citizenStorage.js'
import { PhoneIcon, AlertIcon, CheckIcon } from '../components/CitizenIcons.jsx'

export default function CitizenReport() {
  const { district, lang } = useOutletContext()
  const location = useLocation()

  const [lostMoney, setLostMoney] = useState(null) // null | true | false
  const [scamType, setScamType] = useState('otp')
  const [phone, setPhone] = useState('')
  const [upi, setUpi] = useState('')
  const [txnId, setTxnId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [consent, setConsent] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [refId, setRefId] = useState('')
  const [showLetter, setShowLetter] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (location.state?.prefillScamType) setScamType(location.state.prefillScamType)
    if (location.state?.prefillDescription) setDescription(location.state.prefillDescription)
  }, [location.state])

  const handleSubmit = (e) => {
    e.preventDefault()
    const id = `cit-${Date.now().toString().slice(-6)}`
    saveCitizenReport({
      id,
      scam_type: scamType,
      district,
      channel: 'sms',
      scammer_phone: phone || null,
      scammer_upi: upi || null,
      transaction_id: txnId || null,
      amount_lost: lostMoney ? Number(amount || 0) : 0,
      description,
      consent,
      created_at: new Date().toISOString(),
    })
    setRefId(id)
    setSubmitted(true)
  }

  const complaintLetter = `सेवा में, थाना प्रभारी / साइबर सेल, ज़िला: ${district}
विषय: साइबर वित्तीय धोखाधड़ी शिकायत
महोदय, दिनांक ${new Date().toLocaleDateString('hi-IN')} को प्रार्थी के साथ साइबर ठगी हुई।
• प्रकार: ${SCAM_TYPES.find((s) => s.id === scamType)?.hi || scamType}
• नंबर: ${phone || 'अज्ञात'} | UPI: ${upi || 'N/A'}
${lostMoney ? `• कटी राशि: ₹${amount || '0'} | UTR: ${txnId || 'N/A'}` : '• वित्तीय हानि: शून्य'}
विवरण: ${description || 'उपरोक्त नंबर द्वारा छल का प्रयास किया गया।'}
उचित कानूनी कार्रवाई की कृपा करें। (Ref: ${refId || 'SACHET'})`

  const copyLetter = () => {
    navigator.clipboard?.writeText(complaintLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {submitted ? (
        <section className="bg-card border border-line rounded-3xl p-6 text-center space-y-4 shadow-[0_1px_0_rgba(30,42,34,0.04)] animate-fadeIn">
          <div className="grid place-items-center w-12 h-12 rounded-full bg-mint text-forest mx-auto">
            <CheckIcon size={20} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-forest">रिपोर्ट दर्ज हो गई</h2>
            <p className="text-xs text-muted mt-1">
              संदर्भ संख्या: <span className="font-mono font-bold text-ink">{refId}</span> · {district} डैशबोर्ड पर प्रेषित
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setShowLetter(!showLetter)}
              className="rounded-full bg-forest text-card text-xs font-semibold px-4 py-2 hover:bg-forest-2 transition"
            >
              {showLetter ? 'पत्र छुपाएं' : 'थाना शिकायत पत्र देखें'}
            </button>
            <Link
              to="/citizen"
              className="rounded-full bg-card border border-line text-ink text-xs font-semibold px-4 py-2 hover:bg-beige transition"
            >
              होम पर जाएं
            </Link>
          </div>

          {showLetter && (
            <div className="text-left bg-beige/60 p-4 rounded-2xl border border-line space-y-2 mt-3 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ink">आवेदन पत्र:</span>
                <button onClick={copyLetter} className="text-forest underline font-sans font-bold">
                  {copied ? '✓ कॉपी हुआ' : 'कॉपी करें'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-ink/80 leading-relaxed">{complaintLetter}</pre>
            </div>
          )}
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: DID YOU LOSE MONEY */}
          <section className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] space-y-3">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
              चरण 1 · DID YOU LOSE MONEY?
            </div>
            <h3 className="font-display text-xl font-bold text-ink">क्या आपके पैसे कटे हैं?</h3>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLostMoney(true)}
                className={`flex-1 py-2.5 px-3 rounded-full text-xs font-semibold border transition ${
                  lostMoney === true
                    ? 'bg-blush border-scam text-scam shadow-xs'
                    : 'bg-card border-line text-ink hover:bg-beige'
                }`}
              >
                हाँ, पैसे कटे हैं
              </button>
              <button
                type="button"
                onClick={() => setLostMoney(false)}
                className={`flex-1 py-2.5 px-3 rounded-full text-xs font-semibold border transition ${
                  lostMoney === false
                    ? 'bg-mint border-leaf text-forest shadow-xs'
                    : 'bg-card border-line text-ink hover:bg-beige'
                }`}
              >
                नहीं, सिर्फ़ कॉल/SMS आया
              </button>
            </div>

            {lostMoney === true && (
              <div className="bg-blush/60 border border-scam/15 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <span className="text-scam font-medium">तुरंत 1930 पर कॉल करें (गोल्डन ऑवर)</span>
                <a
                  href="tel:1930"
                  className="rounded-full bg-scam text-card px-3 py-1 font-semibold hover:brightness-110 shrink-0"
                >
                  कॉल 1930
                </a>
              </div>
            )}

            {lostMoney === false && (
              <div className="bg-mint/40 border border-leaf/15 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <span className="text-forest font-medium">संचार साथी "चक्षु" पर नंबर रिपोर्ट करें</span>
                <a
                  href="https://sancharsaathi.gov.in/sfc/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-forest text-card px-3 py-1 font-semibold hover:bg-forest-2 shrink-0"
                >
                  Chakshu →
                </a>
              </div>
            )}
          </section>

          {/* STEP 2: EVIDENCE */}
          <section className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] space-y-3">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
              चरण 2 · साक्ष्य (EVIDENCE)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">धोखाधड़ी का प्रकार</label>
                <select
                  value={scamType}
                  onChange={(e) => setScamType(e.target.value)}
                  className="w-full border border-line rounded-xl px-3 py-2 bg-beige/40 text-ink"
                >
                  {SCAM_TYPES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st[lang] || st.hi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">धोखेबाज़ का फोन नंबर</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-line rounded-xl px-3 py-2 bg-beige/40 text-ink"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">UPI ID (यदि हो)</label>
                <input
                  type="text"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  placeholder="scammer@upi"
                  className="w-full border border-line rounded-xl px-3 py-2 bg-beige/40 text-ink"
                />
              </div>

              {lostMoney && (
                <div>
                  <label className="font-semibold text-scam block mb-1">कटी राशि (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full border border-scam/30 rounded-xl px-3 py-2 bg-blush/30 text-ink font-semibold"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-ink block mb-1 text-xs">विवरण</label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="संदेश या घटना की मुख्य बात लिखें..."
                className="w-full border border-line rounded-xl p-3 bg-beige/40 text-xs text-ink outline-none focus:border-forest resize-none"
              />
            </div>
          </section>

          {/* STEP 3: CONSENT & SUBMIT */}
          <section className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] space-y-3">
            <label className="flex items-center gap-2.5 text-xs text-ink font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-4 h-4 rounded text-forest focus:ring-0"
              />
              <span>{district} ज़िले के नागरिकों को सचेत करने हेतु अनाम रिपोर्ट साझा करें</span>
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-forest text-card text-xs sm:text-sm font-semibold py-2.5 hover:bg-forest-2 active:scale-95 transition"
            >
              अनाम रिपोर्ट दर्ज करें →
            </button>
          </section>
        </form>
      )}
    </div>
  )
}
