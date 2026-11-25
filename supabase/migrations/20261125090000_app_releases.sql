-- Self-hosted APK release channel (replaces a custom version API with Supabase).

create table if not exists public.app_releases (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  version_code integer not null,
  apk_filename text not null,
  apk_size bigint not null,
  apk_hash text not null,
  release_notes text not null default '',
  is_force_update boolean not null default false,
  min_version text,
  published_at timestamptz not null default now()
);

create unique index if not exists app_releases_version_code_key
  on public.app_releases (version_code);

create index if not exists app_releases_published_idx
  on public.app_releases (published_at desc);

alter table public.app_releases enable row level security;

-- Anyone may read release metadata; only the service role can write.
drop policy if exists app_releases_read on public.app_releases;
create policy app_releases_read on public.app_releases
  for select to anon, authenticated
  using (true);

grant select on public.app_releases to anon, authenticated;
revoke insert, update, delete on public.app_releases from anon, authenticated;

-- Public bucket: the APK is guarded by its SHA-256 hash, not by secrecy.
insert into storage.buckets (id, name, public)
values ('apk', 'apk', true)
on conflict (id) do update set public = true;
