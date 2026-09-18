-- ============================================================
-- LEVEL ACADEMY
-- Courses + Engagement + XP Active
-- ============================================================

create extension if not exists pg_cron;

-- ============================================================
-- COURSES
-- ============================================================

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,
  name text not null,
  short_name text,
  description text,

  theme_key text not null default 'level',

  icon_emoji text,

  audience_segment text not null default 'university'
    check (
      audience_segment in (
        'university',
        'adult',
        'teen',
        'kids'
      )
    ),

  is_active boolean not null default true,
  is_public boolean not null default true,

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

-- ============================================================
-- USER COURSES
-- ============================================================

create table if not exists public.user_courses (
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  course_id uuid not null
    references public.courses(id)
    on delete cascade,

  status text not null default 'active'
    check (
      status in (
        'active',
        'paused',
        'completed',
        'archived'
      )
    ),

  joined_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now(),

  primary key (user_id, course_id)
);

create index if not exists user_courses_user_idx
  on public.user_courses(user_id);

-- ============================================================
-- ACTIVE COURSE
-- ============================================================

alter table public.profiles
add column if not exists active_course_id uuid
references public.courses(id)
on delete set null;

-- ============================================================
-- PROGRESS / ENGAGEMENT
-- ============================================================

create table if not exists public.user_progress (
  user_id uuid primary key
    references public.profiles(id)
    on delete cascade,

  lifetime_xp bigint not null default 0
    check (lifetime_xp >= 0),

  active_xp bigint not null default 0
    check (active_xp >= 0),

  level integer not null default 1
    check (level >= 1),

  level_coins bigint not null default 0
    check (level_coins >= 0),

  streak_days integer not null default 1
    check (streak_days >= 0),

  decay_rate_per_hour integer not null default 5
    check (decay_rate_per_hour >= 0),

  last_activity_at timestamptz not null default now(),

  last_decay_at timestamptz,

  updated_at timestamptz not null default now()
);

create trigger user_progress_set_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();

-- existing users
insert into public.user_progress (user_id)
select id
from public.profiles
on conflict (user_id) do nothing;

-- ============================================================
-- ENROLL + ACTIVATE COURSE
-- ============================================================

create or replace function public.enroll_and_activate_course(
  requested_course_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.courses
    where id = requested_course_id
      and is_active = true
  ) then
    raise exception 'Course unavailable';
  end if;

  insert into public.user_courses (
    user_id,
    course_id,
    status,
    last_accessed_at
  )
  values (
    auth.uid(),
    requested_course_id,
    'active',
    now()
  )
  on conflict (user_id, course_id)
  do update
  set
    status = 'active',
    last_accessed_at = now();

  update public.profiles
  set active_course_id = requested_course_id
  where id = auth.uid();

end;
$$;

-- ============================================================
-- SWITCH ACTIVE COURSE
-- ============================================================

