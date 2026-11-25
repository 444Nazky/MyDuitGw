import { useMemo } from 'react';
import { View } from 'react-native';
import { isCurrentMonth } from '@/lib/format';
import type { Transaction } from '@/types/finance';

// GitHub-style contribution grid: 7 columns x 4 rows, one square per day.
const COLUMNS = 7;
const ROWS = 4;
const CELLS = COLUMNS * ROWS;
const CELL_SIZE = 10;
const GAP = 3.5;
const RADIUS = 3;

type Tone = 'idle' | 'expense' | 'income' | 'future' | 'outside';

const COLORS: Record<Tone, string> = {
  // No money left the account: the violet stays faint.
  idle: 'rgba(139, 92, 246, 0.22)',
  // Money out marks the day grey.
  expense: '#52525B',
  // Money in is the strongest violet.
  income: '#8B5CF6',
  future: 'rgba(255, 255, 255, 0.05)',
  outside: 'transparent',
};

interface CashflowHeatmapProps {
  transactions: Transaction[];
}

export function CashflowHeatmap({ transactions }: CashflowHeatmapProps) {
  const days = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const today = now.getDate();
    const tones: Tone[] = new Array<Tone>(CELLS).fill('idle');

    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      if (!isCurrentMonth(date)) continue;
      // The grid holds 28 days, so the tail of a longer month folds into the
      // last square and the panel keeps reflecting month-to-date activity.
      const index = Math.min(date.getDate(), CELLS) - 1;
      if (transaction.type === 'income') {
        tones[index] = 'income';
      } else if (tones[index] !== 'income') {
        tones[index] = 'expense';
      }
    }

    return tones.map((tone, index) => {
      const day = index + 1;
      if (day > daysInMonth) return 'outside' as Tone;
      if (day > today) return 'future' as Tone;
      return tone;
    });
  }, [transactions]);

  return (
    <View accessibilityLabel="Monthly cashflow heatmap" style={{ gap: GAP }}>
      {Array.from({ length: ROWS }, (_, row) => (
        <View key={`week-${row}`} style={{ flexDirection: 'row', gap: GAP }}>
          {days.slice(row * COLUMNS, row * COLUMNS + COLUMNS).map((tone, column) => (
            <View
              key={`day-${row * COLUMNS + column + 1}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                borderRadius: RADIUS,
                backgroundColor: COLORS[tone],
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
