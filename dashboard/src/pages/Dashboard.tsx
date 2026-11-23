import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Download, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../data/DataProvider';
import { Avatar } from '../components/Avatar';
import { CashflowChart, Donut, MiniBars } from '../components/Charts';
import { ReceiptModal } from '../components/ReceiptModal';
import { exportCsv, exportJson, receiptFileName } from '../lib/export';
import { formatMoney, formatShortDate } from '../lib/format';
import { CATEGORY_COLORS, TONE_COLORS } from '../lib/colors';
import type { Page } from '../lib/nav';
import { computeStats, type ActivityItem } from '../lib/stats';
import type { DebtRow } from '../lib/types';

type HistoryFilter = 'all' | 'income' | 'expense' | 'debt';

const HISTORY_FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
  { key: 'debt', label: 'Debt' },
];

export function DashboardPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { profile } = useAuth();
  const { transactions, debts, profiles, realtimeStatus, receiptUrl } = useData();
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [selectedDebt, setSelectedDebt] = useState<DebtRow | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const stats = useMemo(() => computeStats(transactions, debts), [transactions, debts]);
  const currency = profile?.currency ?? 'USD';
  const money = (amount: number) => formatMoney(amount, currency);

  const visibleActivity = useMemo(
    () =>
      historyFilter === 'all'
        ? stats.activity
        : stats.activity.filter((item) => item.tone === historyFilter),
    [historyFilter, stats.activity],
  );

  const latestPath = stats.latestReceipt?.receipt_path ?? null;
  useEffect(() => {
    let active = true;
    if (!latestPath) {
      setReceiptPreview(null);
      return;
    }
    void receiptUrl(latestPath).then((url) => {
      if (active) setReceiptPreview(url);
    });
    return () => {
      active = false;
    };
  }, [latestPath, receiptUrl]);

  return (
    <div className="mx-auto max-w-[1920px] px-8 py-7">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col gap-6">
          <StatCard
            label="Total Income"
            value={money(stats.totalIncome)}
            change={stats.incomeChange}
          />
          <StatCard
            label="Total Expense"
            value={money(stats.totalExpense)}
            change={stats.expenseChange}
          />

          <section className="card p-6">
            <p className="text-[15px] text-muted">Top Spending</p>
            <div className="relative mx-auto mt-2 w-[180px]">
              <Donut
                segments={stats.categorySpend.map((entry) => ({
                  color: CATEGORY_COLORS[entry.category],
                  value: entry.amount,
                }))}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-bold tracking-tight">
                  {money(stats.monthExpense)}
                </span>
                <span className="mt-0.5 text-center text-[11px] text-muted">
                  Total spent
                  <br />
                  this month
                </span>
              </div>
            </div>
            {stats.categorySpend.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {stats.categorySpend.slice(0, 4).map((entry) => (
                  <li key={entry.category} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5 text-[#D5D5DC]">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
                      />
                      {entry.category}
                    </span>
                    <span className="text-muted">{Math.round(entry.share * 100)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-center text-sm text-faint">No spending this month yet.</p>
            )}
          </section>

          <section className="card p-6">
            <p className="text-[15px] text-muted">Recent Borrowers</p>
            <div className="mt-5 flex items-end gap-5">
              {stats.recentBorrowers.map((debt) => (
                <div key={debt.id} className="flex flex-col items-center gap-1.5">
                  <Avatar name={debt.borrower_name} size={40} />
                  <span className="max-w-[64px] truncate text-[12px] text-[#D5D5DC]">
                    {debt.borrower_name.split(' ')[0]}
                  </span>
                  <span className="text-[12px] font-medium text-amber">
                    {money(Number(debt.amount))}
                  </span>
                </div>
              ))}
              <button
                onClick={() => onNavigate('debts')}
                className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:text-ink"
                aria-label="Manage debtors"
              >
                <Plus size={18} />
              </button>
            </div>
            <button
              onClick={() => onNavigate('debts')}
              className="mt-5 h-11 w-full rounded-full border border-white/[0.08] bg-white/[0.04] text-[14px] font-medium transition-colors hover:bg-white/[0.07]"
            >
              Manage debtors
            </button>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-[24px] bg-gradient-to-br from-[#DCE9FE] to-[#BFD6F7] p-7 text-black">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] text-black/60">Net Balance</p>
                <p className="mt-3 text-[46px] font-bold leading-none tracking-tight">
                  {money(stats.netBalance)}
                </p>
              </div>
              <button
                onClick={() => onNavigate('transactions')}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
                aria-label="View transactions"
              >
                <ArrowUpRight size={22} />
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/70 px-4 py-2 text-[13px] font-medium">
                {stats.incomeChange !== null && stats.incomeChange >= 0 ? '▲' : '▼'}{' '}
                {Math.abs(stats.incomeChange ?? 0).toFixed(1)}%
              </span>
              <span className="rounded-full bg-white/70 px-4 py-2 text-[13px] font-medium">
                +{money(stats.monthIncome - stats.monthExpense)}
              </span>
            </div>
            <div className="mt-3 flex justify-end">
              <MiniBars
                values={stats.cashflow.map((point) => point.income - point.expense)}
                color="#111111"
              />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <section className="card p-6">
              <div className="flex items-start justify-between">
                <p className="text-[15px] text-muted">Pending Debts</p>
                <button
                  onClick={() => onNavigate('debts')}
                  className="text-muted transition-colors hover:text-ink"
                  aria-label="View debts"
                >
                  <ArrowUpRight size={18} />
                </button>
              </div>
              <p className="mt-3 text-[29px] font-bold tracking-tight">
                {money(stats.outstanding)}{' '}
                <span className="text-[15px] font-normal text-faint">/ {money(stats.totalLent)}</span>
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-skybar"
                  style={{
                    width: `${stats.totalLent > 0 ? (stats.settled / stats.totalLent) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-[13px] text-muted">
                {stats.settledDebtCount} of{' '}
                {stats.activeDebtCount + stats.settledDebtCount} settled
              </p>
            </section>

            <section className="card p-6">
              <div className="flex items-start justify-between">
                <p className="text-[15px] text-muted">Supabase Status</p>
                <button
                  onClick={() => onNavigate('sync')}
                  className="text-muted transition-colors hover:text-ink"
                  aria-label="View sync monitor"
                >
                  <ArrowUpRight size={18} />
                </button>
              </div>
              <p className="mt-3 flex items-center gap-2 text-[14px] font-medium text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {realtimeStatus === 'subscribed' ? 'Live' : realtimeStatus}
              </p>
              <p className="mt-1 text-[27px] font-bold tracking-tight">
                {(transactions.length + debts.length + profiles.length).toLocaleString()} Records
              </p>
              <p className="mt-2 text-[12.5px] text-muted">
                eu-central-1 · Realtime {realtimeStatus === 'subscribed' ? 'on' : 'off'}
              </p>
            </section>
          </div>

          <section className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-semibold">Cashflow Overview</h3>
                <p className="mt-1 text-[13px] text-muted">Income, expense and repayments</p>
              </div>
              <span className="pill">6 months</span>
            </div>
            <div className="mt-7">
              <CashflowChart data={stats.cashflow} />
            </div>
            <div className="mt-5 flex justify-center gap-6 border-t border-white/[0.06] pt-4 text-[12.5px] text-muted">
              <Legend color="#A9C6F5" label="Income" />
              <Legend color="#5A5A63" label="Expense" />
              <Legend color="#7C5CFF" label="Debt Repayments" />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="card flex flex-col p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[17px] font-semibold">Transaction History</h3>
                <p className="mt-1 text-[13px] text-muted">Latest activity across all records</p>
              </div>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-muted transition-colors hover:text-ink"
                aria-label="View all activity"
              >
                <ArrowUpRight size={18} />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {HISTORY_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setHistoryFilter(filter.key)}
                  className={`pill !px-3.5 !py-1.5 !text-[12.5px] ${
                    historyFilter === filter.key ? 'pill-active' : ''
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-1 flex-col gap-1">
              {visibleActivity.length > 0 ? (
                visibleActivity.map((item) => (
                  <HistoryRow
                    key={`${item.tone}-${item.id}`}
                    item={item}
                    money={money}
                    onPress={
                      item.tone === 'debt'
                        ? () => setSelectedDebt(debts.find((debt) => debt.id === item.id) ?? null)
                        : undefined
                    }
                  />
                ))
              ) : (
                <p className="py-10 text-center text-sm text-faint">No activity in this filter.</p>
              )}
            </div>

            <button
              onClick={() => onNavigate('transactions')}
              className="mt-4 border-t border-white/[0.06] pt-4 text-[13px] text-muted transition-colors hover:text-ink"
            >
              View all activity
            </button>
          </section>

          <section className="rounded-[24px] border border-white/[0.06] bg-[#111A24] p-6">
            <p className="text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
              Latest Transfer Proof
            </p>
            {stats.latestReceipt ? (
              <>
                <p className="mt-3 text-[18px] font-semibold tracking-tight">
                  {receiptFileName(stats.latestReceipt.receipt_path)}
                </p>
                <p className="mt-1 text-[12.5px] text-muted">
                  {formatShortDate(stats.latestReceipt.updated_at)} · Supabase Storage
                </p>
                <button
                  onClick={() => setSelectedDebt(stats.latestReceipt)}
                  className="mt-4 flex h-[150px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20"
                >
                  {receiptPreview ? (
                    <img src={receiptPreview} alt="Latest receipt" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-sm text-muted">Loading receipt...</span>
                  )}
                </button>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => exportCsv(transactions, debts)}
                    className="h-11 flex-1 rounded-full bg-white px-5 text-[13.5px] font-semibold text-black transition-opacity hover:opacity-90"
                  >
                    Export CSV / JSON
                  </button>
                  <button
                    onClick={() => exportJson(transactions, debts)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:text-ink"
                    aria-label="Export JSON"
                  >
                    <Download size={17} />
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 flex h-[210px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center">
                <p className="text-sm text-muted">No transfer proof yet</p>
                <p className="mt-1 text-xs text-faint">Receipts uploaded from mobile appear here.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <ReceiptModal debt={selectedDebt} onClose={() => setSelectedDebt(null)} />
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: number | null;
}) {
  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <p className="text-[15px] text-muted">{label}</p>
        <ChangePill value={change} />
      </div>
      <p className="mt-4 text-[34px] font-bold leading-none tracking-tight">{value}</p>
    </section>
  );
}

function ChangePill({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[12px] text-muted">—</span>;
  }
  const positive = value >= 0;
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium ${
        positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-coral/15 text-coral'
      }`}
    >
      {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function HistoryRow({
  item,
  money,
  onPress,
}: {
  item: ActivityItem;
  money: (amount: number) => string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-semibold"
        style={{ backgroundColor: `${TONE_COLORS[item.tone]}22`, color: TONE_COLORS[item.tone] }}
      >
        {item.tone === 'income' ? '↑' : item.tone === 'expense' ? '↓' : 'Loan'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium text-ink">{item.title}</span>
        <span className="mt-0.5 block text-[12px] text-muted">
          {formatShortDate(item.date)} · {item.subtitle}
        </span>
      </span>
      <span
        className="shrink-0 text-[14px] font-semibold"
        style={{ color: TONE_COLORS[item.tone] }}
      >
        {item.tone === 'income' ? '+' : '-'}
        {money(item.amount)}
      </span>
    </>
  );

  if (onPress) {
    return (
      <button
        onClick={onPress}
        className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        {content}
      </button>
    );
  }
  return <div className="flex items-center gap-3 rounded-2xl px-2 py-2.5">{content}</div>;
}
