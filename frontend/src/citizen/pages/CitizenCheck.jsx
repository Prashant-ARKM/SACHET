import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { analyzeMessage, SAMPLE_MESSAGES } from '../lib/scamDetector.js'
import { saveRecentCheck } from '../lib/citizenStorage.js'
import { PhoneIcon, AlertIcon, BookIcon } from '../components/CitizenIcons.jsx'

export default function CitizenCheck() {
  const { lang, t } = useOutletContext()
  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('message') // 'message' | 'call'
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [callAnalyzing, setCallAnalyzing] = useState(false)
  const [shared, setShared] = useState(false)

  const SAMPLES = [
    { label: { en: 'Power Bill Cutoff', hi: 'बिजली बिल फ्रॉड', cg: 'बिजली बिल ठगी' }, text: SAMPLE_MESSAGES[0].text },
    { label: { en: 'Bank KYC Block', hi: 'बैंक KYC ब्लॉक', cg: 'बैंक KYC ब्लॉक' }, text: SAMPLE_MESSAGES[1].text },
    { label: { en: 'Lottery QR Prize', hi: 'लॉटरी QR कोड', cg: 'लॉटरी क्यूआर' }, text: SAMPLE_MESSAGES[2].text },
    { label: { en: 'Digital Arrest', hi: 'डिजिटल अरेस्ट', cg: 'डिजिटल अरेस्ट' }, text: SAMPLE_MESSAGES[3].text },
  ]

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result)
      setInputText(location.state.result.originalText || '')
    } else if (location.state?.prefillText) {
      setInputText(location.state.prefillText)
      if (location.state.autoCheck) {
        runCheck(location.state.prefillText)
      }
    }
  }, [location.state])

  const runCheck = (textToEvaluate) => {
    const text = textToEvaluate ?? inputText
    if (!text.trim()) return

    setIsAnalyzing(true)
    analyzeMessage(text)
      .then((res) => {
        setResult(res)
        if (res) saveRecentCheck(res)
      })
      .catch((err) => {
        console.error('SACHET model failed', err)
        alert('Could not load the detection model. Please check your connection once and retry.')
      })
      .finally(() => setIsAnalyzing(false))
  }

  const handleShare = async () => {
    if (!result) return
    const text = `⚠️ SACHET Cyber Warning: This message was flagged as fraud:\n"${result.originalText}"\nStay cautious, never share your OTP or PIN!`
    if (navigator.share) {
      try {
        await navigator.share({ text })
        setShared(true)
        setTimeout(() => setShared(false), 2500)
        return
      } catch {}
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
    setShared(true)
    setTimeout(() => setShared(false), 2500)
  }

  const handleSampleCall = () => {
    setCallAnalyzing(true)
    setTimeout(async () => {
      const fakeCall =
        'Call recording: Hello, I am calling from Cyber Crime Branch Delhi. A customs parcel under your Aadhaar contains illegal drugs. You must remain on video call under digital arrest.'
      try {
        const res = await analyzeMessage(fakeCall)
        setResult(res)
        setActiveTab('message')
      } catch (err) {
        console.error('SACHET model failed', err)
      }
      setCallAnalyzing(false)
    }, 1200)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex border border-line rounded-full overflow-hidden text-sm bg-card p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('message')}
            className={`px-4 py-1.5 rounded-full font-medium transition ${
              activeTab === 'message' ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
            }`}
          >
            {t.tabMessage}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('call')}
            className={`px-4 py-1.5 rounded-full font-medium transition ${
              activeTab === 'call' ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
            }`}
          >
            {t.tabCall}
          </button>
        </div>

        {inputText && (
          <button
            onClick={() => {
              setInputText('')
              setResult(null)
            }}
            className="text-xs text-muted hover:text-scam font-medium"
          >
            {t.btnClear}
          </button>
        )}
      </div>

      {/* TAB 1: MESSAGE */}
      {activeTab === 'message' && (
        <section className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] space-y-3">
          <textarea
            rows="3"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.checkInputPlaceholder}
            className="w-full p-3.5 rounded-2xl border border-line bg-beige/40 text-ink text-sm outline-none focus:border-forest resize-none placeholder:text-muted/60"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(s.text)
                    runCheck(s.text)
                  }}
                  className="text-xs bg-beige hover:bg-mint text-ink font-medium px-3 py-1 rounded-full border border-line transition"
                >
                  {s.label[lang] || s.label.en}
                </button>
              ))}
            </div>

            {/* Check Button */}
            <button
              type="button"
              onClick={() => runCheck()}
              disabled={!inputText.trim() || isAnalyzing}
              className="rounded-full bg-forest text-card text-xs sm:text-sm font-semibold px-5 py-2 hover:bg-forest-2 active:scale-95 transition disabled:opacity-40"
            >
              {isAnalyzing
                ? (lang === 'hi' ? 'जाँच हो रही है…' : lang === 'cg' ? 'जाँच चलत हे…' : 'Analyzing…')
                : `${t.btnCheckNow} →`}
            </button>
          </div>
        </section>
      )}

      {/* TAB 2: CALL RECORDING */}
      {activeTab === 'call' && (
        <section className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-warn bg-sun-tint px-3 py-1 rounded-full">
              ⏰ {t.callTabNoticeSub}
            </span>
            <button
              onClick={handleSampleCall}
              disabled={callAnalyzing}
              className="text-xs font-semibold text-forest underline"
            >
              {callAnalyzing
                ? (lang === 'hi' ? 'विश्लेषण...' : lang === 'cg' ? 'विश्लेषण...' : 'Analyzing…')
                : `${t.callSampleBtn} →`}
            </button>
          </div>

          <div className="border border-dashed border-line rounded-2xl p-6 text-center bg-beige/30 space-y-2">
            <div className="grid place-items-center w-10 h-10 rounded-full bg-mint text-forest mx-auto">
              <PhoneIcon size={18} />
            </div>
            <p className="text-xs font-semibold text-ink">{t.callUploadLabel}</p>
            <p className="text-[11px] text-muted">
              {lang === 'hi'
                ? 'हमारा वॉइस AI कॉल में धोखाधड़ी के शब्द व पैटर्न पहचानता है'
                : lang === 'cg'
                ? 'हमार वॉइस AI कॉल म ठगी के बात ल पहचानथे'
                : 'Our voice AI model analyzes phone calls for extortion keywords and coercion'}
            </p>
          </div>
        </section>
      )}

      {/* RESULT CARD */}
      {result && (
        <section className="bg-card border border-line rounded-3xl p-5 sm:p-6 shadow-[0_1px_0_rgba(30,42,34,0.04)] space-y-4 animate-fadeIn">
          {/* Verdict Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              result.verdict === 'scam'
                ? 'bg-blush border-scam/20 text-scam'
                : 'bg-mint/50 border-leaf/20 text-forest'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{result.verdict === 'scam' ? '🚨' : '✅'}</span>
                <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight">
                  {result.verdict === 'scam' ? t.verdictScam : t.verdictGenuine}
                </h3>
              </div>
              <p className="text-xs opacity-85 mt-0.5">
                {lang === 'hi' ? 'विश्वास स्कोर' : lang === 'cg' ? 'विश्वास स्कोर' : 'Confidence'}: {result.confidence}% · {result.typeName?.[lang] || result.typeName?.en || result.typeName?.hi}
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-card/80 border border-current">
              {result.verdict === 'scam'
                ? (lang === 'hi' ? 'ख़तरा' : lang === 'cg' ? 'खतरा' : 'Threat')
                : (lang === 'hi' ? 'सामान्य' : lang === 'cg' ? 'सामान्य' : 'Safe')}
            </span>
          </div>

          {/* AI Token Attention Highlighting */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
              {t.whyTitle}
            </div>
            <div className="p-3.5 rounded-2xl bg-beige/60 border border-line text-xs sm:text-sm leading-relaxed text-ink font-mono break-words">
              {result.annotatedTokens.map((tok, idx) =>
                tok.isFlagged ? (
                  <mark
                    key={idx}
                    title={tok.reason}
                    className="bg-scam/15 text-scam font-semibold px-1 py-0.5 rounded-sm mx-0.5"
                  >
                    {tok.text}
                  </mark>
                ) : (
                  <span key={idx}>{tok.text}</span>
                )
              )}
            </div>
          </div>

          {/* 3 Action Steps */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
              {t.whatToDoTitle}
            </div>
            <div className="space-y-1">
              {result.actionSteps.map((step) => (
                <div key={step.num} className="text-xs text-ink flex items-start gap-2 py-0.5">
                  <span className="font-bold text-forest">{step.num}.</span>
                  <span>{step[lang] || step.en || step.hi}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons as Sleek Pills */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                navigate('/citizen/report', {
                  state: {
                    prefillScamType: result.scamType,
                    prefillDescription: result.originalText,
                  },
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-scam text-card text-xs font-semibold px-4 py-2 hover:brightness-110 active:scale-95 transition"
            >
              <AlertIcon size={14} />
              <span>{t.btnReportThis}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/citizen/learn', {
                  state: { highlightLessonId: result.relatedLessonId },
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-forest text-card text-xs font-semibold px-4 py-2 hover:bg-forest-2 active:scale-95 transition"
            >
              <BookIcon size={14} />
              <span>{t.btnRelatedLesson}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full bg-sun text-ink text-xs font-semibold px-4 py-2 hover:brightness-105 active:scale-95 transition"
            >
              <span>{shared ? '✓ ' + t.shareTextSuccess : t.btnShareFamily}</span>
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
