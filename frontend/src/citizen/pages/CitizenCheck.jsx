import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { analyzeMessage, SAMPLE_MESSAGES } from '../lib/scamDetector.js'
import { saveRecentCheck } from '../lib/citizenStorage.js'

export default function CitizenCheck() {
  const { lang, t } = useOutletContext()
  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('message') // 'message' | 'call'
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [shareNotice, setShareNotice] = useState(false)

  // Call simulation state
  const [audioFile, setAudioFile] = useState(null)
  const [callAnalyzing, setCallAnalyzing] = useState(false)

  // Handle incoming prefilled state from CitizenHome
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
    }, 450)
  }

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const clip = await navigator.clipboard.readText()
        if (clip) setInputText(clip)
      }
    } catch {}
  }

  const handleClear = () => {
    setInputText('')
    setResult(null)
  }

  const handleSample = (sample) => {
    setInputText(sample.text)
    runCheck(sample.text)
  }

  // Share with family via WhatsApp / Web Share
  const handleShareWithFamily = async () => {
    if (!result) return
    const shareText = `⚠️ साइबर धोखाधड़ी चेतावनी (SACHET):\n\nमुझे यह संदेहास्पद संदेश मिला था जिसे सचेत मॉडल ने "${
      result.verdict === 'scam' ? 'धोखाधड़ी (SCAM)' : 'सुरक्षित'
    }" पाया है:\n\n"${result.originalText}"\n\nकृपया सावधान रहें — कभी भी किसी को अपना OTP, बैंक पिन या QR कोड स्कैन करके पैसे न भेजें! सुरक्षित रहें।`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SACHET साइबर धोखाधड़ी चेतावनी',
          text: shareText,
        })
        setShareNotice(true)
        setTimeout(() => setShareNotice(false), 3000)
        return
      } catch {}
    }

    // WhatsApp Fallback
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    window.open(waUrl, '_blank')
    setShareNotice(true)
    setTimeout(() => setShareNotice(false), 3000)
  }

  // Call check demo simulator
  const handleSampleCall = () => {
    setCallAnalyzing(true)
    setTimeout(() => {
      setCallAnalyzing(false)
      const fakeCallTranscript =
        'कॉल रिकॉर्डिंग: नमस्ते, मैं दिल्ली साइबर अपराध प्रकोष्ठ से पुलिस अधिकारी बोल रहा हूँ। आपके नाम से ताइवान कूरियर में अवैध नशीला पदार्थ मिला है। आपको तुरंत इस वीडियो कॉल पर डिजिटल अरेस्ट में रहना होगा जब तक हम आपकी बैंक संपत्ति की जांच न कर लें।'
      const res = analyzeMessage(fakeCallTranscript)
      setResult(res)
      setActiveTab('message') // switch back to result view
    }, 1500)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Tabs */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink flex items-center gap-2.5">
          <span>🛡️</span>
          <span>संदेश व कॉल जाँच (Check Fraud)</span>
        </h1>
        <p className="text-sm text-muted">
          किसी भी संदेहास्पद SMS, WhatsApp संदेश, वेबसाइट लिंक या कॉल रिकॉर्डिंग की तुरंत जाँच करें।
        </p>

        {/* Tab Switcher */}
        <div className="bg-card p-1 rounded-2xl border border-line flex gap-1 shadow-xs max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('message')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'message'
                ? 'bg-forest text-card shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <span>💬</span>
            <span>{t.tabMessage}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('call')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'call'
                ? 'bg-forest text-card shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <span>📞</span>
            <span>{t.tabCall}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MESSAGE CHECK */}
      {activeTab === 'message' && (
        <div className="bg-card border border-line rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-ink">
                संदेश या लिंक दर्ज करें:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-xs font-bold bg-beige hover:bg-mint text-forest px-3 py-1 rounded-lg border border-line transition-colors flex items-center gap-1"
                >
                  📋 {t.btnPaste}
                </button>
                {inputText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs font-bold text-scam hover:underline px-2 py-1"
                  >
                    ✕ {t.btnClear}
                  </button>
                )}
              </div>
            </div>

            <textarea
              rows="4"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.checkInputPlaceholder}
              className="w-full p-4 rounded-2xl border-2 border-line bg-beige/50 text-ink text-base focus:outline-hidden focus:border-forest transition-colors resize-none placeholder:text-muted/60"
            />
          </div>

          {/* Sample Chips */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-muted">त्वरित नमूना संदेश जाँचें:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_MESSAGES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSample(s)}
                  className="text-xs bg-beige hover:bg-mint text-ink font-semibold px-3 py-1.5 rounded-xl border border-line transition-all active:scale-95 text-left"
                >
                  ⚡ {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Check Button */}
          <button
            type="button"
            onClick={() => runCheck()}
            disabled={!inputText.trim() || isAnalyzing}
            className="w-full bg-forest hover:bg-forest-2 disabled:opacity-40 text-card font-bold text-lg py-4 rounded-2xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <span className="animate-pulse">विश्लेषण हो रहा है...</span>
            ) : (
              <>
                <span>🔍</span>
                <span>{t.btnCheckNow}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 2: CALL RECORDING CHECK */}
      {activeTab === 'call' && (
        <div className="bg-card border border-line rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          {/* Schedule Notice Banner */}
          <div className="bg-sun-tint border border-warn/30 p-4 rounded-2xl text-ink space-y-1">
            <div className="flex items-center gap-2 text-warn font-extrabold text-sm sm:text-base">
              <span>⏰</span>
              <span>{t.callTabNoticeTitle}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-muted">
              {t.callTabNoticeSub} (Screen built now, switched on after 10:00).
            </p>
          </div>

          {/* Upload Box */}
          <div className="border-2 border-dashed border-line rounded-2xl p-6 sm:p-8 text-center space-y-3 bg-beige/40">
            <div className="w-16 h-16 rounded-full bg-mint text-forest mx-auto flex items-center justify-center text-2xl font-bold">
              🎙️
            </div>
            <div>
              <p className="font-bold text-base text-ink">{t.callUploadLabel}</p>
              <p className="text-xs text-muted mt-1">
                ऑडियो फ़ाइल (.mp3, .wav, .m4a) अपलोड करें। हमारा वॉइस AI मॉडल कॉल में धोखाधड़ी के संकेत पहचानेगा।
              </p>
            </div>
            <input
              type="file"
              accept="audio/*"
              id="audio-upload"
              onChange={(e) => setAudioFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="audio-upload"
              className="inline-block bg-forest text-card font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer hover:bg-forest-2 transition-colors shadow-xs"
            >
              📁 ऑडियो चुनें
            </label>
            {audioFile && (
              <p className="text-xs text-forest font-semibold">
                चयनित: {audioFile.name}
              </p>
            )}
          </div>

          {/* Sample Call Simulator */}
          <div className="bg-beige p-4 rounded-2xl border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm text-ink">नमूना डिजिटल अरेस्ट कॉल का परीक्षण करें</p>
              <p className="text-xs text-muted">
                देखें कि मॉडल फर्जी पुलिस या CBI कॉल को कैसे पकड़ता है।
              </p>
            </div>
            <button
              type="button"
              onClick={handleSampleCall}
              disabled={callAnalyzing}
              className="w-full sm:w-auto bg-scam text-card font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl hover:bg-scam/90 transition-all shrink-0 active:scale-95"
            >
              {callAnalyzing ? 'ऑडियो विश्लेषण...' : '▶ ' + t.callSampleBtn}
            </button>
          </div>
        </div>
      )}

      {/* RESULT SECTION */}
      {result && (
        <div className="bg-card border-2 border-line rounded-3xl p-5 sm:p-8 shadow-md space-y-6 animate-fadeIn">
          {/* 1. VERDICT */}
          <div
            className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              result.verdict === 'scam'
                ? 'bg-blush border-scam text-scam'
                : 'bg-mint/40 border-safe text-safe'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <span className="text-3xl sm:text-4xl">
                {result.verdict === 'scam' ? '🚨' : '✅'}
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-display leading-tight">
                  {result.verdict === 'scam' ? t.verdictScam : t.verdictGenuine}
                </h2>
                <p className="text-xs font-semibold opacity-90 mt-0.5">
                  AI विश्वास स्कोर: {result.confidence}% विश्वसनीयता
                </p>
              </div>
            </div>

            <div className="bg-card/90 px-3.5 py-1.5 rounded-full border border-current text-xs font-bold self-start sm:self-auto">
              <span>{result.typeName?.[lang] || result.typeName?.hi}</span>
            </div>
          </div>

          {/* 2. WHY: HIGHLIGHTED WORDS OR PHRASES (TRAINED MODEL ATTENTION) */}
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <span>🧠</span>
                <span>{t.whyTitle}</span>
              </h3>
              <p className="text-xs text-muted mt-0.5">
                {t.whySubtitle}
              </p>
            </div>

            {/* Tokenized Text with Highlights */}
            <div className="p-4 sm:p-5 rounded-2xl bg-beige/80 border border-line text-sm sm:text-base leading-relaxed text-ink font-mono break-words">
              {result.annotatedTokens.map((token, idx) => {
                if (token.isFlagged) {
                  return (
                    <mark
                      key={idx}
                      title={token.reason}
                      className="bg-scam/20 border-b-2 border-scam text-scam font-bold px-1.5 py-0.5 rounded-md mx-0.5 inline-block group relative"
                    >
                      {token.text}
                      <span className="text-[10px] bg-scam text-card px-1 py-0.2 rounded-xs ml-1 font-sans">
                        संदिग्ध
                      </span>
                    </mark>
                  )
                }
                return <span key={idx}>{token.text}</span>
              })}
            </div>

            {/* Flagged reasons summary */}
            {result.flaggedReasons && result.flaggedReasons.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-bold text-muted">पहचाने गए मुख्य खतरे:</p>
                <div className="flex flex-wrap gap-2">
                  {result.flaggedReasons.map((r, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blush text-scam border border-scam/30 font-semibold px-2.5 py-1 rounded-lg"
                    >
                      • {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. SCAM TYPE & EXPLANATION */}
          <div className="bg-beige/60 p-4 rounded-2xl border border-line space-y-1">
            <span className="text-xs font-bold text-muted uppercase">
              {t.scamTypeLabel}:
            </span>
            <p className="font-bold text-base text-ink">
              {result.typeName?.[lang] || result.typeName?.hi}
            </p>
            <p className="text-xs text-muted leading-relaxed pt-1">
              {result.explanation}
            </p>
          </div>

          {/* 4. WHAT TO DO NOW */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-ink flex items-center gap-2">
              <span>⚡</span>
              <span>{t.whatToDoTitle}</span>
            </h3>
            <div className="space-y-2">
              {result.actionSteps.map((step) => (
                <div
                  key={step.num}
                  className="flex items-start gap-3 p-3 rounded-xl bg-card border border-line text-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-forest text-card flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {step.num}
                  </span>
                  <span className="font-semibold text-ink">
                    {step[lang] || step.hi}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. ACTION BUTTONS: REPORT · RELATED LESSON · SHARE WITH FAMILY */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {/* Report Button */}
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
              className="flex-1 bg-scam hover:bg-scam/90 text-card font-bold text-base py-3.5 px-4 rounded-2xl shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>🚨</span>
              <span>{t.btnReportThis}</span>
            </button>

            {/* Related Lesson Button */}
            <button
              type="button"
              onClick={() =>
                navigate('/citizen/learn', {
                  state: { highlightLessonId: result.relatedLessonId },
                })
              }
              className="flex-1 bg-forest hover:bg-forest-2 text-card font-bold text-base py-3.5 px-4 rounded-2xl shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>📖</span>
              <span>{t.btnRelatedLesson}</span>
            </button>

            {/* Share with Family Button */}
            <button
              type="button"
              onClick={handleShareWithFamily}
              className="flex-1 bg-sun hover:bg-sun/90 text-ink font-bold text-base py-3.5 px-4 rounded-2xl shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>👨‍👩‍👧‍👦</span>
              <span>{t.btnShareFamily}</span>
            </button>
          </div>

          {shareNotice && (
            <p className="text-xs text-center text-safe font-bold animate-pulse">
              ✓ {t.shareTextSuccess}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

