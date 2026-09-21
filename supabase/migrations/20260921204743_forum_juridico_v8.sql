-- ============================================================
-- COMPATIBILIDADE COM TABELAS ANTIGAS DO FORUM
-- Preserva qualquer estrutura anterior como LEGACY.
-- ============================================================

do $$
begin

  if to_regclass('public.adv_forum_posts') is not null
     and not exists (
       select 1
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'adv_forum_posts'
         and column_name = 'topic_id'
     )
  then

    if to_regclass('public.adv_forum_posts_legacy_v8') is null then
      alter table public.adv_forum_posts
      rename to adv_forum_posts_legacy_v8;
    else
      drop table public.adv_forum_posts cascade;
    end if;

  end if;


  if to_regclass('public.adv_forum_topics') is not null
     and not exists (
       select 1
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'adv_forum_topics'
         and column_name = 'last_activity_at'
     )
  then

    if to_regclass('public.adv_forum_topics_legacy_v8') is null then
      alter table public.adv_forum_topics
      rename to adv_forum_topics_legacy_v8;
    else
      drop table public.adv_forum_topics cascade;
    end if;

  end if;


  if to_regclass('public.adv_forum_reactions') is not null
     and not exists (
       select 1
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'adv_forum_reactions'
         and column_name = 'topic_id'
     )
  then

    if to_regclass('public.adv_forum_reactions_legacy_v8') is null then
      alter table public.adv_forum_reactions
      rename to adv_forum_reactions_legacy_v8;
    else
      drop table public.adv_forum_reactions cascade;
    end if;

  end if;

end;
$$;

create table if not exists public.adv_forum_topics (
  id uuid primary key default gen_random_uuid(),

  author_id uuid not null
    references public.profiles(id)
    on delete cascade,

  category text not null default 'geral'
    check (
      category in (
        'geral',
        'bancario',
        'previdenciario',
        'trabalhista',
        'tributario',
        'civel',
        'penal',
        'processual'
      )
    ),

  title text not null
    check (
      char_length(trim(title))
      between 5 and 180
    ),

  body text not null
    check (
      char_length(trim(body))
      between 10 and 20000
    ),

  tags text[] not null
    default '{}'::text[],

  is_pinned boolean
    not null default false,

  is_locked boolean
    not null default false,

  views_count integer
    not null default 0,

  created_at timestamptz
    not null default now(),

  updated_at timestamptz
    not null default now(),

  last_activity_at timestamptz
    not null default now()
);


create table if not exists public.adv_forum_posts (
  id uuid primary key default gen_random_uuid(),

  topic_id uuid not null
    references public.adv_forum_topics(id)
    on delete cascade,

  author_id uuid not null
    references public.profiles(id)
    on delete cascade,

  body text not null
    check (
      char_length(trim(body))
      between 1 and 10000
    ),

  created_at timestamptz
    not null default now(),

  updated_at timestamptz
    not null default now()
);


create table if not exists public.adv_forum_reactions (
  topic_id uuid not null
    references public.adv_forum_topics(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  created_at timestamptz
    not null default now(),

  primary key (
    topic_id,
    user_id
  )
);


create index if not exists
adv_forum_topics_activity_idx
on public.adv_forum_topics(
  is_pinned desc,
  last_activity_at desc
);


create index if not exists
adv_forum_posts_topic_idx
on public.adv_forum_posts(
  topic_id,
  created_at
);


alter table public.adv_forum_topics
enable row level security;

alter table public.adv_forum_posts
enable row level security;

alter table public.adv_forum_reactions
enable row level security;


drop policy if exists
"forum_topics_select"
on public.adv_forum_topics;

create policy
"forum_topics_select"
on public.adv_forum_topics
for select
to authenticated
using (true);


drop policy if exists
"forum_topics_insert"
on public.adv_forum_topics;

create policy
"forum_topics_insert"
on public.adv_forum_topics
for insert
to authenticated
with check (
  author_id = auth.uid()
);


drop policy if exists
"forum_topics_update"
on public.adv_forum_topics;

create policy
"forum_topics_update"
on public.adv_forum_topics
for update
to authenticated
using (
  author_id = auth.uid()
  or public.is_admin()
)
with check (
  author_id = auth.uid()
  or public.is_admin()
);


drop policy if exists
"forum_topics_delete"
on public.adv_forum_topics;

create policy
"forum_topics_delete"
on public.adv_forum_topics
for delete
to authenticated
using (
  author_id = auth.uid()
  or public.is_admin()
);


drop policy if exists
"forum_posts_select"
on public.adv_forum_posts;

create policy
"forum_posts_select"
on public.adv_forum_posts
for select
to authenticated
using (true);


drop policy if exists
"forum_posts_insert"
on public.adv_forum_posts;

create policy
"forum_posts_insert"
on public.adv_forum_posts
for insert
to authenticated
with check (
  author_id = auth.uid()

  and exists (
    select 1
    from public.adv_forum_topics t
    where t.id = topic_id
      and t.is_locked = false
  )
);


drop policy if exists
"forum_posts_update"
on public.adv_forum_posts;

create policy
"forum_posts_update"
on public.adv_forum_posts
for update
to authenticated
using (
  author_id = auth.uid()
  or public.is_admin()
)
with check (
  author_id = auth.uid()
  or public.is_admin()
);


drop policy if exists
"forum_posts_delete"
on public.adv_forum_posts;

create policy
"forum_posts_delete"
on public.adv_forum_posts
for delete
to authenticated
using (
  author_id = auth.uid()
  or public.is_admin()
);


drop policy if exists
"forum_reactions_select"
on public.adv_forum_reactions;

create policy
"forum_reactions_select"
on public.adv_forum_reactions
for select
to authenticated
using (true);


drop policy if exists
"forum_reactions_insert"
on public.adv_forum_reactions;

create policy
"forum_reactions_insert"
on public.adv_forum_reactions
for insert
to authenticated
with check (
  user_id = auth.uid()
);


drop policy if exists
"forum_reactions_delete"
on public.adv_forum_reactions;

create policy
"forum_reactions_delete"
on public.adv_forum_reactions
for delete
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);


