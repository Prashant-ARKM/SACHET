// Background worker: speech-to-text for uploaded call recordings, on the device.
// Uses OpenAI's Whisper model through Transformers.js. The model is downloaded once
// (first use) and then kept in the browser cache, so later transcriptions work offline.
import { pipeline, env } from '@huggingface/transformers'

// Two optional speech packs (multilingual Whisper, Hindi + English), downloaded only when used:
//  fast     = whisper-base,  about 80 MB: quicker, but weaker on Hindi phone calls
//  accurate = whisper-small, about 250 MB: much better Hindi
export const SPEECH_PACKS = { fast: 'Xenova/whisper-base', accurate: 'Xenova/whisper-small' }

env.allowLocalModels = false // fetch from the model hub on first use, then use the browser cache
env.useBrowserCache = true

// Overall download progress across all model files, by bytes
const files = {}
function reportProgress(p) {
  if (p.status === 'progress' && p.file) {
    files[p.file] = { loaded: p.loaded || 0, total: p.total || 0 }
    const loaded = Object.values(files).reduce((a, f) => a + f.loaded, 0)
    const total = Object.values(files).reduce((a, f) => a + f.total, 0)
    if (total) self.postMessage({ type: 'download', progress: (loaded / total) * 100 })
  }
}

async function hasWebGPU() {
  try {
    return Boolean(self.navigator?.gpu && (await self.navigator.gpu.requestAdapter()))
  } catch {
    return false
  }
}

const transcribers = {} // one loaded model per speech pack
function getTranscriber(pack) {
  const MODEL = SPEECH_PACKS[pack] || SPEECH_PACKS.accurate
  if (!transcribers[MODEL]) {
    transcribers[MODEL] = (async () => {
      self.postMessage({ type: 'loading' })
      // Graphics chip (WebGPU) is much faster where available; otherwise the processor (WASM).
      if (await hasWebGPU()) {
        try {
          return await pipeline('automatic-speech-recognition', MODEL, {
            device: 'webgpu',
            dtype: { encoder_model: 'fp32', decoder_model_merged: 'q4' },
            progress_callback: reportProgress,
          })
        } catch {
          // fall back to the processor below
        }
      }
      return pipeline('automatic-speech-recognition', MODEL, {
        device: 'wasm',
        dtype: 'q8', // 8-bit: small and fast enough for phones
        progress_callback: reportProgress,
      })
    })().catch((err) => {
      delete transcribers[MODEL] // allow a retry (e.g. after coming online)
      throw err
    })
  }
  return transcribers[MODEL]
}

// One message = one piece of audio (up to 30 s, 16 kHz mono)
self.onmessage = async ({ data }) => {
  const { id, audio, language, pack } = data
  try {
    const transcriber = await getTranscriber(pack)
    self.postMessage({ type: 'ready', id })
    const output = await transcriber(audio, {
      language,
      task: 'transcribe',
      // Stop the model from getting stuck repeating the same words ("वो पर वो पर …")
      no_repeat_ngram_size: 3,
      repetition_penalty: 1.2,
    })
    self.postMessage({ type: 'result', id, text: (output.text || '').trim() })
  } catch (err) {
    self.postMessage({ type: 'error', id, message: String(err?.message || err) })
  }
}
