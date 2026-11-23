import { Shield } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../data/DataProvider';
import { Avatar } from '../components/Avatar';
import { formatShortDate } from '../lib/format';

export function UsersPage() {
  const { profile: me } = useAuth();
  const { profiles, transactions, debts } = useData();
  const isAdmin = me?.is_admin ?? false;

  return (
    <div className="mx-auto max-w-[1920px] px-8 py-7">
      <div>
        <h1 className="text-[32px] font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-[14px] text-muted">
          Profiles stored in Supabase. Row level security keeps each account separate.
        </p>
      </div>

      {!isAdmin ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-[#141416] px-5 py-4">
          <Shield size={18} className="mt-0.5 shrink-0 text-muted" />
          <p className="text-[13.5px] leading-relaxed text-muted">
            You are viewing your own profile. To list every user, mark your profile as admin in
            Supabase SQL Editor:
          </p>
        </div>
      ) : null}

      {!isAdmin ? (
        <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#101012] px-5 py-4 text-[12.5px] text-[#B3A3FF]">
          {`update public.profiles set is_admin = true where email = 'you@mail.com';`}
        </pre>
      ) : null}

      <section className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[1.3px] text-faint">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Currency</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((person) => (
                <tr
                  key={person.id}
                  className="border-b border-white/[0.04] text-[14px] last:border-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={person.name || person.email} url={person.avatar_url} size={40} />
                      <div>
                        <p className="font-semibold">{person.name || 'Unnamed'}</p>
                        <p className="text-[12px] text-muted">{person.username || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted">{person.email || '—'}</td>
                  <td className="px-6 py-4 text-muted">{person.currency}</td>
                  <td className="px-6 py-4 text-muted">{formatShortDate(person.created_at)}</td>
                  <td className="px-6 py-4">
                    {person.is_admin ? (
                      <span className="rounded-full bg-neon/20 px-3 py-1 text-[12px] font-medium text-[#B3A3FF]">
                        Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[12px] text-muted">
                        User
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/[0.06] px-6 py-4 text-[13px] text-muted">
          {profiles.length} profile{profiles.length === 1 ? '' : 's'} visible ·{' '}
          {transactions.length} transactions · {debts.length} debts
        </div>
      </section>
    </div>
  );
}
