'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function WritingFeedback({ entry, role }: { entry: any; role: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [feedback, setFeedback] = useState(entry.teacher_feedback ?? '')
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)

  if (role !== 'teacher') return null

  async function save() {
    setSaving(true)
    await supabase.from('writing_entries').update({ teacher_feedback: feedback }).eq('id', entry.id)
    setSaving(false)
    setShow(false)
    router.refresh()
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-ink-700">Leave feedback</h3>
        {!show && (
          <button onClick={() => setShow(true)} className="btn-gold text-sm">
            {entry.teacher_feedback ? 'Edit feedback' : 'Add feedback'}
          </button>
        )}
      </div>
      {show && (
        <div className="space-y-3">
          <textarea className="textarea h-36"
            placeholder="Encourage, guide, and celebrate this writing…"
            value={feedback} onChange={e => setFeedback(e.target.value)} />
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="btn-gold">{saving ? 'Saving…' : 'Save feedback'}</button>
            <button onClick={() => setShow(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
      {!show && !entry.teacher_feedback && (
        <p className="text-ink-400 text-sm italic">No feedback yet.</p>
      )}
    </div>
  )
}
