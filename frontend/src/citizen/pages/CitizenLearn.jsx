import { useState, useEffect } from 'react'
import { useLocation, useOutletContext } from 'react-router-dom'
import { LESSONS, QUIZ_QUESTIONS } from '../data/lessonsData.js'
import { saveScore } from '../lib/citizenStorage.js'

export default function CitizenLearn() {
  const { district, lang, t, score, setScore } = useOutletContext()
  const location = useLocation()

  // Audio language toggle: 'hi' | 'cg'
  const [audioLang, setAudioLang] = useState('hi')
  const [playingLessonId, setPlayingLessonId] = useState(null)
  const [activeLessonId, setActiveLessonId] = useState(
    location.state?.highlightLessonId || 'otp'
  )

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answersState, setAnswersState] = useState([]) // array of booleans
  const [quizCompleted, setQuizCompleted] = useState(false)

  useEffect(() => {
    if (location.state?.highlightLessonId) {
      setActiveLessonId(location.state.highlightLessonId)
      const el = document.getElementById(`lesson-${location.state.highlightLessonId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.state])

  // Stop speech if leaving
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Web Speech API for Hindi & Chhattisgarhi audio narration
  const handleToggleAudio = (lesson) => {
    if (playingLessonId === lesson.id) {
      if (window.speechSynthesis) window.speechSynthesis.cancel()
      setPlayingLessonId(null)
      return
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const textToSpeak = lesson.audioScript[audioLang] || lesson.audioScript.hi
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = 'hi-IN'
      utterance.rate = 0.9 // slightly slower for first-time phone users

      utterance.onend = () => setPlayingLessonId(null)
      utterance.onerror = () => setPlayingLessonId(null)

      setPlayingLessonId(lesson.id)
      window.speechSynthesis.speak(utterance)
    } else {
      // Fallback state simulator
      setPlayingLessonId(lesson.id)
      setTimeout(() => setPlayingLessonId(null), 5000)
    }
  }

  // Quiz Answer Handler
  const handleSelectOption = (option, optIdx) => {
    if (selectedAnswer !== null) return // prevent double answering
    setSelectedAnswer(optIdx)

    const isCorrect = option.correct
    const updatedAnswers = [...answersState, isCorrect]
    setAnswersState(updatedAnswers)

    setTimeout(() => {
      if (currentQIndex + 1 < QUIZ_QUESTIONS.length) {
        setCurrentQIndex(currentQIndex + 1)
        setSelectedAnswer(null)
      } else {
        // Quiz completed, calculate final score
        const correctCount = updatedAnswers.filter(Boolean).length
        const finalScore = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100)
        setScore(finalScore)
        saveScore(finalScore)
        setQuizCompleted(true)
      }
    }, 1800)
  }

  const handleRestartQuiz = () => {
    setQuizStarted(true)
    setCurrentQIndex(0)
    setSelectedAnswer(null)
    setAnswersState([])
    setQuizCompleted(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title & Dialect Selector */}
      <div className="bg-card border border-line rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-leaf bg-mint px-2.5 py-1 rounded-full">
            डिजिटल साक्षरता (Literacy)
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink mt-2">
            {t.learnHeading}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            {t.learnSubheading}
          </p>
        </div>

        {/* Audio Dialect Toggle */}
        <div className="bg-beige p-1 rounded-2xl border border-line flex items-center gap-1 shrink-0">
          <span className="text-xs font-bold text-muted px-2">
            {t.audioLanguage}
          </span>
          <button
            type="button"
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel()
              setPlayingLessonId(null)
              setAudioLang('hi')
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              audioLang === 'hi'
                ? 'bg-forest text-card shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            हिंदी
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel()
              setPlayingLessonId(null)
              setAudioLang('cg')
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              audioLang === 'cg'
                ? 'bg-forest text-card shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            छत्तीसगढ़ी
          </button>
        </div>
      </div>

      {/* 4 VISUAL LESSONS (OTP · ATM PIN · UPI PIN · QR) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-ink flex items-center gap-2">
            <span>📚</span>
            <span>4 बुनियादी सुरक्षा नियम</span>
          </h2>
          <span className="text-xs text-muted font-bold">
            कार्ड छूकर ऑडियो सुनें 🔊
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {LESSONS.map((lesson) => {
            const isPlaying = playingLessonId === lesson.id
            const isHighlighted = activeLessonId === lesson.id

            return (
              <div
                key={lesson.id}
                id={`lesson-${lesson.id}`}
                className={`bg-card rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                  isHighlighted
                    ? 'border-forest ring-4 ring-mint/60'
                    : 'border-line hover:border-forest/50'
                }`}
              >
                {/* Lesson Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: lesson.bgColor, color: lesson.accent }}
                    >
                      {lesson.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleAudio(lesson)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs ${
                        isPlaying
                          ? 'bg-scam text-card animate-pulse'
                          : 'bg-forest text-card hover:bg-forest-2'
                      }`}
                    >
                      <span>{isPlaying ? '⏸️' : '🔊'}</span>
                      <span>
                        {isPlaying
                          ? t.btnPause
                          : `${audioLang === 'cg' ? 'छ.ग. म सुनव' : 'हिंदी में सुनें'}`}
                      </span>
                    </button>
                  </div>

                  <h3 className="text-xl font-bold font-display text-ink pt-1">
                    {lesson.title[lang] || lesson.title.hi}
                  </h3>
                  <p className="text-xs font-semibold text-muted">
                    {lesson.tagline[lang] || lesson.tagline.hi}
                  </p>
                </div>

                {/* Audio Script Banner when playing */}
                {isPlaying && (
                  <div className="bg-mint/60 border border-forest/30 p-3 rounded-2xl text-xs text-ink leading-relaxed animate-fadeIn">
                    <p className="font-bold text-forest flex items-center gap-1 mb-1">
                      <span>🎙️</span> ऑडियो चल रहा है:
                    </p>
                    <p>{lesson.audioScript[audioLang]}</p>
                  </div>
                )}

                {/* DOs and DONTs */}
                <div className="space-y-2.5 text-xs">
                  {/* DOs */}
                  <div className="space-y-1">
                    {lesson.dos.map((d, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-safe">
                        <span className="font-bold text-sm shrink-0">✓</span>
                        <span className="text-ink font-medium">
                          {d[lang] || d.hi}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* DONTs */}
                  <div className="space-y-1">
                    {lesson.donts.map((d, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-scam">
                        <span className="font-bold text-sm shrink-0">✕</span>
                        <span className="text-ink font-medium">
                          {d[lang] || d.hi}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Golden Rule Footer */}
                <div
                  className="p-3 rounded-2xl text-xs font-bold"
                  style={{ backgroundColor: lesson.bgColor, color: lesson.accent }}
                >
                  {lesson.goldenRule[lang] || lesson.goldenRule.hi}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* QUIZ → DIGITAL FINANCIAL LITERACY SCORE */}
      <div className="bg-card border-2 border-forest/30 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-forest bg-mint px-2.5 py-0.5 rounded-full">
              आत्म-परीक्षण (Self Test)
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-ink mt-1">
              {t.quizTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              {t.quizDesc}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-beige px-4 py-2.5 rounded-2xl border border-line">
            <span className="text-xs font-bold text-muted">{t.yourScore}</span>
            <span className="text-xl font-display font-extrabold text-forest">
              {score}/100
            </span>
          </div>
        </div>

        {/* Quiz Flow */}
        {!quizStarted && !quizCompleted ? (
          <div className="bg-beige/60 border border-line rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-forest text-card mx-auto flex items-center justify-center text-3xl font-bold shadow-xs">
              🎯
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <p className="font-bold text-lg text-ink">
                क्या आप असली और नकली में अंतर पहचान सकते हैं?
              </p>
              <p className="text-xs text-muted">
                सिर्फ 4 आसान परिस्थितियां देखें और जानें कि आप कितने सचेत हैं।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuizStarted(true)}
              className="bg-forest hover:bg-forest-2 text-card font-bold text-base px-6 py-3.5 rounded-2xl shadow-md active:scale-98 transition-all inline-flex items-center gap-2"
            >
              <span>{t.btnStartQuiz}</span>
              <span>➔</span>
            </button>
          </div>
        ) : quizCompleted ? (
          /* Quiz Results & Certificate */
          <div className="bg-mint/40 border-2 border-leaf rounded-3xl p-6 sm:p-8 text-center space-y-5 animate-fadeIn">
            <div className="text-4xl animate-bounce">🏆</div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-display text-forest">
                {t.congratsTitle}
              </h3>
              <p className="text-sm font-semibold text-ink">
                आपका नया डिजिटल सुरक्षा स्कोर: <span className="text-forest text-xl font-extrabold">{score}/100</span>
              </p>
            </div>

            {/* Certificate Widget */}
            <div className="bg-card max-w-md mx-auto p-6 rounded-2xl border-4 border-double border-forest/30 shadow-xs text-center space-y-3">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                सचेत डिजिटल सुरक्षा प्रमाण पत्र
              </p>
              <p className="text-base font-bold text-ink">
                नागरिक • ज़िला: {district}
              </p>
              <p className="text-xs text-muted leading-relaxed">
                इन्होंने वित्तीय धोखाधड़ी (OTP, PIN, QR) से सुरक्षा के सभी 4 पाठ सफलतापूर्वक पूर्ण किए हैं।
              </p>
              <div className="pt-2 text-xs font-extrabold text-forest">
                ★ SACHET CHHATTISGARH VERIFIED ★
              </div>
            </div>

            <button
              type="button"
              onClick={handleRestartQuiz}
              className="bg-forest text-card font-bold text-sm px-5 py-3 rounded-xl hover:bg-forest-2 transition-colors shadow-xs"
            >
              🔄 {t.btnRetryQuiz}
            </button>
          </div>
        ) : (
          /* Active Question */
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-muted border-b border-line pb-2">
              <span>
                प्रश्न {currentQIndex + 1} / {QUIZ_QUESTIONS.length}
              </span>
              <span>
                प्रगति: {Math.round(((currentQIndex) / QUIZ_QUESTIONS.length) * 100)}%
              </span>
            </div>

            <div className="bg-beige/70 p-5 rounded-2xl border border-line">
              <p className="text-base sm:text-lg font-bold text-ink leading-relaxed">
                {QUIZ_QUESTIONS[currentQIndex].question[lang] ||
                  QUIZ_QUESTIONS[currentQIndex].question.hi}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {QUIZ_QUESTIONS[currentQIndex].options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx
                let btnStyle = 'bg-card hover:bg-beige border-line text-ink'
                if (selectedAnswer !== null) {
                  if (opt.correct) {
                    btnStyle = 'bg-mint text-forest border-leaf font-bold ring-2 ring-leaf/40'
                  } else if (isSelected && !opt.correct) {
                    btnStyle = 'bg-blush text-scam border-scam font-bold'
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt, idx)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-2xl border-2 text-left text-sm sm:text-base font-semibold transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <span>{opt.text[lang] || opt.text.hi}</span>
                    {selectedAnswer !== null && (
                      <span className="text-lg">
                        {opt.correct ? '✓' : isSelected ? '✕' : ''}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Explanation when answered */}
            {selectedAnswer !== null && (
              <div className="p-4 rounded-2xl bg-card border border-line text-xs sm:text-sm text-ink leading-relaxed animate-fadeIn">
                <p className="font-bold text-forest mb-0.5">व्याख्या:</p>
                <p>
                  {QUIZ_QUESTIONS[currentQIndex].explanation[lang] ||
                    QUIZ_QUESTIONS[currentQIndex].explanation.hi}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

