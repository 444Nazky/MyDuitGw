import { useCallback, useEffect, useState } from 'react';
import { Activity, Database, HardDrive, Shield, Trash2, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { Avatar } from '../components/Avatar';
import { useData } from '../data/DataProvider';
import { formatDateTime, formatShortDate } from '../lib/format';
import { supabase } from '../lib/supabase';

interface ReleaseRow {
  version: string;
  version_code: number;
  apk_size: number | string;
  apk_filename: string;
  published_at: string;
  is_force_update: boolean;
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card flex flex-col justify-between p-5">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-[12px] uppercase tracking-[1.3px]">{label}</span>
      </div>
      <p className="mt-4 text-[26px] font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-[12px] text-faint">{hint}</p> : null}
    </div>
  );
}

export function ServerPage() {
  const { profile: me, session } = useAuth();
  const { profiles, transactions, debts, logs, realtimeStatus, refresh } = useData();
  const [releases, setReleases] = useState<ReleaseRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const isAdmin = me?.is_admin ?? false;

  const loadReleases = useCallback(async () => {
    const { data, error: releaseError } = await supabase
      .from('app_releases')
      .select('version, version_code, apk_size, apk_filename, published_at, is_force_update')
      .order('version_code', { ascending: false });
    if (releaseError) {
      setError(releaseError.message);
      return;
    }
    setReleases((data as ReleaseRow[]) ?? []);
  }, []);

  useEffect(() => {
    void loadReleases();
  }, [loadReleases]);

  const apkBytes = releases.reduce((sum, item) => sum + Number(item.apk_size ?? 0), 0);
  const latest = releases[0] ?? null;

  const removeUser = async (userId: string, label: string) => {
    if (!isAdmin) return;
    const confirmed = window.confirm(
      `Delete ${label}? This removes the account, profile, transactions and debts. It cannot be undone.`,
    );
    if (!confirmed) return;

    setDeleting(userId);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke('admin-delete-user', {
      body: { userId },
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
    });

    setDeleting(null);

    if (invokeError) {
      setError(invokeError.message);
      return;
    }
    if (data && typeof data === 'object' && 'error' in data && data.error) {
      setError(String((data as { error: unknown }).error));
      return;
    }
    await Promise.all([refresh(), loadReleases()]);
  };

  return (
    <div className="mx-auto max-w-[1920px] px-8 py-7">
      <h1 className="text-[32px] font-bold tracking-tight">Server</h1>
      <p className="mt-1 text-[14px] text-muted">
        Supabase project health, published APK builds and the accounts registered from the app.
      </p>

      {error ? (
        <p className="mt-5 rounded-2xl border border-coral/30 bg-coral/10 px-5 py-3 text-[13.5px] text-coral">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={<Users size={16} />}
          label="Accounts"
          value={String(profiles.length)}
          hint={`${profiles.filter((person) => person.is_admin).length} admin`}
        />
        <Stat
          icon={<Database size={16} />}
          label="Records"
          value={String(transactions.length + debts.length)}
          hint={`${transactions.length} transactions · ${debts.length} debts`}
        />
        <Stat
          icon={<HardDrive size={16} />}
          label="APK storage"
          value={`${(apkBytes / (1024 * 1024)).toFixed(1)} MB`}
          hint={`${releases.length} published release${releases.length === 1 ? '' : 's'}`}
        />
        <Stat
          icon={<Activity size={16} />}
          label="Realtime"
          value={realtimeStatus}
          hint={logs[0] ? `Last event ${logs[0].time} · ${logs[0].table}` : 'No events yet'}
        />
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <h2 className="text-[17px] font-semibold">Registered users</h2>
            <p className="mt-0.5 text-[12.5px] text-muted">
              Username comes from the profile created when the account signed up.
            </p>
          </div>
          {!isAdmin ? (
            <span className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] text-muted">
              <Shield size={13} /> Read only
            </span>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[1.3px] text-faint">
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Currency</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Role</th>
                {isAdmin ? <th className="px-6 py-4" /> : null}
              </tr>
            </thead>
            <tbody>
              {profiles.map((person) => (
                <tr key={person.id} className="border-b border-white/[0.04] text-[14px] last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={person.name || person.email}
                        url={person.avatar_url}
                        size={38}
                      />
                      <div>
                        <p className="font-semibold">{person.username || '—'}</p>
                        <p className="text-[12px] text-muted">{person.name || 'Unnamed'}</p>
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
                  {isAdmin ? (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          void removeUser(
                            person.id,
                            person.username || person.email || 'this account',
                          )
                        }
                        disabled={deleting === person.id || person.id === me?.id}
                        title={person.id === me?.id ? 'You cannot delete yourself' : 'Delete user'}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-coral/30 px-3 py-1.5 text-[12.5px] text-coral transition-colors hover:bg-coral/10 disabled:opacity-40"
                      >
                        <Trash2 size={13} />
                        {deleting === person.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-[17px] font-semibold">Published builds</h2>
          <p className="mt-0.5 text-[12.5px] text-muted">
            {latest
              ? `Latest is v${latest.version} (build ${latest.version_code}), published ${formatDateTime(latest.published_at)}.`
              : 'Nothing published yet. Run npm run publish:release.'}
          </p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {releases.map((release) => (
            <div key={release.version_code} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-[14.5px] font-semibold">v{release.version}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {release.apk_filename} · {(Number(release.apk_size) / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <div className="flex items-center gap-3">
                {release.is_force_update ? (
                  <span className="rounded-full bg-coral/15 px-3 py-1 text-[11.5px] text-coral">
                    Forced
                  </span>
                ) : null}
                <span className="text-[12.5px] text-faint">
                  {formatShortDate(release.published_at)}
                </span>
              </div>
            </div>
          ))}
          {releases.length === 0 ? (
            <p className="px-6 py-6 text-[13px] text-muted">No releases recorded.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
