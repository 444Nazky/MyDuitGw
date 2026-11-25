-- The web dashboard runs as the admin account and must show the records and
-- transfer receipts that users create from the mobile app. Row level security
-- limited every table and the receipts bucket to the owning account, so the
-- dashboard could only ever see its own data.

drop policy if exists transactions_select_admin on public.transactions;
create policy transactions_select_admin on public.transactions
  for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists debts_select_admin on public.debts;
create policy debts_select_admin on public.debts
  for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists debts_update_admin on public.debts;
create policy debts_update_admin on public.debts
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists debts_delete_admin on public.debts;
create policy debts_delete_admin on public.debts
  for delete to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists receipts_admin_read on storage.objects;
create policy receipts_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'receipts' and public.is_admin(auth.uid()));

-- The account used to sign in to the dashboard.
update public.profiles
set is_admin = true
where email = 'naruzky.naz@gmail.com';
