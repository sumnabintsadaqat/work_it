'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Project } from '@/lib/types'

const PILLARS = ['all','reading','writing','maths','business','combined']
const STATUSES = ['all','not_started','in_progress','submitted','reviewed']

const STATUS_STYLES: Record<string, string> = {
  not_started: 'bg-ink-100 text-ink-500',
  in_progress: 'bg-gold-100 text-gold-700',
  submitted: 'bg-sage-100 text-sage-700',
  reviewed: 'bg-sage-200 text-sage-800',
}
const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  submitted: 'Submitted',
  reviewed: 'Reviewed ✓',
}

const PILLAR_STYLES: Record<string, string> = {
  reading: 'bg-blue-50 text-blue-700',
  writing: 'bg-purple-50 text-purple-700',
  maths: 'bg-orange-50 text-orange-700',
  business: 'bg-sage-50 text-sage-700',
  combined: 'bg-gold-50 text-gold-700',
}

export default function ProjectsPage() {
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPillar, setFilterPillar] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
    }
    const { data } = await supabase.from('projects').select('*').order('phase').order('created_at')
    setProjects((data ?? []) as Project[])
    setLoading(false)
  }

  const filtered = projects.filter(p =>
    (filterPillar === 'all' || p.pillar === filterPillar) &&
    (filterStatus === 'all' || p.status === filterStatus)
  )

  const byPhase = [1,2,3].map(ph => ({
    phase: ph,
    items: filtered.filter(p => p.phase === ph)
  }))

  const PHASE_LABELS = ['', 'Foundation — Roots & Identity', 'Building — Skills in Action', 'Launching — Real Projects']

  return (
    <div className="fade-up max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-ink-800 mb-2">Projects</h1>
          <p className="text-ink-400 text-sm font-body">Six months of purposeful work — each project builds the next.</p>
        </div>
        {profile?.role === 'teacher' && (
          <Link href="/projects/new" className="btn-primary">+ New project</Link>
        )}
      </div>

      {/* Progress bar */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-ink-600 font-body">Overall progress</span>
          <span className="text-sm text-ink-400">
            {projects.filter(p=>p.status==='reviewed').length} / {projects.length} complete
          </span>
        </div>
        <div className="h-3 bg-ink-100 rounded-full overflow-hidden">
          <div className="h-full bg-gold-400 rounded-full transition-all duration-700"
            style={{ width: `${projects.length ? (projects.filter(p=>p.status==='reviewed').length / projects.length) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex gap-1 bg-ink-50 rounded-xl p-1">
          {PILLARS.map(p => (
            <button key={p} onClick={() => setFilterPillar(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                ${filterPillar === p ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-400 hover:text-ink-600'}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-ink-50 rounded-xl p-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                ${filterStatus === s ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-400 hover:text-ink-600'}`}>
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-ink-400 text-sm text-center py-12">Loading projects…</p>
      ) : (
        <div className="space-y-8">
          {byPhase.map(({ phase, items }) => items.length > 0 && (
            <div key={phase}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`phase-badge phase-${phase} text-sm`}>Phase {phase}</span>
                <h2 className="font-display text-lg text-ink-700">{PHASE_LABELS[phase]}</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {items.map(project => (
                  <Link key={project.id} href={`/projects/${project.id}`}
                    className="card p-5 hover:shadow-md transition-all group block">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`pillar-badge ${PILLAR_STYLES[project.pillar]}`}>
                            {project.pillar}
                          </span>
                          {project.due_date && (
                            <span className="text-xs text-ink-400">
                              Due {format(new Date(project.due_date), 'd MMM yyyy')}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg text-ink-800 group-hover:text-gold-700 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-ink-500 mt-1 line-clamp-2 leading-relaxed font-body">
                          {project.description}
                        </p>
                        {project.teacher_feedback && (
                          <p className="text-xs text-sage-600 mt-2 italic">
                            ✦ Teacher feedback available
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${STATUS_STYLES[project.status]}`}>
                          {STATUS_LABELS[project.status]}
                        </span>
                        {project.grade !== null && project.grade !== undefined && (
                          <span className="text-lg font-display font-bold text-gold-600">{project.grade}%</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-ink-400 text-sm text-center py-12">No projects match your filters.</p>
          )}
        </div>
      )}
    </div>
  )
}
