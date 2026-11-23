// Picks the words of a real scam message that our ML model links most to its scam type.
// Uses the same model.json as the message checker: for each word, its char n-grams are weighted by
// the type classifier (this type's coefficient minus the average of the other types), so the words
// that made the model say "digital arrest" (आधार, क्राइम, अरेस्ट…) rank first, not generic ones.
// Those words go into the signed QR; phones that saved the alert warn when a message contains them.
import { loadModel } from '../ml/score.js'
import { normWord, MAX_WORDS } from './alertSign.js'

// Common words that say nothing about a specific scam
const STOP = new Set(
  (
    'में मे है हैं हो का की के को से पर और लिए यह इस उस कर करें करे करना करो मैं हम आप आपके आपका आपकी तुम आज अभी तुरंत ' +
    'जाएगा जाएगी रहा रही रहे गया गई गए नहीं मत एक तो भी अब कि जो वह ये वो बहुत सभी अपने अपना अपनी होगा होगी था थे थी ' +
    'म ल हे अउ ओ ए ला मन नइ झन हावय हवय ' +
    'your you the and for to is are will be this that at of in on with dear customer please now immediately today ' +
    'call sir madam hello hi from has have our we can not'
  ).split(' '),
)

function wordFeatures(word, model) {
  const [minN, maxN] = model.ngram_range
  const chars = Array.from(` ${model.lowercase ? word.toLowerCase() : word} `)
  const counts = new Map()
  for (let n = minN; n <= maxN; n++) {
    const last = Math.max(0, chars.length - n)
    for (let o = 0; o <= last; o++) {
      const g = chars.slice(o, o + n).join('')
      if (Object.hasOwn(model.vocab, g)) counts.set(g, (counts.get(g) ?? 0) + 1)
    }
    if (last === 0) break
  }
  const feats = Array.from(counts, ([g, c]) => {
    const i = model.vocab[g]
    return [i, c * model.idf[i]]
  })
  const norm = Math.hypot(...feats.map(([, v]) => v)) || 1
  return feats.map(([i, v]) => [i, v / norm])
}

// Trim punctuation around a word, keep Devanagari vowel signs
const clean = (w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}\p{M}]+$/gu, '')

export async function alertWords(text, type, max = MAX_WORDS) {
  const model = await loadModel()
  const classes = model.type?.classes || []
  const ci = classes.indexOf(type)

  const seen = new Set()
  const words = []
  for (const raw of (text || '').split(/\s+/)) {
    const w = clean(raw)
    const n = normWord(w)
    if (n.length < 3 || seen.has(n) || STOP.has(w.toLowerCase()) || STOP.has(n) || /\d/.test(n)) continue
    seen.add(n)
    words.push(w)
  }

  const scored = words.map((w) => {
    const feats = wordFeatures(w, model)
    let typeWeight = 0
    let scamWeight = 0
    for (const [i, v] of feats) {
      scamWeight += v * model.scam.coef[i]
      if (ci >= 0) {
        let others = 0
        for (let k = 0; k < classes.length; k++) if (k !== ci) others += model.type.coef[k][i]
        typeWeight += v * (model.type.coef[ci][i] - others / (classes.length - 1))
      }
    }
    // Scam types the type model doesn't have (fake QR, phishing link…): use the scam/not-scam weights
    return { w, weight: ci >= 0 ? typeWeight : scamWeight, scamWeight }
  })

  return scored
    .filter((x) => x.weight > 0 && x.scamWeight > -0.5)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, max)
    .map((x) => x.w)
}
