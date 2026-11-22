import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { analyzeMessage, SAMPLE_MESSAGES } from '../lib/scamDetector.js'
import { saveRecentCheck } from '../lib/citizenStorage.js'
import { PhoneIcon, AlertIcon, BookIcon } from '../components/CitizenIcons.jsx'

export default function CitizenCheck() {
  const { lang } = useOutletContext()
  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('message') // 'message' | 'call'
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [callAnalyzing, setCallAnalyzing] = useState(false)
  const [shared, setShared] = useState(false)

  // Prefilled text / autoCheck from home tile
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
    setTimeout(() => {
      const res = analyzeMessage(text)
      setResult(res)
      setIsAnalyzing(false)
      saveRecentCheck(res)
    }, 350)
  }

  const handleShare = async () => {
    if (!result) return
    const text = `⚠️ SACHET साइबर अलर्ट: यह संदेश धोखाधड़ी पाया गया है:\n"${result.originalText}"\nसावधान रहें, किसी को OTP या पिन न दें!`
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
    setTimeout(() => {
      setCallAnalyzing(false)
      const fakeCall =
        'कॉल रिकॉर्डिंग: नमस्ते, मैं साइबर क्राइम सेल दिल्ली से बोल रहा हूँ। आपके नाम से ताइवान कूरियर में नशीला पदार्थ मिला है। तुरंत वीडियो कॉल पर डिजिटल अरेस्ट में रहें।'
      const res = analyzeMessage(fakeCall)
      setResult(res)
      setActiveTab('message')
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
            संदेश / लिंक
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('call')}
            className={`px-4 py-1.5 rounded-full font-medium transition ${
              activeTab === 'call' ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
            }`}
          >
            कॉल रिकॉर्डिंग
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
            साफ़ करें
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
            placeholder="SMS, WhatsApp चैट या संदिग्ध लिंक यहाँ पेस्ट करें..."
            className="w-full p-3.5 rounded-2xl border border-line bg-beige/40 text-ink text-sm outline-none focus:border-forest resize-none placeholder:text-muted/60"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_MESSAGES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(s.text)
                    runCheck(s.text)
                  }}
                  className="text-xs bg-beige hover:bg-mint text-ink font-medium px-3 py-1 rounded-full border border-line transition"
                >
                  {s.label.split('(')[0].trim()}
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
              {isAnalyzing ? 'जाँच हो रही है…' : 'जाँच करें →'}
            </button>
          </div>
        </section>
      )}

      {/* TAB 2: CALL RECORDING */}
      {activeTab === 'call' && (
        <section className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-warn bg-sun-tint px-3 py-1 rounded-full">
              ⏰ सेवा समय: 10:00 AM से सक्रिय (Screen built now)
            </span>
            <button
              onClick={handleSampleCall}
              disabled={callAnalyzing}
              className="text-xs font-semibold text-forest underline"
            >
              {callAnalyzing ? 'विश्लेषण...' : 'नमूना कॉल परखें →'}
            </button>
          </div>

          <div className="border border-dashed border-line rounded-2xl p-6 text-center bg-beige/30 space-y-2">
            <div className="grid place-items-center w-10 h-10 rounded-full bg-mint text-forest mx-auto">
              <PhoneIcon size={18} />
            </div>
            <p className="text-xs font-semibold text-ink">ऑडियो रिकॉर्डिंग चुनें (.mp3, .wav, .m4a)</p>
            <p className="text-[11px] text-muted">हमारा वॉइस AI कॉल में धोखाधड़ी के शब्द व पैटर्न पहचानता है</p>
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
                  {result.verdict === 'scam' ? 'धोखाधड़ी (SCAM)' : 'सुरक्षित (GENUINE)'}
                </h3>
              </div>
              <p className="text-xs opacity-85 mt-0.5">
                विश्वास स्कोर: {result.confidence}% · {result.typeName?.[lang] || result.typeName?.hi}
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-card/80 border border-current">
              {result.verdict === 'scam' ? 'ख़तरा' : 'सामान्य'}
            </span>
          </div>

          {/* AI Token Attention Highlighting */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
              AI टोकन ध्यान · MODEL ATTENTION
            </div>
            <div className="p-3.5 rounded-2xl bg-beige/60 border border-line text-xs sm:text-sm leading-relaxed text-ink font-mono break-words">
              {result.annotatedTokens.map((t, idx) =>
                t.isFlagged ? (
                  <mark
                    key={idx}
                    title={t.reason}
                    className="bg-scam/15 text-scam font-semibold px-1 py-0.5 rounded-sm mx-0.5"
                  >
                    {t.text}
                  </mark>
                ) : (
                  <span key={idx}>{t.text}</span>
                )
              )}
            </div>
          </div>

          {/* 3 Action Steps */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
              अब क्या करें · ACTION STEPS
            </div>
            <div className="space-y-1">
              {result.actionSteps.map((step) => (
                <div key={step.num} className="text-xs text-ink flex items-start gap-2 py-0.5">
                  <span className="font-bold text-forest">{step.num}.</span>
                  <span>{step[lang] || step.hi}</span>
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
              <span>रिपोर्ट करें</span>
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
              <span>संबंधित पाठ</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full bg-sun text-ink text-xs font-semibold px-4 py-2 hover:brightness-105 active:scale-95 transition"
            >
              <span>{shared ? '✓ भेजा गया' : 'परिवार को शेयर करें'}</span>
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
