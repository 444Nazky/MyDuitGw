import { useState } from 'react';
import { Alert, Image, Platform, Pressable, Share, Text, View } from 'react-native';
import {
  ChevronRight,
  Download,
  Info,
  RotateCcw,
  User,
} from 'lucide-react-native';
import { EditProfileModal } from '@/components/EditProfileModal';
import { Screen } from '@/components/Screen';
import { useFinance } from '@/context/FinanceContext';
import { initialsOf } from '@/lib/format';
import type { CurrencyCode } from '@/types/finance';

export default function SettingScreen() {
  const { profile, currency, setCurrency, transactions, debts, resetData } = useFinance();
  const [editOpen, setEditOpen] = useState(false);

  const confirmReset = () => {
    const message =
      'This erases every transaction, debt, and profile detail saved on this device. It cannot be undone.';

    if (Platform.OS === 'web') {
      const confirmFn = (globalThis as { confirm?: (text: string) => boolean }).confirm;
      if (confirmFn?.(`Clear all data?\n\n${message}`)) resetData();
      return;
    }

    Alert.alert('Clear all data?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Erase', style: 'destructive', onPress: resetData },
    ]);
  };

  const exportData = async () => {
    const header =
      'kind,id,type,amount,category,note,date,borrowerName,reason,status';
    const cell = (value: string) => {
      const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const row = (values: string[]) => values.map(cell).join(',');
    const rows = [
      ...transactions.map((transaction) =>
        row([
          'transaction',
          transaction.id,
          transaction.type,
          transaction.amount.toFixed(2),
          transaction.category,
          transaction.note ?? '',
          transaction.date,
          '',
          '',
          '',
        ]),
      ),
      ...debts.map((debt) =>
        row([
          'debt',
          debt.id,
          '',
          debt.amount.toFixed(2),
          '',
          '',
          debt.loanDate,
          debt.borrowerName,
          debt.reason,
          debt.status,
        ]),
      ),
    ];
    const csv = [header, ...rows].join('\n');

    try {
      await Share.share({
        title: 'My Duit Gw data',
        message: csv,
      });
    } catch {
      Alert.alert(
        'Export unavailable',
        `Sharing is not available on this platform. You have ${transactions.length} transactions and ${debts.length} debt records.`,
      );
    }
  };

  const openAbout = () => {
    Alert.alert(
      'About My Duit Gw',
      'Version 1.0.3\n\nA personal finance and peer-to-peer loan tracker. All data stays on this device.',
    );
  };

  return (
    <View className="flex-1 bg-obsidian">
      <Screen>
        <Text className="text-[30px] font-bold tracking-tight text-ink">Settings</Text>

        <Pressable
          onPress={() => setEditOpen(true)}
          className="mt-6 flex-row items-center rounded-bento border border-white/[0.06] bg-card p-4"
          style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
        >
          <View className="h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-full bg-[#232326]">
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={{ width: 54, height: 54 }} />
            ) : (
              <Text className="text-[17px] font-semibold text-ink">
                {initialsOf(profile.name)}
              </Text>
            )}
          </View>
          <View className="ml-3.5 flex-1">
            <Text className="text-[17.5px] font-semibold text-ink">
              {profile.name || 'Add your name'}
            </Text>
            <Text className="mt-1 text-[13px] text-muted">
              {profile.email || 'Tap to set up your profile'}
            </Text>
          </View>
          <ChevronRight size={22} color="#8E8E96" strokeWidth={1.8} />
        </Pressable>

        <View className="mt-4 gap-3">
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setEditOpen(true)}
              className="min-h-[150px] flex-1 rounded-bento border border-white/[0.06] bg-card p-4"
            >
              <User size={26} color="#9B87FF" strokeWidth={1.6} />
              <View className="mt-auto">
                <Text className="text-[16px] font-semibold text-ink">Profile Settings</Text>
                <Text className="mt-1 text-[12.5px] text-muted">Name, photo &amp; email</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={exportData}
              className="min-h-[150px] flex-1 rounded-bento border border-white/[0.06] bg-card p-4"
            >
              <Download size={26} color="#9B87FF" strokeWidth={1.6} />
              <View className="mt-auto">
                <Text className="text-[16px] font-semibold text-ink">Export Data</Text>
                <Text className="mt-1 text-[12.5px] text-muted">Share as CSV</Text>
              </View>
            </Pressable>
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={confirmReset}
              className="min-h-[150px] flex-1 rounded-bento border border-white/[0.06] bg-card p-4"
            >
              <RotateCcw size={26} color="#FF6B6B" strokeWidth={1.6} />
              <View className="mt-auto">
                <Text className="text-[16px] font-semibold text-ink">Reset Data</Text>
                <Text className="mt-1 text-[12.5px] text-muted">Erase all records</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={openAbout}
              className="min-h-[150px] flex-1 rounded-bento border border-white/[0.06] bg-card p-4"
            >
              <Info size={26} color="#9B87FF" strokeWidth={1.6} />
              <View className="mt-auto">
                <Text className="text-[16px] font-semibold text-ink">About App</Text>
                <Text className="mt-1 text-[12.5px] text-muted">Version 1.0.3</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View className="mt-4 rounded-bento border border-white/[0.06] bg-card px-5 py-4">
          <Text className="text-[11.5px] font-medium uppercase tracking-[1.5px] text-faint">
            Preferences
          </Text>

          <View className="mt-4 flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[16px] font-semibold text-ink">Currency</Text>
              <Text className="mt-1 text-[12.5px] text-muted">Used across the app</Text>
            </View>

            <View className="flex-row rounded-full border border-white/[0.08] bg-[#101012] p-1">
              {(['USD', 'IDR'] as CurrencyCode[]).map((option) => {
                const active = currency === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setCurrency(option)}
                    className={`h-9 justify-center rounded-full px-4 ${
                      active ? 'bg-neon' : ''
                    }`}
                  >
                    <Text
                      className={`text-[13px] ${
                        active ? 'font-semibold text-white' : 'font-medium text-muted'
                      }`}
                    >
                      {option === 'USD' ? '$ USD' : 'Rp IDR'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="my-4 h-px bg-white/[0.06]" />

          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[16px] font-semibold text-ink">Data source</Text>                <Text className="mt-1 text-[12.5px] text-muted">Saved on this device</Text>
            </View>
            <Text className="text-[13px] text-muted">{transactions.length} transactions</Text>
          </View>
        </View>

        <Pressable
          onPress={confirmReset}
          className="mt-4 h-[58px] items-center justify-center rounded-bento border border-white/[0.06] bg-card"
          style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
        >
          <Text className="text-[15.5px] font-semibold text-coral">Clear All Data</Text>
        </Pressable>

        <Text className="mt-6 text-center text-[12px] text-faint">My Duit Gw · v1.0.3</Text>
      </Screen>

      <EditProfileModal visible={editOpen} onClose={() => setEditOpen(false)} />
    </View>
  );
}