create or replace function public.activate_course(
  requested_course_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

  if not exists (
    select 1
    from public.user_courses
    where user_id = auth.uid()
      and course_id = requested_course_id
      and status = 'active'
  ) then
    raise exception 'Course not linked to user';
  end if;

  update public.profiles
  set active_course_id = requested_course_id
  where id = auth.uid();

  update public.user_courses
  set last_accessed_at = now()
  where user_id = auth.uid()
    and course_id = requested_course_id;

end;
$$;

-- ============================================================
-- RECORD USER ACTIVITY
-- ============================================================

create or replace function public.record_user_activity()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  previous_activity timestamptz;
  current_streak integer;
begin

  select
    last_activity_at,
    streak_days
  into
    previous_activity,
    current_streak
  from public.user_progress
  where user_id = auth.uid();

  if previous_activity is null then

    insert into public.user_progress (
      user_id,
      streak_days,
      last_activity_at
    )
    values (
      auth.uid(),
      1,
      now()
    )
    on conflict (user_id) do nothing;

    return;

  end if;

  if previous_activity::date = current_date then
    current_streak := current_streak;

  elsif previous_activity::date = current_date - 1 then
    current_streak := current_streak + 1;

  else
    current_streak := 1;
  end if;

  update public.user_progress
  set
    streak_days = current_streak,
    last_activity_at = now(),
    last_decay_at = null
  where user_id = auth.uid();

end;
$$;

-- ============================================================
-- XP DECAY
-- Starts after 72h inactivity
-- Default: -5 active XP for every inactive hour after 72h.
-- Lifetime XP is NEVER removed.
-- ============================================================

create or replace function public.apply_xp_decay()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

  update public.user_progress
  set
    active_xp =
      greatest(
        0,
        active_xp -
        (
          floor(
            extract(
              epoch from (
                now() -
                greatest(
                  last_activity_at + interval '72 hours',
                  coalesce(
                    last_decay_at,
                    last_activity_at + interval '72 hours'
                  )
                )
              )
            ) / 3600
          )::integer
          * decay_rate_per_hour
        )
      ),

    last_decay_at = now()

  where active_xp > 0
    and now() >= last_activity_at + interval '72 hours'
    and now() >=
      greatest(
        last_activity_at + interval '72 hours',
        coalesce(
          last_decay_at,
          last_activity_at + interval '72 hours'
        )
      ) + interval '1 hour';

end;
$$;

-- ============================================================
-- CRON - EVERY HOUR
-- ============================================================

select cron.schedule(
  'level_xp_decay_hourly',
  '0 * * * *',
  $$ select public.apply_xp_decay(); $$
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.courses enable row level security;
alter table public.user_courses enable row level security;
alter table public.user_progress enable row level security;

create policy "courses_public_read"
on public.courses
for select
to anon, authenticated
using (
  is_public = true
  and is_active = true
);

create policy "user_courses_read_own"
on public.user_courses
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "user_progress_read_own"
on public.user_progress
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

-- ============================================================
-- UPDATE NEW USER TRIGGER
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_role_id uuid;
begin

  insert into public.profiles (
    id,
    first_name,
    last_name,
    display_name
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'first_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  insert into public.user_progress (
    user_id
  )
  values (
    new.id
  )
  on conflict (user_id) do nothing;

  select id
  into default_role_id
  from public.roles
  where key = 'student'
  limit 1;

  if default_role_id is not null then

    insert into public.user_roles (
      user_id,
      role_id
    )
    values (
      new.id,
      default_role_id
    )
    on conflict do nothing;

  end if;

  return new;
end;
$$;

-- ============================================================
-- SEED COURSES
-- ============================================================

insert into public.courses (
  slug,
  name,
  short_name,
  description,
  theme_key,
  icon_emoji,
  audience_segment,
  sort_order
)
values

(
  'direito',
  'Direito',
  'Direito',
  'Graduação, conteúdos jurídicos, concursos e carreira.',
  'direito',
  '⚖️',
  'university',
  10
),

(
  'enfermagem',
  'Enfermagem',
  'Enfermagem',
  'Conteúdos acadêmicos, prática e carreira em enfermagem.',
  'enfermagem',
  '🩺',
  'university',
  20
),

(
  'medicina',
  'Medicina',
  'Medicina',
  'Conteúdo acadêmico, revisão e preparação médica.',
  'medicina',
  '🧬',
  'university',
  30
),

(
  'administracao',
  'Administração',
  'Administração',
  'Gestão, negócios, carreira e desenvolvimento profissional.',
  'level',
  '📊',
  'university',
  40
),

(
  'ensino-medio',
  'Ensino Médio',
  'Ensino Médio',
  'Estudo, ENEM, vestibulares e preparação escolar.',
  'teens',
  '⚡',
  'teen',
  50
),

(
  'ensino-fundamental',
  'Ensino Fundamental',
  'LEVEL Kids',
  'Aprendizado gamificado para estudantes do ensino fundamental.',
  'kids',
  '🚀',
  'kids',
  60
)

on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  theme_key = excluded.theme_key,
  icon_emoji = excluded.icon_emoji,
  audience_segment = excluded.audience_segment,
  sort_order = excluded.sort_order;

