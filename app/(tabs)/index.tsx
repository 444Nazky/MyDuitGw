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
import {
  Bell,
  LayoutGrid,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react-native';
import { AIAgentSheet } from '@/components/AIAgentSheet';
import { BalanceCard } from '@/components/BalanceCard';
import { CashflowHeatmap } from '@/components/CashflowHeatmap';
import { Screen } from '@/components/Screen';
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

// Spending card bars: one row per top category, filled against a dark track.
const SPEND_BAR_COLORS = ['#7C5CFF', '#FF5F5F', '#FFB020'];

export default function HomeScreen() {
  const router = useRouter();
  const {
    profile,
    currency,
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

  const bars = categoryBreakdown.slice(0, SPEND_BAR_COLORS.length);
  const topShare = bars[0]?.share ?? 0;

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
      <Screen horizontalPadding={16}>
        <View style={{ gap: 12 }}>
          {/* Header: avatar, search pill, AI sparkle, bell */}
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <Pressable
              accessibilityLabel="Open settings"
              onPress={() => router.push('/setting')}
              className="h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#1E293B]"
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

            <View
              className="h-9 flex-1 flex-row items-center rounded-full bg-[#161616] px-3.5"
              style={{ gap: 8 }}
            >
              <Search size={14} color="#6B7280" strokeWidth={2.2} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search"
                placeholderTextColor="#6B7280"
                className="flex-1 text-[13px] text-ink"
                style={{ paddingVertical: 0 }}
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
              className="h-9 w-9 items-center justify-center rounded-full bg-[#161616]"
              style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
            >
              <Sparkles size={16} color="#8B5CF6" strokeWidth={2} />
            </Pressable>

            <Pressable
              accessibilityLabel="Notifications"
              hitSlop={6}
              onPress={openNotifications}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#161616]"
              style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
            >
              <Bell size={16} color="#FFFFFF" strokeWidth={1.9} />
              {debts.some((debt) => debt.status === 'unpaid') ? (
                <View className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
              ) : null}
            </Pressable>
          </View>

          {query.trim().length > 0 ? (
            <View className="mt-1">
              <Text className="mb-3 text-[11.5px] font-medium uppercase tracking-[1.6px] text-faint">
                {results.length > 0
                  ? `${results.length} result${results.length > 1 ? 's' : ''}`
                  : 'No results'}
              </Text>
              <View style={{ gap: 10 }}>
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
              <BalanceCard onAdd={() => setQuickInputOpen(true)} />

              {/* Spending & Income */}
              <View className="flex-row" style={{ gap: 12 }}>
                <Pressable
                  onPress={() => router.push('/history')}
                  className="flex-1 justify-between rounded-bento bg-[#141414] p-4"
                  style={({ pressed }) => ({ minHeight: 168, opacity: pressed ? 0.9 : 1 })}
                >
                  <View>
                    <Text className="text-[17px] font-bold text-white">Spending</Text>
                    <Text className="mt-1 text-[12px] text-[#8A8A8A]">Spent this month</Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      className="mt-3 text-[24px] font-bold tracking-tight text-white"
                    >
                      {spendLabel}
                    </Text>
                  </View>

                  <View className="mt-4" style={{ gap: 9 }}>
                    {SPEND_BAR_COLORS.map((color, index) => {
                      const bar = bars[index];
                      // The top category fills the track; the rest are relative to it.
                      const width = bar && topShare > 0 ? Math.max(bar.share / topShare, 0.12) : 0;

                      return (
                        <View
                          key={`spend-bar-${color}`}
                          className="h-[13px] overflow-hidden rounded-full bg-[#242424]"
                        >
                          <View
                            className="h-full rounded-full"
                            style={{ width: `${width * 100}%`, backgroundColor: color }}
                          />
                        </View>
                      );
                    })}
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/history')}
                  className="flex-1 justify-between rounded-bento bg-[#141414] p-4"
                  style={({ pressed }) => ({ minHeight: 168, opacity: pressed ? 0.9 : 1 })}
                >
                  <View>
                    <Text className="text-[17px] font-bold text-white">Income</Text>
                    <Text className="mt-1 text-[12px] text-[#8A8A8A]">This month</Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      className="mt-3 text-[24px] font-bold tracking-tight text-white"
                    >
                      {formatMoney(monthlyIncome, currency)}
                    </Text>
                  </View>

                  <View className="mt-4 flex-row flex-wrap" style={{ gap: 8 }}>
                    {incomeCategories.length > 0 ? (
                      incomeCategories.map((category, index) => {
                        // The two strongest sources get the violet treatment.
                        const highlighted = index < 2;

                        return (
                          <View
                            key={category}
                            className={`rounded-full border px-3 py-1.5 ${
                              highlighted
                                ? 'border-[#7C3AED] bg-[#201536]'
                                : 'border-white/[0.07] bg-[#1C1C1C]'
                            }`}
                          >
                            <Text
                              className={`text-[12px] font-medium ${
                                highlighted ? 'text-[#C4B5FD]' : 'text-[#9CA3AF]'
                              }`}
                            >
                              {category}
                            </Text>
                          </View>
                        );
                      })
                    ) : (
                      <View className="rounded-full border border-white/[0.07] bg-[#1C1C1C] px-3 py-1.5">
                        <Text className="text-[12px] font-medium text-[#9CA3AF]">No income yet</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </View>

              {/* Quick actions */}
              <View className="flex-row" style={{ gap: 12, height: 92 }}>
                <View className="justify-between" style={{ width: 42 }}>
                  <Pressable
                    accessibilityLabel="Ask myduitgw AI"
                    onPress={() => setAiOpen(true)}
                    className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#141414]"
                    style={({ pressed }) => (pressed ? { opacity: 0.75 } : null)}
                  >
                    <Sparkles size={17} color="#8B5CF6" strokeWidth={2} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Add transaction"
                    onPress={() => setQuickInputOpen(true)}
                    className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#141414]"
                    style={({ pressed }) => (pressed ? { opacity: 0.75 } : null)}
                  >
                    <Plus size={18} color="#FFFFFF" strokeWidth={2} />
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => setAiOpen(true)}
                  className="flex-1 justify-between rounded-[20px] bg-[#141414] p-3.5"
                  style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
                >
                  <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-accent-soft">
                    <MessageSquare size={16} color="#8B5CF6" strokeWidth={2} />
                  </View>
                  <Text className="text-[13px] font-semibold text-white">AI Insights</Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/debt')}
                  className="flex-1 justify-between rounded-[20px] bg-[#141414] p-3.5"
                  style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
                >
                  <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-accent-soft">
                    <LayoutGrid size={16} color="#8B5CF6" strokeWidth={2} />
                  </View>
                  <Text className="text-[13px] font-semibold text-white">Debt Tracker</Text>
                </Pressable>
              </View>

              {/* Monthly cashflow */}
              <View
                className="rounded-bento bg-[#141414]"
                style={{ gap: 10, paddingVertical: 16, paddingHorizontal: 18 }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-[15px] font-semibold text-white">Monthly Cashflow</Text>
                  <Text className="text-[12px] text-[#777777]">Net this month</Text>
                </View>

                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="text-[23px] font-bold tracking-tight text-white"
                >
                  {monthlyNet >= 0 ? '+' : '-'}
                  {formatMoney(monthlyNet, currency)}
                </Text>

                <CashflowHeatmap transactions={transactions} />
              </View>
            </>
          )}
        </View>
      </Screen>

      <TransactionModal visible={quickInputOpen} onClose={() => setQuickInputOpen(false)} />
      <AIAgentSheet visible={aiOpen} onClose={() => setAiOpen(false)} />
    </View>
  );
}
