import '../global.css';

import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { AuthScreen } from '@/components/AuthScreen';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView className="flex-1 bg-black">
      <SafeAreaProvider>
        <FinanceProvider>
          <StatusBar style="light" />
          <View className="flex-1 bg-black">
            <RootContent />
          </View>
        </FinanceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootContent() {
  const { authLoading, session } = useFinance();

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#F2F2F2" />
      </View>
    );
  }

  if (!session) return <AuthScreen />;

  return <MainStack />;
}

function MainStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    />
  );
}
