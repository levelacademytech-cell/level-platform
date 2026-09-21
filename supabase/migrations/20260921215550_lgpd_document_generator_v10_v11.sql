-- ============================================================
-- LEVEL ADV V10/V11
-- LGPD + DOCUMENT GENERATOR
-- ============================================================

create table if not exists public.adv_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,
  document_code text not null,
  document_version text not null,
  accepted_at timestamptz not null default now(),
  source text not null default 'signup',
  user_agent text,
  created_at timestamptz not null default now(),
  unique(user_id, document_code, document_version)
);

alter table public.adv_legal_acceptances
enable row level security;

drop policy if exists "adv_legal_acceptances_select"
on public.adv_legal_acceptances;

create policy "adv_legal_acceptances_select"
on public.adv_legal_acceptances
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "adv_legal_acceptances_insert"
on public.adv_legal_acceptances;

create policy "adv_legal_acceptances_insert"
on public.adv_legal_acceptances
for insert
to authenticated
with check (
  user_id = auth.uid()
);

alter table public.adv_profiles
add column if not exists marketing_opt_in boolean
not null default false;

alter table public.adv_profiles
add column if not exists marketing_updated_at timestamptz;

create table if not exists public.adv_generated_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null
    references public.profiles(id)
    on delete cascade,
  template_id text not null,
  title text not null,
  client_name text,
  case_id uuid
    references public.adv_cases(id)
    on delete set null,
  content_html text not null default '',
  status text not null default 'draft'
    check (status in ('draft','final')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists
adv_generated_documents_owner_idx
on public.adv_generated_documents(
  owner_id,
  updated_at desc
);

create index if not exists
adv_generated_documents_case_idx
on public.adv_generated_documents(
  case_id,
  updated_at desc
);

alter table public.adv_generated_documents
enable row level security;

drop policy if exists "adv_generated_documents_select"
on public.adv_generated_documents;

create policy "adv_generated_documents_select"
on public.adv_generated_documents
for select
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "adv_generated_documents_insert"
on public.adv_generated_documents;

create policy "adv_generated_documents_insert"
on public.adv_generated_documents
for insert
to authenticated
with check (
  owner_id = auth.uid()
);

drop policy if exists "adv_generated_documents_update"
on public.adv_generated_documents;

create policy "adv_generated_documents_update"
on public.adv_generated_documents
for update
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
)
with check (
  owner_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "adv_generated_documents_delete"
on public.adv_generated_documents;

create policy "adv_generated_documents_delete"
on public.adv_generated_documents
for delete
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
);

create or replace function public.level_adv_generated_document_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
level_adv_generated_document_updated_at
on public.adv_generated_documents;

create trigger
level_adv_generated_document_updated_at
before update
on public.adv_generated_documents
for each row
execute function
public.level_adv_generated_document_updated_at();

create or replace function public.adv_accept_current_legal(
  p_user_agent text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  v_user := auth.uid();

  if v_user is null then
    raise exception 'Usuario nao autenticado';
  end if;

  insert into public.adv_legal_acceptances (
    user_id,
    document_code,
    document_version,
    source,
    user_agent
  )
  values
    (
      v_user,
      'terms',
      '1.0.0',
      'in_app',
      p_user_agent
    ),
    (
      v_user,
      'privacy_notice',
      '1.0.0',
      'in_app',
      p_user_agent
    ),
    (
      v_user,
      'third_party_declaration',
      '1.0.0',
      'in_app',
      p_user_agent
    )
  on conflict do nothing;

  return true;
end;
$$;

grant execute
on function public.adv_accept_current_legal(text)
to authenticated;

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
  v_legal_version text;
  v_user_agent text;
  v_marketing boolean;
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
          concat_ws(' ', v_first, v_last),
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
      split_part(new.email, '@', 1)
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

  v_legal_version :=
    coalesce(
      nullif(
        new.raw_user_meta_data ->> 'legal_version',
        ''
      ),
      '1.0.0'
    );

  v_user_agent :=
    nullif(
      new.raw_user_meta_data ->> 'user_agent',
      ''
    );

  v_marketing :=
    coalesce(
      (
        new.raw_user_meta_data ->> 'marketing_opt_in'
      )::boolean,
      false
    );

  insert into public.adv_profiles (
    user_id,
    marketing_opt_in,
    marketing_updated_at
  )
  values (
    new.id,
    v_marketing,
    now()
  )
  on conflict (user_id)
  do update set
    marketing_opt_in = excluded.marketing_opt_in,
    marketing_updated_at = excluded.marketing_updated_at;

  if
    coalesce(
      (
        new.raw_user_meta_data ->> 'accepted_terms'
      )::boolean,
      false
    )
    and
    coalesce(
      (
        new.raw_user_meta_data ->> 'accepted_privacy'
      )::boolean,
      false
    )
    and
    coalesce(
      (
        new.raw_user_meta_data ->> 'accepted_third_party'
      )::boolean,
      false
    )
  then

    insert into public.adv_legal_acceptances (
      user_id,
      document_code,
      document_version,
      source,
      user_agent
    )
    values
      (
        new.id,
        'terms',
        v_legal_version,
        'signup',
        v_user_agent
      ),
      (
        new.id,
        'privacy_notice',
        v_legal_version,
        'signup',
        v_user_agent
      ),
      (
        new.id,
        'third_party_declaration',
        v_legal_version,
        'signup',
        v_user_agent
      )
    on conflict do nothing;

  end if;

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