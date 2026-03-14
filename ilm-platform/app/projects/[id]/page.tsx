'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import type { Project } from '@/lib/types'
import Link from 'next/link'

const STATUS_LABELS: Record<string,string> = {
  not_started:'Not started', in_progress:'In progress', submitted:'Submitted', reviewed:'Reviewed ✓'
}
const STATUS_STYLES: Record<string,string> = {
  not_started:'bg-ink-100 text-ink-500', in_progress:'bg-gold-100 text-gold-700',
  submitted:'bg-sage-100 text-sage-700', reviewed:'bg-sage-200 text-sage-800'
}

export default function ProjectDetailPage() {
  const { id } = useParams<{id:string}>()
  const supabase = createClient()
  const [project, setProject] = useState<Project|null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submissionText, setSubmissionText] = useState('')
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [feedback, setFeedback] = useState('')
  const [grade, setGrade] = useState('')
  const [editMode, setEditMode] = useState<'submit'|'feedback'|null>(null)

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
    }
    const { data } = await supabase.from('projects').select('*').eq('id', id).single()
    if (data) {
      setProject(data as Project)
      setSubmissionText(data.submission_text ?? '')
      setSubmissionUrl(data.submission_url ?? '')
      setFeedback(data.teacher_feedback ?? '')
      setGrade(data.grade?.toString() ?? '')
    }
    setLoading(false)
  }

  async function updateStatus(status: string) {
    setSaving(true)
    await supabase.from('projects').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    await fetchAll(); setSaving(false)
  }

  async function submitWork() {
    setSaving(true)
    await supabase.from('projects').update({
      submission_text: submissionText, submission_url: submissionUrl,
      status: 'submitted', updated_at: new Date().toISOString()
    }).eq('id', id)
    await fetchAll(); setEditMode(null); setSaving(false)
  }

  async function saveFeedback() {
    setSaving(true)
    await supabase.from('projects').update({
      teacher_feedback: feedback, grade: grade ? parseInt(grade) : null,
      status: 'reviewed', updated_at: new Date().toISOString()
    }).eq('id', id)
    await fetchAll(); setEditMode(null); setSaving(false)
  }

  if (loading) return <div className="text-ink-400 text-sm p-8">Loading…</div>
  if (!project) return <div className="text-ink-400 text-sm p-8">Project not found.</div>

  const isTeacher = profile?.role === 'teacher'
  const isStudent = profile?.role === 'student'

  return (
    <div className="fade-up max-w-3xl">
      <Link href="/projects" className="text-xs text-ink-400 hover:text-ink-600 mb-6 inline-flex items-center gap-1">
        ← Back to projects
      </Link>
      <div className="card p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`phase-badge phase-${project.phase}`}>Phase {project.phase}</span>
              <span className="text-xs capitalize bg-ink-100 text-ink-600 px-2.5 py-0.5 rounded-full font-semibold">{project.pillar}</span>
              {project.due_date && <span className="text-xs text-ink-400">Due {format(new Date(project.due_date), 'd MMM yyyy')}</span>}
            </div>
            <h1 className="font-display text-3xl text-ink-800">{project.title}</h1>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${STATUS_STYLES[project.status]}`}>
              {STATUS_LABELS[project.status]}
            </span>
            {project.grade != null && <p className="text-2xl font-display font-bold text-gold-600 mt-2">{project.grade}%</p>}
          </div>
        </div>
        <div className="bg-ink-50 rounded-xl p-5 mb-6">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Project brief</h2>
          <p className="text-ink-700 font-body leading-relaxed">{project.description}</p>
        </div>
        {isStudent && project.status === 'not_started' && (
          <button onClick={() => updateStatus('in_progress')} disabled={saving} className="btn-gold mr-3">
            Start project →
          </button>
        )}
        {isStudent && ['in_progress','not_started'].includes(project.status) && (
          <button onClick={() => setEditMode(editMode === 'submit' ? null : 'submit')} className="btn-primary">
            {editMode === 'submit' ? 'Cancel' : project.submission_text ? 'Edit submission' : 'Submit work'}
          </button>
        )}
        {editMode === 'submit' && (
          <div className="mt-6 space-y-4 border-t border-ink-100 pt-6">
            <h3 className="font-display text-lg text-ink-800">Your submission</h3>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Written work</label>
              <textarea className="textarea" rows={10} value={submissionText}
                placeholder="Write your response here. Take your time — this is your work, not a test."
                onChange={e => setSubmissionText(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Link (optional)</label>
              <input type="url" className="input" value={submissionUrl}
                placeholder="https://docs.google.com/..." onChange={e => setSubmissionUrl(e.target.value)} />
            </div>
            <button onClick={submitWork} disabled={saving || !submissionText} className="btn-primary">
              {saving ? 'Saving…' : 'Submit for review'}
            </button>
          </div>
        )}
      </div>

      {project.submission_text && (
        <div className="card p-6 mb-6">
          <h2 className="font-display text-lg text-ink-800 mb-4">Submission</h2>
          <div className="bg-parchment rounded-xl p-5 border border-ink-100">
            <p className="text-ink-700 font-body leading-relaxed whitespace-pre-wrap text-sm">{project.submission_text}</p>
          </div>
          {project.submission_url && (
            <a href={project.submission_url} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700 font-semibold">
              View linked resource →
            </a>
          )}
          <p className="text-xs text-ink-400 mt-3">Submitted {format(new Date(project.updated_at), 'd MMM yyyy')}</p>
        </div>
      )}

      {isTeacher && project.status === 'submitted' && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink-800">Give feedback</h2>
            <button onClick={() => setEditMode(editMode === 'feedback' ? null : 'feedback')} className="btn-secondary text-xs">
              {editMode === 'feedback' ? 'Cancel' : 'Write feedback'}
            </button>
          </div>
          {editMode === 'feedback' && (
            <div className="space-y-4">
              <textarea className="textarea" rows={6} value={feedback}
                placeholder="Be specific and encouraging. What did they do well? What to improve?"
                onChange={e => setFeedback(e.target.value)} />
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Grade (0–100)</label>
                  <input type="number" className="input w-28" min={0} max={100} value={grade}
                    onChange={e => setGrade(e.target.value)} placeholder="85" />
                </div>
              </div>
              <button onClick={saveFeedback} disabled={saving || !feedback} className="btn-primary">
                {saving ? 'Saving…' : 'Save & mark reviewed'}
              </button>
            </div>
          )}
        </div>
      )}

      {project.teacher_feedback && (
        <div className="card p-6 border-l-4 border-sage-300">
          <h2 className="font-display text-lg text-ink-800 mb-3">Teacher feedback</h2>
          <p className="text-ink-600 font-body leading-relaxed text-sm whitespace-pre-wrap">{project.teacher_feedback}</p>
        </div>
      )}
    </div>
  )
}
