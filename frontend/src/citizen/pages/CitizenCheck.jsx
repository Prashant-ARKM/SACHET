import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { analyzeMessage, SAMPLE_MESSAGES } from '../lib/scamDetector.js'
import { saveRecentCheck } from '../lib/citizenStorage.js'
import { PhoneIcon, AlertIcon, BookIcon } from '../components/CitizenIcons.jsx'
import QrCheck from '../components/QrCheck.jsx'
import { transcribeCall } from '../lib/transcribeCall.js'

// Browser speech-to-text (Chrome / Android). Undefined where not supported: the mic button then hides.
const SpeechRecognitionApi =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined

// Speech engines write English acronyms in Devanagari ("ओटीपी" for OTP). The model learned these
// in Latin letters, so map the common ones back before checking a call.
const SPOKEN_ACRONYMS = [
  ['ओटीपी', 'OTP'], ['केवाईसी', 'KYC'], ['यूपीआई', 'UPI'], ['एसबीआई', 'SBI'], ['सीबीआई', 'CBI'],
  ['एटीएम', 'ATM'], ['क्यूआर', 'QR'], ['फेडेक्स', 'FedEx'], ['एचडीएफसी', 'HDFC'], ['आईसीआईसीआई', 'ICICI'],
  ['पीएनबी', 'PNB'], ['आरबीआई', 'RBI'], ['एपीके', 'APK'], ['ट्राई', 'TRAI'],
]
const normalizeSpokenText = (text) =>
  SPOKEN_ACRONYMS.reduce((out, [spoken, latin]) => out.split(spoken).join(latin), text)

