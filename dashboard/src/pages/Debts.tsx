import { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { AddDebtModal } from '../components/AddDebtModal';
import { Avatar } from '../components/Avatar';
import { ReceiptModal } from '../components/ReceiptModal';
import { useData } from '../data/DataProvider';
import { formatMoney, formatShortDate, formatClockTime, toAmount } from '../lib/format';
import type { DebtRow } from '../lib/types';

export function DebtsPage() {
  const { profile } = useAuth();
  const { debts, setDebtStatus, deleteDebt } = useData();
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtRow | null>(null);
  const currency = profile?.currency ?? 'USD';
  const money = (amount: number) => formatMoney(amount, currency);

  const summary = useMemo(() => {
    const total = debts.reduce((sum, debt) => sum + toAmount(debt.amount), 0);
    const unpaid = debts.filter((debt) => debt.status === 'unpaid');
    const paid = debts.filter((debt) => debt.status === 'paid');
    return {
      total,
      outstanding: unpaid.reduce((sum, debt) => sum + toAmount(debt.amount), 0),
      settled: paid.reduce((sum, debt) => sum + toAmount(debt.amount), 0),
      unpaidCount: unpaid.length,
      paidCount: paid.length,
    };
  }, [debts]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...debts]
      .filter((debt) =>
        needle
          ? `${debt.borrower_name} ${debt.borrower_email ?? ''} ${debt.reason}`
              .toLowerCase()
              .includes(needle)
          : true,
      )
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'unpaid' ? -1 : 1;
        return new Date(b.loan_date).getTime() - new Date(a.loan_date).getTime();
      });
  }, [debts, query]);

  return (
    <div className="mx-auto max-w-[1920px] px-8 py-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight">Debts Management</h1>
          <p className="mt-1 text-[14px] text-muted">
            Money lent to friends — synced live from the My Duit Gw mobile app.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex h-11 w-full max-w-[300px] items-center gap-2 rounded-full border border-white/[0.08] bg-card px-4">
            <Search size={17} className="text-faint" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search borrower..."
              className="min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-faint"
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
          >
            <Plus size={17} />
            Add Debt
          </button>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
        <SummaryCard
          label="Total Lent"
          value={money(summary.total)}
          badge={`${debts.length} records`}
        />
        <SummaryCard
          label="Outstanding"
          value={money(summary.outstanding)}
          badge={`${summary.unpaidCount} pending`}
          badgeTone="amber"
        />
        <SummaryCard
          label="Settled"
          value={money(summary.settled)}
          badge={`${summary.paidCount} paid`}
          badgeTone="green"
        />
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[1.3px] text-faint">
                <th className="px-6 py-4 font-medium">Borrower</th>
                <th className="px-6 py-4 font-medium">Amount Lent</th>
                <th className="px-6 py-4 font-medium">Date &amp; Time</th>
                <th className="px-6 py-4 font-medium">Loan Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((debt) => {
                const paid = debt.status === 'paid';
                return (
                  <tr
                    key={debt.id}
                    className="border-b border-white/[0.04] text-[14px] transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={debt.borrower_name} size={40} />
                        <div>
                          <p className="font-semibold text-ink">{debt.borrower_name}</p>
                          <p className="mt-0.5 text-[12px] text-muted">
                            {debt.borrower_email || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold">
                      {money(toAmount(debt.amount))}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted">
                      {formatShortDate(debt.loan_date)}
                      <br />
                      <span className="text-[12px]">{formatClockTime(debt.loan_date)}</span>
                    </td>
                    <td className="max-w-[260px] truncate px-6 py-4 text-[#D5D5DC]">
                      {debt.reason || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                          paid
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber/15 text-amber'
                        }`}
                      >
                        {paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDebt(debt)}
                          className="h-9 rounded-full border border-white/[0.08] px-4 text-[12.5px] font-medium text-[#D5D5DC] transition-colors hover:bg-white/[0.05]"
                        >
                          View Receipt
                        </button>
                        {!paid ? (
                          <button
                            onClick={() => void setDebtStatus(debt.id, 'paid')}
                            className="h-9 rounded-full bg-emerald-600/15 px-3 text-[12px] font-medium text-emerald-400 transition-colors hover:bg-emerald-600/25"
                            title="Mark as paid"
                          >
                            Paid
                          </button>
                        ) : null}
                        <button
                          onClick={() => void deleteDebt(debt.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-coral transition-colors hover:bg-coral/10"
                          title="Delete debt"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] font-medium">No debts found</p>
            <p className="mt-1 text-[13px] text-muted">
              Add one here or log a loan from the mobile app.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-6 py-4 text-[13px] text-muted">
          <span>
            Showing {rows.length} of {debts.length} debts
          </span>
          <span>Total outstanding {money(summary.outstanding)}</span>
        </div>
      </section>

      <AddDebtModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ReceiptModal debt={selectedDebt} onClose={() => setSelectedDebt(null)} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  badge,
  badgeTone = 'neutral',
}: {
  label: string;
  value: string;
  badge: string;
  badgeTone?: 'neutral' | 'amber' | 'green';
}) {
  const toneClasses = {
    neutral: 'bg-white/[0.06] text-muted',
    amber: 'bg-amber/15 text-amber',
    green: 'bg-emerald-500/15 text-emerald-400',
  }[badgeTone];

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-muted">{label}</p>
        <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${toneClasses}`}>
          {badge}
        </span>
      </div>
      <p className="mt-4 text-[32px] font-bold tracking-tight">{value}</p>
    </section>
  );
}
