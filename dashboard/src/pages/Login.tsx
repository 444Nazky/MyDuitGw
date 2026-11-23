import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

export function LoginPage() {
  const { signIn, signUp, error } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, name.trim());
    setBusy(false);
    if (result.message) setMessage(result.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-6 py-12">
      <div className="grid w-full max-w-[980px] overflow-hidden rounded-[32px] border border-white/[0.07] bg-card lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-neon/25 via-[#161618] to-[#161618] p-10 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[18px] font-extrabold text-black">
              M
            </div>
            <span className="text-[20px] font-semibold">My Duit Gw</span>
          </div>
          <div>
            <h1 className="text-[34px] font-bold leading-tight tracking-tight">
              Your money,
              <br />
              clearly in view.
            </h1>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
              Track income, spending and loans synced live from the mobile app and Supabase.
            </p>
          </div>
          <p className="text-xs text-faint">Personal finance &amp; peer-to-peer loan tracker</p>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="text-[26px] font-bold tracking-tight">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {mode === 'signin'
              ? 'Use the same account as your dashboard.'
              : 'Create the account that owns this data.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {mode === 'signup' ? (
              <label className="block">
                <span className="mb-2 block text-sm text-muted">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="field"
                  autoComplete="name"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                placeholder="you@mail.com"
                className="field"
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-muted">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="field"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </label>

            {message || error ? (
              <p className="rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-[#E7C9A8]">
                {message || error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-2xl bg-neon text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setMessage(null);
            }}
            className="mt-5 text-sm text-muted transition-colors hover:text-ink"
          >
            {mode === 'signin'
              ? 'No account yet? Create one'
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
