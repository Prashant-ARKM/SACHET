import { useState, useEffect } from 'react'
import { useLocation, useOutletContext } from 'react-router-dom'
import { LESSONS, QUIZ_QUESTIONS } from '../data/lessonsData.js'
import { saveScore } from '../lib/citizenStorage.js'
import { SpeakerIcon, BookIcon, CheckIcon } from '../components/CitizenIcons.jsx'

export default function CitizenLearn() {
  const { lang, t, score, setScore } = useOutletContext()
  const location = useLocation()

  const [audioLang, setAudioLang] = useState('en')
  const [playingId, setPlayingId] = useState(null)
  const [highlightId, setHighlightId] = useState(location.state?.highlightLessonId || null)

  // Quiz states
  const [quizStarted, setQuizStarted] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [chosenOpt, setChosenOpt] = useState(null)
  const [correctList, setCorrectList] = useState([])
  const [quizDone, setQuizDone] = useState(false)

  // Sync audio language when overall language switches
  useEffect(() => {
    setAudioLang(lang === 'hi' ? 'hi' : lang === 'cg' ? 'cg' : 'en')
  }, [lang])

  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  const toggleAudio = (lesson) => {
    if (playingId === lesson.id) {
      window.speechSynthesis?.cancel()
      setPlayingId(null)
      return
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const text = lesson.audioScript[audioLang] || lesson.audioScript.en || lesson.audioScript.hi
      const u = new SpeechSynthesisUtterance(text)
      u.lang = audioLang === 'en' ? 'en-IN' : 'hi-IN'
      u.rate = 0.95
      u.onend = () => setPlayingId(null)
      u.onerror = () => setPlayingId(null)
      setPlayingId(lesson.id)
      window.speechSynthesis.speak(u)
    }
  }

  const handleAnswer = (opt, idx) => {
    if (chosenOpt !== null) return
    setChosenOpt(idx)
    const updated = [...correctList, opt.correct]
    setCorrectList(updated)

    setTimeout(() => {
      if (qIndex + 1 < QUIZ_QUESTIONS.length) {
        setQIndex(qIndex + 1)
        setChosenOpt(null)
      } else {
        const hits = updated.filter(Boolean).length
        const finalScore = Math.round((hits / QUIZ_QUESTIONS.length) * 100)
        setScore(finalScore)
        saveScore(finalScore)
        setQuizDone(true)
      }
    }, 1200)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. 4 VISUAL LESSONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-mint text-forest">
              <BookIcon size={16} />
            </span>
            <h2 className="text-sm font-semibold text-ink">
              {lang === 'hi' ? '4 बुनियादी सुरक्षा नियम' : lang === 'cg' ? '4 बुनियादी सुरक्षा नियम' : '4 Core Safety Rules'}
            </h2>
          </div>

          {/* Audio Dialect Switcher */}
          <div className="flex border border-line rounded-full overflow-hidden text-xs bg-card p-0.5">
            {[
              { id: 'en', label: 'Audio: EN' },
              { id: 'hi', label: 'ऑडियो: हिंदी' },
              { id: 'cg', label: 'छ.ग.' },
            ].map((al) => (
              <button
                key={al.id}
                onClick={() => {
                  window.speechSynthesis?.cancel()
                  setPlayingId(null)
                  setAudioLang(al.id)
                }}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  audioLang === al.id ? 'bg-forest text-card' : 'text-ink hover:bg-beige'
                }`}
              >
                {al.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LESSONS.map((lesson) => {
            const isPlaying = playingId === lesson.id
            const isHighlighted = highlightId === lesson.id
            const badgeText = lesson.badge[lang] || lesson.badge.en || lesson.badge.hi

            return (
              <div
                key={lesson.id}
                className={`bg-card border rounded-3xl p-5 flex flex-col justify-between min-h-[190px] shadow-[0_1px_0_rgba(30,42,34,0.04)] transition ${
                  isHighlighted ? 'border-forest ring-2 ring-mint' : 'border-line'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: lesson.bgColor, color: lesson.accent }}
                    >
                      {badgeText}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleAudio(lesson)}
                      className={`inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-3 py-1 transition ${
                        isPlaying
                          ? 'bg-scam text-card animate-pulse'
                          : 'bg-forest text-card hover:bg-forest-2'
                      }`}
                    >
                      <SpeakerIcon size={13} />
                      <span>{isPlaying ? t.btnPause : t.btnListen}</span>
                    </button>
                  </div>

                  <h3 className="font-display text-xl font-bold text-ink mt-1">
                    {lesson.title[lang] || lesson.title.en || lesson.title.hi}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {lesson.tagline[lang] || lesson.tagline.en || lesson.tagline.hi}
                  </p>

                  {/* Concise DOs and DONTs */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-safe">
                      <span className="font-bold">✓</span>
                      <span className="text-ink font-medium truncate">
                        {lesson.dos[0][lang] || lesson.dos[0].en || lesson.dos[0].hi}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-scam">
                      <span className="font-bold">✕</span>
                      <span className="text-ink font-medium truncate">
                        {lesson.donts[0][lang] || lesson.donts[0].en || lesson.donts[0].hi}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-3 p-2.5 rounded-xl text-xs font-semibold"
                  style={{ backgroundColor: lesson.bgColor, color: lesson.accent }}
                >
                  {lesson.goldenRule[lang] || lesson.goldenRule.en || lesson.goldenRule.hi}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. QUIZ & SCORE SECTION */}
      <section className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
              {lang === 'hi' ? 'आत्म-परीक्षण · SELF TEST' : lang === 'cg' ? 'जाँच · SELF TEST' : 'SELF TEST · KNOWLEDGE CHECK'}
            </div>
            <h3 className="font-display text-xl font-bold text-ink mt-0.5">
              {t.quizTitle}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted">{t.yourScore}</span>
            <div className="font-display text-2xl font-bold text-forest leading-none">{score}/100</div>
          </div>
        </div>

        {!quizStarted && !quizDone ? (
          <div className="bg-beige/50 border border-line rounded-2xl p-4 flex items-center justify-between gap-4">
            <p className="text-xs text-muted">{t.quizDesc}</p>
            <button
              onClick={() => setQuizStarted(true)}
              className="rounded-full bg-forest text-card text-xs font-semibold px-4 py-2 hover:bg-forest-2 shrink-0 transition"
            >
              {t.btnStartQuiz} →
            </button>
          </div>
        ) : quizDone ? (
          <div className="bg-mint/40 border border-leaf/20 rounded-2xl p-5 text-center space-y-2 animate-fadeIn">
            <h4 className="font-display text-2xl font-bold text-forest">
              {t.congratsTitle}
            </h4>
            <p className="text-xs text-ink">
              {t.yourScore} <span className="font-bold text-forest text-base">{score}/100</span>
            </p>
            <button
              onClick={() => {
                setQuizStarted(true)
                setQIndex(0)
                setChosenOpt(null)
                setCorrectList([])
                setQuizDone(false)
              }}
              className="rounded-full bg-forest text-card text-xs font-semibold px-4 py-1.5 hover:bg-forest-2 transition"
            >
              {t.btnRetryQuiz}
            </button>
          </div>
        ) : (
          <div className="space-y-3 animate-fadeIn">
            <div className="text-xs font-semibold text-muted">
              {lang === 'hi' ? 'प्रश्न' : lang === 'cg' ? 'सवाल' : 'Question'} {qIndex + 1} / {QUIZ_QUESTIONS.length}
            </div>
            <p className="text-sm font-semibold text-ink bg-beige/40 p-3.5 rounded-2xl border border-line">
              {QUIZ_QUESTIONS[qIndex].question[lang] || QUIZ_QUESTIONS[qIndex].question.en || QUIZ_QUESTIONS[qIndex].question.hi}
            </p>

            <div className="space-y-1.5">
              {QUIZ_QUESTIONS[qIndex].options.map((opt, idx) => {
                const selected = chosenOpt === idx
                let cls = 'bg-card hover:bg-beige border-line text-ink'
                if (chosenOpt !== null) {
                  if (opt.correct) cls = 'bg-mint text-forest border-leaf font-semibold'
                  else if (selected) cls = 'bg-blush text-scam border-scam font-semibold'
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt, idx)}
                    disabled={chosenOpt !== null}
                    className={`w-full p-3 rounded-2xl border text-left text-xs font-medium transition flex items-center justify-between ${cls}`}
                  >
                    <span>{opt.text[lang] || opt.text.en || opt.text.hi}</span>
                    {chosenOpt !== null && opt.correct && <CheckIcon size={14} />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
