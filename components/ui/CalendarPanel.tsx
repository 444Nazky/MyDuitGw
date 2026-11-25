import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react-native';
import { formatClockTime } from '@/lib/format';

interface CalendarPanelProps {
  value: Date;
  onChange: (date: Date) => void;
  withTime?: boolean;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function CalendarPanel({ value, onChange, withTime = false }: CalendarPanelProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value));

  const days = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const leading = first.getDay();
    const total = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: leading }, () => null);
    for (let day = 1; day <= total; day += 1) {
      cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  const shiftMonth = (delta: number) => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const selectDay = (day: Date) => {
    const next = new Date(value);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next);
  };

  const shiftMinutes = (delta: number) => {
    const next = new Date(value.getTime() + delta * 60 * 1000);
    onChange(next);
  };

  return (
    <View className="mt-3 rounded-[20px] bg-[#1C1C1C] p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          accessibilityLabel="Previous month"
          hitSlop={8}
          onPress={() => shiftMonth(-1)}
          className="h-8 w-8 items-center justify-center rounded-full bg-white/[0.05]"
        >
          <ChevronLeft size={18} color="#C9C9D1" />
        </Pressable>
        <Text className="text-[15px] font-semibold text-ink">
          {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </Text>
        <Pressable
          accessibilityLabel="Next month"
          hitSlop={8}
          onPress={() => shiftMonth(1)}
          className="h-8 w-8 items-center justify-center rounded-full bg-white/[0.05]"
        >
          <ChevronRight size={18} color="#C9C9D1" />
        </Pressable>
      </View>

      <View className="flex-row">
        {WEEKDAYS.map((label, index) => (
          <View key={`${label}-${index}`} className="flex-1 items-center pb-2">
            <Text className="text-[11px] font-medium text-faint">{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} className="h-10" style={{ width: `${100 / 7}%` }} />;
          }
          const selected =
            day.getDate() === value.getDate() &&
            day.getMonth() === value.getMonth() &&
            day.getFullYear() === value.getFullYear();
          const today = new Date();
          const isToday =
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();

          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => selectDay(day)}
              className="h-10 items-center justify-center"
              style={{ width: `${100 / 7}%` }}
            >
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  selected ? 'bg-accent-strong' : isToday ? 'border border-accent/40' : ''
                }`}
              >
                <Text
                  className={`text-[14px] ${
                    selected ? 'font-semibold text-white' : 'text-[#D5D5DC]'
                  }`}
                >
                  {day.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {withTime ? (
        <View className="mt-3 flex-row items-center justify-between border-t border-white/[0.06] pt-3">
          <Text className="text-[13px] text-muted">Time</Text>
          <View className="flex-row items-center">
            <Pressable
              accessibilityLabel="Earlier"
              hitSlop={6}
              onPress={() => shiftMinutes(-5)}
              className="h-8 w-8 items-center justify-center rounded-full bg-white/[0.05]"
            >
              <Minus size={16} color="#C9C9D1" />
            </Pressable>
            <Text className="mx-3 min-w-[74px] text-center text-[14px] font-medium text-ink">
              {formatClockTime(value.toISOString())}
            </Text>
            <Pressable
              accessibilityLabel="Later"
              hitSlop={6}
              onPress={() => shiftMinutes(5)}
              className="h-8 w-8 items-center justify-center rounded-full bg-white/[0.05]"
            >
              <Plus size={16} color="#C9C9D1" />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
