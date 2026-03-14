'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const PROMPTS: Record<string, string[]> = {
  journal: [
    'What did I learn today?',
    'What confused me — and why?',
    'What do I want to understand better?',
    'One thing I am grateful for today.',
    'One thing I will do tomorrow.',
  ],
  reflection: [
    'What surprised me about this topic?',
    'What would I tell someone who has never heard of this?',
    'What question does this raise that I cannot yet answer?',
  ],
  essay: [],
  summary: [],
}

export default function NewWritingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'journal' as 'journal' | 'essay' | 'summary' | 'reflection',
    title: '', content: '',
  })
  const [saving, setSaving] = useState(false)
  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length
  const prompts = PROMPTS[form.type] ?? []

  async function save() {
    setSaving(true)
    await supabase.from('writing_entries').insert([{ ...form, word_count: wordCount }])
    router.push('/writing')
  }

  return (
    <div className="fade-up max-w-xl">
      <div className="mb-6">
        <h2 className="font-display text-3xl text-ink-800">New Writing Entry</h2>
        <p className="text-ink-400 text-sm mt-1 font-body">Write freely — no one judges the draft</p>
      </div>
      <div className="card p-8 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Date</label>
          <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Type</label>
          <div className="flex gap-2 flex-wrap">
            {(['journal', 'essay', 'summary', 'reflection'] as const).map(t => (
              <button key={t} type="button" onClick={() => set('type', t)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                  ${form.type === t ? 'bg-gold-400 border-gold-400 text-gold-900' : 'border-ink-200 text-ink-400 hover:border-gold-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Title</label>
          <input className="input" placeholder="Give your entry a title…"
            value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        {/* Prompts for journal/reflection */}
        {prompts.length > 0 && (
          <div className="bg-gold-50 border border-gold-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-2">Writing prompts</p>
            <ol className="space-y-1">
              {prompts.map((p, i) => (
                <li key={i} className="text-sm text-ink-600 font-body flex gap-2">
                  <span className="text-gold-400 font-semibold shrink-0">{i + 1}.</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider">Write</label>
            <span className="text-xs text-ink-400">{wordCount} words</span>
          </div>
          <textarea className="textarea h-64"
            placeholder="Start writing here…"
            value={form.content} onChange={e => set('content', e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving || !form.title || !form.content} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save entry'}
          </button>
          <button onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  )
}
