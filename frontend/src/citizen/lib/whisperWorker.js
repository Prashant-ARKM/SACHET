// Background worker: speech-to-text for uploaded call recordings, on the device.
// Uses OpenAI's Whisper model through Transformers.js. The model is downloaded once
// (first use) and then kept in the browser cache, so later transcriptions work offline.
import { pipeline, env } from '@huggingface/transformers'

// Multilingual Whisper (Hindi + English). "base" is about 80 MB with 8-bit weights.
// For better Hindi accuracy, switch to 'Xenova/whisper-small' (larger and slower).
const MODEL = 'Xenova/whisper-base'

env.allowLocalModels = false // always fetch from the model hub on first use, then use the cache
env.useBrowserCache = true

let transcriberPromise = null

function getTranscriber() {
  if (!transcriberPromise) {
    transcriberPromise = pipeline('automatic-speech-recognition', MODEL, {
      dtype: 'q8', // 8-bit: small and fast enough for phones
      device: 'wasm',
      progress_callback: (p) => {
        // p.status: 'initiate' | 'download' | 'progress' | 'done' | 'ready'
        if (p.status === 'progress' && typeof p.progress === 'number') {
          self.postMessage({ type: 'download', file: p.file, progress: p.progress })
        }
      },
    }).catch((err) => {
      transcriberPromise = null // allow a retry (e.g. after coming online)
      throw err
    })
  }
  return transcriberPromise
}

self.onmessage = async (event) => {
  const { audio, language } = event.data
  try {
    const transcriber = await getTranscriber()
    self.postMessage({ type: 'transcribing' })
    const output = await transcriber(audio, {
      language, // 'hindi' or 'english'
      task: 'transcribe',
      chunk_length_s: 30, // long calls are processed in 30-second pieces
      stride_length_s: 5,
    })
    self.postMessage({ type: 'result', text: (output.text || '').trim() })
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err?.message || err) })
  }
}
