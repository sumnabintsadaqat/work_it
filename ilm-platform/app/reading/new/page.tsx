'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewReadingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    book_title: '', author: '', pages_read: 0, total_pages: 0,
    notes: '', reflection: '',
  })
  const [saving, setSaving] = useState(false)
  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    await supabase.from('reading_logs').insert([form])
    router.push('/reading')
  }

  return (
    <div className="fade-up max-w-xl">
      <div className="mb-6">
        <h2 className="font-display text-3xl text-ink-800">Log Reading Session</h2>
        <p className="text-ink-400 text-sm mt-1 font-body">Record what you read today</p>
      </div>
      <div className="card p-8 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Date</label>
          <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Book title</label>
            <input className="input" placeholder="The Alchemist"
              value={form.book_title} onChange={e => set('book_title', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Author</label>
            <input className="input" placeholder="Paulo Coelho"
              value={form.author} onChange={e => set('author', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Pages read today</label>
            <input type="number" min={0} className="input" value={form.pages_read}
              onChange={e => set('pages_read', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Total pages in book</label>
            <input type="number" min={0} className="input" value={form.total_pages}
              onChange={e => set('total_pages', parseInt(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Notes</label>
          <textarea className="textarea h-24" placeholder="Key ideas, passages you liked…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
            Reflection — what did this make you think about?
          </label>
          <textarea className="textarea h-28" placeholder="Write in your own words…"
            value={form.reflection} onChange={e => set('reflection', e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving || !form.book_title} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save reading log'}
          </button>
          <button onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  )
}
