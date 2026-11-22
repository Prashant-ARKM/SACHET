import { useState, useEffect } from 'react'
import { useLocation, useOutletContext, Link } from 'react-router-dom'
import { SCAM_TYPES } from '../../shared/scamTypes.js'
import { DISTRICTS } from '../../shared/districts.js'
import { saveCitizenReport } from '../lib/citizenStorage.js'

export default function CitizenReport() {
  const { district: initialDistrict, lang, t } = useOutletContext()
  const location = useLocation()

  // 1. Did you lose money bifurcation
  const [lostMoney, setLostMoney] = useState(null) // null | true | false

  // Form Fields
  const [scamType, setScamType] = useState('otp')
  const [phone, setPhone] = useState('')
  const [upi, setUpi] = useState('')
  const [txnId, setTxnId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))
  const [description, setDescription] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict || 'Raipur')
  const [consent, setConsent] = useState(true)
  const [screenshotName, setScreenshotName] = useState('')

  // UI state
  const [submitted, setSubmitted] = useState(false)
  const [refId, setRefId] = useState('')
  const [showComplaintWriter, setShowComplaintWriter] = useState(false)
  const [copiedLetter, setCopiedLetter] = useState(false)

  // Handle incoming prefill from check result
  useEffect(() => {
    if (location.state?.prefillScamType) {
      setScamType(location.state.prefillScamType)
    }
    if (location.state?.prefillDescription) {
      setDescription(location.state.prefillDescription)
    }
  }, [location.state])

  const handleSubmit = (e) => {
    e.preventDefault()
    const id = `cit-${Date.now().toString().slice(-6)}`
    const reportData = {
      id,
      scam_type: scamType,
      district: selectedDistrict,
      channel: 'sms',
      scammer_phone: phone || null,
      scammer_upi: upi || null,
      transaction_id: txnId || null,
      amount_lost: lostMoney ? Number(amount || 0) : 0,
      description,
      consent,
      date,
      created_at: new Date().toISOString(),
    }

    saveCitizenReport(reportData)
    setRefId(id)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Formal complaint letter generator
  const generatedLetter = `सेवा में,
थाना प्रभारी / साइबर अपराध सेल,
ज़िला: ${selectedDistrict}, छत्तीसगढ़।

विषय: साइबर वित्तीय धोखाधड़ी के संबंध में प्रथम सूचना रिपोर्ट (FIR) हेतु आवेदन

महोदय,
सविनय निवेदन है कि प्रार्थी/प्रार्थिया ${selectedDistrict} का निवासी है। दिनांक ${new Date(date).toLocaleDateString('hi-IN')} को प्रार्थी के साथ साइबर धोखाधड़ी की घटना घटित हुई।

घटना का विवरण निम्नानुसार है:
1. धोखाधड़ी का प्रकार: ${SCAM_TYPES.find((s) => s.id === scamType)?.hi || scamType}
2. धोखेबाज़ का मोबाइल नंबर: ${phone || 'अज्ञात / इंटरनेट कॉल'}
3. संदेहास्पद UPI ID / खाता: ${upi || 'लागू नहीं'}
${lostMoney ? `4. धोखाधड़ी में कटी राशि: ₹${amount || '0'}\n5. बैंक ट्रांजेक्शन UTR / Ref No: ${txnId || 'जाँच अधीन'}` : '4. वित्तीय नुकसान: शून्य (समय रहते सतर्कता बरती गई)'}
6. घटना का संक्षिप्त विवरण: ${description || 'उपरोक्त नंबर द्वारा फर्जी कॉल/संदेश भेजकर छल करने का प्रयास किया गया।'}

अतः श्रीमान जी से सादर निवेदन है कि मामले की जाँच कर दोषियों के विरुद्ध सूचना प्रौद्योगिकी अधिनियम (IT Act) एवं भारतीय न्याय संहिता (BNS) के तहत उचित कानूनी कार्यवाही करने की कृपा करें।

धन्यवाद।
दिनांक: ${new Date().toLocaleDateString('hi-IN')}
हस्ताक्षर: __________________
नाम: अनाम नागरिक (SACHET रेफरेंस: ${refId || 'सचेत-छत्तीसगढ़'})`

  const handleCopyLetter = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedLetter)
      setCopiedLetter(true)
      setTimeout(() => setCopiedLetter(false), 3000)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink flex items-center gap-2.5">
          <span>🚨</span>
          <span>{t.reportTitle}</span>
        </h1>
        <p className="text-sm text-muted">
          बिना किसी डर के 2 मिनट में रिपोर्ट करें। आपकी पहचान पूर्णतः गोपनीय रखी जाती है।
        </p>
      </div>

      {/* Success Banner */}
      {submitted ? (
        <div className="bg-card border-2 border-leaf rounded-3xl p-6 sm:p-8 shadow-md text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-mint text-forest mx-auto flex items-center justify-center text-3xl font-bold">
            ✓
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-display text-forest">
              {t.reportSuccess}
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              आपकी रिपोर्ट संदर्भ संख्या (Ref ID): <span className="font-mono font-bold text-ink">{refId}</span>
            </p>
          </div>

          <div className="bg-beige/80 p-4 rounded-2xl border border-line text-xs sm:text-sm text-ink text-left space-y-2 max-w-lg mx-auto">
            <p className="font-bold flex items-center gap-1.5 text-forest">
              <span>📍</span> आपके ज़िले ({selectedDistrict}) के डैशबोर्ड पर यह अलर्ट भेज दिया गया है।
            </p>
            <p className="text-muted">
              अन्य नागरिक अब इस धोखेबाज़ के नंबर और तरीके से सतर्क रहेंगे।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowComplaintWriter(!showComplaintWriter)}
              className="bg-forest text-card font-bold text-sm px-5 py-3 rounded-xl hover:bg-forest-2 transition-colors shadow-xs"
            >
              📝 {showComplaintWriter ? 'शिकायत पत्र छुपाएं' : 'थाने के लिए औपचारिक पत्र देखें'}
            </button>
            <Link
              to="/citizen"
              className="bg-beige text-ink border border-line font-bold text-sm px-5 py-3 rounded-xl hover:bg-mint transition-colors"
            >
              होम पर लौटें
            </Link>
          </div>

          {/* Embedded Complaint Writer in Success state */}
          {showComplaintWriter && (
            <div className="text-left bg-card p-5 rounded-2xl border border-line space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-ink">
                  {t.complaintWriterTitle}
                </h3>
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="bg-mint text-forest font-bold text-xs px-3 py-1.5 rounded-lg border border-forest/30 hover:bg-forest hover:text-card transition-colors"
                >
                  {copiedLetter ? '✓ कॉपी हो गया!' : '📋 कॉपी करें'}
                </button>
              </div>
              <pre className="p-4 bg-beige/70 rounded-xl text-xs text-ink font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto border border-line">
                {generatedLetter}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: DID YOU LOSE MONEY? */}
          <div className="bg-card border-2 border-line rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-leaf bg-mint px-2.5 py-0.5 rounded-full">
                पहला चरण (Step 1)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-ink">
                {t.qLostMoney}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option: YES */}
              <button
                type="button"
                onClick={() => setLostMoney(true)}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-2 ${
                  lostMoney === true
                    ? 'bg-blush border-scam shadow-md scale-[1.01]'
                    : 'bg-beige/40 hover:bg-blush/40 border-line'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💸</span>
                  {lostMoney === true && (
                    <span className="text-xs bg-scam text-card font-bold px-2 py-0.5 rounded-full">
                      चयनित
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-base sm:text-lg text-scam">
                    {t.ansYes}
                  </p>
                  <p className="text-xs text-ink/75 mt-0.5">
                    खाते से पैसे कटे हैं या ऑनलाइन ठगी हुई है
                  </p>
                </div>
              </button>

              {/* Option: NO */}
              <button
                type="button"
                onClick={() => setLostMoney(false)}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-2 ${
                  lostMoney === false
                    ? 'bg-mint/60 border-forest shadow-md scale-[1.01]'
                    : 'bg-beige/40 hover:bg-mint/30 border-line'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🛡️</span>
                  {lostMoney === false && (
                    <span className="text-xs bg-forest text-card font-bold px-2 py-0.5 rounded-full">
                      चयनित
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-base sm:text-lg text-forest">
                    {t.ansNo}
                  </p>
                  <p className="text-xs text-ink/75 mt-0.5">
                    पैसे नहीं कटे, सिर्फ संदिग्ध कॉल/SMS आया
                  </p>
                </div>
              </button>
            </div>

            {/* YES GUIDANCE */}
            {lostMoney === true && (
              <div className="bg-blush/80 border border-scam/40 p-4 rounded-2xl space-y-3 animate-fadeIn">
                <div className="space-y-1">
                  <p className="font-bold text-scam text-sm flex items-center gap-1.5">
                    <span>🚨</span> {t.lostMoneyActionTitle}
                  </p>
                  <p className="text-xs text-ink/80 leading-relaxed">
                    • {t.lostStep1} <br />
                    • {t.lostStep2}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href="tel:1930"
                    className="flex-1 bg-scam hover:bg-scam/90 text-card font-extrabold text-sm py-3 px-4 rounded-xl text-center shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>{t.btnCall1930}</span>
                  </a>
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-card hover:bg-line text-ink font-bold text-xs py-3 px-4 rounded-xl text-center border border-line flex items-center justify-center gap-1.5"
                  >
                    <span>🌐 {t.btnGovPortal}</span>
                  </a>
                </div>
              </div>
            )}

            {/* NO GUIDANCE */}
            {lostMoney === false && (
              <div className="bg-mint/50 border border-leaf/40 p-4 rounded-2xl space-y-3 animate-fadeIn">
                <div className="space-y-1">
                  <p className="font-bold text-forest text-sm flex items-center gap-1.5">
                    <span>✅</span> {t.noLostMoneyTitle}
                  </p>
                  <p className="text-xs text-ink/80 leading-relaxed">
                    {t.noLostMoneyDesc}
                  </p>
                </div>

                <a
                  href="https://sancharsaathi.gov.in/sfc/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-forest text-card font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-forest-2 transition-colors shadow-xs"
                >
                  <span>🌐 {t.btnChakshu}</span>
                  <span>➔</span>
                </a>
              </div>
            )}
          </div>

          {/* STEP 2: EVIDENCE CHECKLIST */}
          <div className="bg-card border-2 border-line rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-leaf bg-mint px-2.5 py-0.5 rounded-full">
                दूसरा चरण (Step 2)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-ink">
                {t.evidenceTitle}
              </h2>
              <p className="text-xs text-muted">
                जो भी जानकारी आपके पास उपलब्ध हो, उसे भरें:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Scam Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  धोखाधड़ी का प्रकार
                </label>
                <select
                  value={scamType}
                  onChange={(e) => setScamType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-line bg-beige text-ink text-sm font-semibold focus:border-forest"
                >
                  {SCAM_TYPES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st[lang] || st.hi} ({st.en})
                    </option>
                  ))}
                </select>
              </div>

              {/* Scammer Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  {t.chkPhone}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="उदा. +91 98765 43210"
                  className="w-full p-3 rounded-xl border border-line bg-beige text-ink text-sm focus:border-forest"
                />
              </div>

              {/* Scammer UPI ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  {t.chkUpi}
                </label>
                <input
                  type="text"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  placeholder="उदा. fraudster@ybl"
                  className="w-full p-3 rounded-xl border border-line bg-beige text-ink text-sm focus:border-forest"
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  {t.chkTxn}
                </label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="उदा. UPI/32187654..."
                  className="w-full p-3 rounded-xl border border-line bg-beige text-ink text-sm focus:border-forest"
                />
              </div>

              {/* Amount Lost (if applicable) */}
              {lostMoney && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-scam">
                    कटी हुई धनराशि (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="उदा. 5000"
                    className="w-full p-3 rounded-xl border border-scam/50 bg-blush/30 text-ink text-sm font-bold focus:border-scam"
                  />
                </div>
              )}

              {/* Date & Time */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  {t.chkTime}
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-line bg-beige text-ink text-sm focus:border-forest"
                />
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink">
                धोखेबाज़ का संदेश या घटना का विवरण
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="यहाँ बताएं कि उसने क्या कहा या क्या संदेश भेजा..."
                className="w-full p-3 rounded-xl border border-line bg-beige text-ink text-sm focus:border-forest resize-none"
              />
            </div>

            {/* Screenshot Upload */}
            <div className="border border-dashed border-line rounded-xl p-4 bg-beige/40 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-ink">{t.chkScreenshot}</p>
                <p className="text-[11px] text-muted">
                  SMS, WhatsApp चैट या ट्रांजेक्शन का स्क्रीनशॉट जोड़ें
                </p>
                {screenshotName && (
                  <p className="text-xs text-forest font-semibold mt-1">
                    ✓ अपलोड हुआ: {screenshotName}
                  </p>
                )}
              </div>
              <label className="shrink-0 bg-card hover:bg-mint border border-line text-forest font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-colors shadow-xs">
                📷 फ़ोटो चुनें
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setScreenshotName(e.target.files[0].name)
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* STEP 3: ANONYMOUS REPORT TO DISTRICT (CONSENT) */}
          <div className="bg-card border-2 border-line rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-leaf bg-mint px-2.5 py-0.5 rounded-full">
                तीसरा चरण (Step 3)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-ink">
                {t.anonymousTitle}
              </h2>
            </div>

            {/* District Selector for Report */}
            <div className="space-y-1 max-w-sm">
              <label className="text-xs font-bold text-ink">
                रिपोर्ट साझा करने का ज़िला:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-3 rounded-xl border border-line bg-beige text-ink text-sm font-semibold focus:border-forest"
              >
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-beige/70 border border-line cursor-pointer hover:bg-mint/30 transition-colors">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-5 h-5 rounded-md text-forest focus:ring-forest border-line mt-0.5 shrink-0"
              />
              <span className="text-xs sm:text-sm font-semibold text-ink leading-relaxed">
                {t.consentLabel}
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-forest hover:bg-forest-2 text-card font-bold text-lg sm:text-xl py-4 rounded-2xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>🚨</span>
              <span>{t.btnSubmitReport}</span>
            </button>
          </div>

          {/* LATER FEATURE: COMPLAINT WRITER ACCESS */}
          <div className="bg-card border border-line rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-ink">{t.complaintWriterTitle}</p>
              <p className="text-xs text-muted">
                {t.complaintWriterDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowComplaintWriter(!showComplaintWriter)}
              className="shrink-0 bg-beige hover:bg-mint border border-line text-forest font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
            >
              📝 {showComplaintWriter ? 'छुपाएं' : 'आवेदन पत्र देखें'}
            </button>
          </div>

          {showComplaintWriter && (
            <div className="bg-card p-5 rounded-2xl border border-line space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-ink">आवेदन पत्र पूर्वावलोकन:</h3>
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="bg-mint text-forest font-bold text-xs px-3 py-1.5 rounded-lg border border-forest/30 hover:bg-forest hover:text-card transition-colors"
                >
                  {copiedLetter ? '✓ कॉपी हो गया!' : '📋 कॉपी करें'}
                </button>
              </div>
              <pre className="p-4 bg-beige/70 rounded-xl text-xs text-ink font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto border border-line">
                {generatedLetter}
              </pre>
            </div>
          )}
        </form>
      )}
    </div>
  )
}

