'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { ReadingLog } from '@/lib/types'

export default function ReadingPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<ReadingLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string|null>(null)
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    book_title: '', author: '',
    pages_read: 0, total_pages: 0,
    notes: '', reflection: '',
  })

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoading(true)
    const { data } = await supabase.from('reading_logs').select('*').order('date', { ascending: false })
    setLogs((data ?? []) as ReadingLog[])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('reading_logs').insert([form])
    await fetchLogs()
    setShowForm(false)
    setSaving(false)
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), book_title: '', author: '', pages_read: 0, total_pages: 0, notes: '', reflection: '' })
  }

  async function deleteLog(id: string) {
    await supabase.from('reading_logs').delete().eq('id', id)
    setLogs(logs.filter(l => l.id !== id))
  }

  const totalPages = logs.reduce((s, l) => s + l.pages_read, 0)
  const totalBooks = Array.from(new Set(logs?.map((l: any) => l.book_title))).length
  const currentBook = logs[0]

  return (
    <div className="fade-up max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-ink-800 mb-2">Reading Log</h1>
          <p className="text-ink-400 text-sm font-body">
            "Read in the name of your Lord." — Al-Alaq 96:1
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Log reading'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-ink-800 font-bold">{totalPages.toLocaleString()}</p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Pages read</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-ink-800 font-bold">{totalBooks}</p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Books started</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-ink-800 font-bold">{logs.length}</p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Reading sessions</p>
        </div>
      </div>

      {currentBook && (
        <div className="card p-6 mb-6 bg-gradient-to-r from-ink-800 to-ink-700 text-parchment">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-300 mb-2">Currently reading</p>
          <h2 className="font-display text-2xl mb-1">{currentBook.book_title}</h2>
          {currentBook.author && <p className="text-ink-300 text-sm mb-3">{currentBook.author}</p>}
          {currentBook.total_pages > 0 && (
            <div>
              <div className="flex justify-between text-xs text-ink-300 mb-1">
                <span>Progress</span>
                <span>{currentBook.pages_read} / {currentBook.total_pages} pages</span>
              </div>
              <div className="h-2 bg-ink-600 rounded-full overflow-hidden">
                <div className="h-full bg-gold-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (currentBook.pages_read / currentBook.total_pages) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-display text-xl text-ink-800 mb-5">Log a reading session</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Book title</label>
                <input className="input" value={form.book_title} required
                  placeholder="The Alchemist"
                  onChange={e => setForm({...form, book_title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Author</label>
                <input className="input" value={form.author}
                  placeholder="Paulo Coelho"
                  onChange={e => setForm({...form, author: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Date</label>
                <input type="date" className="input" value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Pages read today</label>
                <input type="number" className="input" min={1} value={form.pages_read || ''}
                  onChange={e => setForm({...form, pages_read: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Total pages</label>
                <input type="number" className="input" min={1} value={form.total_pages || ''}
                  onChange={e => setForm({...form, total_pages: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Notes — what happened in what you read?</label>
              <textarea className="textarea" rows={3} value={form.notes}
                placeholder="A brief summary of what you read today..."
                onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
                Reflection — what did it make you think about?
              </label>
              <textarea className="textarea" rows={3} value={form.reflection}
                placeholder="What did you find interesting, confusing, or meaningful?"
                onChange={e => setForm({...form, reflection: e.target.value})} />
            </div>
            <button type="submit" disabled={saving || !form.book_title || !form.pages_read} className="btn-primary w-full">
              {saving ? 'Saving…' : 'Save reading entry'}
            </button>
          </form>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-display text-xl text-ink-800 mb-4">Reading history</h2>
        {loading ? (
          <p className="text-ink-400 text-sm text-center py-8">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-ink-400 text-sm text-center py-8">No reading sessions yet. Log your first one above.</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="border-b border-ink-50 last:border-0">
                <div className="flex items-center justify-between py-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ink-700 truncate">{log.book_title}</span>
                      {log.author && <span className="text-xs text-ink-400 hidden sm:block">{log.author}</span>}
                    </div>
                    <p className="text-xs text-ink-400 mt-0.5">{format(new Date(log.date), 'd MMM yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="text-sm font-bold text-ink-700">{log.pages_read}p</span>
                    <span className="text-ink-300 text-xs">{expandedId === log.id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {expandedId === log.id && (log.notes || log.reflection) && (
                  <div className="pb-4 space-y-3">
                    {log.notes && (
                      <div className="bg-ink-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-sm text-ink-600 leading-relaxed">{log.notes}</p>
                      </div>
                    )}
                    {log.reflection && (
                      <div className="bg-gold-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-1">Reflection</p>
                        <p className="text-sm text-ink-600 leading-relaxed italic">{log.reflection}</p>
                      </div>
                    )}
                    <button onClick={() => deleteLog(log.id)}
                      className="text-xs text-ink-300 hover:text-red-500 transition-colors">
                      Delete entry
                    </button>
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
