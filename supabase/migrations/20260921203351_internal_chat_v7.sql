-- ============================================================
-- LEVEL ADV - INTERNAL CHAT V7
-- ============================================================


-- ------------------------------------------------------------
-- THREADS
-- ------------------------------------------------------------

create table if not exists public.adv_chat_threads (
  id uuid primary key default gen_random_uuid(),

  kind text not null
    check (
      kind in (
        'direct',
        'group'
      )
    ),

  title text,

  direct_key text,

  created_by uuid not null
    references public.profiles(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


create unique index if not exists
adv_chat_threads_direct_key_unique
on public.adv_chat_threads(direct_key)
where direct_key is not null;


-- ------------------------------------------------------------
-- PARTICIPANTES
-- ------------------------------------------------------------

create table if not exists public.adv_chat_thread_members (
  thread_id uuid not null
    references public.adv_chat_threads(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  joined_at timestamptz not null default now(),

  primary key (
    thread_id,
    user_id
  )
);


create index if not exists
adv_chat_members_user_idx
on public.adv_chat_thread_members(
  user_id,
  thread_id
);


-- ------------------------------------------------------------
-- MENSAGENS
-- ------------------------------------------------------------

create table if not exists public.adv_chat_messages (
  id uuid primary key default gen_random_uuid(),

  thread_id uuid not null
    references public.adv_chat_threads(id)
    on delete cascade,

  sender_id uuid not null
    references public.profiles(id)
    on delete cascade,

  body text not null
    check (
      char_length(trim(body))
      between 1 and 5000
    ),

  created_at timestamptz not null default now(),

  expires_at timestamptz not null default
    (
      now() +
      interval '24 hours'
    )
);


create index if not exists
adv_chat_messages_thread_idx
on public.adv_chat_messages(
  thread_id,
  created_at
);


create index if not exists
adv_chat_messages_expiration_idx
on public.adv_chat_messages(
  expires_at
);


-- ------------------------------------------------------------
-- HELPER DE ACESSO
-- ------------------------------------------------------------

create or replace function public.can_access_chat_thread(
  p_thread_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.adv_chat_thread_members m
      where m.thread_id = p_thread_id
        and m.user_id = auth.uid()
    );
$$;


-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

alter table public.adv_chat_threads
enable row level security;

alter table public.adv_chat_thread_members
enable row level security;

alter table public.adv_chat_messages
enable row level security;


drop policy if exists
"adv_chat_threads_select"
on public.adv_chat_threads;

create policy
"adv_chat_threads_select"
on public.adv_chat_threads
for select
to authenticated
using (
  public.can_access_chat_thread(id)
);


drop policy if exists
"adv_chat_members_select"
on public.adv_chat_thread_members;

create policy
"adv_chat_members_select"
on public.adv_chat_thread_members
for select
to authenticated
using (
  public.can_access_chat_thread(thread_id)
);


drop policy if exists
"adv_chat_messages_select"
on public.adv_chat_messages;

create policy
"adv_chat_messages_select"
on public.adv_chat_messages
for select
to authenticated
using (
  expires_at > now()
  and public.can_access_chat_thread(thread_id)
);


drop policy if exists
"adv_chat_messages_insert"
on public.adv_chat_messages;

create policy
"adv_chat_messages_insert"
on public.adv_chat_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.can_access_chat_thread(thread_id)
);


drop policy if exists
"adv_chat_messages_delete"
on public.adv_chat_messages;

create policy
"adv_chat_messages_delete"
on public.adv_chat_messages
for delete
to authenticated
using (
  sender_id = auth.uid()
  or public.is_admin()
);


-- ============================================================
-- BUSCAR USUARIOS
-- ============================================================

create or replace function public.adv_search_chat_users(
  p_query text
)
returns table (
  user_id uuid,
  display_name text,
  username text,
  email text
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_query text;
begin

  v_query :=
    lower(
      trim(
        leading '@'
        from trim(
          coalesce(
            p_query,
            ''
          )
        )
      )
    );

  if char_length(v_query) < 2 then
    return;
  end if;


  return query

  select
    p.id,

    coalesce(
      p.display_name,
      p.first_name,
      ap.username,
      split_part(
        au.email,
        '@',
        1
      ),
      'Usuario LEVEL'
    )::text,

    ap.username,

    au.email::text

  from public.profiles p

  join auth.users au
    on au.id = p.id

  left join public.adv_profiles ap
    on ap.user_id = p.id

  where p.id <> auth.uid()

    and (
      lower(
        coalesce(
          au.email,
          ''
        )
      ) like
      '%' || v_query || '%'

      or lower(
        coalesce(
          ap.username,
          ''
        )
      ) like
      '%' || v_query || '%'

      or lower(
        coalesce(
          p.display_name,
          ''
        )
      ) like
      '%' || v_query || '%'

      or lower(
        coalesce(
          p.first_name,
          ''
        )
      ) like
      '%' || v_query || '%'
    )

  order by
    coalesce(
      p.display_name,
      p.first_name,
      ap.username,
      au.email
    )

  limit 12;

end;
$$;


-- ============================================================
-- INICIAR CHAT PRIVADO
-- ============================================================

create or replace function public.adv_start_direct_chat(
  p_identifier text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid;
  v_target uuid;
  v_identifier text;
  v_key text;
  v_thread uuid;
begin

  v_user := auth.uid();

  if v_user is null then
    raise exception 'Usuario nao autenticado';
  end if;


  v_identifier :=
    lower(
      trim(
        leading '@'
        from trim(
          p_identifier
        )
      )
    );


  select p.id
  into v_target
  from public.profiles p

  join auth.users au
    on au.id = p.id

  left join public.adv_profiles ap
    on ap.user_id = p.id

  where
    lower(
      coalesce(
        au.email,
        ''
      )
    ) = v_identifier

    or lower(
      coalesce(
        ap.username,
        ''
      )
    ) = v_identifier

  limit 1;


  if v_target is null then
    raise exception 'Usuario nao encontrado';
  end if;


  if v_target = v_user then
    raise exception 'Voce nao pode iniciar uma conversa consigo mesmo';
  end if;


  v_key :=
    least(
      v_user::text,
      v_target::text
    )
    || ':'
    ||
    greatest(
      v_user::text,
      v_target::text
    );


  insert into public.adv_chat_threads (
    kind,
    direct_key,
    created_by
  )
  values (
    'direct',
    v_key,
    v_user
  )

  on conflict (
    direct_key
  )
  where direct_key is not null

  do update
  set
    updated_at =
      public.adv_chat_threads.updated_at

  returning id
  into v_thread;


  insert into public.adv_chat_thread_members (
    thread_id,
    user_id
  )
  values
    (
      v_thread,
      v_user
    ),
    (
      v_thread,
      v_target
    )
  on conflict do nothing;


  return v_thread;

end;
$$;


-- ============================================================
-- CRIAR GRUPO
-- ============================================================

create or replace function public.adv_create_group_chat(
  p_title text,
  p_identifiers text[]
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid;
  v_thread uuid;
  v_identifier text;
  v_target uuid;
  v_normalized text;
  v_added integer := 0;
begin

  v_user := auth.uid();

  if v_user is null then
    raise exception 'Usuario nao autenticado';
  end if;


  if nullif(
    trim(p_title),
    ''
  ) is null then
    raise exception 'Informe o nome do grupo';
  end if;


  insert into public.adv_chat_threads (
    kind,
    title,
    created_by
  )
  values (
    'group',
    trim(p_title),
    v_user
  )
  returning id
  into v_thread;


  insert into public.adv_chat_thread_members (
    thread_id,
    user_id
  )
  values (
    v_thread,
    v_user
  );


  foreach v_identifier
  in array p_identifiers
  loop

    v_normalized :=
      lower(
        trim(
          leading '@'
          from trim(
            v_identifier
          )
        )
      );


    select p.id
    into v_target
    from public.profiles p

    join auth.users au
      on au.id = p.id

    left join public.adv_profiles ap
      on ap.user_id = p.id

    where
      lower(
        coalesce(
          au.email,
          ''
        )
      ) = v_normalized

      or lower(
        coalesce(
          ap.username,
          ''
        )
      ) = v_normalized

    limit 1;


    if
      v_target is not null
      and v_target <> v_user
    then

      insert into public.adv_chat_thread_members (
        thread_id,
        user_id
      )
      values (
        v_thread,
        v_target
      )
      on conflict do nothing;

      v_added :=
        v_added + 1;

    end if;

  end loop;


  if v_added = 0 then

    delete
    from public.adv_chat_threads
    where id = v_thread;

    raise exception 'Nenhum usuario valido foi encontrado';

  end if;


  return v_thread;

end;
$$;


-- ============================================================
-- LISTA DE CONVERSAS
-- ============================================================

create or replace function public.adv_get_my_chat_threads()
returns table (
  thread_id uuid,
  kind text,
  thread_title text,
  last_message text,
  last_message_at timestamptz,
  member_count bigint
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin

  return query

  select
    t.id,

    t.kind,

    case
      when t.kind = 'group'
        then coalesce(
          t.title,
          'Grupo LEVEL'
        )

      else coalesce(
        other_user.name,
        'Conversa LEVEL'
      )
    end::text,

    lm.body,

    lm.created_at,

    (
      select count(*)
      from public.adv_chat_thread_members cm
      where cm.thread_id = t.id
    )::bigint

  from public.adv_chat_threads t

  join public.adv_chat_thread_members me
    on me.thread_id = t.id
   and me.user_id = auth.uid()


  left join lateral (

    select
      coalesce(
        p.display_name,
        p.first_name,
        ap.username,
        split_part(
          au.email,
          '@',
          1
        ),
        'Colega LEVEL'
      )::text as name

    from public.adv_chat_thread_members m

    left join public.profiles p
      on p.id = m.user_id

    left join public.adv_profiles ap
      on ap.user_id = m.user_id

    left join auth.users au
      on au.id = m.user_id

    where
      m.thread_id = t.id
      and m.user_id <> auth.uid()

    order by m.joined_at

    limit 1

  ) other_user
  on true


  left join lateral (

    select
      m.body,
      m.created_at

    from public.adv_chat_messages m

    where
      m.thread_id = t.id
      and m.expires_at > now()

    order by
      m.created_at desc

    limit 1

  ) lm
  on true


  order by
    coalesce(
      lm.created_at,
      t.created_at
    ) desc;

end;
$$;


-- ============================================================
-- PARTICIPANTES DO CHAT
-- ============================================================

create or replace function public.adv_get_chat_thread_members(
  p_thread_id uuid
)
returns table (
  user_id uuid,
  display_name text,
  username text
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin

  if not public.can_access_chat_thread(
    p_thread_id
  ) then
    raise exception 'Acesso negado';
  end if;


  return query

  select
    m.user_id,

    coalesce(
      p.display_name,
      p.first_name,
      ap.username,
      split_part(
        au.email,
        '@',
        1
      ),
      'Usuario LEVEL'
    )::text,

    ap.username

  from public.adv_chat_thread_members m

  left join public.profiles p
    on p.id = m.user_id

  left join public.adv_profiles ap
    on ap.user_id = m.user_id

  left join auth.users au
    on au.id = m.user_id

  where
    m.thread_id = p_thread_id

  order by
    coalesce(
      p.display_name,
      p.first_name,
      ap.username,
      au.email
    );

end;
$$;


-- ============================================================
-- MENSAGENS DO CHAT
-- ============================================================

create or replace function public.adv_get_chat_messages(
  p_thread_id uuid
)
returns table (
  id uuid,
  body text,
  created_at timestamptz,
  expires_at timestamptz,
  sender_id uuid,
  sender_name text
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin

  if not public.can_access_chat_thread(
    p_thread_id
  ) then
    raise exception 'Acesso negado';
  end if;


  return query

  select
    q.id,
    q.body,
    q.created_at,
    q.expires_at,
    q.sender_id,
    q.sender_name

  from (

    select
      m.id,
      m.body,
      m.created_at,
      m.expires_at,
      m.sender_id,

      coalesce(
        p.display_name,
        p.first_name,
        ap.username,
        split_part(
          au.email,
          '@',
          1
        ),
        'Usuario LEVEL'
      )::text
      as sender_name

    from public.adv_chat_messages m

    left join public.profiles p
      on p.id = m.sender_id

    left join public.adv_profiles ap
      on ap.user_id = m.sender_id

    left join auth.users au
      on au.id = m.sender_id

    where
      m.thread_id = p_thread_id
      and m.expires_at > now()

    order by
      m.created_at desc

    limit 300

  ) q

  order by
    q.created_at asc;

end;
$$;


-- ============================================================
-- LIMPEZA FISICA APOS 24H
-- ============================================================

do $cleanup$
declare
  v_job record;
begin

  for v_job in
    select jobid
    from cron.job
    where jobname =
      'level_adv_chat_cleanup_v7'
  loop

    perform cron.unschedule(
      v_job.jobid
    );

  end loop;

exception
  when others then
    null;
end;
$cleanup$;


select cron.schedule(
  'level_adv_chat_cleanup_v7',
  '15 * * * *',
  $cron$
    delete
    from public.adv_chat_messages
    where expires_at <= now();
  $cron$
);
