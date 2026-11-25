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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { useFinance } from '@/context/FinanceContext';

type Mode = 'signin' | 'signup';

const FIELD =
  'mt-2 h-[54px] rounded-[14px] border border-white/[0.08] bg-white/[0.055] px-4 text-[15px] text-ink';

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useFinance();

  const [mode, setMode] = useState<Mode>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'signup';

  const submit = async () => {
    if (busy) return;

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (isSignUp && cleanUsername.length < 3) {
      setMessage('Username must be at least 3 characters.');
      return;
    }
    if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
      setMessage('Enter a valid Gmail address.');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setMessage(null);
    setBusy(true);
    const error = isSignUp
      ? await signUp(cleanEmail, password, cleanUsername)
      : await signIn(cleanEmail, password);
    setBusy(false);
    if (error) setMessage(error);
  };

  const switchMode = () => {
    setMode(isSignUp ? 'signin' : 'signup');
    setMessage(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 26,
        }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-[12px] bg-ink">
            <Text className="text-[17px] font-extrabold text-black">M</Text>
          </View>
          <Text className="text-[14px] font-medium text-muted">My Duit Gw</Text>
        </View>

        <Text className="mt-12 text-[33px] font-bold leading-[38px] tracking-tight text-ink">
          {isSignUp ? 'Create account' : 'Welcome back'}
        </Text>
        <Text className="mt-2.5 text-[14.5px] leading-[21px] text-muted">
          {isSignUp
            ? 'One account for the app and the web dashboard.'
            : 'Sign in with the account you use on the web dashboard.'}
        </Text>

        <View className="mt-9">
          {isSignUp ? (
            <View>
              <Text className="text-[12.5px] font-medium text-[#9C9CA6]">Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="yourname"
                placeholderTextColor="#7C7C86"
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor="#7C5CFF"
                className={FIELD}
              />
            </View>
          ) : null}

          <View className={isSignUp ? 'mt-5' : ''}>
            <Text className="text-[12.5px] font-medium text-[#9C9CA6]">Gmail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@gmail.com"
              placeholderTextColor="#7C7C86"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              selectionColor="#7C5CFF"
              className={FIELD}
            />
          </View>

          <View className="mt-5">
            <Text className="text-[12.5px] font-medium text-[#9C9CA6]">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor="#7C7C86"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              selectionColor="#7C5CFF"
              onSubmitEditing={() => void submit()}
              className={FIELD}
            />
          </View>

          {message ? (
            <Text className="mt-4 text-[13px] leading-[19px] text-[#FF9B9B]">{message}</Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void submit()}
            className="mt-7 h-[54px] flex-row items-center justify-center gap-2 rounded-[16px] bg-neon"
            style={({ pressed }) => (pressed || busy ? { opacity: 0.85 } : null)}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-[15.5px] font-semibold text-white">
                  {isSignUp ? 'Create account' : 'Sign in'}
                </Text>
                <ArrowRight size={17} color="#FFFFFF" strokeWidth={2} />
              </>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={switchMode}
            hitSlop={12}
            className="mt-5 items-center py-2"
          >
            <Text className="text-[13.5px] text-muted">
              {isSignUp ? 'Already have an account? Sign in' : 'No account yet? Sign up'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
