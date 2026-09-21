-- ============================================================
-- LEVEL ADV V6
-- CASE CREATION + USER APPEARANCE
-- ============================================================


-- ------------------------------------------------------------
-- APARENCIA POR USUARIO
-- ------------------------------------------------------------

alter table public.adv_profiles
add column if not exists accent_color text
not null default '#B58A3A';


-- ------------------------------------------------------------
-- CRIACAO SEGURA DE CASO
--
-- O frontend nao insere mais diretamente em adv_cases.
-- O servidor usa auth.uid() internamente.
-- ------------------------------------------------------------

create or replace function public.adv_create_case(
  p_client_name text,
  p_reference text default null,
  p_process_number text default null,
  p_related_party text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_case uuid;
begin

  v_user := auth.uid();

  if v_user is null then
    raise exception 'Usuario nao autenticado';
  end if;

  if nullif(trim(p_client_name), '') is null then
    raise exception 'Informe o nome do cliente';
  end if;

  insert into public.adv_cases (
    user_id,
    client_name,
    client_reference,
    process_number,
    bank_name,
    original_debt,
    status,
    progress_percent
  )
  values (
    v_user,
    trim(p_client_name),
    nullif(trim(p_reference), ''),
    nullif(trim(p_process_number), ''),
    nullif(trim(p_related_party), ''),
    0,
    'in_progress',
    10
  )
  returning id
  into v_case;

  insert into public.adv_case_contributions (
    case_id,
    user_id,
    kind,
    title,
    body
  )
  values (
    v_case,
    v_user,
    'system',
    'Caso criado',
    'O prontuario juridico foi criado na LEVEL ADV.'
  );

  return v_case;

end;
$$;


revoke all
on function public.adv_create_case(
  text,
  text,
  text,
  text
)
from public;

grant execute
on function public.adv_create_case(
  text,
  text,
  text,
  text
)
to authenticated;