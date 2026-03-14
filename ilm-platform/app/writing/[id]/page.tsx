import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import WritingFeedback from './WritingFeedback'

const typeColors: Record<string, string> = {
  journal: 'bg-gold-100 text-gold-700',
  essay: 'bg-sage-100 text-sage-700',
  summary: 'bg-ink-100 text-ink-600',
  reflection: 'bg-pink-100 text-pink-700',
}

export default async function WritingEntryPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  const { data: entry } = await supabase.from('writing_entries').select('*').eq('id', params.id).single()
  if (!entry) notFound()

  return (
    <div className="fade-up max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`pillar-badge ${typeColors[entry.type]}`}>{entry.type}</span>
          <span className="text-xs text-ink-400">{format(new Date(entry.date), 'd MMMM yyyy')}</span>
          {entry.word_count > 0 && <span className="text-xs text-ink-400">· {entry.word_count} words</span>}
        </div>
        <h2 className="font-display text-3xl text-ink-800">{entry.title}</h2>
      </div>

      <div className="card p-8 mb-4">
        <p className="font-body text-ink-700 leading-relaxed whitespace-pre-wrap text-base">{entry.content}</p>
      </div>

      {entry.teacher_feedback && (
        <div className="card p-6 bg-gold-50/50 border-gold-200 mb-4">
          <h3 className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-3">Teacher feedback</h3>
          <p className="font-body text-ink-700 leading-relaxed">{entry.teacher_feedback}</p>
        </div>
      )}

      <WritingFeedback entry={entry} role={(profile as any)?.role ?? 'student'} />
    </div>
  )
}