export default function CitizenCheck() {
  const { lang, t } = useOutletContext()
  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('message') // 'message' | 'call' | 'qr'
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [callAnalyzing, setCallAnalyzing] = useState(false)
  const [callText, setCallText] = useState('')
  const [listening, setListening] = useState(false)
  const [listenError, setListenError] = useState('')
  const [speechLang, setSpeechLang] = useState('hi-IN') // most calls are in Hindi
  const recognitionRef = useRef(null)
  // Uploaded call recording -> on-device Whisper transcript
  const [upload, setUpload] = useState({ stage: '', progress: 0, part: 0, parts: 0, error: '', note: '' })
  // Live warning while a call is being listened to
  const [liveAlert, setLiveAlert] = useState(null)
  const liveTimerRef = useRef(null)
  const L3 = (en, hi, cg) => (lang === 'hi' ? hi : lang === 'cg' ? cg : en)

  // Stop the microphone if the user leaves this page while listening
  useEffect(() => () => recognitionRef.current?.abort(), [])
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

  // Shared from another app (WhatsApp, SMS, browser) via the Android Share menu:
  // /citizen/check?text=...&url=... -> fill the box and check it straight away
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const parts = []
    for (const key of ['title', 'text', 'url']) {
      const value = (params.get(key) || '').trim()
      if (value && !parts.some((p) => p.includes(value))) parts.push(value)
    }
    if (!parts.length) return
    const shared = parts.join('\n')
    setActiveTab('message')
    setInputText(shared)
    runCheck(shared)
    // Clear the address so a refresh doesn't check the same message again
    navigate('/citizen/check', { replace: true })
  }, [location.search])

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

  // Sample call transcripts (scam scripts named in the problem statement)
  const CALL_SAMPLES = [
    {
      label: { en: 'Fake bank KYC call', hi: 'फर्जी बैंक KYC कॉल', cg: 'फर्जी बैंक KYC कॉल' },
      text: 'नमस्ते, मैं SBI बैंक के KYC विभाग से बोल रहा हूँ। आपका खाता आज बंद हो जाएगा। अभी आपके मोबाइल पर एक OTP आया होगा, वो बता दीजिए ताकि KYC अपडेट हो सके।',
    },
    {
      label: { en: '"Digital arrest" call', hi: 'डिजिटल अरेस्ट कॉल', cg: 'डिजिटल अरेस्ट कॉल' },
      text: 'Hello sir, main Mumbai police se bol raha hoon. Aapke naam pe ek parcel pakda gaya hai jisme drugs hai. Aap digital arrest mein ho, video call cut mat karna, warna arrest warrant nikal jayega.',
    },
    {
      label: { en: 'Fake courier / customs call', hi: 'फर्जी कूरियर कॉल', cg: 'फर्जी कूरियर कॉल' },
      text: 'Hello madam, FedEx courier se bol rahe hain. Aapka parcel customs mein ruka hai, 2500 rupaye customs fee UPI karna padega nahi to parcel return ho jayega.',
    },
  ]

  const runCallCheck = async (textToEvaluate) => {
    const text = textToEvaluate ?? callText
    if (!text.trim()) return
    setCallAnalyzing(true)
    try {
      const res = await analyzeMessage(normalizeSpokenText(text))
      setResult(res)
      if (res) saveRecentCheck(res)
    } catch (err) {
      console.error('SACHET model failed', err)
      alert('Could not load the detection model. Please check your connection once and retry.')
    }
    setCallAnalyzing(false)
  }

  // Listen to a call played on speaker: speech -> text in the box -> same offline model check
  const startListening = () => {
    if (!SpeechRecognitionApi || listening) return
    if (!navigator.onLine) {
      setListenError(t.listenNeedsNet)
      return
    }
    setListenError('')

    const before = callText.trim()
    let heard = ''
    const rec = new SpeechRecognitionApi()
    rec.lang = speechLang
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (event) => {
      heard = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim()
      const soFar = [before, heard].filter(Boolean).join(' ')
      setCallText(soFar)
      scheduleLiveCheck(soFar)
    }
    rec.onerror = (event) => {
      if (event.error === 'aborted') return
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') setListenError(t.listenDenied)
      else if (event.error === 'no-speech') setListenError(t.listenNoSpeech)
      else setListenError(t.listenNeedsNet)
    }
    rec.onend = () => {
      clearTimeout(liveTimerRef.current)
      liveTimerRef.current = null
      setListening(false)
      recognitionRef.current = null
      if (heard) runCallCheck([before, heard].filter(Boolean).join(' '))
    }

    setLiveAlert(null)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }

  const stopListening = () => recognitionRef.current?.stop()

  // While listening: every 1.5 s (even while the caller keeps talking), re-check everything heard
  // so far with the offline model, and warn the user during the call if it already sounds like a scam.
  const liveTextRef = useRef('')
  const scheduleLiveCheck = (textSoFar) => {
    liveTextRef.current = textSoFar
    if (liveTimerRef.current) return // a check is already scheduled; it will use the latest text
    liveTimerRef.current = setTimeout(async () => {
      liveTimerRef.current = null
      const heardSoFar = liveTextRef.current
      if (heardSoFar.split(/\s+/).length < 6) return
      try {
        const r = await analyzeMessage(normalizeSpokenText(heardSoFar))
        if (r?.verdict === 'scam' && r.confidence >= 70) setLiveAlert(r)
      } catch {
        // the full check still runs when listening stops
      }
    }, 1500)
  }

  // Upload a recorded call: transcribe on the phone with Whisper in 30-second parts,
  // show the transcript as it grows, and stop early once it is clearly a scam.
  const handleRecording = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setResult(null)
    setCallText('')
    setUpload({ stage: 'reading', progress: 0, part: 0, parts: 0, error: '', note: '' })
    try {
      const language = speechLang === 'en-IN' ? 'english' : 'hindi'
      let scamPartsInARow = 0
      const out = await transcribeCall(file, language, {
        onStatus: (st) => setUpload((u) => ({ ...u, ...st, progress: st.progress ?? u.progress })),
        onPartial: (textSoFar) => setCallText(textSoFar),
        shouldStop: async (textSoFar) => {
          try {
            const r = await analyzeMessage(normalizeSpokenText(textSoFar))
            const isScam = r?.verdict === 'scam'
            scamPartsInARow = isScam ? scamPartsInARow + 1 : 0
            // Stop early on a strong signal, or when two parts in a row look like a scam
            // (spoken Hindi transcripts often score only 55-70% even when they are scams)
            return (isScam && r.confidence >= 75) || scamPartsInARow >= 2
          } catch {
            return false
          }
        },
      })
      if (!out.text) throw new Error('no_speech')
      if (out.unclear) {
        setCallText(out.text)
        setUpload({
          stage: '',
          progress: 0,
          part: 0,
          parts: 0,
          note: '',
          error: L3(
            "Couldn't transcribe this recording clearly, so we won't guess. Try a clearer recording (speaker close to the phone), check the call language above, or type what the caller said.",
            'यह रिकॉर्डिंग साफ़ नहीं लिखी जा सकी, इसलिए हम अंदाज़ा नहीं लगाएंगे। साफ़ रिकॉर्डिंग आज़माएँ, ऊपर कॉल की भाषा देखें, या कॉल करने वाले की बात खुद लिखें।',
            'ए रिकॉर्डिंग साफ नइ लिखे जा सकिस, एकर सेती हम अंदाज़ा नइ लगावन। साफ रिकॉर्डिंग चलावव, ऊपर कॉल के भाखा देखव, या फोन करइया के बात खुद लिखव।',
          ),
        })
        return
      }
      const mins = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
      setUpload({
        stage: '',
        progress: 0,
        part: 0,
        parts: 0,
        error: '',
        note: out.stoppedEarly
          ? L3(
              `Scam found in the first ${mins(out.secondsDone)} of ${mins(out.secondsTotal)}, so we stopped early to warn you sooner.`,
              `${mins(out.secondsTotal)} में से पहले ${mins(out.secondsDone)} में ही ठगी मिल गई, इसलिए जल्दी चेतावनी देने के लिए हम रुक गए।`,
              `${mins(out.secondsTotal)} म ले पहिली ${mins(out.secondsDone)} म ही ठगी मिल गे, एकर सेती जल्दी चेताए बर हम रुक गेन।`,
            )
          : '',
      })
      setCallText(out.text)
      runCallCheck(out.text)
    } catch (err) {
      const msg = String(err?.message || '')
      const error =
        msg === 'too_short' || msg === 'no_speech'
          ? L3('No clear speech found in this recording.', 'रिकॉर्डिंग में साफ़ आवाज़ नहीं मिली।', 'रिकॉर्डिंग म साफ आवाज़ नइ मिलिस।')
          : /decode|audio|EncodingError/i.test(msg)
          ? L3("Couldn't read this audio file. Try MP3, M4A or WAV.", 'यह ऑडियो फ़ाइल पढ़ी नहीं जा सकी। MP3, M4A या WAV आज़माएँ।', 'ए ऑडियो फ़ाइल पढ़े नइ जा सकिस। MP3, M4A या WAV चलावव।')
          : L3(
              'The first time, the speech model (about 250 MB) needs internet to download. After that it works offline.',
              'पहली बार आवाज़ पहचानने वाला मॉडल (लगभग 250 MB) डाउनलोड करने के लिए इंटरनेट चाहिए। उसके बाद यह बिना इंटरनेट चलेगा।',
              'पहिली बार आवाज़ पहचाने वाला मॉडल (लगभग 250 MB) डाउनलोड करे बर इंटरनेट लागही। ओकर बाद बिना इंटरनेट चलही।',
            )
      console.error('Call transcription failed', err)
      setUpload({ stage: '', progress: 0, part: 0, parts: 0, error, note: '' })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 overflow-x-auto whitespace-nowrap border border-line rounded-full text-base md:text-sm bg-card p-0.5">
          <button
            type="button"
            onClick={() => {
              recognitionRef.current?.stop()
              setActiveTab('message')
            }}
            className={`px-4 py-3 md:py-1.5 rounded-full font-medium transition ${
              activeTab === 'message' ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
            }`}
          >
            {t.tabMessage}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('call')}
            className={`px-4 py-3 md:py-1.5 rounded-full font-medium transition ${
              activeTab === 'call' ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
            }`}
          >
            {t.tabCall}
          </button>
          <button
            type="button"
            onClick={() => {
              recognitionRef.current?.stop()
              setActiveTab('qr')
            }}
            className={`px-4 py-3 md:py-1.5 rounded-full font-medium transition ${
              activeTab === 'qr' ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
            }`}
          >
            {lang === 'hi' ? 'QR कोड' : lang === 'cg' ? 'QR कोड' : 'QR Code'}
          </button>
        </div>

        {(inputText || callText) && !listening && (
          <button
            onClick={() => {
              setInputText('')
              setCallText('')
              setResult(null)
            }}
            className="text-sm md:text-xs text-muted hover:text-scam font-medium"
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
            className="w-full p-3.5 rounded-2xl border border-line bg-beige/40 text-ink text-lg md:text-sm outline-none focus:border-forest resize-none placeholder:text-muted/60 min-h-[140px] md:min-h-0"
          />

          <div className="flex flex-col-reverse md:flex-row md:flex-wrap md:items-center md:justify-between gap-3 md:gap-2 pt-1">
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
                  className="text-sm md:text-xs bg-beige hover:bg-mint text-ink font-medium px-3 py-2.5 md:py-1 rounded-full border border-line transition"
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
              className="w-full md:w-auto h-14 md:h-auto rounded-full bg-forest text-card text-lg md:text-sm font-semibold px-5 md:py-2 hover:bg-forest-2 active:scale-95 transition disabled:opacity-40"
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
          <span className="inline-block text-sm md:text-xs font-semibold text-warn bg-sun-tint px-3 py-1 rounded-full">
            {t.callTabNoticeSub}
          </span>

          <div className="flex items-center gap-2">
            <div className="grid place-items-center w-8 h-8 rounded-full bg-mint text-forest shrink-0">
              <PhoneIcon size={16} />
            </div>
            <p className="text-base md:text-xs font-semibold text-ink">{t.callUploadLabel}</p>
          </div>

          {/* Listen to the call (speech -> text). Hidden where the browser has no speech recognition. */}
          {SpeechRecognitionApi && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-3 md:py-2 text-base md:text-sm font-semibold active:scale-95 transition ${
                  listening ? 'bg-scam text-card' : 'bg-forest text-card hover:bg-forest-2'
                }`}
              >
                <span aria-hidden="true">{listening ? '⏹' : '🎤'}</span>
                <span>{listening ? t.btnStopListen : t.btnListenCall}</span>
              </button>

              <div className="flex border border-line rounded-full overflow-hidden text-sm md:text-xs bg-card p-0.5">
                {[
                  ['hi-IN', 'हिंदी'],
                  ['en-IN', 'English'],
                ].map(([code, label]) => (
                  <button
                    key={code}
                    type="button"
                    disabled={listening}
                    onClick={() => setSpeechLang(code)}
                    className={`px-3 py-1.5 md:py-1 rounded-full font-medium transition disabled:opacity-50 ${
                      speechLang === code ? 'bg-mint text-forest' : 'text-ink hover:bg-beige'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {listening && (
                <span className="text-sm md:text-xs font-medium text-scam animate-pulse">{t.listeningHint}</span>
              )}
            </div>
          )}

          {listenError && <p className="text-sm md:text-xs font-medium text-scam">{listenError}</p>}

          {/* Live warning: shown during the call, as soon as it sounds like a scam */}
          {listening && liveAlert && (
            <div role="alert" className="p-3.5 rounded-2xl border border-scam/30 bg-blush space-y-1 animate-fadeIn">
              <p className="text-base md:text-sm font-bold text-scam">
                ⚠️ {L3('This sounds like a scam call', 'यह ठगी वाली कॉल लगती है', 'ए ठगी वाला कॉल लगथे')}:{' '}
                {liveAlert.typeName?.[lang] || liveAlert.typeName?.en}
              </p>
              <p className="text-sm md:text-xs text-ink font-medium">
                {L3(
                  "Don't share OTP, PIN or money. Cut the call.",
                  'OTP, पिन या पैसे न दें। फोन काट दें।',
                  'ओटीपी, पिन या पैसा झन देवव। फोन काट देवव।',
                )}
              </p>
              <p className="text-xs text-scam/80">
                {L3('Heard', 'सुने गए शब्द', 'सुने गे शब्द')}:{' '}
                {liveAlert.annotatedTokens.filter((tk) => tk.isFlagged).slice(0, 6).map((tk) => tk.text).join(', ')}
              </p>
            </div>
          )}

          {/* Upload a recorded call: transcribed on the phone (Whisper), then checked by the same model */}
          <div className="border border-dashed border-line rounded-2xl p-4 bg-beige/30 space-y-2">
            <label
              className={`inline-flex items-center gap-2 rounded-full px-4 py-3 md:py-2 text-base md:text-sm font-semibold transition cursor-pointer ${
                upload.stage ? 'bg-line text-muted pointer-events-none' : 'bg-forest text-card hover:bg-forest-2 active:scale-95'
              }`}
            >
              <span aria-hidden="true">📁</span>
              {L3('Upload call recording', 'कॉल रिकॉर्डिंग अपलोड करें', 'कॉल रिकॉर्डिंग अपलोड करव')}
              <input type="file" accept="audio/*" onChange={handleRecording} disabled={Boolean(upload.stage)} className="sr-only" />
            </label>
            <p className="text-sm md:text-xs text-muted">
              {L3(
                'Transcribed on your phone with Whisper AI. The first time it downloads about 250 MB; after that it works offline.',
                'आपके फ़ोन पर ही Whisper AI से लिखा जाता है। पहली बार लगभग 250 MB डाउनलोड होता है, उसके बाद बिना इंटरनेट चलता है।',
                'तुंहर फ़ोन म ही Whisper AI ले लिखे जाथे। पहिली बार लगभग 250 MB डाउनलोड होथे, ओकर बाद बिना इंटरनेट चलथे।',
              )}
            </p>
            {upload.stage === 'reading' && (
              <p className="text-sm md:text-xs font-medium text-forest">{L3('Reading the recording…', 'रिकॉर्डिंग पढ़ी जा रही है…', 'रिकॉर्डिंग पढ़त हन…')}</p>
            )}
            {upload.stage === 'loading' && (
              <p className="text-sm md:text-xs font-medium text-forest animate-pulse">
                {L3('Starting the speech engine (first time: downloading, please wait)…', 'आवाज़ पहचानने वाला इंजन शुरू हो रहा है (पहली बार डाउनलोड, कृपया रुकें)…', 'आवाज़ पहचाने वाला इंजन चालू होवत हे (पहिली बार डाउनलोड, थोरकुन रुकव)…')}
              </p>
            )}
            {upload.stage === 'download' && (
              <div className="space-y-1">
                <p className="text-sm md:text-xs font-medium text-forest">
                  {L3('Downloading the speech model (first time only)…', 'आवाज़ का मॉडल डाउनलोड हो रहा है (सिर्फ़ पहली बार)…', 'आवाज़ के मॉडल डाउनलोड होवत हे (खाली पहिली बार)…')}{' '}
                  {Math.round(upload.progress)}%
                </p>
                <div className="h-1.5 rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-forest transition-all" style={{ width: `${Math.round(upload.progress)}%` }} />
                </div>
              </div>
            )}
            {upload.stage === 'transcribing' && (
              <p className="text-sm md:text-xs font-medium text-forest animate-pulse">
                {L3('Transcribing on your phone', 'आपके फ़ोन पर लिखा जा रहा है', 'तुंहर फ़ोन म लिखे जावत हे')}
                {upload.parts > 1 ? ` · ${L3('part', 'भाग', 'भाग')} ${upload.part}/${upload.parts}` : ''}…
              </p>
            )}
            {upload.note && <p className="text-sm md:text-xs font-semibold text-scam">⚠️ {upload.note}</p>}
            {upload.error && <p className="text-sm md:text-xs font-medium text-scam">{upload.error}</p>}
          </div>

          <textarea
            rows="3"
            value={callText}
            onChange={(e) => setCallText(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-line bg-beige/40 text-ink text-lg md:text-sm outline-none focus:border-forest resize-none min-h-[120px] md:min-h-0"
          />

          <div className="flex flex-col-reverse md:flex-row md:flex-wrap md:items-center md:justify-between gap-3 md:gap-2">
            <div className="flex flex-wrap gap-1.5">
              {CALL_SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCallText(s.text)
                    runCallCheck(s.text)
                  }}
                  className="text-sm md:text-xs bg-beige hover:bg-mint text-ink font-medium px-3 py-2.5 md:py-1 rounded-full border border-line transition"
                >
                  {s.label[lang] || s.label.en}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => runCallCheck()}
              disabled={!callText.trim() || callAnalyzing}
              className="w-full md:w-auto h-14 md:h-auto rounded-full bg-forest text-card text-lg md:text-sm font-semibold px-5 md:py-2 hover:bg-forest-2 active:scale-95 transition disabled:opacity-40"
            >
              {callAnalyzing
                ? (lang === 'hi' ? 'जाँच हो रही है…' : lang === 'cg' ? 'जाँच चलत हे…' : 'Analyzing…')
                : `${t.btnCheckNow} →`}
            </button>
          </div>
        </section>
      )}

      {/* TAB 3: QR CODE (fake-QR checker) */}
      {activeTab === 'qr' && (
        <QrCheck
          lang={lang}
          onCheckLink={(url) => {
            setActiveTab('message')
            setInputText(url)
            runCheck(url)
          }}
        />
      )}

      {/* RESULT CARD */}
      {result && activeTab !== 'qr' && (
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
              {result.verdict === 'scam' && (
                <p className="text-base md:text-xs opacity-85 mt-0.5">
                  {result.typeName?.[lang] || result.typeName?.en || result.typeName?.hi}
                </p>
              )}
            </div>

            <span className="text-sm md:text-xs font-semibold px-3 py-1 rounded-full bg-card/80 border border-current">
              {result.verdict === 'scam'
                ? (lang === 'hi' ? 'ख़तरा' : lang === 'cg' ? 'खतरा' : 'Threat')
                : (lang === 'hi' ? 'कम संकेत' : lang === 'cg' ? 'कम संकेत' : 'Low signal')}
            </span>
          </div>

          {/* AI Token Attention Highlighting */}
          <div className="space-y-1.5">
            <div className="text-sm md:text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
              {t.whyTitle}
            </div>
            <div className="p-3.5 rounded-2xl bg-beige/60 border border-line text-sm sm:text-sm leading-relaxed text-ink font-mono break-words">
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
            <div className="text-sm md:text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
              {t.whatToDoTitle}
            </div>
            <div className="space-y-1">
              {result.actionSteps.map((step) => (
                <div key={step.num} className="text-sm md:text-xs text-ink flex items-start gap-2 py-0.5">
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
              className="inline-flex items-center gap-1.5 rounded-full bg-scam text-card text-sm md:text-xs font-semibold px-4 py-3 md:py-2 hover:brightness-110 active:scale-95 transition"
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
              className="inline-flex items-center gap-1.5 rounded-full bg-forest text-card text-sm md:text-xs font-semibold px-4 py-3 md:py-2 hover:bg-forest-2 active:scale-95 transition"
            >
              <BookIcon size={14} />
              <span>{t.btnRelatedLesson}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full bg-sun text-ink text-sm md:text-xs font-semibold px-4 py-3 md:py-2 hover:brightness-105 active:scale-95 transition"
            >
              <span>{shared ? '✓ ' + t.shareTextSuccess : t.btnShareFamily}</span>
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
