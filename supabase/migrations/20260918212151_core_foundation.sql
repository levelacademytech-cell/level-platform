-- ============================================================
-- LEVEL ACADEMY
-- Core Foundation - v0.1
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- HELPERS
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- PROFILES
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  first_name text,
  last_name text,
  display_name text,

  avatar_url text,
  avatar_emoji text,

  birth_date date,
  phone text,

  account_status text not null default 'active'
    check (account_status in (
      'active',
      'pending',
      'suspended',
      'banned',
      'deleted'
    )),

  onboarding_completed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ============================================================
-- ROLES
-- ============================================================

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),

  key text not null unique,
  name text not null,
  description text,

  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  role_id uuid not null
    references public.roles(id)
    on delete cascade,

  assigned_by uuid
    references public.profiles(id)
    on delete set null,

  assigned_at timestamptz not null default now(),

  primary key (user_id, role_id)
);

-- ============================================================
-- ROLE HELPERS
-- ============================================================

create or replace function public.has_role(role_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r
      on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.key = role_key
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role('admin')
    or public.has_role('super_admin');
$$;

-- ============================================================
-- PLANS
-- ============================================================

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,
  name text not null,
  description text,

  monthly_price_cents integer
    check (
      monthly_price_cents is null
      or monthly_price_cents >= 0
    ),

  is_active boolean not null default true,
  is_public boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger plans_set_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

-- ============================================================
-- FEATURES
-- ============================================================

create table if not exists public.features (
  id uuid primary key default gen_random_uuid(),

  key text not null unique,
  name text not null,
  description text,

  feature_type text not null default 'boolean'
    check (
      feature_type in (
        'boolean',
        'quota',
        'credit',
        'access'
      )
    ),

  created_at timestamptz not null default now()
);

create table if not exists public.plan_features (
  plan_id uuid not null
    references public.plans(id)
    on delete cascade,

  feature_id uuid not null
    references public.features(id)
    on delete cascade,

  enabled boolean not null default true,
  quantity integer,

  primary key (plan_id, feature_id)
);

-- ============================================================
-- ENTITLEMENTS
-- ============================================================

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  feature_id uuid not null
    references public.features(id)
    on delete cascade,

  enabled boolean not null default true,

  quantity integer,

  source text not null default 'system'
    check (
      source in (
        'system',
        'plan',
        'purchase',
        'reward',
        'promotion',
        'manual',
        'compensation'
      )
    ),

  starts_at timestamptz not null default now(),
  expires_at timestamptz,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entitlements_user_idx
  on public.entitlements(user_id);

create index if not exists entitlements_feature_idx
  on public.entitlements(feature_id);

create index if not exists entitlements_expiration_idx
  on public.entitlements(expires_at);

create trigger entitlements_set_updated_at
before update on public.entitlements
for each row execute function public.set_updated_at();

-- ============================================================
-- CONSENTS / LGPD
-- ============================================================

create table if not exists public.consent_documents (
  id uuid primary key default gen_random_uuid(),

  document_type text not null,
  version text not null,

  title text not null,
  content_hash text,

  requires_acceptance boolean not null default true,
  is_active boolean not null default true,

  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  unique (document_type, version)
);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  document_id uuid not null
    references public.consent_documents(id)
    on delete restrict,

  accepted boolean not null,

  user_agent text,
  ip_address inet,

  accepted_at timestamptz not null default now(),

  unique (user_id, document_id)
);

create index if not exists consents_user_idx
  on public.consents(user_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  actor_user_id uuid
    references public.profiles(id)
    on delete set null,

  action text not null,

  entity_type text,
  entity_id text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_idx
  on public.audit_logs(actor_user_id);

create index if not exists audit_logs_created_idx
  on public.audit_logs(created_at desc);

-- ============================================================
-- AUTOMATIC PROFILE CREATION
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

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.plans enable row level security;
alter table public.features enable row level security;
alter table public.plan_features enable row level security;
alter table public.entitlements enable row level security;
alter table public.consent_documents enable row level security;
alter table public.consents enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);

-- ============================================================
-- ROLES POLICIES
-- ============================================================

create policy "roles_read_authenticated"
on public.roles
for select
to authenticated
using (true);

create policy "user_roles_select_own"
on public.user_roles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

-- ============================================================
-- PLANS / FEATURES POLICIES
-- ============================================================

