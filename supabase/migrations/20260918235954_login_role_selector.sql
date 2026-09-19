create or replace function public.get_my_role_keys()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    array_agg(r.key order by r.key),
    array[]::text[]
  )
  from public.user_roles ur
  join public.roles r
    on r.id = ur.role_id
  where ur.user_id = auth.uid();
$$;

grant execute
on function public.get_my_role_keys()
to authenticated;