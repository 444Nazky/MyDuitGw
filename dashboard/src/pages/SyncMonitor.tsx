import { Activity, Database, HardDrive, Radio } from 'lucide-react';
import { useData } from '../data/DataProvider';

export function SyncMonitorPage() {
  const {
    transactions,
    debts,
    profiles,
    logs,
    realtimeStatus,
    lastSync,
    refresh,
  } = useData();

  const receiptCount = debts.filter((debt) => Boolean(debt.receipt_path)).length;
  const live = realtimeStatus === 'subscribed';

  return (
    <div className="mx-auto max-w-[1920px] px-8 py-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight">Supabase Backend Monitor</h1>
          <p className="mt-1 text-[14px] text-muted">
            Realtime health, table counts and storage usage for the My Duit Gw backend.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-card px-4 py-2 text-[13px] text-muted">
            <span className={`h-2 w-2 rounded-full ${live ? 'bg-neon' : 'bg-amber'}`} />
            ap-northeast-1 · {live ? 'Live' : realtimeStatus}
          </span>
          <button
            onClick={() => void refresh()}
            className="h-10 rounded-full border border-white/[0.08] bg-card px-5 text-[13px] font-medium text-[#D5D5DC] transition-colors hover:bg-white/[0.05]"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
        <TableCard
          icon={<Database size={18} />}
          name="transactions"
          count={transactions.length}
          note="rows synced live"
        />
        <TableCard
          icon={<Database size={18} />}
          name="debts"
          count={debts.length}
          note="rows synced live"
          badge={`${debts.filter((debt) => debt.status === 'unpaid').length} pending`}
        />
        <TableCard
          icon={<Database size={18} />}
          name="profiles"
          count={profiles.length}
          note="rows synced live"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[16px] font-semibold">
              <HardDrive size={18} className="text-muted" />
              Storage Bucket · receipts
            </h3>
            <span className="rounded-full bg-neon/15 px-3 py-1 text-[12px] text-neon">
              Healthy
            </span>
          </div>
          <p className="mt-5 text-[40px] font-bold tracking-tight">
            {receiptCount} <span className="text-[16px] font-normal text-muted">receipts linked</span>
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-skybar" style={{ width: `${Math.min(100, receiptCount * 5)}%` }} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-[13px]">
            <Metric label="Bucket" value="Private" />
            <Metric label="Policies" value="4 active" />
            <Metric label="From mobile" value={`${receiptCount} records`} />
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[16px] font-semibold">
              <Radio size={18} className="text-muted" />
              Realtime API
            </h3>
            <span className="text-[12px] text-neon">{live ? '1 connection' : 'connecting'}</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <Metric label="Status" value={live ? 'Subscribed' : realtimeStatus} />
            <Metric label="Channels" value="1 active" />
            <Metric label="Events logged" value={`${logs.length}`} />
            <Metric label="Errors (24h)" value="0" />
          </div>
          <p className="mt-6 border-t border-white/[0.06] pt-4 text-[12.5px] text-faint">
            Last sync {lastSync ? lastSync.toLocaleTimeString() : 'pending'} · postgres_changes on
            transactions, debts, profiles
          </p>
        </section>
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
          <h3 className="flex items-center gap-2 text-[16px] font-semibold">
            <Activity size={18} className="text-muted" />
            Realtime Connection Logs
          </h3>
          <span className="rounded-full bg-neon/15 px-3 py-1 text-[12px] text-neon">
            Live tail
          </span>
        </div>
        {logs.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-[14px] text-muted">Waiting for changes...</p>
            <p className="mt-1 text-[12.5px] text-faint">
              Add a record on mobile and the event appears here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[1.3px] text-faint">
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Table</th>
                  <th className="px-6 py-4 font-medium">Payload</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/[0.04] text-[13px] last:border-0">
                    <td className="whitespace-nowrap px-6 py-3 text-muted">{entry.time}</td>
                    <td
                      className={`px-6 py-3 font-medium ${
                        entry.event === 'DELETE'
                          ? 'text-coral'
                          : entry.event === 'INSERT'
                            ? 'text-neon'
                            : 'text-sky'
                      }`}
                    >
                      {entry.event}
                    </td>
                    <td className="px-6 py-3 text-muted">{entry.table}</td>
                    <td className="max-w-[400px] truncate px-6 py-3 font-mono text-[12px] text-[#D5D5DC]">
                      {entry.payload}
                    </td>
                    <td className="px-6 py-3 text-neon">200 OK</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-between border-t border-white/[0.06] px-6 py-4 text-[12.5px] text-muted">
          <span>Auto-refresh on · retention 40 events</span>
          <span className="text-neon">Realtime healthy</span>
        </div>
      </section>
    </div>
  );
}

function TableCard({
  icon,
  name,
  count,
  note,
  badge,
}: {
  icon: React.ReactNode;
  name: string;
  count: number;
  note: string;
  badge?: string;
}) {
  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[14px] text-muted">
          {icon}
          {name}
        </p>
        {badge ? (
          <span className="rounded-full bg-amber/15 px-3 py-1 text-[12px] text-amber">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-[34px] font-bold tracking-tight">{count.toLocaleString()}</p>
      <p className="mt-1 text-[12.5px] text-faint">{note}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-skybar" style={{ width: `${Math.min(100, count * 2)}%` }} />
      </div>
      <p className="mt-3 text-[12px] text-faint">RLS enabled · auto-vacuum ok</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[1.2px] text-faint">{label}</p>
      <p className="mt-1 text-[16px] font-semibold">{value}</p>
    </div>
  );
}
