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
import { ArrowRight, LockKeyhole, Mail, User } from 'lucide-react-native';
import { useFinance } from '@/context/FinanceContext';

type Mode = 'signin' | 'signup';

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
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
        }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-ink">
            <Text className="text-[18px] font-extrabold text-black">M</Text>
          </View>
          <View>
            <Text className="text-[17px] font-semibold text-ink">My Duit Gw</Text>
            <Text className="text-[12px] text-faint">Personal finance tracker</Text>
          </View>
        </View>

        <View className="mt-6 overflow-hidden rounded-[26px] border border-white/[0.1] bg-white/[0.055] p-6">
          <Text className="text-[26px] font-bold tracking-tight text-ink">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text className="mt-1.5 text-[13.5px] leading-[20px] text-muted">
            {isSignUp
              ? 'Sign up once — the same account opens the web dashboard.'
              : 'Sign in with the account you use on the web dashboard.'}
          </Text>

          <View className="mt-6 gap-3">
            {isSignUp ? (
              <View>
                <Text className="text-[11.5px] font-medium uppercase tracking-[1.4px] text-faint">
                  Username
                </Text>
                <View className="mt-2 h-[52px] flex-row items-center rounded-2xl border border-white/[0.09] bg-white/[0.05] px-4">
                  <User size={17} color="#8E8E96" strokeWidth={1.8} />
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="yourname"
                    placeholderTextColor="#63636B"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#7C5CFF"
                    className="ml-3 flex-1 text-[15px] text-ink"
                  />
                </View>
              </View>
            ) : null}

            <View>
              <Text className="text-[11.5px] font-medium uppercase tracking-[1.4px] text-faint">
                Gmail
              </Text>
              <View className="mt-2 h-[52px] flex-row items-center rounded-2xl border border-white/[0.09] bg-white/[0.05] px-4">
                <Mail size={17} color="#8E8E96" strokeWidth={1.8} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@gmail.com"
                  placeholderTextColor="#63636B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  selectionColor="#7C5CFF"
                  className="ml-3 flex-1 text-[15px] text-ink"
                />
              </View>
            </View>

            <View>
              <Text className="text-[11.5px] font-medium uppercase tracking-[1.4px] text-faint">
                Password
              </Text>
              <View className="mt-2 h-[52px] flex-row items-center rounded-2xl border border-white/[0.09] bg-white/[0.05] px-4">
                <LockKeyhole size={17} color="#8E8E96" strokeWidth={1.8} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#63636B"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  selectionColor="#7C5CFF"
                  onSubmitEditing={() => void submit()}
                  className="ml-3 flex-1 text-[15px] text-ink"
                />
              </View>
            </View>
          </View>

          {message ? (
            <Text className="mt-4 rounded-xl border border-coral/20 bg-coral/[0.08] px-4 py-3 text-[13px] leading-[19px] text-[#FFB4B4]">
              {message}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void submit()}
            className="mt-5 h-[52px] flex-row items-center justify-center gap-2 rounded-2xl bg-neon"
            style={({ pressed }) => (pressed || busy ? { opacity: 0.82 } : null)}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-[15px] font-semibold text-white">
                  {isSignUp ? 'Create account' : 'Sign in'}
                </Text>
                <ArrowRight size={17} color="#FFFFFF" strokeWidth={2} />
              </>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={switchMode}
            className="mt-4 h-11 items-center justify-center rounded-xl border border-white/[0.07]"
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
          >
            <Text className="text-[13px] text-muted">
              {isSignUp ? 'Already have an account? Sign in' : 'No account yet? Sign up first'}
            </Text>
          </Pressable>
        </View>

        <Text className="mt-5 text-center text-[12px] leading-[18px] text-faint">
          One account for the app and myduitgw2.web.app. Sign in on the web with the same Gmail and
          password to follow your statistics.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
