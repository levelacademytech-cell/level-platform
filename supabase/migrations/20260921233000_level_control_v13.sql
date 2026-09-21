-- ============================================================
-- LEVEL ADV V13 - ADMIN CONTROL / ACTIVITY / BRANDING
-- ============================================================

create table if not exists public.adv_user_presence (
  user_id uuid primary key
    references public.profiles(id)
    on delete cascade,
  last_seen_at timestamptz not null default now(),
  last_path text,
  updated_at timestamptz not null default now()
);

create table if not exists public.adv_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  event_type text not null,
  path text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists adv_activity_log_user_idx
on public.adv_activity_log(user_id, occurred_at desc);

create index if not exists adv_activity_log_time_idx
on public.adv_activity_log(occurred_at desc);

alter table public.adv_user_presence
enable row level security;

alter table public.adv_activity_log
enable row level security;

drop policy if exists "adv_presence_select" on public.adv_user_presence;
create policy "adv_presence_select"
on public.adv_user_presence
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "adv_presence_insert" on public.adv_user_presence;
create policy "adv_presence_insert"
on public.adv_user_presence
for insert
to authenticated
with check (
  user_id = auth.uid()
);

drop policy if exists "adv_presence_update" on public.adv_user_presence;
create policy "adv_presence_update"
on public.adv_user_presence
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

drop policy if exists "adv_activity_select" on public.adv_activity_log;
create policy "adv_activity_select"
on public.adv_activity_log
for select
to authenticated
using (
  public.is_admin()
);

drop policy if exists "adv_activity_insert" on public.adv_activity_log;
create policy "adv_activity_insert"
on public.adv_activity_log
for insert
to authenticated
with check (
  user_id = auth.uid()
);

create or replace function public.adv_touch_presence(
  p_path text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  insert into public.adv_user_presence (
    user_id,
    last_seen_at,
    last_path,
    updated_at
  )
  values (
    auth.uid(),
    now(),
    nullif(trim(p_path), ''),
    now()
  )
  on conflict (user_id)
  do update set
    last_seen_at = excluded.last_seen_at,
    last_path = excluded.last_path,
    updated_at = now();
end;
$$;

grant execute
on function public.adv_touch_presence(text)
to authenticated;

create or replace function public.adv_log_activity(
  p_event_type text,
  p_path text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  insert into public.adv_activity_log (
    user_id,
    event_type,
    path,
    metadata
  )
  values (
    auth.uid(),
    left(coalesce(nullif(trim(p_event_type), ''), 'activity'), 80),
    nullif(trim(p_path), ''),
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

grant execute
on function public.adv_log_activity(text, text, jsonb)
to authenticated;

create or replace function public.adv_admin_list_users()
returns table (
  id uuid,
  email text,
  display_name text,
  username text,
  oab_number text,
  law_firm text,
  account_status text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  last_seen_at timestamptz,
  last_path text,
  roles text[]
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso administrativo necessÃ¡rio';
  end if;

  return query
  select
    u.id,
    u.email::text,
    coalesce(
      p.display_name,
      p.first_name,
      split_part(u.email, '@', 1)
    )::text,
    ap.username,
    ap.oab_number,
    ap.law_firm,
    p.account_status,
    u.created_at,
    u.last_sign_in_at,
    pr.last_seen_at,
    pr.last_path,
    coalesce(
      (
        select array_agg(r.key order by r.key)
        from public.user_roles ur
        join public.roles r
          on r.id = ur.role_id
        where ur.user_id = u.id
      ),
      array[]::text[]
    )::text[]
  from auth.users u
  join public.profiles p
    on p.id = u.id
  left join public.adv_profiles ap
    on ap.user_id = u.id
  left join public.adv_user_presence pr
    on pr.user_id = u.id
  order by
    coalesce(pr.last_seen_at, u.last_sign_in_at, u.created_at) desc;
end;
$$;

grant execute
on function public.adv_admin_list_users()
to authenticated;

create or replace function public.adv_admin_activity_feed(
  p_limit integer default 150
)
returns table (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  event_type text,
  path text,
  metadata jsonb,
  occurred_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso administrativo necessÃ¡rio';
  end if;

  return query
  select
    a.id,
    a.user_id,
    u.email::text,
    coalesce(
      p.display_name,
      p.first_name,
      split_part(u.email, '@', 1)
    )::text,
    a.event_type,
    a.path,
    a.metadata,
    a.occurred_at
  from public.adv_activity_log a
  join auth.users u
    on u.id = a.user_id
  left join public.profiles p
    on p.id = a.user_id
  order by a.occurred_at desc
  limit greatest(1, least(coalesce(p_limit, 150), 500));
end;
$$;

grant execute
on function public.adv_admin_activity_feed(integer)
to authenticated;

create or replace function public.adv_admin_set_account_status(
  p_user_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso administrativo necessÃ¡rio';
  end if;

  if p_status not in (
    'active',
    'pending',
    'suspended',
    'banned',
    'deleted'
  ) then
    raise exception 'Status invÃ¡lido';
  end if;

  if p_user_id = auth.uid()
     and p_status <> 'active' then
    raise exception 'VocÃª nÃ£o pode bloquear o prÃ³prio acesso';
  end if;

  update public.profiles
  set
    account_status = p_status,
    updated_at = now()
  where id = p_user_id;

  insert into public.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'admin.account_status_changed',
    'user',
    p_user_id::text,
    jsonb_build_object(
      'status',
      p_status
    )
  );
end;
$$;

grant execute
on function public.adv_admin_set_account_status(uuid, text)
to authenticated;

insert into public.adv_settings (key, value)
values
  ('brand_logo_url', '/brand/level-adv-icon.png'),
  ('brand_favicon_url', '/brand/favicon-64.png'),
  ('brand_share_image_url', '/brand/icon-512.png'),
  ('brand_company_name', 'Ludo Digital MKT')
on conflict (key) do nothing;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'level-adv-branding',
  'level-adv-branding',
  true,
  8388608,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ]
)
on conflict (id)
do update set
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "level_adv_branding_insert" on storage.objects;
create policy "level_adv_branding_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'level-adv-branding'
  and public.is_admin()
);

drop policy if exists "level_adv_branding_update" on storage.objects;
create policy "level_adv_branding_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'level-adv-branding'
  and public.is_admin()
)
with check (
  bucket_id = 'level-adv-branding'
  and public.is_admin()
);

drop policy if exists "level_adv_branding_delete" on storage.objects;
create policy "level_adv_branding_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'level-adv-branding'
  and public.is_admin()
);

do $cleanup$
declare
  v_job record;
begin
  for v_job in
    select jobid
    from cron.job
    where jobname = 'level_adv_activity_cleanup_v13'
  loop
    perform cron.unschedule(v_job.jobid);
  end loop;
exception
  when others then
    null;
end;
$cleanup$;

select cron.schedule(
  'level_adv_activity_cleanup_v13',
  '30 3 * * *',
  $cron$
    delete
    from public.adv_activity_log
    where occurred_at <
      now() - interval '180 days';
  $cron$
);
