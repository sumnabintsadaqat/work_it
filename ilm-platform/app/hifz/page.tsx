'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { HifzEntry } from '@/lib/types'

const SURAHS = [
  'Al-Fatiha','Al-Baqarah','Al-Imran','An-Nisa','Al-Maidah','Al-Anam','Al-Araf','Al-Anfal',
  'At-Tawbah','Yunus','Hud','Yusuf','Ar-Rad','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf',
  'Maryam','Ta-Ha','Al-Anbiya','Al-Hajj','Al-Muminun','An-Nur','Al-Furqan','Ash-Shuara',
  'An-Naml','Al-Qasas','Al-Ankabut','Ar-Rum','Luqman','As-Sajdah','Al-Ahzab','Saba','Fatir',
  'Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhan',
  'Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf','Adh-Dhariyat','At-Tur',
  'An-Najm','Al-Qamar','Ar-Rahman','Al-Waqiah','Al-Hadid','Al-Mujadila','Al-Hashr','Al-Mumtahanah',
  'As-Saf','Al-Jumuah','Al-Munafiqun','At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam',
  'Al-Haqqah','Al-Maarij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddathir','Al-Qiyamah','Al-Insan',
  'Al-Mursalat','An-Naba','An-Naziat','Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq',
  'Al-Buruj','At-Tariq','Al-Ala','Al-Ghashiyah','Al-Fajr','Al-Balad','Ash-Shams','Al-Layl',
  'Ad-Duha','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-Adiyat',
  'Al-Qariah','At-Takathur','Al-Asr','Al-Humazah','Al-Fil','Quraysh','Al-Maun','Al-Kawthar',
  'Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'
]

const QUALITY_LABELS = ['','Weak','Fair','Good','Strong','Excellent']

export default function HifzPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<HifzEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    surah_from: 'Al-Fatiha', ayah_from: 1,
    surah_to: 'Al-Fatiha', ayah_to: 7,
    juz: 1, quality: 3 as 1|2|3|4|5, notes: '',
  })

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    setLoading(true)
    const { data } = await supabase.from('hifz_entries').select('*').order('date', { ascending: false })
    setEntries((data ?? []) as HifzEntry[])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('hifz_entries').insert([form])
    await fetchEntries()
    setShowForm(false)
    setSaving(false)
  }

  async function deleteEntry(id: string) {
    await supabase.from('hifz_entries').delete().eq('id', id)
    setEntries(entries.filter(e => e.id !== id))
  }

  const avgQuality = entries.length
    ? (entries.reduce((s, e) => s + e.quality, 0) / entries.length).toFixed(1) : '—'
  const juzRevised = Array.from(new Set(entries?.map((e: any) => e.juz)))

  return (
    <div className="fade-up max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-ink-800 mb-1">Hifz Revision</h1>
          <p className="arabic text-gold-600 text-xl">مراجعة الحفظ</p>
          <p className="text-ink-400 text-sm font-body mt-2">The foundation of everything. Track every revision.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold">
          {showForm ? 'Cancel' : '+ Log revision'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-gold-600 font-bold">{entries.length}</p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Sessions logged</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-gold-600 font-bold">{avgQuality}</p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Avg quality</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-display text-gold-600 font-bold">{juzRevised.length}/30</p>
          <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider mt-1">Juz covered</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-display text-lg text-ink-800 mb-4">Juz progress grid</h2>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({length:30}, (_,i) => i+1).map(j => (
            <div key={j} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors
              ${juzRevised.includes(j) ? 'bg-gold-400 text-gold-900' : 'bg-ink-100 text-ink-400'}`}>
              {j}
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 border-gold-200">
          <h2 className="font-display text-xl text-ink-800 mb-5">Log today's revision</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Date</label>
                <input type="date" className="input" value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Juz</label>
                <input type="number" className="input" min={1} max={30} value={form.juz}
                  onChange={e => setForm({...form, juz: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">From surah</label>
                <select className="input" value={form.surah_from}
                  onChange={e => setForm({...form, surah_from: e.target.value})}>
                  {SURAHS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">From ayah</label>
                <input type="number" className="input" min={1} value={form.ayah_from}
                  onChange={e => setForm({...form, ayah_from: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">To surah</label>
                <select className="input" value={form.surah_to}
                  onChange={e => setForm({...form, surah_to: e.target.value})}>
                  {SURAHS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">To ayah</label>
                <input type="number" className="input" min={1} value={form.ayah_to}
                  onChange={e => setForm({...form, ayah_to: parseInt(e.target.value)})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-2 uppercase tracking-wider">
                Quality — {QUALITY_LABELS[form.quality]}
              </label>
              <div className="flex gap-2">
                {([1,2,3,4,5] as const).map(q => (
                  <button key={q} type="button" onClick={() => setForm({...form, quality: q})}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all
                      ${form.quality >= q ? 'bg-gold-400 border-gold-400 text-gold-900' : 'border-ink-200 text-ink-400'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Notes</label>
              <textarea className="textarea" rows={3} value={form.notes}
                placeholder="Mistakes, areas to focus on next time..."
                onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : 'Save revision'}
            </button>
          </form>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-display text-xl text-ink-800 mb-4">Revision history</h2>
        {loading ? (
          <p className="text-ink-400 text-sm text-center py-8">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-ink-400 text-sm text-center py-8">No revisions logged yet.</p>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="flex items-start justify-between py-4 border-b border-ink-50 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-ink-700">
                      {entry.surah_from} {entry.ayah_from} — {entry.surah_to} {entry.ayah_to}
                    </span>
                    <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-semibold">
                      Juz {entry.juz}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-400">{format(new Date(entry.date), 'd MMM yyyy')}</span>
                    <span className="text-xs text-ink-300">·</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-xs ${i <= entry.quality ? 'text-gold-500' : 'text-ink-200'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-xs text-ink-400">{QUALITY_LABELS[entry.quality]}</span>
                  </div>
                  {entry.notes && <p className="text-xs text-ink-500 mt-1.5 leading-relaxed">{entry.notes}</p>}
                </div>
                <button onClick={() => deleteEntry(entry.id)}
                  className="text-ink-300 hover:text-red-500 transition-colors ml-4 text-xs mt-1">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
