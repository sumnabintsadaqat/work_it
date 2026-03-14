'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [debug, setDebug] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebug('')

    try {
      if (mode === 'login') {
        setDebug('Signing in…')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setError(error.message)
          setDebug('Error: ' + error.message)
          setLoading(false)
          return
        }
        setDebug('Signed in! User: ' + data.user?.email + ' — redirecting…')
        setTimeout(() => {
          window.location.replace('/dashboard')
        }, 500)
      } else {
        setDebug('Creating account…')
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, role } }
        })
        if (error) {
          setError(error.message)
          setDebug('Signup error: ' + error.message)
          setLoading(false)
          return
        }
        setDebug('Account created! User: ' + data.user?.email + ' — redirecting…')
        setTimeout(() => {
          window.location.replace('/dashboard')
        }, 500)
      }
    } catch (err: any) {
      setError('Unexpected error: ' + err.message)
      setDebug('Caught: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm fade-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-ink-800 mb-2">Ilm</h1>
          <p className="text-ink-400 text-sm font-body">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
                    Full name
                  </label>
                  <input className="input" type="text" value={fullName}
                    onChange={e => setFullName(e.target.value)} required placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
                    I am the
                  </label>
                  <div className="flex gap-3">
                    {(['student', 'teacher'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          role === r
                            ? 'bg-gold-400 border-gold-400 text-gold-900'
                            : 'border-ink-200 text-ink-500 hover:border-ink-400'
                        }`}>
                        {r === 'student' ? '📚 Student' : '🎓 Teacher'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Email</label>
              <input className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Password</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            {debug && (
              <p className="text-ink-400 text-xs bg-ink-50 border border-ink-100 rounded-lg px-4 py-2.5 font-mono">
                {debug}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-400 mt-6 font-body">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setDebug('') }}
              className="text-gold-600 hover:text-gold-700 font-semibold">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}
