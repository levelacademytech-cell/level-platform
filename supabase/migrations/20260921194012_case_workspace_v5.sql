-- ============================================================
-- LEVEL ADV - CASE WORKSPACE V5
-- ============================================================


-- ============================================================
-- ADMIN = admin / super_admin / director
-- ============================================================

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


-- ============================================================
-- USERNAME PROFISSIONAL
-- ============================================================

alter table public.adv_profiles
add column if not exists username text;

create unique index if not exists
adv_profiles_username_unique
on public.adv_profiles(lower(username))
where username is not null;


-- ============================================================
-- EVOLUCAO DO CASO
-- ============================================================

alter table public.adv_cases
add column if not exists progress_percent integer
not null default 15;

alter table public.adv_cases
add column if not exists finalized_at timestamptz;

alter table public.adv_cases
add column if not exists finalized_by uuid
references public.profiles(id)
on delete set null;

alter table public.adv_cases
drop constraint if exists adv_cases_progress_percent_check;

alter table public.adv_cases
add constraint adv_cases_progress_percent_check
check (
  progress_percent >= 0
  and progress_percent <= 100
);


-- Casos antigos que estavam "completed"
-- viram casos em andamento.
update public.adv_cases
set
  status = 'in_progress',
  progress_percent = greatest(progress_percent, 35)
where status = 'completed';


alter table public.adv_cases
drop constraint if exists adv_cases_status_check;

alter table public.adv_cases
add constraint adv_cases_status_check
check (
  status in (
    'draft',
    'in_progress',
    'review_requested',
    'reviewed',
    'finalized',
    'archived'
  )
);


-- ============================================================
-- COLABORADORES POR CASO
-- ============================================================

create table if not exists public.adv_case_members (
  id uuid primary key default gen_random_uuid(),

  case_id uuid not null
    references public.adv_cases(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  invited_by uuid not null
    references public.profiles(id)
    on delete cascade,

  permission text not null default 'contribute'
    check (
      permission in (
        'view',
        'contribute'
      )
    ),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'accepted',
        'rejected',
        'revoked'
      )
    ),

  created_at timestamptz not null default now(),
  responded_at timestamptz,

  unique(case_id, user_id)
);


-- ============================================================
-- ACESSO A TODOS OS CASOS DE UM ADVOGADO
-- ============================================================

create table if not exists public.adv_global_case_access (
  id uuid primary key default gen_random_uuid(),

  owner_user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  invited_by uuid not null
    references public.profiles(id)
    on delete cascade,

  permission text not null default 'contribute'
    check (
      permission in (
        'view',
        'contribute'
      )
    ),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'accepted',
        'rejected',
        'revoked'
      )
    ),

  created_at timestamptz not null default now(),
  responded_at timestamptz,

  unique(owner_user_id, user_id)
);


-- ============================================================
-- CONTRIBUICOES / HISTORICO
-- ============================================================

