-- ============================================================
-- LEVEL ADV
-- FOUNDATION
-- ============================================================


-- ------------------------------------------------------------
-- PERFIL PROFISSIONAL
-- ------------------------------------------------------------

create table if not exists public.adv_profiles (
  user_id uuid primary key
    references public.profiles(id)
    on delete cascade,

  profession text not null default 'lawyer',

  oab_number text,
  law_firm text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- CASOS / ANALISES
-- ------------------------------------------------------------

create table if not exists public.adv_cases (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  client_reference text,

  bank_name text,

  operation_date date,

  original_debt numeric(14,2)
    not null default 0,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'completed',
        'review_requested',
        'reviewed',
        'archived'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.adv_case_periods (
  id uuid primary key default gen_random_uuid(),

  case_id uuid not null
    references public.adv_cases(id)
    on delete cascade,

  competence text,

  financed_balance numeric(14,2)
    not null default 0,

  stated_monthly_rate numeric(10,4),

  revolving_interest numeric(14,2)
    not null default 0,

  installment_interest numeric(14,2)
    not null default 0,

  late_interest numeric(14,2)
    not null default 0,

  fine numeric(14,2)
    not null default 0,

  other_charges numeric(14,2)
    not null default 0,

  created_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- DOCUMENTOS
-- ------------------------------------------------------------

create table if not exists public.adv_documents (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  case_id uuid
    references public.adv_cases(id)
    on delete cascade,

  original_name text not null,
  storage_path text not null,

  mime_type text,
  file_size bigint,

  extraction_status text
    not null default 'pending'
    check (
      extraction_status in (
        'pending',
        'processed',
        'needs_review',
        'failed'
      )
    ),

  extracted_data jsonb
    not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- SOLICITACAO DE ANALISE
-- ------------------------------------------------------------

create table if not exists public.adv_analysis_requests (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  case_id uuid
    references public.adv_cases(id)
    on delete set null,

  document_id uuid
    references public.adv_documents(id)
    on delete set null,

  title text not null,

  description text,

  status text not null default 'waiting'
    check (
      status in (
        'waiting',
        'in_analysis',
        'answered',
        'cancelled'
      )
    ),

  response_text text,

  answered_by uuid
    references public.profiles(id)
    on delete set null,

  requested_at timestamptz
    not null default now(),

  answered_at timestamptz
);


-- ------------------------------------------------------------
-- CHAT PRIVADO - 24 HORAS
-- ------------------------------------------------------------

create table if not exists public.adv_private_messages (
  id uuid primary key default gen_random_uuid(),

  sender_id uuid not null
    references public.profiles(id)
    on delete cascade,

  recipient_id uuid not null
    references public.profiles(id)
    on delete cascade,

  body text not null,

  created_at timestamptz
    not null default now(),

  expires_at timestamptz
    not null default
    (now() + interval '24 hours')
);


create index if not exists
adv_messages_expiration_idx
on public.adv_private_messages(expires_at);


-- ------------------------------------------------------------
-- FORUM
-- ------------------------------------------------------------

create table if not exists public.adv_forum_posts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  title text not null,
  body text not null,

  is_active boolean
    not null default true,

  created_at timestamptz
    not null default now(),

  updated_at timestamptz
    not null default now()
);


create table if not exists public.adv_forum_comments (
  id uuid primary key default gen_random_uuid(),

  post_id uuid not null
    references public.adv_forum_posts(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  body text not null,

  created_at timestamptz
    not null default now()
);


-- ------------------------------------------------------------
-- CONFIGURACOES VISUAIS
-- ------------------------------------------------------------

create table if not exists public.adv_settings (
  key text primary key,

  value text,

  updated_at timestamptz
    not null default now()
);


insert into public.adv_settings (
  key,
  value
)
values
  (
    'login_banner_desktop',
    ''
  ),
  (
    'login_banner_mobile',
    ''
  )
on conflict (key) do nothing;


-- ------------------------------------------------------------
-- STORAGE PRIVADO
-- ------------------------------------------------------------

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'level-adv-documents',
  'level-adv-documents',
  false
)
on conflict (id) do nothing;


-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

alter table public.adv_profiles
enable row level security;

alter table public.adv_cases
enable row level security;

alter table public.adv_case_periods
enable row level security;

alter table public.adv_documents
enable row level security;

alter table public.adv_analysis_requests
enable row level security;

alter table public.adv_private_messages
enable row level security;

alter table public.adv_forum_posts
enable row level security;

alter table public.adv_forum_comments
enable row level security;

alter table public.adv_settings
enable row level security;


-- PROFILES

create policy "adv_profile_read"
on public.adv_profiles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "adv_profile_manage"
on public.adv_profiles
for all
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
)
with check (
  user_id = auth.uid()
  or public.is_admin()
);


-- CASES

create policy "adv_cases_owner"
on public.adv_cases
for all
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
)
with check (
  user_id = auth.uid()
  or public.is_admin()
);


create policy "adv_periods_owner"
on public.adv_case_periods
for all
to authenticated
using (
  exists (
    select 1
    from public.adv_cases c
    where c.id = case_id
      and (
        c.user_id = auth.uid()
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.adv_cases c
    where c.id = case_id
      and (
        c.user_id = auth.uid()
        or public.is_admin()
      )
  )
);


-- DOCUMENTS

create policy "adv_documents_owner"
on public.adv_documents
for all
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
)
with check (
  user_id = auth.uid()
  or public.is_admin()
);


-- REQUESTS

create policy "adv_requests_owner"
on public.adv_analysis_requests
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);


create policy "adv_requests_insert"
on public.adv_analysis_requests
for insert
to authenticated
with check (
  user_id = auth.uid()
);


create policy "adv_requests_admin_update"
on public.adv_analysis_requests
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- CHAT

create policy "adv_chat_read"
on public.adv_private_messages
for select
to authenticated
using (
  (
    sender_id = auth.uid()
    or recipient_id = auth.uid()
  )
  and expires_at > now()
);


create policy "adv_chat_send"
on public.adv_private_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and sender_id <> recipient_id
);


-- FORUM

create policy "adv_forum_read"
on public.adv_forum_posts
for select
to authenticated
using (
  is_active = true
  or public.is_admin()
);


create policy "adv_forum_create"
on public.adv_forum_posts
for insert
to authenticated
with check (
  user_id = auth.uid()
);


create policy "adv_forum_owner_update"
on public.adv_forum_posts
for update
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);


create policy "adv_comments_read"
on public.adv_forum_comments
for select
to authenticated
using (true);


create policy "adv_comments_create"
on public.adv_forum_comments
for insert
to authenticated
with check (
  user_id = auth.uid()
);


-- SETTINGS

create policy "adv_settings_read"
on public.adv_settings
for select
to anon, authenticated
using (true);


create policy "adv_settings_admin"
on public.adv_settings
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- STORAGE

create policy "adv_files_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'level-adv-documents'
  and
  (storage.foldername(name))[1]
    = auth.uid()::text
);


create policy "adv_files_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'level-adv-documents'
  and (
    (storage.foldername(name))[1]
      = auth.uid()::text
    or public.is_admin()
  )
);


create policy "adv_files_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'level-adv-documents'
  and (
    (storage.foldername(name))[1]
      = auth.uid()::text
    or public.is_admin()
  )
);


-- ------------------------------------------------------------
-- CHAT CLEANUP
-- ------------------------------------------------------------

create extension if not exists pg_cron;

select cron.schedule(
  'level_adv_message_cleanup',
  '15 * * * *',
  $$
    delete
    from public.adv_private_messages
    where expires_at <= now();
  $$
);
