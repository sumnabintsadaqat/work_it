# Ilm — Learning Platform

A six-month learning platform built for one student and one teacher.
Stack: **Next.js 14** · **Supabase** · **Tailwind CSS** · **Vercel**

---

## Features

- **Dashboard** — progress overview across all pillars
- **Sessions** — log and review daily learning sessions
- **Hifz** — Quran revision tracker with 30-juz visual grid and quality ratings
- **Projects** — 6-month project journey with student submissions and teacher feedback
- **Reading** — reading log with page progress and reflections
- **Writing** — journal, essays, summaries and reflections with teacher feedback
- **Two roles** — teacher and student views with appropriate permissions

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd ilm-platform
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, run the contents of `supabase/migrations/001_initial.sql`
3. This creates all tables, RLS policies, the auto-profile trigger, and seeds the 8 default projects

### 3. Set environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both values are in your Supabase project → Settings → API.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Creating accounts

1. Visit `/login` and click "Sign up"
2. **Teacher** signs up first — select "Teacher" role
3. **Student** signs up — select "Student" role
4. Both land on the dashboard after signup

> The 8 default projects seeded in the migration are available immediately.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo in the Vercel dashboard.

Add environment variables in Vercel → Project → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Project structure

```
app/
  page.tsx              # Landing page
  login/                # Auth page
  dashboard/            # Main dashboard
  sessions/             # Session log
  hifz/                 # Quran revision tracker
  projects/             # Project tracker
  reading/              # Reading log
  writing/              # Writing entries
components/
  layout/Sidebar.tsx    # Navigation sidebar
lib/
  supabase/             # Client, server, middleware
  types.ts              # TypeScript types
supabase/
  migrations/           # SQL migrations
```

---

## Design

The platform uses a parchment-and-gold aesthetic — warm, scholarly, and calm.
Fonts: Playfair Display (headings) · Source Serif 4 (body) · Noto Naskh Arabic (Quranic text)

---

## Extending

To add more students in future, update the RLS policies in `001_initial.sql` to filter
by `student_id` foreign keys on each table. The current design is intentionally simple
for a 1-teacher / 1-student setup.
