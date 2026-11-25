import { useState } from 'react';
import { Check, Coins } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import type { CurrencyCode } from '../lib/types';

const OPTIONS: { value: CurrencyCode; label: string; hint: string }[] = [
  { value: 'IDR', label: 'Rupiah', hint: 'Rp 1.000.000' },
  { value: 'USD', label: 'US Dollar', hint: '$ 61.35' },
];

export function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [busy, setBusy] = useState<CurrencyCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const current: CurrencyCode = profile?.currency ?? 'IDR';

  const choose = async (next: CurrencyCode) => {
    if (!profile || next === current) return;
    setBusy(next);
    setError(null);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ currency: next })
      .eq('id', profile.id);
    setBusy(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await refreshProfile();
  };

  return (
    <div className="mx-auto max-w-[1920px] px-8 py-7">
      <h1 className="text-[32px] font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-[14px] text-muted">
        Preferences are stored on your Supabase profile, so the app and the dashboard agree.
      </p>

      <section className="card mt-6 max-w-2xl p-6">
        <div className="flex items-center gap-2.5">
          <Coins size={18} className="text-[#9B87FF]" />
          <h2 className="text-[17px] font-semibold">Currency</h2>
        </div>
        <p className="mt-1 text-[13px] text-muted">
          Used for every amount on the dashboard and in the mobile app.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((option) => {
            const active = current === option.value;
            return (
              <button
                key={option.value}
                onClick={() => void choose(option.value)}
                disabled={busy !== null}
                className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors ${
                  active
                    ? 'border-neon/60 bg-neon/[0.12]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]'
                }`}
              >
                <div>
                  <p className="text-[15px] font-semibold">{option.label}</p>
                  <p className="mt-1 text-[12.5px] text-muted">{option.hint}</p>
                </div>
                {active ? <Check size={18} className="text-[#B3A3FF]" /> : null}
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] text-coral">
            {error}
          </p>
        ) : null}

        <p className="mt-5 text-[12.5px] text-faint">
          Amounts are stored as USD and converted at a fixed rate of Rp 16.300 per dollar, so
          switching currency never rewrites your data.
        </p>
      </section>
    </div>
  );
}
