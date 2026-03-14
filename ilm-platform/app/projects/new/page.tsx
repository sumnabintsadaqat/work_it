'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProjectPage() {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', phase: 1 as 1|2|3,
    pillar: 'reading' as 'reading'|'writing'|'maths'|'business'|'combined',
    due_date: '', status: 'not_started',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data } = await supabase.from('projects').insert([form]).select().single()
    if (data) router.push(`/projects/${data.id}`)
    setSaving(false)
  }

  return (
    <div className="fade-up max-w-2xl">
      <Link href="/projects" className="text-xs text-ink-400 hover:text-ink-600 mb-6 inline-flex items-center gap-1">
        ← Back to projects
      </Link>
      <div className="card p-8">
        <h1 className="font-display text-3xl text-ink-800 mb-6">New project</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Title</label>
            <input className="input" value={form.title} required placeholder="e.g. Read The Alchemist"
              onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Brief</label>
            <textarea className="textarea" rows={5} value={form.description} required
              placeholder="What should the student do? Be clear and motivating."
              onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-2 uppercase tracking-wider">Phase</label>
              <div className="flex gap-2">
                {([1,2,3] as const).map(p => (
                  <button key={p} type="button" onClick={() => setForm({...form, phase: p})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all
                      ${form.phase === p ? 'bg-gold-400 border-gold-400 text-gold-900' : 'border-ink-200 text-ink-400'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Pillar</label>
              <select className="input" value={form.pillar}
                onChange={e => setForm({...form, pillar: e.target.value as any})}>
                {['reading','writing','maths','business','combined'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Due date</label>
            <input type="date" className="input" value={form.due_date}
              onChange={e => setForm({...form, due_date: e.target.value})} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Creating…' : 'Create project'}
          </button>
        </form>
      </div>
    </div>
  )
}
