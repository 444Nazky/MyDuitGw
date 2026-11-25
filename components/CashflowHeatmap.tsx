import { useMemo, useRef, type ComponentRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { Transaction } from '@/types/finance';

// GitHub-style year graph: 7 rows for Sun–Sat, 53 columns for the last year of
// weeks. Squares are micro-sized and the strip scrolls sideways so the card
// itself never grows wider than the screen.
const WEEKS = 53;
const DAYS = 7;
const CELL = 8;
const GAP = 3;
const RADIUS = 2;
const LABEL_HEIGHT = 11;
const DAY_MS = 24 * 60 * 60 * 1000;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Tone = 'idle' | 'expense' | 'income' | 'future';

const COLORS: Record<Tone, string> = {
  // Nothing left the account that day: the violet stays faint.
  idle: 'rgba(139, 92, 246, 0.22)',
  // Money out marks the day grey.
  expense: '#52525B',
  // Money in is the strongest violet.
  income: '#8B5CF6',
  future: 'rgba(255, 255, 255, 0.05)',
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

interface CashflowHeatmapProps {
  transactions: Transaction[];
}

export function CashflowHeatmap({ transactions }: CashflowHeatmapProps) {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const grid = useMemo(() => {
    const today = startOfDay(new Date());
    // Sunday of the current week, then walk back 52 weeks: the final column is
    // the week the user is living in right now.
    const lastSunday = new Date(today.getTime() - today.getDay() * DAY_MS);
    const firstSunday = new Date(lastSunday.getTime() - (WEEKS - 1) * 7 * DAY_MS);

    const tones = new Map<string, Tone>();
    for (const transaction of transactions) {
      const date = startOfDay(new Date(transaction.date));
      const key = dateKey(date);
      if (transaction.type === 'income') {
        tones.set(key, 'income');
      } else if (tones.get(key) !== 'income') {
        tones.set(key, 'expense');
      }
    }

    const columns = Array.from({ length: WEEKS }, (_, week) => {
      const weekStart = new Date(firstSunday.getTime() + week * 7 * DAY_MS);

      const days = Array.from({ length: DAYS }, (_, day) => {
        const date = new Date(weekStart.getTime() + day * DAY_MS);
        if (date.getTime() > today.getTime()) return 'future' as Tone;
        return tones.get(dateKey(date)) ?? 'idle';
      });

      let label: string | null = null;
      for (let day = 0; day < DAYS; day += 1) {
        const date = new Date(weekStart.getTime() + day * DAY_MS);
        if (date.getDate() === 1) {
          label = MONTHS[date.getMonth()];
          break;
        }
      }

      return { key: weekStart.toISOString(), label, days };
    });

    return columns;
  }, [transactions]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      // The newest week is the one that matters, so open scrolled to the end.
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      accessibilityLabel="Yearly cashflow heatmap"
    >
      <View style={{ gap: GAP }}>
        <View style={{ flexDirection: 'row', gap: GAP, height: LABEL_HEIGHT }}>
          {grid.map((column) => (
            <View key={`label-${column.key}`} style={{ width: CELL }}>
              {column.label ? (
                <Text numberOfLines={1} style={{ width: 26, fontSize: 9, color: '#666666' }}>
                  {column.label}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: GAP }}>
          {grid.map((column) => (
            <View key={column.key} style={{ width: CELL, gap: GAP }}>
              {column.days.map((tone, day) => (
                <View
                  key={`${column.key}-${day}`}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: RADIUS,
                    backgroundColor: COLORS[tone],
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
