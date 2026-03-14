'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProjectActions({ project, role }: { project: any; role: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [feedbacking, setFeedbacking] = useState(false)
  const [subText, setSubText] = useState(project.submission_text ?? '')
  const [subUrl, setSubUrl] = useState(project.submission_url ?? '')
  const [feedback, setFeedback] = useState(project.teacher_feedback ?? '')
  const [grade, setGrade] = useState<number>(project.grade ?? 0)
  const [showSubForm, setShowSubForm] = useState(false)
  const [showFbForm, setShowFbForm] = useState(false)

  async function submitWork() {
    setSubmitting(true)
    await supabase.from('projects').update({
      submission_text: subText,
      submission_url: subUrl,
      status: 'submitted',
      updated_at: new Date().toISOString(),
    }).eq('id', project.id)
    setSubmitting(false)
    setShowSubForm(false)
    router.refresh()
  }

  async function saveFeedback() {
    setFeedbacking(true)
    await supabase.from('projects').update({
      teacher_feedback: feedback,
      grade,
      status: 'reviewed',
      updated_at: new Date().toISOString(),
    }).eq('id', project.id)
    setFeedbacking(false)
    setShowFbForm(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Student: submit work */}
      {role === 'student' && project.status !== 'reviewed' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-ink-700">Your submission</h3>
            {!showSubForm && (
              <button onClick={() => setShowSubForm(true)} className="btn-primary text-sm">
                {project.submission_text ? 'Edit submission' : '+ Submit work'}
              </button>
            )}
          </div>
          {showSubForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Your work</label>
                <textarea className="textarea h-48"
                  placeholder="Write your response, essay, or explanation here…"
                  value={subText} onChange={e => setSubText(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">
                  Link (optional)
                </label>
                <input type="url" className="input" placeholder="https://docs.google.com/..."
                  value={subUrl} onChange={e => setSubUrl(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={submitWork} disabled={submitting} className="btn-primary">
                  {submitting ? 'Submitting…' : 'Submit for review'}
                </button>
                <button onClick={() => setShowSubForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}
          {!showSubForm && !project.submission_text && (
            <p className="text-ink-400 text-sm italic">Nothing submitted yet.</p>
          )}
        </div>
      )}

      {/* Teacher: give feedback */}
      {role === 'teacher' && project.status === 'submitted' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-ink-700">Give feedback</h3>
            {!showFbForm && (
              <button onClick={() => setShowFbForm(true)} className="btn-gold text-sm">
                Review submission
              </button>
            )}
          </div>
          {showFbForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Feedback</label>
                <textarea className="textarea h-40"
                  placeholder="Write your feedback, encouragement and guidance…"
                  value={feedback} onChange={e => setFeedback(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Grade / 100</label>
                <input type="number" min={0} max={100} className="input w-32"
                  value={grade} onChange={e => setGrade(parseInt(e.target.value))} />
              </div>
              <div className="flex gap-3">
                <button onClick={saveFeedback} disabled={feedbacking} className="btn-gold">
                  {feedbacking ? 'Saving…' : 'Save feedback'}
                </button>
                <button onClick={() => setShowFbForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
