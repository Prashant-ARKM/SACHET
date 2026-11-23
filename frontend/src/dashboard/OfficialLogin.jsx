import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from './lib/auth.js'

const ERRORS = {
  wrong: 'Wrong username or password · गलत यूज़रनेम या पासवर्ड',
  not_configured: 'Official login is not set up on the server yet · सर्वर पर लॉगिन अभी सेट नहीं है',
  unreachable: 'Could not reach the server. Check the internet and try again · सर्वर से संपर्क नहीं हो सका',
}

// Officials only. Citizens never see this: the citizen app needs no login.
export default function OfficialLogin({ onLoggedIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    setBusy(true)
    setError('')
    const res = await login(username.trim(), password)
    setBusy(false)
    if (res.ok) onLoggedIn()
    else setError(ERRORS[res.reason] || ERRORS.unreachable)
  }

  return (
    <div className="min-h-screen bg-beige grid place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-card border border-line rounded-3xl p-6 space-y-4 shadow-[0_1px_0_rgba(30,42,34,0.04)]"
      >
        <div>
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted">
            SACHET · सचेत
          </div>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Official login</h1>
          <p className="text-sm text-muted">अधिकारी लॉगिन · district administration, police and banks</p>
        </div>

        <label className="block text-sm">
          <span className="font-semibold text-ink">Username · यूज़रनेम</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="mt-1 w-full border border-line rounded-xl px-3 py-2.5 bg-beige/40 text-ink outline-none focus:border-forest"
          />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-ink">Password · पासवर्ड</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full border border-line rounded-xl px-3 py-2.5 bg-beige/40 text-ink outline-none focus:border-forest"
          />
        </label>

        {error && <p className="text-sm font-medium text-scam">{error}</p>}

        <button
          type="submit"
          disabled={busy || !username.trim() || !password}
          className="w-full rounded-full bg-forest text-card font-semibold py-3 hover:bg-forest-2 active:scale-95 transition disabled:opacity-40"
        >
          {busy ? 'Signing in… (the server may take a minute to wake up)' : 'Log in →'}
        </button>

        <p className="text-xs text-muted">
          Citizens don't need to log in. ·{' '}
          <Link to="/citizen" className="text-forest font-semibold underline">
            Open the citizen app
          </Link>
        </p>
      </form>
    </div>
  )
}