create table if not exists public.adv_case_contributions (
  id uuid primary key default gen_random_uuid(),

  case_id uuid not null
    references public.adv_cases(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  kind text not null default 'note'
    check (
      kind in (
        'note',
        'calculation',
        'analysis',
        'task',
        'document',
        'system'
      )
    ),

  title text not null,

  body text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists
adv_case_contributions_case_idx
on public.adv_case_contributions(
  case_id,
  created_at desc
);


-- ============================================================
-- CHAT DO CASO
-- ============================================================

create table if not exists public.adv_case_messages (
  id uuid primary key default gen_random_uuid(),

  case_id uuid not null
    references public.adv_cases(id)
    on delete cascade,

  sender_id uuid not null
    references public.profiles(id)
    on delete cascade,

  body text not null,

  created_at timestamptz not null default now()
);

create index if not exists
adv_case_messages_case_idx
on public.adv_case_messages(
  case_id,
  created_at
);


-- ============================================================
-- HELPERS DE PERMISSAO
-- ============================================================

create or replace function public.can_access_adv_case(
  p_case_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.adv_cases c
    where c.id = p_case_id
      and (
        c.user_id = auth.uid()

        or public.is_admin()

        or exists (
          select 1
          from public.adv_case_members cm
          where cm.case_id = c.id
            and cm.user_id = auth.uid()
            and cm.status = 'accepted'
        )

        or exists (
          select 1
          from public.adv_global_case_access ga
          where ga.owner_user_id = c.user_id
            and ga.user_id = auth.uid()
            and ga.status = 'accepted'
        )
      )
  );
$$;


create or replace function public.can_contribute_adv_case(
  p_case_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.adv_cases c
    where c.id = p_case_id
      and (
        c.user_id = auth.uid()

        or public.is_admin()

        or exists (
          select 1
          from public.adv_case_members cm
          where cm.case_id = c.id
            and cm.user_id = auth.uid()
            and cm.status = 'accepted'
            and cm.permission = 'contribute'
        )

        or exists (
          select 1
          from public.adv_global_case_access ga
          where ga.owner_user_id = c.user_id
            and ga.user_id = auth.uid()
            and ga.status = 'accepted'
            and ga.permission = 'contribute'
        )
      )
  );
$$;


-- ============================================================
-- RLS
-- ============================================================

alter table public.adv_case_members enable row level security;
alter table public.adv_global_case_access enable row level security;
alter table public.adv_case_contributions enable row level security;
alter table public.adv_case_messages enable row level security;


-- ------------------------------------------------------------
-- CASES
-- ------------------------------------------------------------

drop policy if exists "adv_cases_owner"
on public.adv_cases;

drop policy if exists "adv_cases_select"
on public.adv_cases;

drop policy if exists "adv_cases_insert"
on public.adv_cases;

drop policy if exists "adv_cases_update"
on public.adv_cases;

drop policy if exists "adv_cases_delete"
on public.adv_cases;


create policy "adv_cases_select"
on public.adv_cases
for select
to authenticated
using (
  public.can_access_adv_case(id)
);


create policy "adv_cases_insert"
on public.adv_cases
for insert
to authenticated
with check (
  user_id = auth.uid()
  or public.is_admin()
);


create policy "adv_cases_update"
on public.adv_cases
for update
to authenticated
using (
  public.can_contribute_adv_case(id)
)
with check (
  public.can_contribute_adv_case(id)
);


create policy "adv_cases_delete"
on public.adv_cases
for delete
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);


-- ------------------------------------------------------------
-- PERIODOS / CALCULOS DO ROTATIVO
-- ------------------------------------------------------------

drop policy if exists "adv_periods_owner"
on public.adv_case_periods;

drop policy if exists "adv_periods_select"
on public.adv_case_periods;

drop policy if exists "adv_periods_insert"
on public.adv_case_periods;

drop policy if exists "adv_periods_update"
on public.adv_case_periods;

drop policy if exists "adv_periods_delete"
on public.adv_case_periods;


create policy "adv_periods_select"
on public.adv_case_periods
for select
to authenticated
using (
  public.can_access_adv_case(case_id)
);


create policy "adv_periods_insert"
on public.adv_case_periods
for insert
to authenticated
with check (
  public.can_contribute_adv_case(case_id)
);


create policy "adv_periods_update"
on public.adv_case_periods
for update
to authenticated
using (
  public.can_contribute_adv_case(case_id)
)
with check (
  public.can_contribute_adv_case(case_id)
);


create policy "adv_periods_delete"
on public.adv_case_periods
for delete
to authenticated
using (
  public.can_contribute_adv_case(case_id)
);


-- ------------------------------------------------------------
-- DOCUMENTOS COMPARTILHADOS NO CASO
-- ------------------------------------------------------------

drop policy if exists "adv_documents_select"
on public.adv_documents;

create policy "adv_documents_select"
on public.adv_documents
for select
to authenticated
using (
  user_id = auth.uid()

  or public.is_admin()

  or (
    case_id is not null
    and public.can_access_adv_case(case_id)
  )
);


drop policy if exists "adv_documents_insert"
on public.adv_documents;

create policy "adv_documents_insert"
on public.adv_documents
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    case_id is null
    or public.can_contribute_adv_case(case_id)
  )
);


drop policy if exists "adv_documents_update"
on public.adv_documents;

create policy "adv_documents_update"
on public.adv_documents
for update
to authenticated
using (
  user_id = auth.uid()

  or public.is_admin()

  or (
    case_id is not null
    and public.can_contribute_adv_case(case_id)
  )
)
with check (
  user_id = auth.uid()

  or public.is_admin()

  or (
    case_id is not null
    and public.can_contribute_adv_case(case_id)
  )
);


-- ------------------------------------------------------------
-- CONTRIBUICOES
-- ------------------------------------------------------------

drop policy if exists "adv_case_contributions_select"
on public.adv_case_contributions;

create policy "adv_case_contributions_select"
on public.adv_case_contributions
for select
to authenticated
using (
  public.can_access_adv_case(case_id)
);


drop policy if exists "adv_case_contributions_insert"
on public.adv_case_contributions;

create policy "adv_case_contributions_insert"
on public.adv_case_contributions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.can_contribute_adv_case(case_id)
);


