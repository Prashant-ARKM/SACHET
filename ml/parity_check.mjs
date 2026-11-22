// Compares frontend/src/ml/score.js with the Python predict() results stored in a JSON file.
// Usage: node ml/parity_check.mjs <expected.json> <repo_root>
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
const [expectedFile, root] = process.argv.slice(2)
const modelPath = path.join(root, 'frontend', 'public', 'model.json')
globalThis.fetch = async () => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(modelPath, 'utf8')) })
const { score } = await import(pathToFileURL(path.join(root, 'frontend', 'src', 'ml', 'score.js')).href)
const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf8'))
let bad = 0, maxDiff = 0
for (const e of expected) {
  const j = await score(e.text)
  const diff = Math.abs(j.score - e.score)
  maxDiff = Math.max(maxDiff, diff)
  const problems = []
  if (j.label !== e.label) problems.push(`label js=${j.label} py=${e.label}`)
  if (j.scam_type !== e.scam_type) problems.push(`type js=${j.scam_type} py=${e.scam_type}`)
  if (diff > 1e-6) problems.push(`score diff=${diff}`)
  if (JSON.stringify(j.highlights) !== JSON.stringify(e.highlights)) problems.push(`highlights js=${JSON.stringify(j.highlights)} py=${JSON.stringify(e.highlights)}`)
  if (problems.length) { bad++; console.log('MISMATCH:', JSON.stringify(e.text.slice(0, 60)), problems.join(' | ')) }
}
console.log(`\nPARITY: ${expected.length - bad}/${expected.length} match, ${bad} mismatches, max score diff ${maxDiff.toExponential(2)}`)
process.exit(bad ? 1 : 0)
