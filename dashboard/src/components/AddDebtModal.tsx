import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../data/DataProvider';
import { USD_TO_IDR } from '../lib/format';

interface AddDebtModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddDebtModal({ open, onClose }: AddDebtModalProps) {
  const { addDebt } = useData();
  const { profile } = useAuth();
  const currency = profile?.currency ?? 'USD';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loanDate, setLoanDate] = useState(() =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const numeric = Number(amount.replace(/,/g, ''));
    if (!name.trim()) {
      setError('Enter a borrower name.');
      return;
    }
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    setSaving(true);
    await addDebt({
      borrowerName: name.trim(),
      borrowerEmail: email.trim() || undefined,
      amount: currency === 'IDR' ? numeric / USD_TO_IDR : numeric,
      loanDate: new Date(loanDate).toISOString(),
      reason: reason.trim(),
    });
    setSaving(false);
    setName('');
    setEmail('');
    setAmount('');
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[560px] rounded-[28px] border border-white/[0.08] bg-card p-7"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[24px] font-bold tracking-tight">Add New Debt</h2>
            <p className="mt-1 text-sm text-muted">
              Records a loan in {currency === 'IDR' ? 'Rupiah' : 'US Dollar'}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:text-ink"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Borrower Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter full name"
              className="field"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm text-muted">
                Amount ({currency === 'IDR' ? 'Rp' : '$'})
              </span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                placeholder={currency === 'IDR' ? '50.000' : '0.00'}
                className="field"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-muted">Date & Time</span>
              <input
                type="datetime-local"
                value={loanDate}
                onChange={(event) => setLoanDate(event.target.value)}
                className="field"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-muted">Email (optional)</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="name@mail.com"
              className="field"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-muted">Reason for Loan</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="What is this loan for?"
              rows={3}
              className="w-full rounded-2xl border border-white/[0.08] bg-[#101012] p-4 text-[15px] text-ink placeholder:text-faint"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-coral">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 h-14 w-full rounded-2xl bg-neon text-[16px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Debt Record'}
        </button>
      </form>
    </div>
  );
}
