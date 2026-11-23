// Turn an uploaded call recording into text, on the device (see whisperWorker.js).
// The call is transcribed in 30-second parts, so the transcript appears part by part
// and the caller can stop early once the call is clearly a scam.

const SAMPLE_RATE = 16000
const PART_SECONDS = 30

let worker = null
let nextId = 0
const pending = new Map()
let statusListener = () => {}
let current = { part: 1, parts: 1 } // which part is being transcribed (for the status line)

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./whisperWorker.js', import.meta.url), { type: 'module' })
    worker.onmessage = ({ data }) => {
      if (data.type === 'loading') statusListener({ stage: 'loading' })
      else if (data.type === 'ready') statusListener({ stage: 'transcribing', ...current })
      else if (data.type === 'download') statusListener({ stage: 'download', progress: data.progress })
      else if (data.type === 'result' || data.type === 'error') {
        const job = pending.get(data.id)
        if (!job) return
        pending.delete(data.id)
        if (data.type === 'result') job.resolve(data.text)
        else job.reject(new Error(data.message))
      }
    }
    worker.onerror = (e) => {
      for (const job of pending.values()) job.reject(new Error(e.message || 'worker_failed'))
      pending.clear()
      worker = null
    }
  }
  return worker
}

// Safety net for speech-model repetition loops: if a phrase of 1-6 words repeats
// more than 3 times in a row, keep it once.
export function collapseRepeats(text) {
  let words = text.split(/\s+/).filter(Boolean)
  for (let n = 1; n <= 6; n++) {
    const out = []
    let i = 0
    while (i < words.length) {
      const phrase = words.slice(i, i + n).join(' ')
      let j = i + n
      let repeats = 1
      while (j + n <= words.length && words.slice(j, j + n).join(' ') === phrase) {
        repeats++
        j += n
      }
      if (repeats > 3) {
        out.push(...words.slice(i, i + n))
        i = j
      } else {
        out.push(words[i])
        i++
      }
    }
    words = out
  }
  return words.join(' ')
}

// True when the raw transcript was mostly a repetition loop (not real speech)
export function looksLikeLoop(raw, cleaned) {
  const rawWords = raw.split(/\s+/).filter(Boolean).length
  const cleanWords = cleaned.split(/\s+/).filter(Boolean).length
  return rawWords >= 12 && cleanWords / rawWords < 0.35
}

function transcribePart(samples, language, pack) {
  const id = ++nextId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    getWorker().postMessage({ id, audio: samples, language, pack }, [samples.buffer])
  })
}

// Which speech packs are already on this phone (Transformers.js keeps them in this browser cache)
export async function downloadedPacks() {
  try {
    const keys = await (await caches.open('transformers-cache')).keys()
    const urls = keys.map((k) => k.url)
    return {
      fast: urls.some((u) => u.includes('whisper-base') && u.includes('.onnx')),
      accurate: urls.some((u) => u.includes('whisper-small') && u.includes('.onnx')),
    }
  } catch {
    return { fast: false, accurate: false }
  }
}

// Decode any audio file the browser can play (mp3, m4a, wav, ogg; amr where supported)
// into 16 kHz mono samples, which is what Whisper expects.
async function decodeTo16kMono(file) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  const ctx = new AudioCtx({ sampleRate: SAMPLE_RATE })
  try {
    const buffer = await ctx.decodeAudioData(await file.arrayBuffer())
    if (buffer.numberOfChannels === 1) return new Float32Array(buffer.getChannelData(0))
    const left = buffer.getChannelData(0)
    const right = buffer.getChannelData(1)
    const mono = new Float32Array(buffer.length)
    for (let i = 0; i < buffer.length; i++) mono[i] = (left[i] + right[i]) / 2
    return mono
  } finally {
    ctx.close?.()
  }
}

/**
 * @param {File} file
 * @param {'hindi'|'english'} language
 * @param {object} hooks
 *   onStatus({ stage: 'reading'|'loading'|'download'|'transcribing', progress?, part?, parts? })
 *   onPartial(textSoFar)               called after each 30-second part
 *   shouldStop(textSoFar) -> boolean   return true to stop early (e.g. clearly a scam already)
 * @returns {Promise<{ text: string, stoppedEarly: boolean, secondsDone: number, secondsTotal: number }>}
 */
export async function transcribeCall(file, language, { pack = 'accurate', onStatus = () => {}, onPartial = () => {}, shouldStop = async () => false } = {}) {
  onStatus({ stage: 'reading' })
  const audio = await decodeTo16kMono(file)
  if (audio.length < SAMPLE_RATE) throw new Error('too_short') // under 1 second

  statusListener = onStatus
  const partLen = SAMPLE_RATE * PART_SECONDS
  const parts = Math.ceil(audio.length / partLen)
  let text = ''
  let done = 0
  let loopedParts = 0

  for (let i = 0; i < parts; i++) {
    current = { part: i + 1, parts }
    const piece = audio.slice(i * partLen, Math.min((i + 1) * partLen, audio.length)) // own copy, safe to transfer
    const raw = await transcribePart(piece, language, pack)
    const partText = collapseRepeats(raw)
    if (looksLikeLoop(raw, partText)) loopedParts++
    done = i + 1
    text = [text, partText].filter(Boolean).join(' ')
    onPartial(text)
    if (done < parts && (await shouldStop(text))) {
      return {
        text,
        unclear: false,
        stoppedEarly: true,
        secondsDone: Math.round((done * partLen) / SAMPLE_RATE),
        secondsTotal: Math.round(audio.length / SAMPLE_RATE),
      }
    }
  }
  const seconds = Math.round(audio.length / SAMPLE_RATE)
  // If every part was a repetition loop, the transcript can't be trusted for a verdict
  const words = text.split(/\s+/).filter(Boolean).length
  const unclear = words < 3 || (loopedParts > 0 && words < 10)
  return { text, unclear, stoppedEarly: false, secondsDone: seconds, secondsTotal: seconds }
}
