import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { CheckCircle, Circle } from 'lucide-react'

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  const { data: session } = await supabase.from('sessions').select('*').eq('id', params.id).single()
  if (!session) notFound()

  return (
    <div className="fade-up max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className={`phase-badge phase-${session.phase}`}>Phase {session.phase}</span>
          <span className="text-xs text-ink-400">{format(new Date(session.date), 'EEEE, d MMMM yyyy')}</span>
          {session.completed
            ? <span className="flex items-center gap-1 text-xs text-sage-600 font-semibold"><CheckCircle size={14} /> Completed</span>
            : <span className="flex items-center gap-1 text-xs text-ink-400"><Circle size={14} /> Not completed</span>}
        </div>
        <h2 className="font-display text-3xl text-ink-800">{session.title}</h2>
      </div>

      {session.objectives?.length > 0 && (
        <div className="card p-6 mb-4">
          <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Objectives</h3>
          <ul className="space-y-2">
            {session.objectives.map((o: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-700 font-body">
                <span className="text-gold-400 font-semibold mt-0.5">→</span> {o}
              </li>
            ))}
          </ul>
        </div>
      )}

      {session.notes && (
        <div className="card p-6 mb-4">
          <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Session notes</h3>
          <p className="font-body text-ink-700 leading-relaxed whitespace-pre-wrap">{session.notes}</p>
        </div>
      )}

      {(profile as any)?.role === 'teacher' && session.teacher_notes && (
        <div className="card p-6 mb-4 bg-gold-50/50 border-gold-200">
          <h3 className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-3">Private teacher notes</h3>
          <p className="font-body text-ink-700 leading-relaxed whitespace-pre-wrap">{session.teacher_notes}</p>
        </div>
      )}
    </div>
  )
}
