import {
  formatClockTime,
  monthKey,
  monthLabel,
  percentChange,
  toAmount,
} from './format';
import type { CashflowPoint } from '../components/Charts';
import type { DebtRow, TransactionCategory, TransactionRow } from './types';

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  tone: 'income' | 'expense' | 'debt';
  date: string;
  category?: TransactionCategory;
}

export interface CategorySpend {
  category: TransactionCategory;
  amount: number;
  share: number;
}

export function currentMonthKey(): string {
  return monthKey(new Date().toISOString());
}

export function prevMonthKey(): string {
  const now = new Date();
  return monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString());
}

export function computeStats(transactions: TransactionRow[], debts: DebtRow[]) {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + toAmount(transaction.amount), 0);
  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + toAmount(transaction.amount), 0);

  const thisMonth = currentMonthKey();
  const lastMonth = prevMonthKey();

  let monthIncome = 0;
  let monthExpense = 0;
  let prevIncome = 0;
  let prevExpense = 0;
  const spendByCategory = new Map<TransactionCategory, number>();

  for (const transaction of transactions) {
    const amount = toAmount(transaction.amount);
    const key = monthKey(transaction.date);
    if (key === thisMonth) {
      if (transaction.type === 'income') monthIncome += amount;
      else {
        monthExpense += amount;
        spendByCategory.set(
          transaction.category,
          (spendByCategory.get(transaction.category) ?? 0) + amount,
        );
      }
    } else if (key === lastMonth) {
      if (transaction.type === 'income') prevIncome += amount;
      else prevExpense += amount;
    }
  }

  const categorySpend: CategorySpend[] = Array.from(spendByCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      share: monthExpense > 0 ? amount / monthExpense : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const now = new Date();
  const cashflow: CashflowPoint[] = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = monthKey(date.toISOString());
    let income = 0;
    let expense = 0;
    let debt = 0;
    for (const transaction of transactions) {
      if (monthKey(transaction.date) !== key) continue;
      if (transaction.type === 'income') income += toAmount(transaction.amount);
      else expense += toAmount(transaction.amount);
    }
    for (const item of debts) {
      if (item.status === 'paid' && monthKey(item.updated_at) === key) {
        debt += toAmount(item.amount);
      }
    }
    return { label: monthLabel(date), income, expense, debt };
  });

  const unpaidDebts = debts.filter((debt) => debt.status === 'unpaid');
  const paidDebts = debts.filter((debt) => debt.status === 'paid');
  const totalLent = debts.reduce((sum, debt) => sum + toAmount(debt.amount), 0);
  const outstanding = unpaidDebts.reduce((sum, debt) => sum + toAmount(debt.amount), 0);
  const settled = paidDebts.reduce((sum, debt) => sum + toAmount(debt.amount), 0);

  const recentBorrowers = [...unpaidDebts]
    .sort((a, b) => new Date(b.loan_date).getTime() - new Date(a.loan_date).getTime())
    .slice(0, 3);

  const transactionItems: ActivityItem[] = transactions.map((transaction) => ({
    id: transaction.id,
    title: transaction.note?.trim() || transaction.category,
    subtitle: formatClockTime(transaction.date),
    amount: toAmount(transaction.amount),
    tone: transaction.type,
    date: transaction.date,
    category: transaction.category,
  }));

  const debtItems: ActivityItem[] = debts.map((debt) => ({
    id: debt.id,
    title: `Lent to ${debt.borrower_name}`,
    subtitle: formatClockTime(debt.loan_date),
    amount: toAmount(debt.amount),
    tone: 'debt',
    date: debt.loan_date,
  }));

  const activity = [...transactionItems, ...debtItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const latestReceipt =
    [...debts]
      .filter((debt) => Boolean(debt.receipt_path))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0] ??
    null;

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    monthIncome,
    monthExpense,
    incomeChange: percentChange(monthIncome, prevIncome),
    expenseChange: percentChange(monthExpense, prevExpense),
    categorySpend,
    cashflow,
    totalLent,
    outstanding,
    settled,
    activeDebtCount: unpaidDebts.length,
    settledDebtCount: paidDebts.length,
    recentBorrowers,
    activity,
    latestReceipt,
  };
}
