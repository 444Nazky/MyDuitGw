import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFinance } from '@/context/FinanceContext';
import { INPUT, LABEL } from '@/lib/ui';

export function LoginScreen() {
  const { signIn, signUp } = useFinance();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const message =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, name.trim());
    setBusy(false);
    if (message) setError(message);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-obsidian"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-7 py-12">
          <View className="items-center">
            <View className="h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-white">
              <Text className="text-[26px] font-extrabold text-black">M</Text>
            </View>
            <Text className="mt-5 text-[30px] font-bold tracking-tight text-ink">My Duit Gw</Text>
            <Text className="mt-1 text-[14px] text-muted">
              {mode === 'signin' ? 'Sign in to sync your data' : 'Create your account'}
            </Text>
          </View>

          <View className="mt-9">
            {mode === 'signup' ? (
              <>
                <Text className={LABEL}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="#63636B"
                  className={INPUT}
                  selectionColor="#7C5CFF"
                />
              </>
            ) : null}

            <Text className={`${LABEL} mt-5`}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@mail.com"
              placeholderTextColor="#63636B"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className={INPUT}
              selectionColor="#7C5CFF"
            />

            <Text className={`${LABEL} mt-5`}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor="#63636B"
              secureTextEntry
              className={INPUT}
              selectionColor="#7C5CFF"
            />

            {error ? (
              <View className="mt-5 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3">
                <Text className="text-[13px] leading-[19px] text-coral">{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => void submit()}
              disabled={busy}
              className="mt-7 h-14 items-center justify-center rounded-2xl bg-neon"
              style={({ pressed }) => (pressed ? { opacity: 0.88 } : null)}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-[16px] font-semibold text-white">
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="mt-5 items-center py-2"
            >
              <Text className="text-[14px] text-muted">
                {mode === 'signin'
                  ? 'No account yet? Create one'
                  : 'Already have an account? Sign in'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
