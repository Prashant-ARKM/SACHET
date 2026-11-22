import { useState, useEffect } from 'react'
import { useLocation, useOutletContext, Link } from 'react-router-dom'
import { SCAM_TYPES } from '../../shared/scamTypes.js'
import { saveCitizenReport } from '../lib/citizenStorage.js'
import { CheckIcon } from '../components/CitizenIcons.jsx'

export default function CitizenReport() {
  const { district, lang, t } = useOutletContext()
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

  const complaintLetter = `To, Officer in Charge / Cyber Crime Cell, District: ${district}
Subject: Formal Complaint regarding Cyber Financial Fraud
Date: ${new Date().toLocaleDateString('en-IN')}

Dear Sir/Madam,
I am submitting this formal complaint regarding a cyber fraud incident:
• Fraud Type: ${SCAM_TYPES.find((s) => s.id === scamType)?.en || scamType}
• Scammer Phone: ${phone || 'Unknown / Internet Call'} | UPI: ${upi || 'N/A'}
${lostMoney ? `• Amount Lost: ₹${amount || '0'} | Transaction UTR: ${txnId || 'Under Investigation'}` : '• Financial Loss: None (Intercepted timely)'}
• Details: ${description || 'Deceptive message/call attempting unlawful financial extraction.'}

Kindly take necessary legal action under IT Act and relevant penal provisions.
Reference ID: ${refId || 'SACHET-CG'}`

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
            <h2 className="font-display text-2xl font-bold text-forest">
              {t.reportSuccess}
            </h2>
            <p className="text-xs text-muted mt-1">
              {lang === 'hi' ? 'संदर्भ संख्या' : lang === 'cg' ? 'संदर्भ नंबर' : 'Reference ID'}: <span className="font-mono font-bold text-ink">{refId}</span> · {district} {lang === 'hi' ? 'डैशबोर्ड पर प्रेषित' : lang === 'cg' ? 'डैशबोर्ड म भेज दे गे' : 'sent to dashboard'}
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setShowLetter(!showLetter)}
              className="rounded-full bg-forest text-card text-xs font-semibold px-4 py-2 hover:bg-forest-2 transition"
            >
              {showLetter
                ? (lang === 'hi' ? 'पत्र छुपाएं' : lang === 'cg' ? 'पत्र लुकावव' : 'Hide Letter')
                : (lang === 'hi' ? 'थाना शिकायत पत्र देखें' : lang === 'cg' ? 'थाना रपट देखव' : 'View Police Application Letter')}
            </button>
            <Link
              to="/citizen"
              className="rounded-full bg-card border border-line text-ink text-xs font-semibold px-4 py-2 hover:bg-beige transition"
            >
              {lang === 'hi' ? 'होम पर जाएं' : lang === 'cg' ? 'घर जावव' : 'Back to Home'}
            </Link>
          </div>

          {showLetter && (
            <div className="text-left bg-beige/60 p-4 rounded-2xl border border-line space-y-2 mt-3 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ink font-sans">
                  {t.complaintWriterTitle}:
                </span>
                <button onClick={copyLetter} className="text-forest underline font-sans font-bold">
                  {copied ? '✓ Copied' : t.btnCopyLetter}
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
              {lang === 'hi' ? 'चरण 1 · क्या आपके पैसे कटे?' : lang === 'cg' ? 'पहिला पायदान · पैसा कट गे का?' : 'STEP 1 · DID YOU LOSE MONEY?'}
            </div>
            <h3 className="font-display text-xl font-bold text-ink">{t.qLostMoney}</h3>

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
                {t.ansYes}
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
                {t.ansNo}
              </button>
            </div>

            {lostMoney === true && (
              <div className="bg-blush/60 border border-scam/15 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <span className="text-scam font-medium">{t.lostStep1}</span>
                <a
                  href="tel:1930"
                  className="rounded-full bg-scam text-card px-3 py-1 font-semibold hover:brightness-110 shrink-0"
                >
                  {t.callNow}
                </a>
              </div>
            )}

            {lostMoney === false && (
              <div className="bg-mint/40 border border-leaf/15 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <span className="text-forest font-medium">{t.noLostMoneyDesc}</span>
                <a
                  href="https://sancharsaathi.gov.in/sfc/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-forest text-card px-3 py-1 font-semibold hover:bg-forest-2 shrink-0"
                >
                  {t.btnChakshu} →
                </a>
              </div>
            )}
          </section>

          {/* STEP 2: EVIDENCE */}
          <section className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] space-y-3">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
              {t.evidenceTitle}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">{t.scamTypeLabel}</label>
                <select
                  value={scamType}
                  onChange={(e) => setScamType(e.target.value)}
                  className="w-full border border-line rounded-xl px-3 py-2 bg-beige/40 text-ink"
                >
                  {SCAM_TYPES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st[lang] || st.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">{t.chkPhone}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-line rounded-xl px-3 py-2 bg-beige/40 text-ink"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">{t.chkUpi}</label>
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
                  <label className="font-semibold text-scam block mb-1">
                    {lang === 'hi' ? 'कटी राशि (₹)' : lang === 'cg' ? 'कटे पैसा (₹)' : 'Amount Lost (₹)'}
                  </label>
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
              <label className="font-semibold text-ink block mb-1 text-xs">
                {lang === 'hi' ? 'घटना का संक्षिप्त विवरण' : lang === 'cg' ? 'विवरण' : 'Brief Description'}
              </label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={lang === 'hi' ? 'संदेश या घटना की मुख्य बात लिखें...' : lang === 'cg' ? 'मैसेज या ठगी के बात लिखव...' : 'Paste message text or describe what happened...'}
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
              <span>{t.consentLabel}</span>
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-forest text-card text-xs sm:text-sm font-semibold py-2.5 hover:bg-forest-2 active:scale-95 transition"
            >
              {t.btnSubmitReport} →
            </button>
          </section>
        </form>
      )}
    </div>
  )
}
