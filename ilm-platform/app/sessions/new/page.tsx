'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export default function NewSessionPage() {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '', phase: 1, notes: '', teacher_notes: '',
    objectives: [] as string[], completed: false,
  })
  const [objInput, setObjInput] = useState('')
  const [saving, setSaving] = useState(false)
  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  function addObjective() {
    if (objInput.trim()) {
      set('objectives', [...form.objectives, objInput.trim()])
      setObjInput('')
    }
  }
  function removeObjective(i: number) {
    set('objectives', form.objectives.filter((_, idx) => idx !== i))
  }

  async function save() {
    setSaving(true)
    await supabase.from('sessions').insert([form])
    router.push('/sessions')
  }

  return (
    <div className="fade-up max-w-xl">
      <div className="mb-6">
        <h2 className="font-display text-3xl text-ink-800">Log Session</h2>
        <p className="text-ink-400 text-sm mt-1 font-body">Record today's learning session</p>
      </div>
      <div className="card p-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Date</label>
            <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Phase</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(p => (
                <button key={p} type="button" onClick={() => set('phase', p)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all
                    ${form.phase === p ? 'bg-gold-400 border-gold-400 text-gold-900' : 'border-ink-200 text-ink-400 hover:border-gold-300'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Session title</label>
          <input className="input" placeholder="e.g. Introduction to linear equations"
            value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        {/* Objectives */}
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Objectives</label>
          <div className="flex gap-2 mb-2">
            <input className="input flex-1" placeholder="Add objective…"
              value={objInput} onChange={e => setObjInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addObjective() } }} />
            <button type="button" onClick={addObjective} className="btn-secondary px-3">Add</button>
          </div>
          {form.objectives.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.objectives.map((o, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-ink-50 text-ink-600 text-sm px-3 py-1 rounded-full">
                  {o}
                  <button onClick={() => removeObjective(i)}><X size={12} className="text-ink-400 hover:text-red-500" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Session notes (shared)</label>
          <textarea className="textarea h-28" placeholder="What was covered in this session…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Teacher notes (private)</label>
          <textarea className="textarea h-24" placeholder="Observations, areas to revisit, emotional notes…"
            value={form.teacher_notes} onChange={e => set('teacher_notes', e.target.value)} />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.completed} onChange={e => set('completed', e.target.checked)}
            className="w-4 h-4 accent-gold-400 rounded" />
          <span className="text-sm font-body text-ink-600">Mark as completed</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving || !form.title} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save session'}
          </button>
          <button onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  )
}
