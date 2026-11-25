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
import { Bell, Plus, Search, User, X } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Sparkline } from '@/components/Sparkline';
import { MetalFill } from '@/components/ui/MetalFill';
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

const BAR_COLORS = ['#7C5CFF', '#FF5F5F', '#FFB020'];

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
  const [query, setQuery] = useState('');

  const bars = categoryBreakdown.slice(0, 3);
  const maxShare = bars.length > 0 ? bars[0].share : 1;

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
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityLabel="Open settings"
            onPress={() => router.push('/setting')}
            className="h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-full border border-white/[0.06] bg-[#1C1C1F]"
          >
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={{ width: 46, height: 46 }} />
            ) : profile.name ? (
              <Text className="text-[15px] font-semibold text-ink">
                {initialsOf(profile.name)}
              </Text>
            ) : (
              <User size={19} color="#9A9AA2" strokeWidth={1.8} />
            )}
          </Pressable>

          <View className="h-11 flex-1 flex-row items-center rounded-full border border-white/[0.08] bg-white/[0.05] px-4">
            <Search size={18} color="#77777F" strokeWidth={1.9} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor="#77777F"
              className="ml-3 flex-1 text-[15px] text-ink"
              returnKeyType="search"
              selectionColor="#7C5CFF"
            />
            {query.length > 0 ? (
              <Pressable accessibilityLabel="Clear search" hitSlop={8} onPress={() => setQuery('')}>
                <X size={16} color="#8E8E96" />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            accessibilityLabel="Notifications"
            hitSlop={6}
            onPress={openNotifications}
            className="h-[46px] w-[46px] items-center justify-center"
          >
            <Bell size={22} color="#FAFAFA" strokeWidth={1.7} />
            {debts.some((debt) => debt.status === 'unpaid') ? (
              <View className="absolute right-3 top-3 h-2 w-2 rounded-full bg-amber" />
            ) : null}
          </Pressable>
        </View>

        <Pressable
          onPress={() => setQuickInputOpen(true)}
          className="relative mt-6 overflow-hidden rounded-bento border border-white/[0.1] p-5"
          style={({ pressed }) => (pressed ? { opacity: 0.94 } : null)}
        >
          <MetalFill />
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[14.5px] text-muted">Total Balance</Text>
              <Text className="mt-2 text-[16px] font-medium text-[#D5D5DC]">
                {profile.name || 'Your account'}
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                className="mt-1.5 text-[42px] font-bold tracking-tight text-ink"
              >
                {totalBalance < 0 ? '-' : ''}
                {formatMoney(totalBalance, currency)}
              </Text>
              <Text className="mt-2 text-[13.5px] text-faint">Personal account</Text>
            </View>

            <View className="h-11 w-11 items-center justify-center rounded-full border border-white/[0.1]">
              <Plus size={20} color="#FAFAFA" strokeWidth={1.9} />
            </View>
          </View>

          <View className="absolute bottom-5 right-5 flex-row">
            <View className="h-[26px] w-[26px] rounded-full bg-coral" />
            <View className="-ml-2.5 h-[26px] w-[26px] rounded-full bg-amber" />
          </View>
        </Pressable>

        {query.trim().length > 0 ? (
          <View className="mt-6">
            <Text className="mb-3 text-[12px] font-medium uppercase tracking-[1.5px] text-faint">
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
            <View className="mt-4 flex-row gap-3">
              <View className="relative flex-1 overflow-hidden rounded-bento border border-white/[0.1] p-4">
                <MetalFill />
                <Text className="text-[18px] font-semibold text-ink">Spending</Text>
                <Text className="mt-1 text-[12.5px] text-muted">Spent this month</Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="mt-2.5 text-[21px] font-bold tracking-tight text-ink"
                >
                  {formatMoney(monthlyExpense, currency)}
                </Text>

                <View className="mt-4 gap-2">
                  {bars.length > 0 ? (
                    bars.map((bar, index) => (
                      <View
                        key={bar.category}
                        className="h-[7px] overflow-hidden rounded-full bg-[#26262A]"
                      >
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${20 + (bar.share / maxShare) * 70}%`,
                            backgroundColor: BAR_COLORS[index],
                          }}
                        />
                      </View>
                    ))
                  ) : (
                    <>
                      <View className="h-[7px] rounded-full bg-[#26262A]" />
                      <View className="h-[7px] rounded-full bg-[#26262A]" />
                      <View className="h-[7px] rounded-full bg-[#26262A]" />
                    </>
                  )}
                </View>
              </View>

              <View className="relative flex-1 overflow-hidden rounded-bento border border-white/[0.1] p-4">
                <MetalFill />
                <Text className="text-[18px] font-semibold text-ink">Income</Text>
                <Text className="mt-1 text-[12.5px] text-muted">This month</Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="mt-2.5 text-[21px] font-bold tracking-tight text-ink"
                >
                  {formatMoney(monthlyIncome, currency)}
                </Text>

                <View className="mt-4 flex-row flex-wrap gap-2">
                  {incomeCategories.length > 0 ? (
                    incomeCategories.map((category) => (
                      <View
                        key={category}
                        className="rounded-full border border-neon/40 bg-neon/15 px-3 py-1.5"
                      >
                        <Text className="text-[12.5px] font-medium text-[#B3A3FF]">
                          {category}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View className="rounded-full border border-white/10 px-3 py-1.5">
                      <Text className="text-[12.5px] text-muted">No income yet</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View className="relative mt-4 overflow-hidden rounded-bento border border-white/[0.1] p-5">
              <MetalFill />
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-[16px] font-semibold text-ink">Monthly Cashflow</Text>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    className="mt-2 text-[30px] font-bold tracking-tight text-ink"
                  >
                    {monthlyNet >= 0 ? '+' : '-'}
                    {formatMoney(monthlyNet, currency)}
                  </Text>
                  <Text className="mt-1 text-[12.5px] text-muted">Net this month</Text>

                  <Pressable
                    onPress={() => router.push('/history')}
                    className="mt-4 h-10 self-start justify-center rounded-full border border-white/[0.12] px-5"
                    style={({ pressed }) => (pressed ? { opacity: 0.8 } : null)}
                  >
                    <Text className="text-[13.5px] text-[#D5D5DC]">View report</Text>
                  </Pressable>
                </View>

                <View className="pt-8">
                  <Sparkline values={sparkValues} />
                </View>
              </View>
            </View>
          </>
        )}
      </Screen>

      <TransactionModal visible={quickInputOpen} onClose={() => setQuickInputOpen(false)} />
    </View>
  );
}
