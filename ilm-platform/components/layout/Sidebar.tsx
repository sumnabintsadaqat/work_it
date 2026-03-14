'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import {
  LayoutDashboard, BookOpen, PenLine, Folder,
  Star, CalendarDays, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/sessions',   label: 'Sessions',   icon: CalendarDays },
  { href: '/hifz',       label: 'Hifz',       icon: Star },
  { href: '/projects',   label: 'Projects',   icon: Folder },
  { href: '/reading',    label: 'Reading',    icon: BookOpen },
  { href: '/writing',    label: 'Writing',    icon: PenLine },
]

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen border-r border-ink-100 bg-white/40 backdrop-blur-sm
                      flex flex-col py-6 px-4 fixed left-0 top-0">
      {/* Logo */}
      <div className="px-4 mb-8">
        <h1 className="font-display text-2xl text-ink-800">Ilm</h1>
        <p className="text-xs text-ink-400 mt-0.5 font-body arabic text-right">علم</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`nav-link ${pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}`}>
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="mt-6 pt-6 border-t border-ink-100">
        <div className="px-4 mb-3">
          <p className="text-sm font-semibold text-ink-700 font-body">{profile.full_name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-semibold
            ${profile.role === 'teacher' ? 'bg-sage-100 text-sage-700' : 'bg-gold-100 text-gold-700'}`}>
            {profile.role}
          </span>
        </div>
        <button onClick={signOut}
          className="nav-link w-full text-left text-ink-400 hover:text-red-600">
          <LogOut size={16} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
