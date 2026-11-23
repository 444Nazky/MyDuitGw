# My Duit Gw dashboard

Web admin dashboard for My Duit Gw, styled after `UI/web-*.png`. It reads and writes the same Supabase project as the mobile app and listens to realtime changes.

## Run

```bash
cd dashboard
npm install
npm install-scripts approve esbuild
cp .env.example .env.local   # already filled in this workspace
npm run dev
```

Open http://localhost:5173. Sign in with a Supabase Auth account, or create one from the sign-in screen. The database trigger `on_auth_user_created` creates the matching `profiles` row.

## Configure

`dashboard/.env.local`:

```
VITE_SUPABASE_URL=https://ixsyfstslhositdhesru.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The publishable key is safe to ship in the browser. Never put the database password here.

## Admin access

Row level security normally shows a user only their own profile. To let an account see the full Users list, run this in Supabase SQL Editor:

```sql
update public.profiles set is_admin = true where email = 'you@mail.com';
```

## Sample data

After signing up once, open `supabase/demo-data.sql`, replace `you@mail.com` with your account email, and run it in Supabase SQL Editor. The dashboard then looks like the figcraft screenshots.

## Schema

`supabase/migrations/20261123000000_init.sql` creates `profiles`, `transactions`, `debts`, the private `receipts` storage bucket, RLS policies, and realtime publication. Amounts are stored in USD base units; the UI converts for IDR display at 16,300.

## Scripts

- `npm run dev` start Vite
- `npm run typecheck` TypeScript check
- `npm run build` typecheck + production build
