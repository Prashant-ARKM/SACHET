import { useEffect, useRef, useState } from 'react'
import { decodeQrFromFile, parseQr, checkQr } from '../lib/qrCheck.js'
import AlertVerdict from './AlertVerdict.jsx'
import { Link } from 'react-router-dom'
import { matchBlocked, normUpi, normLink, showId } from '../../shared/alertSign.js'

const L = (lang, en, hi, cg) => (lang === 'hi' ? hi : lang === 'cg' ? cg : en)

const LEVEL_STYLE = {
  danger: 'bg-blush border-scam/20 text-scam',
  warn: 'bg-sun-tint border-warn/30 text-warn',
  ok: 'bg-mint/50 border-leaf/20 text-forest',
}

// Fake-QR checker: photo or screenshot of a QR -> UPI ID, payee name, amount + red flags.
// Runs on the phone, offline. onCheckLink(url) sends a website QR to the message checker.
export default function QrCheck({ lang, onCheckLink }) {
  const cameraInput = useRef(null)
  const [info, setInfo] = useState(null)
  const [preview, setPreview] = useState('')
  const [expected, setExpected] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [payAnyway, setPayAnyway] = useState(false)
  const [speechError, setSpeechError] = useState('')

  useEffect(() => {
    window.speechSynthesis?.getVoices()
  }, [])

  const readPayee = () => {
    const synth = window.speechSynthesis
    const speechLocale = lang === 'hi' || lang === 'cg' ? 'hi-IN' : 'en-IN'
    const voices = synth?.getVoices().filter((voice) => voice.localService) ?? []
    // Chhattisgarhi uses a Hindi voice when the device has no Chhattisgarhi voice.
    const voice =
      (lang === 'cg' && voices.find((voice) => /^hne(?:-|$)/i.test(voice.lang))) ||
      voices.find((voice) => voice.lang.toLowerCase() === speechLocale.toLowerCase()) ||
      voices.find((voice) => voice.lang.toLowerCase().split('-')[0] === speechLocale.split('-')[0])
    const showSpeechError = () => setSpeechError(L(
      lang,
      'Could not read the name aloud. Check the displayed name and confirm it in your UPI app.',
      'नाम बोलकर नहीं पढ़ सके। दिखाया गया नाम देखें और अपने UPI ऐप में पुष्टि करें।',
      'नाव बोल के नई पढ़ सकेन। दिखत नाव ल देखव अउ अपन UPI ऐप म जाँचव।',
    ))

    setSpeechError('')
    if (!synth || !window.SpeechSynthesisUtterance) {
      setSpeechError(L(lang, 'This browser does not support reading aloud.', 'इस ब्राउज़र में आवाज़ में पढ़ने की सुविधा नहीं है।', 'ए ब्राउज़र म बोल के पढ़े के सुविधा नइ हे।'))
      return
    }
    if (!voice && !window.confirm(L(
      lang,
      'No on-device voice is available. Use the system voice? It may send the payee name to its speech service.',
      'फ़ोन की स्थानीय आवाज़ उपलब्ध नहीं है। सिस्टम की आवाज़ इस्तेमाल करें? यह पाने वाले का नाम अपनी स्पीच सेवा को भेज सकती है।',
      'फ़ोन के स्थानीय आवाज उपलब्ध नइ हे। सिस्टम के आवाज चलावन? ए पवइया के नाव अपन स्पीच सेवा ल भेज सकथे।',
    ))) return

    const utterance = new window.SpeechSynthesisUtterance(L(
      lang,
      `This QR shows ${info.payeeName} as the recipient. Please confirm the name in your UPI app before paying.`,
      `इस QR में पाने वाले का नाम ${info.payeeName} दिख रहा है। भुगतान से पहले अपने UPI ऐप में नाम की पुष्टि करें।`,
      `ए QR म पवइया के नाव ${info.payeeName} दिखत हे। पेमेंट ले पहिली अपन UPI ऐप म नाव जाँचव।`,
    ))
    utterance.lang = voice?.lang ?? speechLocale
    if (voice) utterance.voice = voice
    utterance.rate = 0.9
    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') showSpeechError()
    }
    synth.cancel()
    synth.speak(utterance)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again
    if (!file) return
    setSpeechError('')
    setBusy(true)
    setError('')
    setInfo(null)
    setPayAnyway(false)
    setPreview(URL.createObjectURL(file))
    try {
      const raw = await decodeQrFromFile(file)
      if (!raw) {
        setError(
          L(
            lang,
            'No QR code found in this image. Try a clearer, closer photo.',
            'इस फ़ोटो में कोई QR कोड नहीं मिला। साफ़ और पास से फ़ोटो लें।',
            'ए फ़ोटो म कोनो QR कोड नइ मिलिस। साफ अउ पास ले फ़ोटो लेवव।',
          ),
        )
      } else {
        setInfo(parseQr(raw))
      }
    } catch (err) {
      console.error('QR read failed', err)
      setError(L(lang, 'Could not read this image.', 'यह फ़ोटो पढ़ी नहीं जा सकी।', 'ए फ़ोटो पढ़े नइ जा सकिस।'))
    }
    setBusy(false)
  }

  const isAlert = info?.kind === 'alert'
  // Payment QR to a UPI ID (or a link) that a signed alert on this phone lists as reported
  const blockedMatch =
    info && !isAlert
      ? matchBlocked(info.kind === 'upi' ? '' : info.raw, info.kind === 'upi' ? [{ kind: 'u', value: normUpi(info.upiId) }] : [{ kind: 'l', value: normLink(info.raw) }])
      : null
  const result = info && !isAlert ? checkQr(info, expected) : null
  const pickBtn =
    'relative inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 md:py-2 text-base md:text-sm font-semibold active:scale-95 transition cursor-pointer'

  return (
    <section className="bg-card border border-line rounded-3xl p-5 shadow-[0_1px_0_rgba(30,42,34,0.04)] space-y-4">
      <div>
        <p className="text-base md:text-sm font-semibold text-ink">
          {L(lang, 'Check a QR code before you pay', 'भुगतान से पहले QR कोड जाँचें', 'पेमेंट ले पहिली QR कोड जाँचव')}
        </p>
        <p className="text-sm md:text-xs text-muted mt-0.5">
          {L(
            lang,
            'See the real UPI ID and name hidden in the QR, or check a SACHET alert poster is genuine. QR scanning works offline.',
            'QR में छिपी असली UPI ID और नाम देखें, या जाँचें कि SACHET सूचना पोस्टर असली है। QR स्कैनिंग बिना इंटरनेट काम करती है।',
            'QR म लुकाय असली UPI ID अउ नाव देखव, या जाँचव कि SACHET सूचना पोस्टर असली हे। QR स्कैनिंग बिना इंटरनेट चलथे।',
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`${pickBtn} bg-forest text-card hover:bg-forest-2`}
          onClick={() => cameraInput.current.click()}
        >
          <span aria-hidden="true">📷</span>
          {L(lang, 'Take photo of QR', 'QR की फ़ोटो लें', 'QR के फ़ोटो लेवव')}
        </button>
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          hidden
        />
        <label className={`${pickBtn} bg-beige text-ink border border-line hover:bg-mint`}>
          <span aria-hidden="true">🖼️</span>
          {L(lang, 'Upload screenshot', 'स्क्रीनशॉट चुनें', 'स्क्रीनशॉट चुनव')}
          <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
        </label>
      </div>

      <label className="block text-sm md:text-xs">
        <span className="font-semibold text-ink">
          {L(
            lang,
            'Who are you paying? (optional: shop or person name)',
            'आप किसे भुगतान कर रहे हैं? (वैकल्पिक: दुकान या व्यक्ति का नाम)',
            'तुमन काकर ल पेमेंट करत हव? (मन होय त: दुकान या मनखे के नाव)',
          )}
        </span>
        <input
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          placeholder={L(lang, 'e.g. Sharma Kirana Store', 'जैसे: शर्मा किराना स्टोर', 'जइसे: शर्मा किराना स्टोर')}
          className="mt-1 w-full border border-line rounded-xl px-3 py-2.5 bg-beige/40 text-ink outline-none focus:border-forest"
        />
      </label>

      {busy && <p className="text-sm text-muted">{L(lang, 'Reading QR…', 'QR पढ़ा जा रहा है…', 'QR पढ़त हन…')}</p>}
      {error && <p className="text-sm font-medium text-scam">{error}</p>}

      {isAlert && <AlertVerdict text={info.raw} lang={lang} />}

      {result && (
        <div className="space-y-3 animate-fadeIn">
          {blockedMatch && (
            <Link
              to={{ pathname: '/citizen/alert', hash: `#${blockedMatch.alert.token}` }}
              className="block p-4 rounded-2xl border-2 border-scam bg-scam text-card hover:brightness-110"
            >
              <p className="text-base md:text-sm font-bold">
                {lang === 'en'
                  ? `🚨 ${blockedMatch.id.kind === 'p' ? 'This number' : blockedMatch.id.kind === 'u' ? 'This UPI ID' : 'This link'} was reported ${blockedMatch.id.count} time${blockedMatch.id.count === 1 ? '' : 's'} in ${blockedMatch.alert.district}`
                  : lang === 'cg'
                  ? `🚨 ${blockedMatch.id.kind === 'p' ? 'ए नंबर' : blockedMatch.id.kind === 'u' ? 'ए UPI ID' : 'ए लिंक'} के ${blockedMatch.alert.district} म ${blockedMatch.id.count} बेर सिकायत होए हे`
                  : `🚨 ${blockedMatch.id.kind === 'p' ? 'इस नंबर' : blockedMatch.id.kind === 'u' ? 'इस UPI ID' : 'इस लिंक'} की ${blockedMatch.alert.district} में ${blockedMatch.id.count} बार शिकायत हुई है`}
              </p>
              <p className="text-sm md:text-xs mt-1 opacity-90">
                <span className="font-mono font-semibold">{showId(blockedMatch.id)}</span> ·{' '}
                {lang === 'en'
                  ? 'From a signed SACHET alert you scanned. Do not reply, pay or share any code. Open the alert →'
                  : lang === 'cg'
                  ? 'तुंहर स्कैन करे दस्तखत वाला SACHET सूचना ले। जवाब, पइसा या कोड झन देवव। सूचना खोलव →'
                  : 'आपकी स्कैन की हुई हस्ताक्षरित SACHET सूचना से। जवाब, पैसा या कोई कोड न दें। सूचना खोलें →'}
              </p>
            </Link>
          )}

          <div className="flex gap-3 items-start">
            {preview && (
              <img src={preview} alt="" className="w-20 h-20 object-contain rounded-xl border border-line bg-white shrink-0" />
            )}
            {info.kind === 'upi' ? (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm md:text-xs min-w-0">
                <dt className="text-muted">{L(lang, 'UPI ID', 'UPI ID', 'UPI ID')}</dt>
                <dd className="font-mono font-semibold text-ink break-all">{info.upiId || '—'}</dd>
                <dt className="text-muted">{L(lang, 'Payee name', 'पाने वाले का नाम', 'पवइया के नाव')}</dt>
                <dd className="font-semibold text-ink">{info.payeeName || '—'}</dd>
                {info.amount && (
                  <>
                    <dt className="text-muted">{L(lang, 'Amount', 'राशि', 'रकम')}</dt>
                    <dd className="font-semibold text-ink">₹{info.amount.toLocaleString('en-IN')}</dd>
                  </>
                )}
                {info.note && (
                  <>
                    <dt className="text-muted">{L(lang, 'Note', 'संदेश', 'संदेस')}</dt>
                    <dd className="text-ink">{info.note}</dd>
                  </>
                )}
              </dl>
            ) : (
              <p className="text-sm md:text-xs font-mono text-ink break-all">{info.raw}</p>
            )}
          </div>

          {info.kind === 'upi' && info.payeeName && (
            <div>
              <button
                type="button"
                onClick={readPayee}
                className="rounded-full border border-line bg-beige px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mint"
              >
                {L(lang, 'Read aloud', 'नाम सुनें', 'नाव सुनव')}
              </button>
              {speechError && <p role="status" className="mt-1 text-sm text-muted">{speechError}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            {result.flags.map((f, i) => (
              <div key={i} className={`p-3 rounded-2xl border text-sm md:text-xs font-medium ${LEVEL_STYLE[f.level]}`}>
                {f.level === 'danger' ? '🚨 ' : f.level === 'warn' ? '⚠️ ' : '✓ '}
                {f[lang] || f.en}
              </div>
            ))}
            {result.level === 'ok' && result.flags.length === 0 && (
              <div className={`p-3 rounded-2xl border text-sm md:text-xs font-medium ${LEVEL_STYLE.ok}`}>
                {L(lang, '✓ No red flags found.', '✓ कोई ख़तरे का संकेत नहीं मिला।', '✓ कोनो खतरा के संकेत नइ मिलिस।')}
              </div>
            )}
          </div>

          <p className="text-sm md:text-xs text-ink/80">
            {L(
              lang,
              'Before entering your PIN, check that the name shown in your UPI app is the person or shop you want to pay.',
              'पिन डालने से पहले देखें कि UPI ऐप में दिखा नाम उसी व्यक्ति या दुकान का है जिसे आप भुगतान करना चाहते हैं।',
              'पिन डाले ले पहिली देखव कि UPI ऐप म दिखे नाव उही मनखे या दुकान के हे जेला तुमन पेमेंट करना चाहथव।',
            )}
          </p>

          {info.kind === 'upi' && (
            <>
              <p className="text-sm md:text-xs font-semibold text-scam">
                {L(
                  lang,
                  '⚠️ If someone told you to scan a QR to RECEIVE money (prize, refund, job, cashback), it is a scam. Scanning a QR only ever SENDS money.',
                  '⚠️ अगर किसी ने पैसे पाने (इनाम, रिफंड, नौकरी, कैशबैक) के लिए QR स्कैन करने को कहा है, तो यह ठगी है। QR स्कैन करने से पैसे सिर्फ़ जाते हैं।',
                  '⚠️ अगर कोनो पैसा पाए (इनाम, रिफंड, नौकरी, कैशबैक) बर QR स्कैन करे ल कहिस हे, त ए ठगी आय। QR स्कैन करे ले पैसा खाली जाथे।',
                )}
              </p>

              {/* Continue to the real payment, in the user's UPI app */}
              <div className="border-t border-line pt-3 space-y-2">
                {result.level === 'danger' && (
                  <>
                    <p className="text-sm md:text-xs font-bold text-scam">
                      {L(lang, 'We recommend you do NOT pay this QR.', 'हमारी सलाह: इस QR पर भुगतान न करें।', 'हमर सलाह: ए QR म पेमेंट झन करव।')}
                    </p>
                    <label className="flex items-start gap-2 text-sm md:text-xs text-ink cursor-pointer">
                      <input type="checkbox" checked={payAnyway} onChange={(e) => setPayAnyway(e.target.checked)} className="mt-0.5" />
                      {L(
                        lang,
                        'I know this person or shop and still want to pay',
                        'मैं इस व्यक्ति या दुकान को जानता/जानती हूँ और फिर भी भुगतान करना चाहता/चाहती हूँ',
                        'मैं ए मनखे या दुकान ल जानथंव अउ तभो ले पेमेंट करना चाहथंव',
                      )}
                    </label>
                  </>
                )}
                {(result.level !== 'danger' || payAnyway) && /^upi:\/\/pay/i.test(info.raw) && (
                  <>
                    <a
                      href={info.raw}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 md:py-2 text-base md:text-sm font-semibold active:scale-95 transition ${
                        result.level === 'danger' ? 'bg-card text-scam border border-scam/40' : 'bg-forest text-card hover:bg-forest-2'
                      }`}
                    >
                      {L(lang, 'Continue to pay in UPI app →', 'UPI ऐप में भुगतान जारी रखें →', 'UPI ऐप म पेमेंट करव →')}
                    </a>
                    <p className="text-xs text-muted">
                      {L(
                        lang,
                        `Your UPI app (GPay, PhonePe, Paytm…) will open with: pay ${info.amount ? '₹' + info.amount.toLocaleString('en-IN') + ' ' : ''}to ${info.payeeName || info.upiId}. Check the name again there before entering your PIN. (Works on a phone with a UPI app.)`,
                        `आपका UPI ऐप (GPay, PhonePe, Paytm…) खुलेगा: ${info.payeeName || info.upiId} को ${info.amount ? '₹' + info.amount.toLocaleString('en-IN') + ' ' : ''}भुगतान। पिन डालने से पहले वहाँ नाम फिर से देखें। (UPI ऐप वाले फ़ोन पर काम करता है।)`,
                        `तुंहर UPI ऐप (GPay, PhonePe, Paytm…) खुलही: ${info.payeeName || info.upiId} ल ${info.amount ? '₹' + info.amount.toLocaleString('en-IN') + ' ' : ''}पेमेंट। पिन डाले ले पहिली उहाँ नाव फेर देखव। (UPI ऐप वाला फ़ोन म चलथे।)`,
                      )}
                    </p>
                  </>
                )}
              </div>
            </>
          )}

          {info.kind === 'url' && (
            <button
              type="button"
              onClick={() => onCheckLink(info.raw)}
              className="rounded-full bg-forest text-card text-sm md:text-xs font-semibold px-4 py-3 md:py-2 hover:bg-forest-2 active:scale-95 transition"
            >
              {L(lang, 'Check this link for scam →', 'इस लिंक की जाँच करें →', 'ए लिंक के जाँच करव →')}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