create or replace function public.adv_forum_touch_topic()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  update public.adv_forum_topics
  set
    last_activity_at = now(),
    updated_at = now()
  where id =
    coalesce(
      new.topic_id,
      old.topic_id
    );

  return coalesce(new, old);

end;
$$;


drop trigger if exists
adv_forum_posts_touch_topic
on public.adv_forum_posts;

create trigger
adv_forum_posts_touch_topic
after insert or update or delete
on public.adv_forum_posts
for each row
execute function
public.adv_forum_touch_topic();


create or replace function public.adv_forum_topics_feed(
  p_search text default '',
  p_category text default 'all'
)
returns table (
  id uuid,
  author_id uuid,
  author_name text,
  username text,
  category text,
  title text,
  body text,
  tags text[],
  is_pinned boolean,
  is_locked boolean,
  views_count integer,
  replies_count bigint,
  likes_count bigint,
  liked_by_me boolean,
  created_at timestamptz,
  last_activity_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$

  select
    t.id,
    t.author_id,

    coalesce(
      p.display_name,
      p.first_name,
      ap.username,
      'Usuario LEVEL'
    )::text
    as author_name,

    ap.username,

    t.category,
    t.title,
    t.body,
    t.tags,
    t.is_pinned,
    t.is_locked,
    t.views_count,

    (
      select count(*)
      from public.adv_forum_posts fp
      where fp.topic_id = t.id
    )::bigint
    as replies_count,

    (
      select count(*)
      from public.adv_forum_reactions fr
      where fr.topic_id = t.id
    )::bigint
    as likes_count,

    exists (
      select 1
      from public.adv_forum_reactions my
      where my.topic_id = t.id
        and my.user_id = auth.uid()
    )
    as liked_by_me,

    t.created_at,
    t.last_activity_at

  from public.adv_forum_topics t

  left join public.profiles p
    on p.id = t.author_id

  left join public.adv_profiles ap
    on ap.user_id = t.author_id

  where
    (
      p_category = 'all'
      or t.category = p_category
    )

    and (
      nullif(
        trim(p_search),
        ''
      ) is null

      or lower(t.title)
        like
        '%' ||
        lower(trim(p_search))
        || '%'

      or lower(t.body)
        like
        '%' ||
        lower(trim(p_search))
        || '%'

      or array_to_string(
        t.tags,
        ' '
      )
        ilike
        '%' ||
        trim(p_search)
        || '%'
    )

  order by
    t.is_pinned desc,
    t.last_activity_at desc;

$$;


create or replace function public.adv_forum_topic_posts(
  p_topic_id uuid
)
returns table (
  id uuid,
  author_id uuid,
  author_name text,
  username text,
  body text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$

  select
    fp.id,
    fp.author_id,

    coalesce(
      p.display_name,
      p.first_name,
      ap.username,
      'Usuario LEVEL'
    )::text,

    ap.username,

    fp.body,
    fp.created_at,
    fp.updated_at

  from public.adv_forum_posts fp

  left join public.profiles p
    on p.id = fp.author_id

  left join public.adv_profiles ap
    on ap.user_id = fp.author_id

  where fp.topic_id = p_topic_id

  order by fp.created_at asc;

$$;


create or replace function public.adv_forum_toggle_like(
  p_topic_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin

  if exists (
    select 1
    from public.adv_forum_reactions
    where topic_id = p_topic_id
      and user_id = auth.uid()
  ) then

    delete
    from public.adv_forum_reactions
    where topic_id = p_topic_id
      and user_id = auth.uid();

    return false;

  end if;


  insert into public.adv_forum_reactions (
    topic_id,
    user_id
  )
  values (
    p_topic_id,
    auth.uid()
  );

  return true;

end;
$$;


create or replace function public.adv_forum_add_view(
  p_topic_id uuid
)
returns void
language sql
security definer
set search_path = public
as $$

  update public.adv_forum_topics
  set views_count =
    views_count + 1
  where id = p_topic_id;

$$;