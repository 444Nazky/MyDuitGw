import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFinance } from '@/context/FinanceContext';

interface ScreenProps {
  children: React.ReactNode;
}

export function Screen({ children }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { refresh } = useFinance();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
            progressBackgroundColor="#161616"
          />
        }
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 22,
          paddingBottom: 136,
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
