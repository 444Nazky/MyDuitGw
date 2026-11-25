import { type ComponentRef, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Sparkles, X } from 'lucide-react-native';
import { useFinance } from '@/context/FinanceContext';
import { formatMoney, USD_TO_IDR } from '@/lib/format';
import type { TransactionCategory } from '@/types/finance';

interface AIAgentSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface ReplyCard {
  title: string;
  meta: string;
  amount: string;
  tone: 'income' | 'expense' | 'debt';
}

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  card?: ReplyCard;
}

const DEBT_PATTERN = /(hutang|utang|pinjam|pinjamin|piutang|lent)/i;
const INCOME_PATTERN = /(pemasukan|masuk|gaji|bonus|dapat|terima|income|freelance|transfer masuk)/i;
const EXPENSE_PATTERN = /(pengeluaran|keluar|beli|bayar|jajan|makan|kopi|expense|belanja|parkir)/i;

/** Reads "25rb", "1,5jt", "Rp 25.000" or a plain number. */
function parseNominal(input: string): { value: number; idr: boolean } | null {
  const lower = input.toLowerCase();

  const million = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)\b/);
  if (million) {
    return {
      value: Math.round(parseFloat(million[1].replace(',', '.')) * 1_000_000),
      idr: true,
    };
  }

  const thousand = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k)\b/);
  if (thousand) {
    return {
      value: Math.round(parseFloat(thousand[1].replace(',', '.')) * 1_000),
      idr: true,
    };
  }

  const rupiah = lower.match(/rp\.?\s*([\d.]+)/);
  if (rupiah) {
    return { value: Number(rupiah[1].replace(/\./g, '')), idr: true };
  }

  const plain = lower.match(/\b(\d[\d.,]*)\b/);
  if (!plain) return null;
  const cleaned = plain[1].replace(/\./g, '').replace(',', '.');
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { value: Math.round(value), idr: false };
}

