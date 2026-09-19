create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),

  course_id uuid not null
    references public.courses(id)
    on delete cascade,

  slug text not null,
  name text not null,
  description text,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(course_id, slug)
);

create index if not exists subjects_course_idx
on public.subjects(course_id);


create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),

  subject_id uuid not null
    references public.subjects(id)
    on delete cascade,

  title text not null,

  material_type text not null default 'lesson'
    check (
      material_type in (
        'lesson',
        'article',
        'video',
        'pdf',
        'link',
        'flashcard'
      )
    ),

  description text,
  content text,
  external_url text,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create index if not exists materials_subject_idx
on public.materials(subject_id);


alter table public.subjects
enable row level security;

alter table public.materials
enable row level security;


drop policy if exists "subjects_read"
on public.subjects;

create policy "subjects_read"
on public.subjects
for select
to authenticated
using (
  is_active = true
  or public.is_admin()
);


drop policy if exists "subjects_admin"
on public.subjects;

create policy "subjects_admin"
on public.subjects
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


drop policy if exists "materials_read"
on public.materials;

create policy "materials_read"
on public.materials
for select
to authenticated
using (
  is_active = true
  or public.is_admin()
);


drop policy if exists "materials_admin"
on public.materials;

create policy "materials_admin"
on public.materials
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);