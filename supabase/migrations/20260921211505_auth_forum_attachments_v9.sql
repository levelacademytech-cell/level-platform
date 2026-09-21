-- ============================================================
-- LEVEL ADV V9
-- AUTH PROFILE + FORUM ATTACHMENTS
-- ============================================================


-- ============================================================
-- PERFIL AUTOMATICO PARA NOVOS CADASTROS
-- ============================================================

create or replace function public.level_adv_sync_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first text;
  v_last text;
  v_display text;
begin

  v_first :=
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'first_name',
          ''
        )
      ),
      ''
    );

  v_last :=
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'last_name',
          ''
        )
      ),
      ''
    );

  v_display :=
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'display_name',
          concat_ws(
            ' ',
            v_first,
            v_last
          ),
          ''
        )
      ),
      ''
    );


  insert into public.profiles (
    id,
    first_name,
    last_name,
    display_name
  )
  values (
    new.id,
    v_first,
    v_last,
    coalesce(
      v_display,
      split_part(
        new.email,
        '@',
        1
      )
    )
  )
  on conflict (id)
  do update set
    first_name =
      coalesce(
        excluded.first_name,
        profiles.first_name
      ),

    last_name =
      coalesce(
        excluded.last_name,
        profiles.last_name
      ),

    display_name =
      coalesce(
        excluded.display_name,
        profiles.display_name
      );


  return new;

end;
$$;


drop trigger if exists
level_adv_auth_profile_sync
on auth.users;

create trigger
level_adv_auth_profile_sync
after insert
on auth.users
for each row
execute function
public.level_adv_sync_new_user();


-- ============================================================
-- BUCKET PRIVADO DO FORUM
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'level-adv-forum',
  'level-adv-forum',
  false,
  15728640,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
)
on conflict (id)
do update set
  public = false,
  file_size_limit = 15728640,
  allowed_mime_types = excluded.allowed_mime_types;


-- ============================================================
-- ANEXOS
-- ============================================================

create table if not exists public.adv_forum_attachments (
  id uuid primary key default gen_random_uuid(),

  topic_id uuid
    references public.adv_forum_topics(id)
    on delete cascade,

  post_id uuid
    references public.adv_forum_posts(id)
    on delete cascade,

  uploader_id uuid not null
    references public.profiles(id)
    on delete cascade,

  storage_path text not null,

  original_name text not null,

  mime_type text,

  size_bytes bigint not null default 0,

  created_at timestamptz
    not null default now(),

  constraint adv_forum_attachment_parent_check
  check (
    (
      topic_id is not null
      and post_id is null
    )
    or
    (
      topic_id is null
      and post_id is not null
    )
  )
);


create index if not exists
adv_forum_attachments_topic_idx
on public.adv_forum_attachments(
  topic_id,
  created_at
);


create index if not exists
adv_forum_attachments_post_idx
on public.adv_forum_attachments(
  post_id,
  created_at
);


alter table public.adv_forum_attachments
enable row level security;


drop policy if exists
"forum_attachments_select"
on public.adv_forum_attachments;

create policy
"forum_attachments_select"
on public.adv_forum_attachments
for select
to authenticated
using (true);


drop policy if exists
"forum_attachments_insert"
on public.adv_forum_attachments;

create policy
"forum_attachments_insert"
on public.adv_forum_attachments
for insert
to authenticated
with check (
  uploader_id = auth.uid()
);


drop policy if exists
"forum_attachments_delete"
on public.adv_forum_attachments;

create policy
"forum_attachments_delete"
on public.adv_forum_attachments
for delete
to authenticated
using (
  uploader_id = auth.uid()
  or public.is_admin()
);


-- ============================================================
-- STORAGE RLS
-- ============================================================

drop policy if exists
"level_adv_forum_read"
on storage.objects;

create policy
"level_adv_forum_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'level-adv-forum'
);


drop policy if exists
"level_adv_forum_insert"
on storage.objects;

create policy
"level_adv_forum_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'level-adv-forum'
  and
  (
    storage.foldername(name)
  )[1] = auth.uid()::text
);


drop policy if exists
"level_adv_forum_delete"
on storage.objects;

create policy
"level_adv_forum_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'level-adv-forum'
  and (
    (
      storage.foldername(name)
    )[1] = auth.uid()::text

    or public.is_admin()
  )
);