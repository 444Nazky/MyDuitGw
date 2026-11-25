import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, MessageSquare, Plus, Search, Sparkles, User, X } from 'lucide-react-native';
import { AIAgentSheet } from '@/components/AIAgentSheet';
import { BalanceCard } from '@/components/BalanceCard';
import { Screen } from '@/components/Screen';
import { Sparkline } from '@/components/Sparkline';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionRow } from '@/components/TransactionRow';
import { useFinance } from '@/context/FinanceContext';
import {
  formatClockTime,
  formatMoney,
  formatShortDate,
  initialsOf,
  isCurrentMonth,
} from '@/lib/format';

const SEGMENT_COLORS = ['#737373', '#525252', '#3F3F46', '#2E2E2E'];

export default function HomeScreen() {
  const router = useRouter();
  const {
    profile,
    currency,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlyNet,
    categoryBreakdown,
    transactions,
    debts,
  } = useFinance();
  const [quickInputOpen, setQuickInputOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [query, setQuery] = useState('');

  const bars = categoryBreakdown.slice(0, 4);

  const segments = useMemo(() => {
    if (bars.length === 0) {
      return [36, 18, 10, 13].map((flex, index) => ({
        flex,
        color: SEGMENT_COLORS[index],
      }));
    }
    return bars.map((bar, index) => ({
      flex: Math.max(Math.round(bar.share * 100), 8),
      color: SEGMENT_COLORS[index] ?? SEGMENT_COLORS[SEGMENT_COLORS.length - 1],
    }));
  }, [bars]);

  const incomeCategories = useMemo(() => {
    const totals = new Map<string, number>();
    for (const transaction of transactions) {
      if (transaction.type !== 'income') continue;
      if (!isCurrentMonth(new Date(transaction.date))) continue;
      totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
    }
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }, [transactions]);

  const sparkValues = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daily = new Array<number>(daysInMonth).fill(0);

    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      if (!isCurrentMonth(date)) continue;
      const index = date.getDate() - 1;
      daily[index] += transaction.type === 'income' ? transaction.amount : -transaction.amount;
    }

    let running = 0;
    return daily.slice(0, now.getDate()).map((value) => (running += value));
  }, [transactions]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const matchedTransactions = transactions
      .filter((transaction) => {
        const haystack = `${transaction.note ?? ''} ${transaction.category}`.toLowerCase();
        return haystack.includes(needle);
      })
      .map((transaction) => ({
        key: transaction.id,
        title: transaction.note || transaction.category,
        subtitle: `${formatShortDate(transaction.date)} · ${formatClockTime(transaction.date)}`,
        amount: transaction.amount,
        tone: transaction.type,
        category: transaction.category,
      }));

    const matchedDebts = debts
      .filter((debt) =>
        `${debt.borrowerName} ${debt.reason}`.toLowerCase().includes(needle),
      )
      .map((debt) => ({
        key: debt.id,
        title: `Lent to ${debt.borrowerName}`,
        subtitle: `${formatShortDate(debt.loanDate)} · ${debt.status === 'paid' ? 'Paid' : 'Unpaid'}`,
        amount: debt.amount,
        tone: 'debt' as const,
        category: undefined,
      }));

    return [...matchedTransactions, ...matchedDebts].slice(0, 6);
  }, [query, transactions, debts]);

  const spendLabel =
    currency === 'IDR'
      ? `-${formatMoney(monthlyExpense, currency).replace('Rp ', 'Rp. ')}`
      : `-${formatMoney(monthlyExpense, currency)}`;

  const openNotifications = () => {
    const unpaid = debts.filter((debt) => debt.status === 'unpaid');
    const loanLine = unpaid.length
      ? `${unpaid.length} unpaid loan${unpaid.length === 1 ? '' : 's'}: ${
          unpaid[0].borrowerName
        }${unpaid.length > 1 ? ' and others' : ''}.`
      : 'No unpaid loans.';
    const flowLine =
      monthlyNet >= 0
        ? `You are up ${formatMoney(monthlyNet, currency)} this month.`
        : `You are down ${formatMoney(monthlyNet, currency)} this month.`;
    const topCategory = categoryBreakdown[0];
    const spendLine = topCategory
      ? `Most spent this month: ${topCategory.category} (${Math.round(topCategory.share * 100)}%).`
      : 'No spending recorded this month.';
    Alert.alert('Notifications', [loanLine, flowLine, spendLine].join('\n'));
  };

  return (
    <View className="flex-1">
      <Screen>
        <View className="flex-row items-center gap-2.5 pt-1">
          <Pressable
            accessibilityLabel="Open settings"
            onPress={() => router.push('/setting')}
            className="h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#1C1C1C]"
          >
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={{ width: 36, height: 36 }} />
            ) : profile.name ? (
              <Text className="text-[12.5px] font-semibold text-ink">
                {initialsOf(profile.name)}
              </Text>
            ) : (
              <User size={17} color="#9A9A9A" strokeWidth={1.8} />
            )}
          </Pressable>

          <View className="h-9 flex-1 flex-row items-center rounded-full bg-[#181818] px-3.5">
            <Search size={15} color="#777777" strokeWidth={2.1} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor="#666666"
              className="ml-2 flex-1 text-[13px] text-ink"
              returnKeyType="search"
              selectionColor="#8B5CF6"
            />
            {query.length > 0 ? (
              <Pressable accessibilityLabel="Clear search" hitSlop={8} onPress={() => setQuery('')}>
                <X size={14} color="#8A8A8A" />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            accessibilityLabel="Open myduitgw AI"
            hitSlop={6}
            onPress={() => setAiOpen(true)}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#181818]"
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
          >
            <Sparkles size={17} color="#8B5CF6" strokeWidth={1.9} />
          </Pressable>

          <Pressable
            accessibilityLabel="Notifications"
            hitSlop={6}
            onPress={openNotifications}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#181818]"
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
          >
            <Bell size={16} color="#FFFFFF" strokeWidth={1.9} />
            {debts.some((debt) => debt.status === 'unpaid') ? (
              <View className="absolute right-2 top-2 h-[6px] w-[6px] rounded-full bg-accent" />
            ) : null}
          </Pressable>
        </View>

        <View className="mt-5">
          <BalanceCard onAdd={() => setQuickInputOpen(true)} />
        </View>

        {query.trim().length > 0 ? (
          <View className="mt-6">
            <Text className="mb-3 text-[11.5px] font-medium uppercase tracking-[1.6px] text-faint">
              {results.length > 0 ? `${results.length} result${results.length > 1 ? 's' : ''}` : 'No results'}
            </Text>
            <View className="gap-2.5">
              {results.map((item) => (
                <TransactionRow
                  key={item.key}
                  title={item.title}
                  subtitle={item.subtitle}
                  amount={item.amount}
                  tone={item.tone}
                  category={item.category}
                />
              ))}
            </View>
            {results.length === 0 ? (
              <Text className="mt-2 text-[14px] text-muted">
                Try a category, a note, or a borrower name.
              </Text>
            ) : null}
          </View>
        ) : (
          <>
            <View className="mt-3.5 flex-row gap-3">
              <Pressable
                onPress={() => router.push('/history')}
                className="flex-1 rounded-bento bg-card p-4"
                style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
              >
                <Text className="text-[14px] font-semibold text-white">Spending</Text>
                <Text className="mt-0.5 text-[11.5px] text-[#777777]">Spent this month</Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="mt-2 text-[17px] font-bold tracking-tight text-negative"
                >
                  {spendLabel}
                </Text>

                <View className="mt-3 flex-row items-center gap-1.5">
                  {segments.map((segment, index) => (
                    <View
                      key={`segment-${index}`}
                      style={{
                        flex: segment.flex,
                        height: 14,
                        borderRadius: 999,
                        backgroundColor: segment.color,
                      }}
                    />
                  ))}
                </View>
              </Pressable>

              <Pressable
                onPress={() => router.push('/history')}
                className="flex-1 rounded-bento bg-card p-4"
                style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
              >
                <Text className="text-[14px] font-semibold text-white">Income</Text>
                <Text className="mt-0.5 text-[11.5px] text-[#777777]">This month</Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="mt-2 text-[17px] font-bold tracking-tight text-white"
                >
                  {formatMoney(monthlyIncome, currency)}
                </Text>

                <View className="mt-3 flex-row flex-wrap gap-1.5">
                  {incomeCategories.length > 0 ? (
                    incomeCategories.map((category) => (
                      <View key={category} className="rounded-full bg-white/10 px-2.5 py-1">
                        <Text className="text-[11px] font-semibold text-white">{category}</Text>
                      </View>
                    ))
                  ) : (
                    <View className="rounded-full bg-white/10 px-2.5 py-1">
                      <Text className="text-[11px] text-[#999999]">No income yet</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>

            <View className="mt-3 flex-row items-stretch gap-3">
              <View className="gap-2.5">
                <Pressable
                  accessibilityLabel="Ask myduitgw AI"
                  onPress={() => setAiOpen(true)}
                  className="h-11 w-11 items-center justify-center rounded-[15px] bg-card"
                  style={({ pressed }) => (pressed ? { opacity: 0.75 } : null)}
                >
                  <Sparkles size={17} color="#8B5CF6" strokeWidth={2} />
                </Pressable>
                <Pressable
                  accessibilityLabel="Add transaction"
                  onPress={() => setQuickInputOpen(true)}
                  className="h-11 w-11 items-center justify-center rounded-[15px] bg-card"
                  style={({ pressed }) => (pressed ? { opacity: 0.75 } : null)}
                >
                  <Plus size={18} color="#FFFFFF" strokeWidth={2} />
                </Pressable>
              </View>

              <View className="flex-1 flex-row gap-3">
                <Pressable
                  onPress={() => setAiOpen(true)}
                  className="flex-1 justify-between rounded-bento bg-card p-3.5"
                  style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
                >
                  <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent-soft">
                    <MessageSquare size={16} color="#8B5CF6" strokeWidth={2} />
                  </View>
                  <Text className="mt-2 text-[12.5px] font-semibold text-white">AI Insights</Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/debt')}
                  className="flex-1 justify-between rounded-bento bg-card p-3.5"
                  style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
                >
                  <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent-soft">
                    <Sparkles size={16} color="#8B5CF6" strokeWidth={2} />
                  </View>
                  <Text className="mt-2 text-[12.5px] font-semibold text-white">Debt Tracker</Text>
                </Pressable>
              </View>
            </View>

            <View className="mt-3 flex-row items-center justify-between rounded-bento bg-card p-[18px]">
              <View className="flex-1 pr-3">
                <Text className="text-[14px] font-semibold text-white">Monthly Cashflow</Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="mt-1 text-[21px] font-bold tracking-tight text-white"
                >
                  {monthlyNet >= 0 ? '+' : '-'}
                  {formatMoney(monthlyNet, currency)}
                </Text>
                <Text className="mt-0.5 text-[11.5px] text-[#777777]">Net this month</Text>

                <Pressable
                  onPress={() => router.push('/history')}
                  className="mt-3 h-8 self-start justify-center rounded-full bg-[#242424] px-3.5"
                  style={({ pressed }) => (pressed ? { opacity: 0.8 } : null)}
                >
                  <Text className="text-[11.5px] font-medium text-white">View report</Text>
                </Pressable>
              </View>

              <View className="shrink-0">
                <Sparkline values={sparkValues} />
              </View>
            </View>
          </>
        )}
      </Screen>

      <TransactionModal visible={quickInputOpen} onClose={() => setQuickInputOpen(false)} />
      <AIAgentSheet visible={aiOpen} onClose={() => setAiOpen(false)} />
    </View>
  );
}