drop policy if exists "adv_case_contributions_update"
on public.adv_case_contributions;

create policy "adv_case_contributions_update"
on public.adv_case_contributions
for update
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
)
with check (
  user_id = auth.uid()
  or public.is_admin()
);


drop policy if exists "adv_case_contributions_delete"
on public.adv_case_contributions;

create policy "adv_case_contributions_delete"
on public.adv_case_contributions
for delete
to authenticated
using (
  user_id = auth.uid()

  or public.is_admin()

  or exists (
    select 1
    from public.adv_cases c
    where c.id = case_id
      and c.user_id = auth.uid()
  )
);


-- ------------------------------------------------------------
-- CHAT
-- ------------------------------------------------------------

drop policy if exists "adv_case_messages_select"
on public.adv_case_messages;

create policy "adv_case_messages_select"
on public.adv_case_messages
for select
to authenticated
using (
  public.can_access_adv_case(case_id)
);


drop policy if exists "adv_case_messages_insert"
on public.adv_case_messages;

create policy "adv_case_messages_insert"
on public.adv_case_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.can_contribute_adv_case(case_id)
);


drop policy if exists "adv_case_messages_delete"
on public.adv_case_messages;

create policy "adv_case_messages_delete"
on public.adv_case_messages
for delete
to authenticated
using (
  sender_id = auth.uid()

  or public.is_admin()

  or exists (
    select 1
    from public.adv_cases c
    where c.id = case_id
      and c.user_id = auth.uid()
  )
);


-- ============================================================
-- INVITE POR E-MAIL OU USERNAME
-- ============================================================

