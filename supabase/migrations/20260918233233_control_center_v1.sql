-- ============================================================
-- LEVEL ACADEMY
-- CONTROL CENTER v1
-- ============================================================

-- ------------------------------------------------------------
-- DIRECTOR ROLE
-- ------------------------------------------------------------

insert into public.roles (
  key,
  name,
  description
)
values (
  'director',
  'Diretor',
  'Direção geral da plataforma LEVEL'
)
on conflict (key) do nothing;


-- ------------------------------------------------------------
-- ROLE HELPERS
-- ------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role('admin')
    or public.has_role('super_admin')
    or public.has_role('director');
$$;


create or replace function public.get_my_role_keys()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    array_agg(r.key order by r.key),
    array[]::text[]
  )
  from public.user_roles ur
  join public.roles r
    on r.id = ur.role_id
  where ur.user_id = auth.uid();
$$;

grant execute
on function public.get_my_role_keys()
to authenticated;


-- ------------------------------------------------------------
-- ANNOUNCEMENTS / POPUPS
-- ------------------------------------------------------------

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  body text,

  announcement_type text not null default 'info'
    check (
      announcement_type in (
        'info',
        'success',
        'warning',
        'promotion',
        'maintenance'
      )
    ),

  course_id uuid
    references public.courses(id)
    on delete cascade,

  audience_segment text,

  is_popup boolean not null default false,
  is_active boolean not null default true,

  starts_at timestamptz not null default now(),
  ends_at timestamptz,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


drop trigger if exists announcements_set_updated_at
on public.announcements;

create trigger announcements_set_updated_at
before update on public.announcements
for each row
execute function public.set_updated_at();


alter table public.announcements
enable row level security;


-- ------------------------------------------------------------
-- ANNOUNCEMENT POLICIES
-- ------------------------------------------------------------

drop policy if exists "announcements_read"
on public.announcements;

create policy "announcements_read"
on public.announcements
for select
to authenticated
using (
  public.is_admin()
  or (
    is_active = true
    and starts_at <= now()
    and (
      ends_at is null
      or ends_at >= now()
    )
  )
);


drop policy if exists "announcements_admin_insert"
on public.announcements;

create policy "announcements_admin_insert"
on public.announcements
for insert
to authenticated
with check (
  public.is_admin()
);


drop policy if exists "announcements_admin_update"
on public.announcements;

create policy "announcements_admin_update"
on public.announcements
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


drop policy if exists "announcements_admin_delete"
on public.announcements;

create policy "announcements_admin_delete"
on public.announcements
for delete
to authenticated
using (
  public.is_admin()
);


-- ------------------------------------------------------------
-- PROFILE ADMIN ACCESS
-- ------------------------------------------------------------

drop policy if exists "profiles_admin_select"
on public.profiles;

create policy "profiles_admin_select"
on public.profiles
for select
to authenticated
using (
  public.is_admin()
);


drop policy if exists "profiles_admin_update"
on public.profiles;

create policy "profiles_admin_update"
on public.profiles
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ------------------------------------------------------------
-- USER ROLES ADMIN
-- ------------------------------------------------------------

drop policy if exists "user_roles_admin_select"
on public.user_roles;

create policy "user_roles_admin_select"
on public.user_roles
for select
to authenticated
using (
  public.is_admin()
);


drop policy if exists "user_roles_admin_insert"
on public.user_roles;

create policy "user_roles_admin_insert"
on public.user_roles
for insert
to authenticated
with check (
  public.is_admin()
);


drop policy if exists "user_roles_admin_delete"
on public.user_roles;

create policy "user_roles_admin_delete"
on public.user_roles
for delete
to authenticated
using (
  public.is_admin()
);


-- ------------------------------------------------------------
-- COURSE ADMIN ACCESS
-- ------------------------------------------------------------

drop policy if exists "courses_admin_select"
on public.courses;

create policy "courses_admin_select"
on public.courses
for select
to authenticated
using (
  public.is_admin()
);


drop policy if exists "courses_admin_insert"
on public.courses;

create policy "courses_admin_insert"
on public.courses
for insert
to authenticated
with check (
  public.is_admin()
);


drop policy if exists "courses_admin_update"
on public.courses;

create policy "courses_admin_update"
on public.courses
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


drop policy if exists "courses_admin_delete"
on public.courses;

create policy "courses_admin_delete"
on public.courses
for delete
to authenticated
using (
  public.is_admin()
);


-- ------------------------------------------------------------
-- PROGRESS ADMIN
-- ------------------------------------------------------------

drop policy if exists "progress_admin_select"
on public.user_progress;

create policy "progress_admin_select"
on public.user_progress
for select
to authenticated
using (
  public.is_admin()
);


drop policy if exists "progress_admin_update"
on public.user_progress;

create policy "progress_admin_update"
on public.user_progress
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

