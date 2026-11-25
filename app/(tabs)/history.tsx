import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowUpDown } from 'lucide-react-native';
import { DebtDetailModal } from '@/components/DebtDetailModal';
import { Screen } from '@/components/Screen';
import { MetalFill } from '@/components/ui/MetalFill';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionRow } from '@/components/TransactionRow';
import { useFinance } from '@/context/FinanceContext';
import {
  formatClockTime,
  formatLongDate,
  isToday,
  isYesterday,
} from '@/lib/format';
import type { Debt, TransactionCategory } from '@/types/finance';

type Filter = 'all' | 'income' | 'expense' | 'debt';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
  { key: 'debt', label: 'Debt List' },
];

interface HistoryItem {
  key: string;
  title: string;
  subtitle: string;
  amount: number;
  tone: 'income' | 'expense' | 'debt';
  category?: TransactionCategory;
  date: string;
  createdAt: string;
  debt?: Debt;
}

export default function HistoryScreen() {
  const { transactions, debts } = useFinance();
  const [filter, setFilter] = useState<Filter>('all');
  const [newestFirst, setNewestFirst] = useState(true);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const selectedDebt = selectedDebtId
    ? debts.find((debt) => debt.id === selectedDebtId) ?? null
    : null;

  const selectedTransaction = selectedTransactionId
    ? transactions.find((transaction) => transaction.id === selectedTransactionId) ?? null
    : null;

  const groups = useMemo(() => {
    const transactionItems: HistoryItem[] = transactions.map((transaction) => ({
      key: transaction.id,
      title: transaction.note?.trim() ? transaction.note : transaction.category,
      subtitle: formatClockTime(transaction.date),
      amount: transaction.amount,
      tone: transaction.type,
      category: transaction.category,
      date: transaction.date,
      createdAt: transaction.createdAt ?? '',
    }));

    const debtItems: HistoryItem[] = debts.map((debt) => ({
      key: debt.id,
      title: `Lent to ${debt.borrowerName}`,
      subtitle: formatClockTime(debt.loanDate),
      amount: debt.amount,
      tone: 'debt',
      date: debt.loanDate,
      createdAt: '',
      debt,
    }));

    let items: HistoryItem[];
    if (filter === 'income') {
      items = transactionItems.filter((item) => item.tone === 'income');
    } else if (filter === 'expense') {
      items = transactionItems.filter((item) => item.tone === 'expense');
    } else if (filter === 'debt') {
      items = debtItems;
    } else {
      items = [...transactionItems, ...debtItems];
    }

    items.sort((a, b) => {
      const delta = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (delta !== 0) return newestFirst ? delta : -delta;
      // Same timestamp (entries saved on the same day): the row created last
      // still belongs on top, so fall back to the creation time.
      const tie = b.createdAt.localeCompare(a.createdAt);
      return newestFirst ? tie : -tie;
    });

    // One group per calendar day. Today and Yesterday keep their names, older
    // days show their own date instead of a shared "Earlier" bucket.
    const buckets: { key: string; label: string; items: HistoryItem[] }[] = [];
    for (const item of items) {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const label = isToday(date)
        ? 'Today'
        : isYesterday(date)
          ? 'Yesterday'
          : formatLongDate(item.date);
      const last = buckets[buckets.length - 1];
      if (last && last.key === key) {
        last.items.push(item);
      } else {
        buckets.push({ key, label, items: [item] });
      }
    }
    return buckets;
  }, [transactions, debts, filter, newestFirst]);

  return (
    <View className="flex-1">
      <Screen>
        <View className="flex-row items-center justify-between">
          <Text className="text-[30px] font-bold tracking-tight text-ink">
            Transaction History
          </Text>
          <Pressable
            accessibilityLabel="Toggle sort order"
            hitSlop={8}
            onPress={() => setNewestFirst((value) => !value)}
            className="h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05]"
          >
            <ArrowUpDown size={18} color={newestFirst ? '#FAFAFA' : '#8E8E96'} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingRight: 8 }}
          className="mt-5"
        >
          {FILTERS.map((option) => {
            const active = filter === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setFilter(option.key)}
                className={`h-[46px] justify-center rounded-full border px-5 ${
                  active
                    ? 'border-white bg-white'
                    : 'border-white/[0.08] bg-white/[0.05]'
                }`}
              >
                <Text
                  className={`text-[14.5px] ${
                    active ? 'font-semibold text-black' : 'font-medium text-[#B9B9C2]'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {groups.length === 0 ? (
          <View className="relative mt-10 items-center overflow-hidden rounded-bento border border-white/[0.1] px-6 py-12">
            <MetalFill />
            <Text className="text-[15.5px] font-medium text-ink">Nothing here yet</Text>
            <Text className="mt-1.5 text-center text-[13.5px] text-muted">
              Add a transaction from Home to start building your history.
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.key} className="mt-6">
              <Text className="mb-3 text-[12px] font-medium uppercase tracking-[1.5px] text-faint">
                {group.label}
              </Text>
              <View className="gap-2.5">
                {group.items.map((item) => (
                  <TransactionRow
                    key={`${group.key}-${item.key}`}
                    title={item.title}
                    subtitle={item.subtitle}
                    amount={item.amount}
                    tone={item.tone}
                    category={item.category}
                    onPress={
                      item.debt
                        ? () => setSelectedDebtId(item.debt!.id)
                        : () => setSelectedTransactionId(item.key)
                    }
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </Screen>

      <DebtDetailModal debt={selectedDebt} onClose={() => setSelectedDebtId(null)} />
      <TransactionModal
        visible={selectedTransaction !== null}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransactionId(null)}
      />
    </View>
  );
}
