import type { ComponentType } from 'react';
import { View } from 'react-native';
import {
  ArrowUpRight,
  Coffee,
  Gamepad2,
  Layers,
  ReceiptText,
  ShoppingBag,
  Wallet,
  Wifi,
} from 'lucide-react-native';
import type { TransactionCategory } from '@/types/finance';

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const ICONS: Record<TransactionCategory, IconComponent> = {
  Kuota: Wifi,
  Shopping: ShoppingBag,
  Food: Coffee,
  Salary: ArrowUpRight,
  Bills: ReceiptText,
  Game: Gamepad2,
  Etc: Layers,
};

const TONES = {
  income: { background: 'rgba(124,92,255,0.14)', color: '#9B87FF' },
  expense: { background: 'rgba(255,95,95,0.12)', color: '#FF6B6B' },
  debt: { background: 'rgba(255,176,32,0.12)', color: '#FFB020' },
} as const;

interface CategoryIconProps {
  category?: TransactionCategory;
  tone: 'income' | 'expense' | 'debt';
}

const SIZE = 46;

export function CategoryIcon({ category, tone }: CategoryIconProps) {
  const Icon = tone === 'debt' ? Wallet : ICONS[category ?? 'Etc'];
  const palette = TONES[tone];

  return (
    <View
      className="items-center justify-center rounded-[15px]"
      style={{ width: SIZE, height: SIZE, backgroundColor: palette.background }}
    >
      <Icon size={SIZE * 0.46} color={palette.color} strokeWidth={1.8} />
    </View>
  );
}
