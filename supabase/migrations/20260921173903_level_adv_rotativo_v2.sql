-- ============================================================
-- LEVEL ADV
-- ROTATIVO V2
-- ============================================================

alter table public.adv_cases
add column if not exists client_name text;

alter table public.adv_cases
add column if not exists client_document text;

alter table public.adv_cases
add column if not exists process_number text;

alter table public.adv_cases
add column if not exists contract_reference text;

alter table public.adv_cases
add column if not exists total_paid numeric(14,2)
not null default 0;

alter table public.adv_cases
add column if not exists interest_mode text
not null default 'charged';

alter table public.adv_cases
add column if not exists notes text;

alter table public.adv_cases
add column if not exists technical_conclusion text;


alter table public.adv_case_periods
add column if not exists calculated_revolving_interest numeric(14,2)
not null default 0;

alter table public.adv_case_periods
add column if not exists charged_revolving_interest numeric(14,2)
not null default 0;

alter table public.adv_case_periods
add column if not exists annual_equivalent_rate numeric(14,6)
not null default 0;


create index if not exists adv_cases_user_created_idx
on public.adv_cases(user_id, created_at desc);

create index if not exists adv_cases_process_idx
on public.adv_cases(process_number);
