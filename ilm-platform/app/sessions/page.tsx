'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { Session } from '@/lib/types'

export default function SessionsPage() {
  const supabase = createClient()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<string|null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    phase: 1 as 1|2|3,
    notes: '',
    teacher_notes: '',
    objectives: [''],
    completed: false,
  })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
    }
    const { data } = await supabase.from('sessions').select('*').order('date', { ascending: false })
    setSessions((data ?? []) as Session[])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const objectives = form.objectives.filter(o => o.trim())
    await supabase.from('sessions').insert([{ ...form, objectives }])
    await fetchAll()
    setShowForm(false)
    setSaving(false)
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), title: '', phase: 1, notes: '', teacher_notes: '', objectives: [''], completed: false })
  }

  async function toggleComplete(id: string, completed: boolean) {
    await supabase.from('sessions').update({ completed: !completed }).eq('id', id)
    setSessions(sessions.map(s => s.id === id ? { ...s, completed: !completed } : s))
  }

  const isTeacher = profile?.role === 'teacher'
  const completed = sessions.filter(s => s.completed).length

  return (
    <div className="fade-up max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-ink-800 mb-2">Sessions</h1>
          <p className="text-ink-400 text-sm font-body">
            Every session is a step. {completed} of {sessions.length} completed.
          </p>
        </div>
        {isTeacher && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ New session'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-ink-800 font-bold">{sessions.length}</p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Total sessions</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-sage-600 font-bold">{completed}</p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Completed</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-gold-600 font-bold">
            {sessions.length ? Math.round((completed / sessions.length) * 100) : 0}%
          </p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Completion rate</p>
        </div>
      </div>

      {showForm && isTeacher && (
        <div className="card p-6 mb-6">
          <h2 className="font-display text-xl text-ink-800 mb-5">Log a session</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Session title</label>
                <input className="input" value={form.title} required
                  placeholder="e.g. Introduction to linear equations"
                  onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Date</label>
                <input type="date" className="input" value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-2 uppercase tracking-wider">Phase</label>
              <div className="flex gap-2">
                {([1,2,3] as const).map(p => (
                  <button key={p} type="button" onClick={() => setForm({...form, phase: p})}
                    className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all
                      ${form.phase === p ? 'bg-gold-400 border-gold-400 text-gold-900' : 'border-ink-200 text-ink-400'}`}>
                    Phase {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
                Session notes (visible to student)
              </label>
              <textarea className="textarea" rows={4} value={form.notes}
                placeholder="What was covered, what was discussed, key takeaways..."
                onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
                Teacher-only notes
              </label>
              <textarea className="textarea" rows={3} value={form.teacher_notes}
                placeholder="Observations about the student, things to follow up on, concerns..."
                onChange={e => setForm({...form, teacher_notes: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-2 uppercase tracking-wider">
                Objectives / homework
              </label>
              {form.objectives.map((obj, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="input flex-1" value={obj}
                    placeholder={`Objective ${i+1}`}
                    onChange={e => {
                      const updated = [...form.objectives]
                      updated[i] = e.target.value
                      setForm({...form, objectives: updated})
                    }} />
                  {form.objectives.length > 1 && (
                    <button type="button" onClick={() => setForm({...form, objectives: form.objectives.filter((_,j)=>j!==i)})}
                      className="text-ink-300 hover:text-red-500 px-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setForm({...form, objectives: [...form.objectives, '']})}
                className="text-xs text-gold-600 hover:text-gold-700 font-semibold">
                + Add objective
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="completed" checked={form.completed}
                onChange={e => setForm({...form, completed: e.target.checked})}
                className="w-4 h-4 accent-gold-500" />
              <label htmlFor="completed" className="text-sm text-ink-600 font-body">Mark as completed</label>
            </div>
            <button type="submit" disabled={saving || !form.title} className="btn-primary w-full">
              {saving ? 'Saving…' : 'Save session'}
            </button>
          </form>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-display text-xl text-ink-800 mb-4">Session history</h2>
        {loading ? (
          <p className="text-ink-400 text-sm text-center py-8">Loading…</p>
        ) : sessions.length === 0 ? (
          <p className="text-ink-400 text-sm text-center py-8">No sessions logged yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => (
              <div key={session.id} className="border-b border-ink-50 last:border-0">
                <div className="flex items-center gap-3 py-3 cursor-pointer group"
                  onClick={() => setExpanded(expanded === session.id ? null : session.id)}>
                  <button onClick={e => { e.stopPropagation(); toggleComplete(session.id, session.completed) }}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                      ${session.completed ? 'bg-sage-400 border-sage-400' : 'border-ink-300 hover:border-sage-400'}`}>
                    {session.completed && <span className="text-white text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink-700 group-hover:text-ink-900 truncate">
                        {session.title}
                      </span>
                      <span className={`phase-badge phase-${session.phase} text-xs shrink-0`}>P{session.phase}</span>
                    </div>
                    <p className="text-xs text-ink-400 mt-0.5">{format(new Date(session.date), 'd MMM yyyy')}</p>
                  </div>
                  <span className="text-ink-300 text-xs shrink-0">{expanded === session.id ? '▲' : '▼'}</span>
                </div>
                {expanded === session.id && (
                  <div className="pb-5 pl-8 space-y-4">
                    {session.notes && (
                      <div>
                        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Session notes</p>
                        <p className="text-sm text-ink-600 leading-relaxed">{session.notes}</p>
                      </div>
                    )}
                    {session.objectives?.length > 0 && session.objectives[0] && (
                      <div>
                        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Objectives</p>
                        <ul className="space-y-1">
                          {session.objectives.filter(Boolean).map((obj, i) => (
                            <li key={i} className="text-sm text-ink-600 flex items-start gap-2">
                              <span className="text-gold-500 mt-0.5">◆</span>{obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isTeacher && session.teacher_notes && (
                      <div className="bg-ink-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Teacher notes (private)</p>
                        <p className="text-sm text-ink-600 leading-relaxed italic">{session.teacher_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