create policy "plans_public_read"
on public.plans
for select
to anon, authenticated
using (
  is_public = true
);

create policy "features_read_authenticated"
on public.features
for select
to authenticated
using (true);

create policy "plan_features_read_authenticated"
on public.plan_features
for select
to authenticated
using (true);

-- ============================================================
-- ENTITLEMENTS POLICIES
-- ============================================================

create policy "entitlements_select_own"
on public.entitlements
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

-- ============================================================
-- CONSENTS POLICIES
-- ============================================================

create policy "consent_documents_read"
on public.consent_documents
for select
to anon, authenticated
using (
  is_active = true
);

create policy "consents_select_own"
on public.consents
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "consents_insert_own"
on public.consents
for insert
to authenticated
with check (
  user_id = auth.uid()
);

-- ============================================================
-- AUDIT POLICIES
-- ============================================================

create policy "audit_logs_admin_read"
on public.audit_logs
for select
to authenticated
using (
  public.is_admin()
);

-- ============================================================
-- SEED ROLES
-- ============================================================

insert into public.roles (
  key,
  name,
  description
)
values
  (
    'student',
    'Aluno',
    'Usuário estudante da LEVEL'
  ),
  (
    'teacher',
    'Professor',
    'Professor ou profissional acadêmico'
  ),
  (
    'company',
    'Empresa',
    'Empresa parceira da área de carreiras'
  ),
  (
    'moderator',
    'Moderador',
    'Responsável por moderação de comunidade'
  ),
  (
    'support',
    'Suporte',
    'Equipe de atendimento da LEVEL'
  ),
  (
    'admin',
    'Administrador',
    'Administrador da plataforma'
  ),
  (
    'super_admin',
    'Super Administrador',
    'Acesso administrativo superior'
  )
on conflict (key) do nothing;

-- ============================================================
-- SEED PLANS
-- ============================================================

insert into public.plans (
  slug,
  name,
  description,
  monthly_price_cents,
  is_active,
  is_public
)
values
  (
    'free',
    'Free',
    'Plano gratuito da LEVEL',
    0,
    true,
    true
  ),
  (
    'premium',
    'Premium',
    'Recursos avançados de aprendizagem e IA',
    null,
    false,
    true
  ),
  (
    'unique',
    'Unique',
    'Experiência completa da LEVEL',
    null,
    false,
    true
  )
on conflict (slug) do nothing;

-- ============================================================
-- SEED CORE FEATURES
-- ============================================================

insert into public.features (
  key,
  name,
  description,
  feature_type
)
values
  (
    'academy_access',
    'LEVEL Academy',
    'Acesso ao ambiente acadêmico',
    'access'
  ),
  (
    'arena_access',
    'Arena Level',
    'Acesso ao módulo gamificado Arena Level',
    'access'
  ),
  (
    'career_access',
    'Carreira',
    'Acesso ao currículo, vagas e oportunidades',
    'access'
  ),
  (
    'community_access',
    'Comunidade',
    'Acesso ao fórum e comunidades',
    'access'
  ),
  (
    'ai_tutor',
    'Tutor IA',
    'Acesso ao tutor inteligente',
    'quota'
  ),
  (
    'essay_ai',
    'Correção de Redação',
    'Correção e análise de redações por IA',
    'quota'
  ),
  (
    'teacher_question',
    'Pergunte ao Professor',
    'Créditos para perguntas a professores',
    'credit'
  ),
  (
    'academic_review',
    'Revisão Acadêmica',
    'Créditos para revisão de trabalhos',
    'credit'
  ),
  (
    'store_access',
    'LEVEL Store',
    'Acesso à loja da LEVEL',
    'access'
  ),
  (
    'rewards_access',
    'LEVEL Rewards',
    'Acesso ao sistema de recompensas',
    'access'
  )
on conflict (key) do nothing;

-- ============================================================
-- FREE PLAN DEFAULT FEATURES
-- ============================================================

insert into public.plan_features (
  plan_id,
  feature_id,
  enabled
)
select
  p.id,
  f.id,
  true
from public.plans p
cross join public.features f
where p.slug = 'free'
  and f.key in (
    'academy_access',
    'arena_access',
    'career_access',
    'community_access',
    'store_access',
    'rewards_access'
  )
on conflict (plan_id, feature_id) do nothing;