function cleanTitle(input: string): string {
  const cleaned = input
    .replace(
      /\b(catat|tolong|tambahkan|tambah|buatkan|masukkan|input|pengeluaran|pemasukan|sebesar|senilai|seharga|bayar|beli|untuk|ke|rp)\b/gi,
      ' ',
    )
    .replace(/\d+(?:[.,]\d+)?\s*(?:jt|juta|rb|ribu|k)\b/gi, ' ')
    .replace(/rp\.?\s*[\d.]+/gi, ' ')
    .replace(/\b\d[\d.,]*\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

function cleanPerson(input: string): string {
  const cleaned = input
    .replace(
      /\b(catat|tolong|tambahkan|tambah|buatkan|pinjamkan|pinjamin|pinjam|hutang|utang|piutang|lent|out|ke|untuk|atas|nama|sebesar|senilai|rp)\b/gi,
      ' ',
    )
    .replace(/\d+(?:[.,]\d+)?\s*(?:jt|juta|rb|ribu|k)\b/gi, ' ')
    .replace(/rp\.?\s*[\d.]+/gi, ' ')
    .replace(/\b\d[\d.,]*\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'Teman';
}

function expenseCategory(title: string): TransactionCategory {
  const value = title.toLowerCase();
  if (/(kopi|makan|jajan|food|resto|warteg|bakso|nasi|minum)/.test(value)) return 'Food';
  if (/(kuota|internet|wifi|pulsa)/.test(value)) return 'Kuota';
  if (/(belanja|shopping|baju|sepatu|plush|tas)/.test(value)) return 'Shopping';
  if (/(game|top up|topup|voucher)/.test(value)) return 'Game';
  if (/(listrik|air|tagihan|bayar|parkir|bensin|transport)/.test(value)) return 'Bills';
  return 'Etc';
}

export function AIAgentSheet({ visible, onClose }: AIAgentSheetProps) {
  const insets = useSafeAreaInsets();
  const {
    profile,
    currency,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlyNet,
    categoryBreakdown,
    debts,
    addTransaction,
    addDebt,
  } = useFinance();

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'ai',
      text: `Halo${profile.name ? ` ${profile.name.split(' ')[0]}` : ''}! Saya myduitgw AI, terhubung langsung dengan saldo dan riwayatmu. Coba ketik "catat pengeluaran kopi 25rb" atau "tambah pemasukan bonus 500rb".`,
    },
  ]);

  const scrollToEnd = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const buildReply = (prompt: string): ChatMessage => {
    const nominal = parseNominal(prompt);
    const id = `${Date.now()}-ai`;

    if (nominal && DEBT_PATTERN.test(prompt)) {
      const person = cleanPerson(prompt);
      const stored = nominal.idr || currency === 'IDR' ? nominal.value / USD_TO_IDR : nominal.value;
      void addDebt({
        borrowerName: person,
        amount: stored,
        loanDate: new Date().toISOString(),
        reason: 'Dicatat via myduitgw AI',
      });
      return {
        id,
        role: 'ai',
        text: `Catatan pinjaman untuk ${person} sudah masuk ke Debt List dan Total Lent Out diperbarui.`,
        card: {
          title: person,
          meta: 'Pinjaman aktif · Debt List',
          amount: formatMoney(stored, currency),
          tone: 'debt',
        },
      };
    }

    if (nominal) {
      const isIncome = INCOME_PATTERN.test(prompt) && !EXPENSE_PATTERN.test(prompt);
      const title = cleanTitle(prompt) || (isIncome ? 'Pemasukan via AI' : 'Pengeluaran via AI');
      const stored = nominal.idr || currency === 'IDR' ? nominal.value / USD_TO_IDR : nominal.value;
      const category: TransactionCategory = isIncome ? 'Salary' : expenseCategory(title);

      void addTransaction({
        type: isIncome ? 'income' : 'expense',
        amount: stored,
        category,
        note: title,
        date: new Date().toISOString(),
      });

      return {
        id,
        role: 'ai',
        text: isIncome
          ? 'Pemasukan sudah dicatat. Saldo utama, Income bulan ini, dan Monthly Cashflow ikut diperbarui.'
          : 'Pengeluaran sudah dicatat. Saldo utama, Spending bulan ini, dan Monthly Cashflow ikut diperbarui.',
        card: {
          title,
          meta: `${category} · ${isIncome ? 'Pemasukan' : 'Pengeluaran'}`,
          amount: `${isIncome ? '+' : '-'}${formatMoney(stored, currency)}`,
          tone: isIncome ? 'income' : 'expense',
        },
      };
    }

    const activeLoans = debts.filter((debt) => debt.status === 'unpaid');
    const top = categoryBreakdown[0];
    const savingRatio =
      monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100) : 0;
    const lines = [
      `Total Balance: ${formatMoney(totalBalance, currency)}`,
      `Income bulan ini: ${formatMoney(monthlyIncome, currency)}`,
      `Spending bulan ini: ${formatMoney(monthlyExpense, currency)}`,
      `Net cashflow: ${monthlyNet >= 0 ? '+' : '-'}${formatMoney(monthlyNet, currency)} (${savingRatio}% surplus)`,
      activeLoans.length > 0
        ? `${activeLoans.length} pinjaman aktif, total ${formatMoney(
            activeLoans.reduce((sum, debt) => sum + debt.amount, 0),
            currency,
          )}`
        : 'Tidak ada pinjaman aktif.',
      top
        ? `Pengeluaran terbesar: ${top.category} (${Math.round(top.share * 100)}%).`
        : 'Belum ada pengeluaran bulan ini.',
    ];

    return {
      id,
      role: 'ai',
      text: `Ringkasan keuanganmu sekarang:\n\n${lines.join('\n')}\n\nMau saya catatkan transaksi atau pinjaman baru?`,
    };
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;

    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: 'user', text },
    ]);
    setInput('');
    setThinking(true);
    scrollToEnd();

    setTimeout(() => {
      setMessages((current) => [...current, buildReply(text)]);
      setThinking(false);
      scrollToEnd();
    }, 420);
  };

  const canSend = input.trim().length > 0 && !thinking;

  const cardTone = useMemo(
    () => ({
      income: 'text-positive',
      expense: 'text-negative',
      debt: 'text-accent',
    }),
    [],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <View
          className="flex-row items-center justify-between border-b border-white/[0.06] bg-[#0D0D0D] px-5 pb-3"
          style={{ paddingTop: insets.top + 10 }}
        >
          <View className="flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-2xl bg-accent-soft">
              <Sparkles size={18} color="#8B5CF6" strokeWidth={2} />
            </View>
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-[14px] font-bold text-white">myduitgw AI</Text>
                <View className="h-1.5 w-1.5 rounded-full bg-accent" />
              </View>
              <Text className="mt-0.5 text-[11px] text-[#8A8A8A]">
                Asisten Keuangan · Live Sync
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityLabel="Close AI agent"
            onPress={onClose}
            className="h-8 w-8 items-center justify-center rounded-full bg-[#1C1C1C]"
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
          >
            <X size={16} color="#9A9A9A" strokeWidth={2} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
          >
            {messages.map((message) => {
              if (message.role === 'user') {
                return (
                  <View
                    key={message.id}
                    className="max-w-[84%] self-end rounded-2xl rounded-br-sm bg-[#242424] px-3.5 py-2.5"
                  >
                    <Text className="text-[12.5px] leading-[19px] text-white">{message.text}</Text>
                  </View>
                );
              }

              return (
                <View
                  key={message.id}
                  className="max-w-[90%] self-start rounded-2xl rounded-bl-sm bg-card px-3.5 py-2.5"
                >
                  <Text className="text-[12.5px] leading-[20px] text-[#D5D5DC]">
                    {message.text}
                  </Text>

                  {message.card ? (
                    <View className="mt-2.5 flex-row items-center justify-between rounded-xl bg-[#0E0E0E] p-3">
                      <View className="flex-1 pr-3">
                        <Text numberOfLines={1} className="text-[12.5px] font-semibold text-white">
                          {message.card.title}
                        </Text>
                        <Text className="mt-0.5 text-[10.5px] text-[#777777]">
                          {message.card.meta}
                        </Text>
                      </View>
                      <Text
                        className={`text-[13px] font-bold ${cardTone[message.card.tone]}`}
                      >
                        {message.card.amount}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}

            {thinking ? (
              <View className="flex-row items-center gap-1.5 self-start rounded-2xl bg-card px-4 py-3">
                <View className="h-1.5 w-1.5 rounded-full bg-accent" />
                <View className="h-1.5 w-1.5 rounded-full bg-accent opacity-70" />
                <View className="h-1.5 w-1.5 rounded-full bg-accent opacity-40" />
              </View>
            ) : null}
          </ScrollView>

          <View
            className="flex-row items-center gap-2 border-t border-[#181818] bg-black px-4"
            style={{ paddingTop: 12, paddingBottom: Math.max(insets.bottom, 12) }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ketik perintah (mis. beli kopi 25rb)..."
              placeholderTextColor="#666666"
              className="flex-1 rounded-full bg-[#1A1A1A] px-4 py-3 text-[12.5px] text-white"
              selectionColor="#8B5CF6"
              returnKeyType="send"
              onSubmitEditing={() => send(input)}
            />
            <Pressable
              accessibilityLabel="Send message"
              onPress={() => send(input)}
              disabled={!canSend}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                canSend ? 'bg-accent-strong' : 'bg-[#242424]'
              }`}
              style={({ pressed }) => (pressed && canSend ? { opacity: 0.8 } : null)}
            >
              <Send size={16} color={canSend ? '#FFFFFF' : '#666666'} strokeWidth={2.2} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
