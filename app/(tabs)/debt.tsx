import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bookmark, Plus } from 'lucide-react-native';
import { AddDebtModal } from '@/components/AddDebtModal';
import { DebtDetailModal } from '@/components/DebtDetailModal';
import { Screen } from '@/components/Screen';
import { useFinance } from '@/context/FinanceContext';
import { formatMoney, formatShortDate, initialsOf } from '@/lib/format';

export default function DebtScreen() {
  const { debts, totalLentOut, activeDebtCount, settledDebtCount, currency } = useFinance();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortedDebts = useMemo(
    () =>
      [...debts].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'unpaid' ? -1 : 1;
        return new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime();
      }),
    [debts],
  );

  const selectedDebt = selectedId ? debts.find((debt) => debt.id === selectedId) ?? null : null;

  return (
    <View className="flex-1">
      <Screen>
        <View className="flex-row items-center justify-between">
          <Text className="text-[28px] font-bold tracking-tight text-ink">Debt List</Text>
          <Pressable
            onPress={() => setAddOpen(true)}
            className="h-11 flex-row items-center gap-1.5 rounded-full bg-white px-5"
            style={({ pressed }) => (pressed ? { opacity: 0.88 } : null)}
          >
            <Plus size={16} color="#000000" strokeWidth={2.4} />
            <Text className="text-[14px] font-semibold text-black">Add Debt</Text>
          </Pressable>
        </View>

        <View className="mt-6 flex-row items-center rounded-bento bg-card p-5">
          <View className="flex-1">
            <Text className="text-[12.5px] text-muted">Total Lent Out</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className="mt-2 text-[30px] font-bold tracking-tight text-ink"
            >
              {formatMoney(totalLentOut, currency)}
            </Text>
            <Text className="mt-2 text-[12.5px] text-faint">
              {activeDebtCount} active loan{activeDebtCount === 1 ? '' : 's'}
              {settledDebtCount > 0 ? ` · ${settledDebtCount} settled` : ''}
            </Text>
          </View>
          <Bookmark size={30} color="#777777" strokeWidth={1.5} />
        </View>

        {sortedDebts.length === 0 ? (
          <View className="mt-6 items-center rounded-bento bg-card px-6 py-12">
            <Text className="text-[15.5px] font-medium text-ink">No loans recorded</Text>
            <Text className="mt-1.5 text-center text-[13.5px] text-muted">
              Tap Add Debt to log money you have lent out.
            </Text>
          </View>
        ) : (
          <View className="mt-4 gap-3">
            {sortedDebts.map((debt) => {
              const paid = debt.status === 'paid';
              return (
                <Pressable
                  key={debt.id}
                  onPress={() => setSelectedId(debt.id)}
                  className="flex-row items-center rounded-bento bg-card px-4 py-4"
                  style={({ pressed }) => (pressed ? { opacity: 0.86 } : null)}
                >
                  <View className="h-[44px] w-[44px] items-center justify-center rounded-full bg-[#1C1C1C]">
                    <Text className="text-[13px] font-semibold text-[#C9C9D1]">
                      {initialsOf(debt.borrowerName)}
                    </Text>
                  </View>
                  <View className="ml-3.5 flex-1 pr-2">
                    <Text
                      numberOfLines={1}
                      className={`text-[16.5px] font-semibold ${
                        paid ? 'text-muted' : 'text-ink'
                      }`}
                    >
                      {debt.borrowerName}
                    </Text>
                    <Text className="mt-1 text-[13px] text-muted">
                      Lent on {formatShortDate(debt.loanDate)}
                      {paid ? ' · Paid' : ''}
                    </Text>
                  </View>
                  <Text
                    className={`text-[15.5px] font-semibold ${
                      paid ? 'text-faint line-through' : 'text-ink'
                    }`}
                  >
                    {formatMoney(debt.amount, currency)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </Screen>

      <AddDebtModal visible={addOpen} onClose={() => setAddOpen(false)} />
      <DebtDetailModal debt={selectedDebt} onClose={() => setSelectedId(null)} />
    </View>
  );
}
