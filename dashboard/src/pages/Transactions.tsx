import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../data/DataProvider';
import { exportCsv, exportJson } from '../lib/export';
import { CATEGORY_COLORS, TONE_COLORS } from '../lib/colors';
import { formatDateTime, formatMoney, toAmount } from '../lib/format';
import type { TransactionType } from '../lib/types';

type Filter = 'all' | TransactionType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
];

export function TransactionsPage() {
  const { profile } = useAuth();
  const { transactions, debts } = useData();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const currency = profile?.currency ?? 'IDR';

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return transactions.filter((transaction) => {
      if (filter !== 'all' && transaction.type !== filter) return false;
      if (!needle) return true;
      return `${transaction.note ?? ''} ${transaction.category} ${transaction.type}`
        .toLowerCase()
        .includes(needle);
    });
  }, [transactions, filter, query]);

  return (
    <div className="mx-auto max-w-[1920px] px-8 py-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-[14px] text-muted">
            Every income and expense record synced from the mobile app.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportCsv(transactions, debts)}
            className="flex h-11 items-center gap-2 rounded-full border border-white/[0.08] bg-card px-5 text-[13.5px] font-medium text-[#D5D5DC] transition-colors hover:bg-white/[0.05]"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => exportJson(transactions, debts)}
            className="flex h-11 items-center gap-2 rounded-full border border-white/[0.08] bg-card px-5 text-[13.5px] font-medium text-[#D5D5DC] transition-colors hover:bg-white/[0.05]"
          >
            Export JSON
          </button>
        </div>
      </div>

      <section className="card mt-7 overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 border-b border-white/[0.06] p-6">
          <div className="flex gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`pill ${filter === item.key ? 'pill-active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex h-11 w-full max-w-[320px] items-center gap-2 rounded-full border border-white/[0.08] bg-[#101012] px-4">
            <Search size={17} className="text-faint" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search note or category..."
              className="min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-faint"
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <p className="text-[15px] font-medium">No transactions found</p>
            <p className="mt-1 text-[13px] text-muted">
              Add one from the mobile app to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[1.3px] text-faint">
                  <th className="px-6 py-4 font-medium">Date &amp; Time</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Note</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-white/[0.04] text-[14px] transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-muted">
                      {formatDateTime(transaction.date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[transaction.category] }}
                        />
                        {transaction.category}
                      </span>
                    </td>
                    <td className="max-w-[320px] truncate px-6 py-4 text-[#D5D5DC]">
                      {transaction.note || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="rounded-full px-3 py-1 text-[12px] font-medium capitalize"
                        style={{
                          color: TONE_COLORS[transaction.type],
                          backgroundColor: `${TONE_COLORS[transaction.type]}1A`,
                        }}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td
                      className="whitespace-nowrap px-6 py-4 text-right font-semibold"
                      style={{ color: TONE_COLORS[transaction.type] }}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatMoney(toAmount(transaction.amount), currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4 text-[13px] text-muted">
          <span>
            Showing {rows.length} of {transactions.length} transactions
          </span>
          <span>Synced live from Supabase</span>
        </div>
      </section>
    </div>
  );
}
