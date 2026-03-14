-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null check (role in ('teacher', 'student')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Sessions (lesson records)
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  date date not null default current_date,
  title text not null,
  phase smallint not null check (phase in (1, 2, 3)),
  notes text default '',
  teacher_notes text default '',
  objectives text[] default '{}',
  completed boolean default false,
  created_at timestamptz default now()
);

-- Hifz revision log
create table public.hifz_entries (
  id uuid default uuid_generate_v4() primary key,
  date date not null default current_date,
  surah_from text not null,
  ayah_from integer not null,
  surah_to text not null,
  ayah_to integer not null,
  juz integer not null check (juz between 1 and 30),
  quality smallint not null check (quality between 1 and 5),
  notes text default '',
  created_at timestamptz default now()
);

-- Projects
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  phase smallint not null check (phase in (1, 2, 3)),
  pillar text not null check (pillar in ('reading', 'writing', 'maths', 'business', 'combined')),
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'submitted', 'reviewed')),
  due_date date,
  submission_text text,
  submission_url text,
  teacher_feedback text,
  grade integer check (grade between 0 and 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reading log
create table public.reading_logs (
  id uuid default uuid_generate_v4() primary key,
  date date not null default current_date,
  book_title text not null,
  author text default '',
  pages_read integer not null default 0,
  total_pages integer not null default 0,
  notes text default '',
  reflection text default '',
  created_at timestamptz default now()
);

-- Writing entries (journal, essays, reflections)
create table public.writing_entries (
  id uuid default uuid_generate_v4() primary key,
  date date not null default current_date,
  type text not null check (type in ('journal', 'essay', 'summary', 'reflection')),
  title text not null,
  content text not null,
  word_count integer default 0,
  teacher_feedback text,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.hifz_entries enable row level security;
alter table public.projects enable row level security;
alter table public.reading_logs enable row level security;
alter table public.writing_entries enable row level security;

-- Profiles: users see own profile, teacher sees all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Teacher can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
);

-- All other tables: authenticated users can read/write (small 2-person app)
create policy "Authenticated read sessions" on public.sessions for select to authenticated using (true);
create policy "Authenticated write sessions" on public.sessions for insert to authenticated with check (true);
create policy "Authenticated update sessions" on public.sessions for update to authenticated using (true);

create policy "Authenticated read hifz" on public.hifz_entries for select to authenticated using (true);
create policy "Authenticated write hifz" on public.hifz_entries for insert to authenticated with check (true);
create policy "Authenticated update hifz" on public.hifz_entries for update to authenticated using (true);
create policy "Authenticated delete hifz" on public.hifz_entries for delete to authenticated using (true);

create policy "Authenticated read projects" on public.projects for select to authenticated using (true);
create policy "Authenticated write projects" on public.projects for insert to authenticated with check (true);
create policy "Authenticated update projects" on public.projects for update to authenticated using (true);

create policy "Authenticated read reading" on public.reading_logs for select to authenticated using (true);
create policy "Authenticated write reading" on public.reading_logs for insert to authenticated with check (true);
create policy "Authenticated update reading" on public.reading_logs for update to authenticated using (true);
create policy "Authenticated delete reading" on public.reading_logs for delete to authenticated using (true);

create policy "Authenticated read writing" on public.writing_entries for select to authenticated using (true);
create policy "Authenticated write writing" on public.writing_entries for insert to authenticated with check (true);
create policy "Authenticated update writing" on public.writing_entries for update to authenticated using (true);
create policy "Authenticated delete writing" on public.writing_entries for delete to authenticated using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed default projects for 6-month journey
insert into public.projects (title, description, phase, pillar, status, due_date) values
('Read The Alchemist', 'Read the full book and write a 1-page reflection: What does Santiago fear? What do you fear?', 1, 'reading', 'not_started', current_date + interval '30 days'),
('Daily Journal — Week 1', 'Write 5 sentences every day: what you learned, what confused you, what you want to know next, one gratitude, one plan for tomorrow.', 1, 'writing', 'not_started', current_date + interval '7 days'),
('Logistics Maths Problem Set', 'Your father moves containers: 340 tons to move, 12 tons per truck. How many trucks? What if one breaks down? Show all working.', 1, 'maths', 'not_started', current_date + interval '14 days'),
('Business Report — Father''s Company', 'Research and write a 2-page analyst report on the Saudi logistics sector and your father''s company. Include economics of moving cargo.', 2, 'business', 'not_started', current_date + interval '60 days'),
('Physics in Logistics Essay', 'Write a 1-page essay: what physical forces act on a loaded container ship? How does aerodynamics affect truck fuel efficiency?', 2, 'maths', 'not_started', current_date + interval '75 days'),
('Islamic Business Ethics Report', 'Research the Prophet''s ﷺ life as a merchant. Write about Khadijah''s رضي الله عنها business. What principles should guide a Muslim businessman?', 2, 'business', 'not_started', current_date + interval '90 days'),
('Capstone: My Business Plan', 'Design a small business from scratch. Write a 1-page plan: what it does, startup costs, projected income, physical constraints, Islamic ethical framework.', 3, 'combined', 'not_started', current_date + interval '160 days'),
('Final Presentation', 'Present your business plan as a 20-minute video presentation. You are pitching to investors. Be confident. You''ve earned this.', 3, 'combined', 'not_started', current_date + interval '175 days');
