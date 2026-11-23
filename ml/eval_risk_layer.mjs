// Evaluate the ML model alone vs model + risk layer (frontend/src/citizen/lib/riskSignals.js).
// Usage (from repo root):
//   node ml/eval_risk_layer.mjs frontend/src/citizen/lib/scamDetector.js frontend/public/model.json ml/data/realworld_fresh.json [--show]
// For dev/test splits, first export them to JSON ({text,label,lang}) from ml/data/messages.csv + splits.csv.
import fs from 'node:fs'
const [, , detPath, modelPath, setPath, show] = process.argv
const model = JSON.parse(fs.readFileSync(modelPath))
globalThis.fetch = async () => ({ ok: true, json: async () => model })
const { analyzeMessage } = await import(new URL(detPath, 'file://' + process.cwd() + '/').href)
const rows = JSON.parse(fs.readFileSync(setPath, 'utf8'))
const stat = () => ({ tp: 0, fp: 0, tn: 0, fn: 0 })
const S = { model: stat(), final: stat() }, byLang = {}
const add = (s, pred, gold) => { s[(pred === 'scam') === (gold === 'scam') ? (pred === 'scam' ? 'tp' : 'tn') : (pred === 'scam' ? 'fp' : 'fn')]++ }
const errors = []
for (const r of rows) {
  const out = await analyzeMessage(r.text)
  const modelPred = out.modelVerdict || (out.modelScore >= 0.5 ? 'scam' : 'genuine')
  add(S.model, modelPred, r.label); add(S.final, out.verdict, r.label)
  if (r.lang) { byLang[r.lang] ??= { model: stat(), final: stat() }; add(byLang[r.lang].model, modelPred, r.label); add(byLang[r.lang].final, out.verdict, r.label) }
  if (out.verdict !== r.label || (show && modelPred !== out.verdict)) errors.push({ gold: r.label, model: modelPred + ' ' + Math.round(out.modelScore * 100), final: out.verdict + ' ' + Math.round((out.finalScore ?? out.modelScore) * 100), signals: (out.riskSignals || []).map(s => s.id).join(','), text: r.text.slice(0, 90) })
}
const m = (s) => { const n = s.tp + s.fp + s.tn + s.fn; return `acc ${(100 * (s.tp + s.tn) / n).toFixed(1)}% | recall ${(100 * s.tp / (s.tp + s.fn)).toFixed(1)}% | precision ${(100 * s.tp / Math.max(1, s.tp + s.fp)).toFixed(1)}% | FP ${s.fp} FN ${s.fn} (n=${n})` }
console.log('MODEL ONLY :', m(S.model)); console.log('MODEL+RULES:', m(S.final))
for (const [l, v] of Object.entries(byLang)) console.log(`  ${l.padEnd(9)} model ${m(v.model).split('|')[0]} -> final ${m(v.final).split('|')[0]}`)
if (show) for (const e of errors) console.log(JSON.stringify(e))
