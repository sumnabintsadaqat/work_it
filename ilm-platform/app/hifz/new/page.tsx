'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'

const SURAHS = [
  'Al-Fatiha','Al-Baqarah','Al-Imran','An-Nisa','Al-Maidah','Al-Anam','Al-Araf','Al-Anfal',
  'At-Tawbah','Yunus','Hud','Yusuf','Ar-Rad','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf',
  'Maryam','Ta-Ha','Al-Anbiya','Al-Hajj','Al-Muminun','An-Nur','Al-Furqan','Ash-Shuara',
  'An-Naml','Al-Qasas','Al-Ankabut','Ar-Rum','Luqman','As-Sajdah','Al-Ahzab','Saba','Fatir',
  'Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Ash-Shura','Az-Zukhruf',
  'Ad-Dukhan','Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf','Adh-Dhariyat',
  'At-Tur','An-Najm','Al-Qamar','Ar-Rahman','Al-Waqiah','Al-Hadid','Al-Mujadila','Al-Hashr',
  'Al-Mumtahanah','As-Saf','Al-Jumuah','Al-Munafiqun','At-Taghabun','At-Talaq','At-Tahrim',
  'Al-Mulk','Al-Qalam','Al-Haqqah','Al-Maarij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir',
  'Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Naziat','Abasa','At-Takwir','Al-Infitar',
  'Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-Ala','Al-Ghashiyah','Al-Fajr',
  'Al-Balad','Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr',
  'Al-Bayyinah','Az-Zalzalah','Al-Adiyat','Al-Qariah','At-Takathur','Al-Asr','Al-Humazah',
  'Al-Fil','Quraysh','Al-Maun','Al-Kawthar','Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas',
  'Al-Falaq','An-Nas'
]

export default function NewHifzPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    surah_from: 'Al-Fatiha',
    ayah_from: 1,
    surah_to: 'Al-Fatiha',
    ayah_to: 7,
    juz: 1,
    quality: 3,
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    await supabase.from('hifz_entries').insert([form])
    router.push('/hifz')
  }

  return (
    <div className="fade-up max-w-xl">
      <div className="mb-6">
        <h2 className="font-display text-3xl text-ink-800">Log Hifz Revision</h2>
        <p className="text-ink-400 text-sm mt-1 font-body">Record today's revision session</p>
      </div>

      <div className="card p-8 space-y-6">
        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Date</label>
          <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>

        {/* Juz */}
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Juz revised</label>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
              <button key={j} type="button" onClick={() => set('juz', j)}
                className={`aspect-square rounded-xl text-sm font-semibold border transition-all
                  ${form.juz === j ? 'bg-gold-400 border-gold-400 text-gold-900' : 'border-ink-200 text-ink-400 hover:border-gold-300'}`}>
                {j}
              </button>
            ))}
          </div>
        </div>

        {/* Surah range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">From surah</label>
            <select className="input" value={form.surah_from} onChange={e => set('surah_from', e.target.value)}>
              {SURAHS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">From ayah</label>
            <input type="number" min={1} className="input" value={form.ayah_from}
              onChange={e => set('ayah_from', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">To surah</label>
            <select className="input" value={form.surah_to} onChange={e => set('surah_to', e.target.value)}>
              {SURAHS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">To ayah</label>
            <input type="number" min={1} className="input" value={form.ayah_to}
              onChange={e => set('ayah_to', parseInt(e.target.value))} />
          </div>
        </div>

        {/* Quality stars */}
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-2 uppercase tracking-wider">Quality of recitation</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} type="button" onClick={() => set('quality', s)}
                className="transition-transform hover:scale-110 active:scale-95">
                <Star size={28} strokeWidth={1.5}
                  className={s <= form.quality ? 'text-gold-400 fill-gold-400' : 'text-ink-200'} />
              </button>
            ))}
            <span className="text-sm text-ink-400 ml-2 font-body">
              {['', 'Needs much work', 'Needs work', 'Good', 'Very good', 'Excellent'][form.quality]}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">Notes</label>
          <textarea className="textarea h-24" placeholder="Any difficult parts, observations…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving} className="btn-gold flex-1">
            {saving ? 'Saving…' : 'Save revision'}
          </button>
          <button onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  )
}
