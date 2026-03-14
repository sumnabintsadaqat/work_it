import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="fade-up max-w-lg">
        <p className="arabic text-3xl text-gold-600 mb-6">
          طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
        </p>
        <p className="text-ink-400 text-sm mb-10 font-body italic">
          "Seeking knowledge is an obligation upon every Muslim."
        </p>

        <h1 className="font-display text-5xl text-ink-800 mb-4 leading-tight">
          Ilm
        </h1>
        <p className="text-ink-500 font-body text-lg mb-10 leading-relaxed">
          A six-month journey of reading, writing, mathematics,<br />
          business, and Quran — built for one curious mind.
        </p>

        <Link href="/login" className="btn-primary text-base px-8 py-3 inline-block">
          Begin your journey →
        </Link>
      </div>

      <div className="absolute bottom-8 text-ink-300 text-xs font-body">
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
      </div>
    </main>
  )
}
