import type { Metadata } from 'next'
import { Playfair_Display, Source_Serif_4, Noto_Naskh_Arabic } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '600'],
})

const notoArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Ilm — Learning Platform',
  description: 'A journey of knowledge, character and confidence',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable} ${notoArabic.variable}`}>
      <body className="bg-parchment text-ink-800 font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
