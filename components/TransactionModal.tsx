import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { CalendarDays, Trash2 } from 'lucide-react-native';
import { CalendarPanel } from '@/components/ui/CalendarPanel';
import { Sheet } from '@/components/ui/Sheet';
import { useFinance } from '@/context/FinanceContext';
import {
  formatAmountInput,
  formatMediumDate,
  parseAmountInput,
  USD_TO_IDR,
} from '@/lib/format';
import { INPUT, LABEL } from '@/lib/ui';
import {
  CATEGORY_COLORS,
  TRANSACTION_CATEGORIES,
  type Transaction,
  type TransactionCategory,
  type TransactionType,
} from '@/types/finance';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

export function TransactionModal({
  visible,
  onClose,
  transaction,
}: TransactionModalProps) {
  const { addTransaction, updateTransaction, deleteTransaction, currency } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setType(transaction?.type ?? 'expense');
    setAmountText(
      transaction
        ? formatAmountInput(
            String(
              currency === 'IDR'
                ? Math.round(transaction.amount * USD_TO_IDR)
                : transaction.amount.toFixed(2),
            ),
            currency,
          )
        : '',
    );
    setCategory(transaction?.category ?? 'Food');
    setNote(transaction?.note ?? '');
    setDate(transaction ? new Date(transaction.date) : new Date());
    setCalendarOpen(false);
  }, [visible, transaction, currency]);

  const editing = Boolean(transaction);
  const amount = parseAmountInput(amountText, currency);
  const canSave = amount > 0;

  const handleSave = () => {
    if (!canSave) return;
    // The calendar only picks the day, which resets the clock to 00:00 and made
    // a fresh entry sink below older ones from the same day. Keep a real time:
    // now for new entries, the original time when editing.
    const reference = transaction ? new Date(transaction.date) : new Date();
    const stamped = new Date(date);
    stamped.setHours(
      reference.getHours(),
      reference.getMinutes(),
      reference.getSeconds(),
      reference.getMilliseconds(),
    );
    const draft = {
      type,
      amount: currency === 'IDR' ? amount / USD_TO_IDR : amount,
      category,
      note: note.trim() ? note.trim() : undefined,
      date: stamped.toISOString(),
    };

    if (transaction) {
      updateTransaction(transaction.id, draft);
    } else {
      addTransaction(draft);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!transaction) return;
    const remove = () => {
      deleteTransaction(transaction.id);
      onClose();
    };
    const message = 'This transaction will be removed from your balance and history.';

    if (Platform.OS === 'web') {
      const confirmFn = (globalThis as { confirm?: (text: string) => boolean }).confirm;
      if (confirmFn?.(`Delete transaction?\n\n${message}`)) remove();
      return;
    }

    Alert.alert('Delete transaction?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: remove },
    ]);
  };

  const symbol = currency === 'IDR' ? 'Rp' : '$';

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={editing ? 'Edit Transaction' : 'New Transaction'}
      footer={
        <>
          {!canSave ? (
            <Text className="mb-3 text-center text-[12.5px] text-faint">
              Enter an amount greater than zero.
            </Text>
          ) : null}
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            className={`h-14 items-center justify-center rounded-2xl ${
              canSave ? 'bg-neon' : 'bg-neon/40'
            }`}
            style={({ pressed }) => (pressed && canSave ? { opacity: 0.88 } : null)}
          >
            <Text className="text-[16.5px] font-semibold text-white">
              {editing ? 'Save Changes' : 'Save Transaction'}
            </Text>
          </Pressable>

          {editing ? (
            <Pressable
              onPress={handleDelete}
              className="mt-2 h-11 flex-row items-center justify-center gap-2 rounded-2xl"
              style={({ pressed }) => (pressed ? { opacity: 0.8 } : null)}
            >
              <Trash2 size={16} color="#FF5F5F" strokeWidth={1.8} />
              <Text className="text-[15px] font-semibold text-coral">Delete Transaction</Text>
            </Pressable>
          ) : null}
        </>
      }
    >
      <View className="flex-row rounded-2xl border border-white/[0.07] bg-[#19191C] p-1.5">
        {(['income', 'expense'] as TransactionType[]).map((option) => {
          const active = type === option;
          return (
            <Pressable
              key={option}
              onPress={() => setType(option)}
              className={`h-12 flex-1 items-center justify-center rounded-xl ${
                active ? 'bg-neon' : ''
              }`}
            >
              <Text
                className={`text-[15px] ${
                  active ? 'font-semibold text-white' : 'font-medium text-muted'
                }`}
              >
                {option === 'income' ? 'Income' : 'Expense'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className={`${LABEL} mt-6`}>Amount</Text>
      <View className="flex-row items-center border-b border-white/[0.08] pb-4">
        <Text
          className={`mr-2 font-bold text-ink ${currency === 'IDR' ? 'text-[24px]' : 'text-[38px]'}`}
        >
          {symbol}
        </Text>
        <TextInput
          value={amountText}
          onChangeText={(text) => setAmountText(formatAmountInput(text, currency))}
          placeholder={currency === 'IDR' ? '0' : '0.00'}
          placeholderTextColor="#4C4C55"
          keyboardType="decimal-pad"
          className={`flex-1 font-bold text-ink ${currency === 'IDR' ? 'text-[32px]' : 'text-[40px]'}`}
          selectionColor="#7C5CFF"
        />
      </View>

      <View className="mt-6 flex-row flex-wrap gap-2.5">
        {TRANSACTION_CATEGORIES.map((option) => {
          const active = category === option;
          return (
            <Pressable
              key={option}
              onPress={() => setCategory(option)}
              className={`h-11 items-center justify-center rounded-full border px-5 ${
                active ? 'border-neon bg-neon' : 'border-white/[0.09] bg-[#17171A]'
              }`}
            >
              <Text
                className={`text-[14.5px] ${
                  active ? 'font-semibold text-white' : 'font-medium text-[#B9B9C2]'
                }`}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className={`${LABEL} mt-6`}>Date</Text>
      <Pressable
        onPress={() => setCalendarOpen((open) => !open)}
        className={`${INPUT} flex-row items-center justify-between`}
      >
        <Text className="text-[15px] text-ink">{formatMediumDate(date.toISOString())}</Text>
        <CalendarDays size={20} color="#8E8E96" strokeWidth={1.7} />
      </Pressable>

      {calendarOpen ? (
        <CalendarPanel value={date} onChange={setDate} />
      ) : null}

      <Text className={`${LABEL} mt-6`}>Note</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Add a note..."
        placeholderTextColor="#5A5A63"
        multiline
        textAlignVertical="top"
        className="min-h-[88px] rounded-2xl border border-white/[0.08] bg-[#101012] p-4 text-[15px] text-ink"
        selectionColor="#7C5CFF"
      />

      <View className="mt-4 flex-row items-center justify-center">
        <View
          className="mr-2 h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: CATEGORY_COLORS[category] }}
        />
        <Text className="text-[12.5px] text-faint">
          {type === 'income' ? 'Money coming in' : 'Money going out'} · {category}
        </Text>
      </View>
    </Sheet>
  );
}
