create table if not exists public.adv_document_deletion_requests (
  id uuid primary key default gen_random_uuid(),

  document_id uuid
    references public.adv_documents(id)
    on delete set null,

  requester_id uuid not null
    references public.profiles(id)
    on delete cascade,

  original_name text not null,

  storage_path text not null,

  reason text,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'approved',
        'rejected',
        'cancelled'
      )
    ),

  admin_note text,

  requested_at timestamptz
    not null default now(),

  reviewed_at timestamptz,

  reviewed_by uuid
    references public.profiles(id)
    on delete set null
);


create unique index if not exists
adv_document_delete_pending_unique
on public.adv_document_deletion_requests(document_id)
where
  status = 'pending'
  and document_id is not null;


alter table public.adv_document_deletion_requests
enable row level security;


drop policy if exists
"adv_document_delete_requests_select"
on public.adv_document_deletion_requests;

create policy
"adv_document_delete_requests_select"
on public.adv_document_deletion_requests
for select
to authenticated
using (
  requester_id = auth.uid()
  or public.is_admin()
);


drop policy if exists
"adv_document_delete_requests_insert"
on public.adv_document_deletion_requests;

create policy
"adv_document_delete_requests_insert"
on public.adv_document_deletion_requests
for insert
to authenticated
with check (
  requester_id = auth.uid()
);


drop policy if exists
"adv_document_delete_requests_admin_update"
on public.adv_document_deletion_requests;

create policy
"adv_document_delete_requests_admin_update"
on public.adv_document_deletion_requests
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- DOCUMENTOS:
-- USUARIO PODE LER/CRIAR/ATUALIZAR,
-- MAS SOMENTE ADMIN EXCLUI
-- ============================================================

drop policy if exists
"adv_documents_owner"
on public.adv_documents;


drop policy if exists
"adv_documents_select"
on public.adv_documents;

create policy
"adv_documents_select"
on public.adv_documents
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);


drop policy if exists
"adv_documents_insert"
on public.adv_documents;

create policy
"adv_documents_insert"
on public.adv_documents
for insert
to authenticated
with check (
  user_id = auth.uid()
  or public.is_admin()
);


drop policy if exists
"adv_documents_update"
on public.adv_documents;

create policy
"adv_documents_update"
on public.adv_documents
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


drop policy if exists
"adv_documents_delete_admin"
on public.adv_documents;

create policy
"adv_documents_delete_admin"
on public.adv_documents
for delete
to authenticated
using (
  public.is_admin()
);


-- STORAGE: SOMENTE ADMIN PODE REMOVER

drop policy if exists
"adv_files_delete"
on storage.objects;

drop policy if exists
"adv_files_admin_delete"
on storage.objects;

create policy
"adv_files_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'level-adv-documents'
  and public.is_admin()
);