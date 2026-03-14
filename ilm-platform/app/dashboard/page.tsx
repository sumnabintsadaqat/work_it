import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: projects } = await supabase.from('projects').select('*').order('created_at')
  const { data: hifzEntries } = await supabase.from('hifz_entries').select('*').order('date', { ascending: false }).limit(5)
  const { data: sessions } = await supabase.from('sessions').select('*').order('date', { ascending: false }).limit(3)
  const { data: readingLogs } = await supabase.from('reading_logs').select('*').order('date', { ascending: false }).limit(3)
  const { data: writingEntries } = await supabase.from('writing_entries').select('*').order('date', { ascending: false }).limit(3)

  const totalProjects = projects?.length ?? 0
  const completedProjects = projects?.filter(p => p.status === 'reviewed').length ?? 0
  const inProgressProjects = projects?.filter(p => p.status === 'in_progress').length ?? 0
  const totalPages = readingLogs?.reduce((sum, r) => sum + (r.pages_read ?? 0), 0) ?? 0
  const totalWords = writingEntries?.reduce((sum, w) => sum + (w.word_count ?? 0), 0) ?? 0

  const phase = completedProjects >= 6 ? 3 : completedProjects >= 3 ? 2 : 1
  const phaseLabel = ['', 'Foundation — Roots & Identity', 'Building — Skills in Action', 'Launching — Real Projects'][phase]

  return (
    <div className="fade-up max-w-5xl">
      <div className="mb-8">
        <p className="text-ink-400 text-sm font-body mb-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        <h1 className="font-display text-4xl text-ink-800 mb-2">
          As-salamu alaykum, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className={`phase-badge phase-${phase}`}>Phase {phase}</span>
          <span className="text-ink-400 text-sm font-body">{phaseLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Projects done', value: completedProjects, sub: `of ${totalProjects}` },
          { label: 'In progress', value: inProgressProjects, sub: 'projects' },
          { label: 'Pages read', value: totalPages, sub: 'total' },
          { label: 'Words written', value: totalWords, sub: 'total' },
        ].map(stat => (
          <div key={stat.label} className="card p-5">
            <p className="text-2xl font-display text-ink-800 font-bold">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-ink-400 font-body">{stat.sub}</p>
            <p className="text-xs text-ink-500 font-body mt-1 font-semibold uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-ink-800">Active projects</h2>
            <Link href="/projects" className="text-xs text-gold-600 hover:text-gold-700 font-semibold">View all →</Link>
          </div>
          <div className="space-y-1">
            {projects?.filter(p => p.status !== 'reviewed').slice(0, 5).map(p => (
              <Link key={p.id} href={`/projects/${p.id}`}
                className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-ink-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-700 group-hover:text-ink-900 truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`phase-badge phase-${p.phase} text-xs py-0`}>Phase {p.phase}</span>
                    <span className="text-xs text-ink-400 capitalize">{p.pillar}</span>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
            {(projects?.filter(p => p.status !== 'reviewed').length ?? 0) === 0 && (
              <p className="text-ink-400 text-sm font-body text-center py-8">All projects complete — masha'Allah!</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display text-lg text-ink-800 mb-3">Hifz today</h3>
            <div className="arabic text-gold-600 text-lg mb-1 text-center leading-loose">
              {hifzEntries?.[0]?.surah_from ?? 'لم يُسجَّل بعد'}
            </div>
            <p className="text-center text-xs text-ink-400 font-body mb-3">
              Last: {hifzEntries?.[0]?.date ? format(new Date(hifzEntries[0].date), 'd MMM') : '—'}
            </p>
            <div className="flex justify-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${i <= (hifzEntries?.[0]?.quality ?? 0) ? 'bg-gold-400 text-gold-900' : 'bg-ink-100 text-ink-300'}`}>
                  ★
                </div>
              ))}
            </div>
            <Link href="/hifz" className="btn-gold w-full text-center block text-xs py-2">
              Log revision →
            </Link>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-lg text-ink-800 mb-3">Last session</h3>
            {sessions?.[0] ? (
              <div>
                <p className="text-sm font-semibold text-ink-700">{sessions[0].title}</p>
                <p className="text-xs text-ink-400 mt-1">{format(new Date(sessions[0].date), 'd MMM yyyy')}</p>
                <p className="text-xs text-ink-500 mt-2 line-clamp-3 leading-relaxed">{sessions[0].notes}</p>
              </div>
            ) : (
              <p className="text-ink-400 text-sm font-body">No sessions yet</p>
            )}
            <Link href="/sessions" className="btn-secondary w-full text-center block text-xs py-2 mt-3">
              View sessions →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink-800">Reading log</h2>
            <Link href="/reading" className="text-xs text-gold-600 font-semibold">Add entry →</Link>
          </div>
          <div className="space-y-2">
            {readingLogs?.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-700 truncate">{r.book_title}</p>
                  <p className="text-xs text-ink-400">{r.author}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-bold text-ink-700">{r.pages_read}p</p>
                  <p className="text-xs text-ink-400">{format(new Date(r.date), 'd MMM')}</p>
                </div>
              </div>
            ))}
            {(readingLogs?.length ?? 0) === 0 && (
              <p className="text-ink-400 text-sm text-center py-4">Start logging your reading</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink-800">Writing</h2>
            <Link href="/writing" className="text-xs text-gold-600 font-semibold">Write now →</Link>
          </div>
          <div className="space-y-2">
            {writingEntries?.slice(0, 3).map(w => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-700 truncate">{w.title}</p>
                  <span className="text-xs text-ink-400 capitalize">{w.type}</span>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-bold text-ink-700">{w.word_count}w</p>
                  <p className="text-xs text-ink-400">{format(new Date(w.date), 'd MMM')}</p>
                </div>
              </div>
            ))}
            {(writingEntries?.length ?? 0) === 0 && (
              <p className="text-ink-400 text-sm text-center py-4">Start your journal today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    not_started: 'bg-ink-100 text-ink-500',
    in_progress: 'bg-gold-100 text-gold-700',
    submitted: 'bg-sage-100 text-sage-700',
    reviewed: 'bg-sage-200 text-sage-800',
  }
  const labels: Record<string, string> = {
    not_started: 'Not started',
    in_progress: 'In progress',
    submitted: 'Submitted',
    reviewed: 'Reviewed',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ml-3 shrink-0 ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
