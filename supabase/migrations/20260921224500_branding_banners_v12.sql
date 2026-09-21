-- LEVEL ADV V12 - BRANDING + BANNERS

create table if not exists public.adv_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  storage_path text,
  link_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid
    references public.profiles(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists
adv_banners_active_order_idx
on public.adv_banners(
  is_active,
  sort_order,
  created_at
);

alter table public.adv_banners
enable row level security;

drop policy if exists
"adv_banners_select"
on public.adv_banners;

create policy
"adv_banners_select"
on public.adv_banners
for select
to authenticated
using (true);

drop policy if exists
"adv_banners_insert"
on public.adv_banners;

create policy
"adv_banners_insert"
on public.adv_banners
for insert
to authenticated
with check (
  public.is_admin()
);

drop policy if exists
"adv_banners_update"
on public.adv_banners;

create policy
"adv_banners_update"
on public.adv_banners
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

drop policy if exists
"adv_banners_delete"
on public.adv_banners;

create policy
"adv_banners_delete"
on public.adv_banners
for delete
to authenticated
using (
  public.is_admin()
);

create or replace function
public.level_adv_banner_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
level_adv_banner_updated_at
on public.adv_banners;

create trigger
level_adv_banner_updated_at
before update
on public.adv_banners
for each row
execute function
public.level_adv_banner_updated_at();

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'level-adv-banners',
  'level-adv-banners',
  true,
  8388608,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id)
do update set
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types =
    excluded.allowed_mime_types;

drop policy if exists
"level_adv_banners_insert"
on storage.objects;

create policy
"level_adv_banners_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id =
    'level-adv-banners'
  and public.is_admin()
);

drop policy if exists
"level_adv_banners_update"
on storage.objects;

create policy
"level_adv_banners_update"
on storage.objects
for update
to authenticated
using (
  bucket_id =
    'level-adv-banners'
  and public.is_admin()
)
with check (
  bucket_id =
    'level-adv-banners'
  and public.is_admin()
);

drop policy if exists
"level_adv_banners_delete"
on storage.objects;

create policy
"level_adv_banners_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id =
    'level-adv-banners'
  and public.is_admin()
);

insert into public.adv_banners (
  title,
  image_url,
  link_url,
  sort_order,
  is_active
)
values
  (
    'Calculadoras jurÃ­dicas inteligentes',
    '/brand/banners/banner-calculadoras.webp',
    '/app/calculadoras',
    1,
    true
  ),
  (
    'Geradores de documentos',
    '/brand/banners/banner-documentos.webp',
    '/app/gerador-documentos',
    2,
    true
  ),
  (
    'Casos, equipe e colaboraÃ§Ã£o',
    '/brand/banners/banner-casos.webp',
    '/app/casos',
    3,
    true
  ),
  (
    'SeguranÃ§a, LGPD e controle',
    '/brand/banners/banner-lgpd.webp',
    '/app',
    4,
    true
  );
