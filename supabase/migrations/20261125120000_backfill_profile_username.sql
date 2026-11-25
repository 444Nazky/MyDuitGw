-- The app stores the username chosen at sign-up in auth metadata and in
-- public.profiles. Older accounts (created before that was filled in) can
-- still have an empty profile username, so the admin dashboard shows "—"
-- instead of the name the user picked on mobile. Fill it once from the
-- signup metadata, falling back to the profile name.

update public.profiles as profile
set username = coalesce(
  nullif(trim(account.raw_user_meta_data ->> 'username'), ''),
  nullif(trim(profile.name), ''),
  ''
)
from auth.users as account
where profile.id = account.id
  and coalesce(profile.username, '') = '';
