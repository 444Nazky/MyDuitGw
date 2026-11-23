import { useEffect, useState } from 'react';
import { Alert, Image, Platform, Pressable, Text, View } from 'react-native';
import { Check, ImageOff, Trash2 } from 'lucide-react-native';
import { Sheet } from '@/components/ui/Sheet';
import { useFinance } from '@/context/FinanceContext';
import { formatMediumDate, formatMoney, initialsOf } from '@/lib/format';
import type { Debt } from '@/types/finance';

interface DebtDetailModalProps {
  debt: Debt | null;
  onClose: () => void;
}

export function DebtDetailModal({ debt, onClose }: DebtDetailModalProps) {
  const { toggleDebtStatus, deleteDebt, currency, receiptUrl } = useFinance();
  const [snapshot, setSnapshot] = useState<Debt | null>(debt);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (debt) setSnapshot(debt);
  }, [debt]);

  const current = debt ?? snapshot;
  const receiptPath = current?.receiptUri ?? null;

  useEffect(() => {
    let active = true;
    if (!receiptPath) {
      setImageUri(null);
      return;
    }
    void receiptUrl(receiptPath).then((uri) => {
      if (active) setImageUri(uri);
    });
    return () => {
      active = false;
    };
  }, [receiptPath, receiptUrl]);

  const visible = debt !== null;
  const paid = current?.status === 'paid';

  const handleDelete = () => {
    if (!current) return;
    const remove = () => {
      deleteDebt(current.id);
      onClose();
    };
    const message = 'This loan record will be removed from your debt list.';

    if (Platform.OS === 'web') {
      const confirmFn = (globalThis as { confirm?: (text: string) => boolean }).confirm;
      if (confirmFn?.(`Delete debt?\n\n${message}`)) remove();
      return;
    }

    Alert.alert('Delete debt?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: remove },
    ]);
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Debt Details"
      footer={
        current ? (
          <>
            <Pressable
              onPress={() => toggleDebtStatus(current.id)}
              className={`h-14 flex-row items-center justify-center gap-2 rounded-2xl ${
                paid ? 'border border-white/[0.1] bg-[#1A1A1D]' : 'bg-neon'
              }`}
              style={({ pressed }) => (pressed ? { opacity: 0.88 } : null)}
            >
              {paid ? null : <Check size={18} color="#FFFFFF" strokeWidth={2.4} />}
              <Text
                className={`text-[16.5px] font-semibold ${paid ? 'text-[#D5D5DC]' : 'text-white'}`}
              >
                {paid ? 'Mark as Unpaid' : 'Mark as Paid'}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              className="mt-2 h-11 flex-row items-center justify-center gap-2 rounded-2xl"
              style={({ pressed }) => (pressed ? { opacity: 0.8 } : null)}
            >
              <Trash2 size={16} color="#FF5F5F" strokeWidth={1.8} />
              <Text className="text-[15px] font-semibold text-coral">Delete Debt</Text>
            </Pressable>
          </>
        ) : null
      }
    >
      {current ? (
        <View>
          <View className="items-center pb-2 pt-1">
            <View className="h-[68px] w-[68px] items-center justify-center rounded-full bg-white/[0.06]">
              <Text className="text-[22px] font-semibold text-ink">
                {initialsOf(current.borrowerName)}
              </Text>
            </View>
            <Text className="mt-3 text-[19px] font-semibold text-ink">
              {current.borrowerName}
            </Text>
            <View
              className={`mt-2 rounded-full px-3 py-1 ${
                paid ? 'bg-neon/20' : 'bg-amber/15'
              }`}
            >
              <Text
                className={`text-[12px] font-semibold uppercase tracking-wide ${
                  paid ? 'text-[#B0A0FF]' : 'text-amber'
                }`}
              >
                {paid ? 'Paid' : 'Unpaid'}
              </Text>
            </View>
          </View>

          <Text
            className={`mt-4 text-center text-[38px] font-bold tracking-tight ${
              paid ? 'text-faint line-through' : 'text-amber'
            }`}
          >
            {formatMoney(current.amount, currency)}
          </Text>

          <View className="mt-6 rounded-2xl border border-white/[0.06] bg-[#101012] p-4">
            <Text className="text-[12px] uppercase tracking-wide text-faint">Lent on</Text>
            <Text className="mt-1.5 text-[15px] text-ink">
              {formatMediumDate(current.loanDate)}
            </Text>

            <View className="my-4 h-px bg-white/[0.06]" />

            <Text className="text-[12px] uppercase tracking-wide text-faint">Reason</Text>
            <Text className="mt-1.5 text-[15px] leading-[22px] text-[#D5D5DC]">
              {current.reason.trim() ? current.reason : 'No reason recorded.'}
            </Text>
          </View>

          <Text className="mb-2 mt-6 text-[12px] uppercase tracking-wide text-faint">
            Transfer receipt
          </Text>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: 210, borderRadius: 16 }}
              resizeMode="cover"
            />
          ) : (
            <View className="items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-[#101012] py-9">
              <ImageOff size={22} color="#5A5A63" strokeWidth={1.6} />
              <Text className="mt-2 text-[13px] text-faint">No receipt attached</Text>
            </View>
          )}
        </View>
      ) : null}
    </Sheet>
  );
}
