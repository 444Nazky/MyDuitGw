import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CalendarDays, Camera, ImagePlus, Upload, X } from 'lucide-react-native';
import { CalendarPanel } from '@/components/ui/CalendarPanel';
import { Sheet } from '@/components/ui/Sheet';
import { useFinance } from '@/context/FinanceContext';
import {
  formatAmountInput,
  formatDateTime,
  parseAmountInput,
  USD_TO_IDR,
} from '@/lib/format';
import { INPUT, LABEL } from '@/lib/ui';

interface AddDebtModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddDebtModal({ visible, onClose }: AddDebtModalProps) {
  const { addDebt, currency } = useFinance();
  const [borrowerName, setBorrowerName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [reason, setReason] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | undefined>();
  const [loanDate, setLoanDate] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setBorrowerName('');
    setAmountText('');
    setReason('');
    setReceiptUri(undefined);
    setLoanDate(new Date());
    setCalendarOpen(false);
  }, [visible]);

  const amount = parseAmountInput(amountText, currency);
  const canSave = borrowerName.trim().length > 0 && amount > 0;

  const applyResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) return;
    setReceiptUri(result.assets[0].uri);
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to attach a transfer receipt.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    applyResult(result);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to photograph a receipt.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    applyResult(result);
  };

  const openReceiptPicker = () => {
    if (Platform.OS === 'web') {
      void pickFromLibrary();
      return;
    }
    Alert.alert('Transfer Receipt', 'Add proof of transfer', [
      { text: 'Choose from Library', onPress: () => void pickFromLibrary() },
      { text: 'Take Photo', onPress: () => void takePhoto() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    const error = await addDebt({
      borrowerName: borrowerName.trim(),
      amount: currency === 'IDR' ? amount / USD_TO_IDR : amount,
      loanDate: loanDate.toISOString(),
      reason: reason.trim(),
      receiptUri,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Could not save this debt', error);
      return;
    }
    onClose();
  };

  const symbol = currency === 'IDR' ? 'Rp' : '$';

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Add New Debt"
      footer={
        <>
          {!canSave ? (
            <Text className="mb-3 text-center text-[12.5px] text-faint">
              Add a borrower name and an amount greater than zero.
            </Text>
          ) : null}
          <Pressable
            onPress={() => void handleSave()}
            disabled={!canSave || saving}
            className={`h-14 items-center justify-center rounded-2xl ${
              canSave ? 'bg-accent-strong' : 'bg-white/15'
            }`}
            style={({ pressed }) => (pressed && canSave ? { opacity: 0.88 } : null)}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                className={`text-[16px] font-semibold ${
                  canSave ? 'text-white' : 'text-white/40'
                }`}
              >
                Save Debt Record
              </Text>
            )}
          </Pressable>
        </>
      }
    >
      <Text className={LABEL}>Borrower Name</Text>
      <TextInput
        value={borrowerName}
        onChangeText={setBorrowerName}
        placeholder="Enter full name"
        placeholderTextColor="#5A5A63"
        className={INPUT}
        selectionColor="#8B5CF6"
      />

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1">
          <Text className={LABEL}>Amount</Text>
          <View
            className="h-14 flex-row items-center rounded-2xl bg-[#1C1C1C] px-4"
          >
            <Text className="mr-1.5 text-[17px] font-semibold text-ink">{symbol}</Text>
            <TextInput
              value={amountText}
              onChangeText={(text) => setAmountText(formatAmountInput(text, currency))}
              placeholder={currency === 'IDR' ? '0' : '0.00'}
              placeholderTextColor="#5A5A63"
              keyboardType="decimal-pad"
              className="flex-1 text-[17px] font-semibold text-ink"
              selectionColor="#8B5CF6"
            />
          </View>
        </View>

        <View className="flex-[1.15]">
          <Text className={LABEL}>Date &amp; Time</Text>
          <Pressable
            onPress={() => setCalendarOpen((open) => !open)}
            className="h-14 flex-row items-center justify-between rounded-2xl bg-[#1C1C1C] px-3.5"
          >
            <Text className="mr-1 text-[13px] text-ink" numberOfLines={1}>
              {formatDateTime(loanDate.toISOString())}
            </Text>
            <CalendarDays size={18} color="#8E8E96" strokeWidth={1.7} />
          </Pressable>
        </View>
      </View>

      {calendarOpen ? (
        <CalendarPanel value={loanDate} onChange={setLoanDate} withTime />
      ) : null}

      <Text className={`${LABEL} mt-5`}>Reason for Loan</Text>
      <TextInput
        value={reason}
        onChangeText={setReason}
        placeholder="What is this loan for?"
        placeholderTextColor="#5A5A63"
        multiline
        textAlignVertical="top"
        className="min-h-[96px] rounded-2xl bg-[#1C1C1C] p-4 text-[15px] text-ink"
        selectionColor="#8B5CF6"
      />

      <Text className={`${LABEL} mt-5`}>Transfer Receipt</Text>
      {receiptUri ? (
        <View className="overflow-hidden rounded-2xl border border-white/[0.08]">
          <Image source={{ uri: receiptUri }} style={{ width: '100%', height: 172 }} resizeMode="cover" />
          <View className="flex-row items-center justify-between bg-[#1C1C1C] px-3 py-2.5">
            <Pressable
              onPress={openReceiptPicker}
              className="flex-row items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-2"
            >
              <ImagePlus size={15} color="#C9C9D1" />
              <Text className="text-[13px] font-medium text-[#D5D5DC]">Replace</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Remove receipt"
              hitSlop={8}
              onPress={() => setReceiptUri(undefined)}
              className="h-8 w-8 items-center justify-center rounded-full bg-white/[0.06]"
            >
              <X size={16} color="#FF6B6B" />
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={openReceiptPicker}
          className="items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#1C1C1C] py-8"
          style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}
        >
          <View className="mb-2 flex-row items-center gap-2">
            <Upload size={22} color="#8E8E96" strokeWidth={1.7} />
            <Camera size={20} color="#8E8E96" strokeWidth={1.7} />
          </View>
          <Text className="text-[14.5px] text-muted">Upload proof of transfer</Text>
          <Text className="mt-1 text-[12px] text-faint">JPG or PNG from gallery or camera</Text>
        </Pressable>
      )}

    </Sheet>
  );
}
