import { Pressable, Text, View } from 'react-native';
import { CategoryIcon } from '@/components/CategoryIcon';
import { useFinance } from '@/context/FinanceContext';
import { formatMoney } from '@/lib/format';
import type { TransactionCategory } from '@/types/finance';

interface TransactionRowProps {
  title: string;
  subtitle: string;
  amount: number;
  tone: 'income' | 'expense' | 'debt';
  category?: TransactionCategory;
  onPress?: () => void;
}

const TONE_COLORS = {
  income: '#9B87FF',
  expense: '#FF6B6B',
  debt: '#FFB020',
} as const;

export function TransactionRow({
  title,
  subtitle,
  amount,
  tone,
  category,
  onPress,
}: TransactionRowProps) {
  const { currency } = useFinance();
  const sign = tone === 'income' ? '+' : '-';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center rounded-bento border border-white/[0.07] bg-card px-4 py-3.5"
      style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}
    >
      <CategoryIcon category={category} tone={tone} />
      <View className="ml-3.5 flex-1 pr-2">
        <Text numberOfLines={1} className="text-[15.5px] font-semibold text-ink">
          {title}
        </Text>
        <Text className="mt-1 text-[13px] text-muted">{subtitle}</Text>
      </View>
      <Text className="text-[15.5px] font-semibold" style={{ color: TONE_COLORS[tone] }}>
        {sign}
        {formatMoney(amount, currency)}
      </Text>
    </Pressable>
  );
}
