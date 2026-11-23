-- My Duit Gw: initial schema for shared mobile + web dashboard data.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  username text not null default '',
  avatar_url text,
  currency text not null default 'USD' check (currency in ('USD', 'IDR')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(18, 6) not null check (amount > 0),
  category text not null check (
    category in ('Kuota', 'Shopping', 'Food', 'Salary', 'Bills', 'Game', 'Etc')
  ),
  note text,
  date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  borrower_name text not null,
  borrower_email text,
  amount numeric(18, 6) not null check (amount > 0),
  loan_date timestamptz not null default now(),
  reason text not null default '',
  receipt_path text,
  status text not null default 'unpaid' check (status in ('unpaid', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);
create index if not exists debts_user_status_idx
  on public.debts (user_id, status, loan_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists debts_set_updated_at on public.debts;
create trigger debts_set_updated_at
  before update on public.debts
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'username', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.debts enable row level security;

drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists transactions_select_own on public.transactions;
drop policy if exists transactions_insert_own on public.transactions;
drop policy if exists transactions_update_own on public.transactions;
drop policy if exists transactions_delete_own on public.transactions;
create policy transactions_select_own on public.transactions
  for select to authenticated using (user_id = auth.uid());
create policy transactions_insert_own on public.transactions
  for insert to authenticated with check (user_id = auth.uid());
create policy transactions_update_own on public.transactions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy transactions_delete_own on public.transactions
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists debts_select_own on public.debts;
drop policy if exists debts_insert_own on public.debts;
drop policy if exists debts_update_own on public.debts;
drop policy if exists debts_delete_own on public.debts;
create policy debts_select_own on public.debts
  for select to authenticated using (user_id = auth.uid());
create policy debts_insert_own on public.debts
  for insert to authenticated with check (user_id = auth.uid());
create policy debts_update_own on public.debts
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy debts_delete_own on public.debts
  for delete to authenticated using (user_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant all on public.profiles, public.transactions, public.debts to authenticated, service_role;
grant execute on function public.is_admin(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

drop policy if exists receipts_read_own on storage.objects;
drop policy if exists receipts_insert_own on storage.objects;
drop policy if exists receipts_update_own on storage.objects;
drop policy if exists receipts_delete_own on storage.objects;
create policy receipts_read_own on storage.objects
  for select to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy receipts_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy receipts_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy receipts_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

do $$
begin
  begin
    alter publication supabase_realtime add table public.transactions;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.debts;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.profiles;
  exception
    when duplicate_object then null;
  end;
end;
$$;
