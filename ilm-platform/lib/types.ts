export type Role = 'teacher' | 'student'

export type Profile = {
  id: string
  email: string
  full_name: string
  role: Role
  avatar_url?: string
  created_at: string
}

export type Session = {
  id: string
  date: string
  title: string
  phase: 1 | 2 | 3
  notes: string
  teacher_notes: string
  objectives: string[]
  completed: boolean
  created_at: string
}

export type HifzEntry = {
  id: string
  date: string
  surah_from: string
  ayah_from: number
  surah_to: string
  ayah_to: number
  juz: number
  quality: 1 | 2 | 3 | 4 | 5
  notes: string
  created_at: string
}

export type Project = {
  id: string
  title: string
  description: string
  phase: 1 | 2 | 3
  pillar: 'reading' | 'writing' | 'maths' | 'business' | 'combined'
  status: 'not_started' | 'in_progress' | 'submitted' | 'reviewed'
  due_date: string
  submission_text?: string
  submission_url?: string
  teacher_feedback?: string
  grade?: number
  created_at: string
  updated_at: string
}

export type ReadingLog = {
  id: string
  date: string
  book_title: string
  author: string
  pages_read: number
  total_pages: number
  notes: string
  reflection: string
  created_at: string
}

export type WritingEntry = {
  id: string
  date: string
  type: 'journal' | 'essay' | 'summary' | 'reflection'
  title: string
  content: string
  word_count: number
  teacher_feedback?: string
  created_at: string
}