create or replace function public.adv_invite_case_member(
  p_case_id uuid,
  p_identifier text,
  p_permission text default 'contribute',
  p_scope text default 'case'
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_target uuid;
  v_owner uuid;
  v_name text;
  v_identifier text;
begin

  if p_permission not in ('view', 'contribute') then
    raise exception 'Permissao invalida';
  end if;

  if p_scope not in ('case', 'all') then
    raise exception 'Escopo invalido';
  end if;

  select c.user_id
  into v_owner
  from public.adv_cases c
  where c.id = p_case_id;

  if v_owner is null then
    raise exception 'Caso nao encontrado';
  end if;

  if v_owner <> auth.uid()
     and not public.is_admin() then
    raise exception 'Somente o responsavel pelo caso pode convidar colaboradores';
  end if;

  v_identifier :=
    lower(
      trim(
        leading '@'
        from trim(p_identifier)
      )
    );

  select au.id
  into v_target
  from auth.users au
  left join public.adv_profiles ap
    on ap.user_id = au.id
  where
    lower(coalesce(au.email, '')) = v_identifier
    or lower(coalesce(ap.username, '')) = v_identifier
  limit 1;

  if v_target is null then
    raise exception 'Usuario nao encontrado';
  end if;

  if v_target = v_owner then
    raise exception 'Este usuario ja e o responsavel pelo caso';
  end if;

  select
    coalesce(
      p.display_name,
      p.first_name,
      ap.username,
      'Usuario LEVEL'
    )
  into v_name
  from public.profiles p
  left join public.adv_profiles ap
    on ap.user_id = p.id
  where p.id = v_target;

  if p_scope = 'all' then

    insert into public.adv_global_case_access (
      owner_user_id,
      user_id,
      invited_by,
      permission,
      status
    )
    values (
      v_owner,
      v_target,
      auth.uid(),
      p_permission,
      'pending'
    )
    on conflict (
      owner_user_id,
      user_id
    )
    do update set
      permission = excluded.permission,
      status = 'pending',
      invited_by = auth.uid(),
      created_at = now(),
      responded_at = null;

  else

    insert into public.adv_case_members (
      case_id,
      user_id,
      invited_by,
      permission,
      status
    )
    values (
      p_case_id,
      v_target,
      auth.uid(),
      p_permission,
      'pending'
    )
    on conflict (
      case_id,
      user_id
    )
    do update set
      permission = excluded.permission,
      status = 'pending',
      invited_by = auth.uid(),
      created_at = now(),
      responded_at = null;

  end if;

  return jsonb_build_object(
    'ok', true,
    'name', v_name,
    'scope', p_scope
  );

end;
$$;


-- ============================================================
-- CONVITES DO USUARIO
-- ============================================================

create or replace function public.adv_get_my_case_invitations()
returns table (
  scope text,
  invitation_id uuid,
  case_id uuid,
  case_title text,
  inviter_name text,
  permission text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$

  select
    'case'::text as scope,

    cm.id,

    cm.case_id,

    coalesce(
      c.client_name,
      c.client_reference,
      c.bank_name,
      'Caso LEVEL'
    ),

    coalesce(
      p.display_name,
      p.first_name,
      'Colega LEVEL'
    ),

    cm.permission,

    cm.created_at

  from public.adv_case_members cm

  join public.adv_cases c
    on c.id = cm.case_id

  left join public.profiles p
    on p.id = cm.invited_by

  where cm.user_id = auth.uid()
    and cm.status = 'pending'


  union all


  select
    'all'::text,

    ga.id,

    null::uuid,

    'Todos os casos deste advogado'::text,

    coalesce(
      p.display_name,
      p.first_name,
      'Colega LEVEL'
    ),

    ga.permission,

    ga.created_at

  from public.adv_global_case_access ga

  left join public.profiles p
    on p.id = ga.owner_user_id

  where ga.user_id = auth.uid()
    and ga.status = 'pending'

  order by created_at desc;

$$;


create or replace function public.adv_respond_case_invite(
  p_invitation_id uuid,
  p_scope text,
  p_accept boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

  if p_scope = 'all' then

    update public.adv_global_case_access
    set
      status =
        case
          when p_accept then 'accepted'
          else 'rejected'
        end,

      responded_at = now()

    where id = p_invitation_id
      and user_id = auth.uid()
      and status = 'pending';

  else

    update public.adv_case_members
    set
      status =
        case
          when p_accept then 'accepted'
          else 'rejected'
        end,

      responded_at = now()

    where id = p_invitation_id
      and user_id = auth.uid()
      and status = 'pending';

  end if;

end;
$$;


-- ============================================================
-- PESSOAS DO CASO
-- ============================================================

create or replace function public.adv_get_case_members(
  p_case_id uuid
)
returns table (
  user_id uuid,
  display_name text,
  username text,
  permission text,
  status text,
  is_owner boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin

  if not public.can_access_adv_case(p_case_id) then
    raise exception 'Acesso negado';
  end if;

  return query

  select
    c.user_id,

    coalesce(
      p.display_name,
      p.first_name,
      'Responsavel'
    ),

    ap.username,

    'owner'::text,

    'accepted'::text,

    true

  from public.adv_cases c

  left join public.profiles p
    on p.id = c.user_id

  left join public.adv_profiles ap
    on ap.user_id = c.user_id

  where c.id = p_case_id


  union all


  select
    cm.user_id,

    coalesce(
      p.display_name,
      p.first_name,
      'Colaborador'
    ),

    ap.username,

    cm.permission,

    cm.status,

    false

  from public.adv_case_members cm

  left join public.profiles p
    on p.id = cm.user_id

  left join public.adv_profiles ap
    on ap.user_id = cm.user_id

  where cm.case_id = p_case_id
    and cm.status in (
      'pending',
      'accepted'
    );


end;
$$;


-- ============================================================
-- FEED DE CONTRIBUICOES
-- ============================================================

create or replace function public.adv_get_case_contributions(
  p_case_id uuid
)
returns table (
  id uuid,
  kind text,
  title text,
  body text,
  metadata jsonb,
  created_at timestamptz,
  actor_user_id uuid,
  actor_name text,
  actor_username text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin

  if not public.can_access_adv_case(p_case_id) then
    raise exception 'Acesso negado';
  end if;

  return query

  select
    cc.id,
    cc.kind,
    cc.title,
    cc.body,
    cc.metadata,
    cc.created_at,
    cc.user_id,

    coalesce(
      p.display_name,
      p.first_name,
      'Usuario LEVEL'
    ),

    ap.username

  from public.adv_case_contributions cc

  left join public.profiles p
    on p.id = cc.user_id

  left join public.adv_profiles ap
    on ap.user_id = cc.user_id

  where cc.case_id = p_case_id

  order by cc.created_at desc;

end;
$$;


-- ============================================================
-- FEED DO CHAT DO CASO
-- ============================================================

create or replace function public.adv_get_case_messages(
  p_case_id uuid
)
returns table (
  id uuid,
  body text,
  created_at timestamptz,
  actor_user_id uuid,
  actor_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin

  if not public.can_access_adv_case(p_case_id) then
    raise exception 'Acesso negado';
  end if;

  return query

  select
    m.id,
    m.body,
    m.created_at,
    m.sender_id,

    coalesce(
      p.display_name,
      p.first_name,
      'Usuario LEVEL'
    )

  from public.adv_case_messages m

  left join public.profiles p
    on p.id = m.sender_id

  where m.case_id = p_case_id

  order by m.created_at asc;

end;
$$;
