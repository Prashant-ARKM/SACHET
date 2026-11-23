// Turn an uploaded call recording into text, on the device (see whisperWorker.js).

let worker = null

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./whisperWorker.js', import.meta.url), { type: 'module' })
  }
  return worker
}

// Decode any audio file the browser can play (mp3, m4a, wav, ogg, amr where supported)
// into 16 kHz mono samples, which is what Whisper expects.
async function decodeTo16kMono(file) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  const ctx = new AudioCtx({ sampleRate: 16000 })
  try {
    const buffer = await ctx.decodeAudioData(await file.arrayBuffer())
    if (buffer.numberOfChannels === 1) return new Float32Array(buffer.getChannelData(0)) // own copy, safe to transfer
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
 * @param {File} file          the recording
 * @param {'hindi'|'english'} language
 * @param {(status: {stage: 'reading'|'download'|'transcribing', progress?: number}) => void} onStatus
 * @returns {Promise<string>}  the transcript
 */
export async function transcribeCall(file, language, onStatus = () => {}) {
  onStatus({ stage: 'reading' })
  const audio = await decodeTo16kMono(file)
  if (audio.length < 16000) throw new Error('too_short') // under 1 second

  const w = getWorker()
  return new Promise((resolve, reject) => {
    w.onmessage = ({ data }) => {
      if (data.type === 'download') onStatus({ stage: 'download', progress: data.progress })
      else if (data.type === 'transcribing') onStatus({ stage: 'transcribing' })
      else if (data.type === 'result') resolve(data.text)
      else if (data.type === 'error') reject(new Error(data.message))
    }
    w.onerror = (e) => reject(new Error(e.message || 'worker_failed'))
    w.postMessage({ audio, language }, [audio.buffer])
  })
}
