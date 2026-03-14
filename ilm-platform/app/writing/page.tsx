'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { WritingEntry } from '@/lib/types'

const TYPES = ['journal','essay','summary','reflection'] as const
const TYPE_COLORS: Record<string, string> = {
  journal: 'bg-blue-50 text-blue-700',
  essay: 'bg-purple-50 text-purple-700',
  summary: 'bg-sage-50 text-sage-700',
  reflection: 'bg-gold-50 text-gold-700',
}

const JOURNAL_PROMPTS = [
  'What did I learn today?',
  'What confused me, and why?',
  'What do I want to understand better?',
  'One thing I am grateful for today.',
  'One thing I will do tomorrow.',
]

export default function WritingPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<WritingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [viewEntry, setViewEntry] = useState<WritingEntry|null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [feedback, setFeedback] = useState('')
  const [savingFeedback, setSavingFeedback] = useState(false)

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'journal' as typeof TYPES[number],
    title: '',
    content: '',
  })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
    }
    const { data } = await supabase.from('writing_entries').select('*').order('date', { ascending: false })
    setEntries((data ?? []) as WritingEntry[])
    setLoading(false)
  }

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('writing_entries').insert([{
      ...form,
      word_count: wordCount(form.content),
    }])
    await fetchAll()
    setShowForm(false)
    setSaving(false)
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), type: 'journal', title: '', content: '' })
  }

  async function saveFeedback(id: string) {
    setSavingFeedback(true)
    await supabase.from('writing_entries').update({ teacher_feedback: feedback }).eq('id', id)
    await fetchAll()
    if (viewEntry) setViewEntry({ ...viewEntry, teacher_feedback: feedback })
    setSavingFeedback(false)
  }

  async function deleteEntry(id: string) {
    await supabase.from('writing_entries').delete().eq('id', id)
    setEntries(entries.filter(e => e.id !== id))
    setViewEntry(null)
  }

  const totalWords = entries.reduce((s, e) => s + e.word_count, 0)
  const isTeacher = profile?.role === 'teacher'

  if (viewEntry) {
    return (
      <div className="fade-up max-w-3xl">
        <button onClick={() => setViewEntry(null)}
          className="text-xs text-ink-400 hover:text-ink-600 mb-6 inline-flex items-center gap-1">
          ← Back to writing
        </button>
        <div className="card p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${TYPE_COLORS[viewEntry.type]}`}>
                {viewEntry.type}
              </span>
              <h1 className="font-display text-3xl text-ink-800 mt-2">{viewEntry.title}</h1>
              <p className="text-xs text-ink-400 mt-1">
                {format(new Date(viewEntry.date), 'd MMMM yyyy')} · {viewEntry.word_count} words
              </p>
            </div>
          </div>
          <div className="bg-parchment border border-ink-100 rounded-xl p-6">
            <p className="text-ink-700 font-body leading-loose text-base whitespace-pre-wrap">
              {viewEntry.content}
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => deleteEntry(viewEntry.id)}
              className="text-xs text-ink-300 hover:text-red-500 transition-colors">
              Delete
            </button>
          </div>
        </div>

        {viewEntry.teacher_feedback && (
          <div className="card p-6 mb-6 border-l-4 border-sage-300">
            <h2 className="font-display text-lg text-ink-800 mb-3">Teacher feedback</h2>
            <p className="text-ink-600 font-body leading-relaxed text-sm whitespace-pre-wrap">
              {viewEntry.teacher_feedback}
            </p>
          </div>
        )}

        {isTeacher && (
          <div className="card p-6">
            <h2 className="font-display text-lg text-ink-800 mb-4">
              {viewEntry.teacher_feedback ? 'Edit feedback' : 'Give feedback'}
            </h2>
            <textarea className="textarea mb-4" rows={5}
              value={feedback || viewEntry.teacher_feedback || ''}
              placeholder="Encourage specific things. What worked? What could be richer?"
              onChange={e => setFeedback(e.target.value)} />
            <button onClick={() => saveFeedback(viewEntry.id)} disabled={savingFeedback}
              className="btn-primary">
              {savingFeedback ? 'Saving…' : 'Save feedback'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fade-up max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-ink-800 mb-2">Writing</h1>
          <p className="text-ink-400 text-sm font-body">
            Thinking made visible. Every word builds your mind.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Write now'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-ink-800 font-bold">{totalWords.toLocaleString()}</p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Words written</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-ink-800 font-bold">{entries.length}</p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Entries</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-ink-800 font-bold">
            {entries.length ? Math.round(totalWords / entries.length) : 0}
          </p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Avg words/entry</p>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-display text-xl text-ink-800 mb-5">New entry</h2>

          {form.type === 'journal' && (
            <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-gold-700 uppercase tracking-wider mb-2">Today's journal prompts</p>
              <ol className="space-y-1">
                {JOURNAL_PROMPTS.map((p, i) => (
                  <li key={i} className="text-sm text-gold-800 font-body">
                    <span className="font-bold mr-1">{i+1}.</span> {p}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all
                        ${form.type === t ? 'bg-ink-800 text-parchment border-ink-800' : 'border-ink-200 text-ink-500'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Date</label>
                <input type="date" className="input" value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Title</label>
              <input className="input" value={form.title} required
                placeholder={form.type === 'journal' ? `Journal — ${format(new Date(), 'd MMM yyyy')}` : 'Title of your piece'}
                onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider">Content</label>
                <span className="text-xs text-ink-400">{wordCount(form.content)} words</span>
              </div>
              <textarea className="textarea font-body" rows={12} value={form.content} required
                placeholder="Begin writing here…"
                onChange={e => setForm({...form, content: e.target.value})} />
            </div>
            <button type="submit" disabled={saving || !form.title || !form.content} className="btn-primary w-full">
              {saving ? 'Saving…' : 'Save entry'}
            </button>
          </form>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-display text-xl text-ink-800 mb-4">All entries</h2>
        {loading ? (
          <p className="text-ink-400 text-sm text-center py-8">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-ink-400 text-sm text-center py-8">
            No entries yet. Start your journal above — just 5 sentences is enough.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <button key={entry.id} onClick={() => { setViewEntry(entry); setFeedback(entry.teacher_feedback ?? '') }}
                className="w-full text-left flex items-center justify-between py-3 px-3 rounded-xl hover:bg-ink-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${TYPE_COLORS[entry.type]}`}>
                      {entry.type}
                    </span>
                    {entry.teacher_feedback && (
                      <span className="text-xs text-sage-600 font-semibold">✦ feedback</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-ink-700 group-hover:text-ink-900 truncate">{entry.title}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{format(new Date(entry.date), 'd MMM yyyy')}</p>
                </div>
                <span className="text-sm font-bold text-ink-500 ml-4 shrink-0">{entry.word_count}w</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
