import { useEffect, useState } from 'react';
import { Check, Download, ImageOff, X } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../data/DataProvider';
import { formatDateTime, formatMoney } from '../lib/format';
import type { DebtRow } from '../lib/types';

interface ReceiptModalProps {
  debt: DebtRow | null;
  onClose: () => void;
}

export function ReceiptModal({ debt, onClose }: ReceiptModalProps) {
  const { receiptUrl, setDebtStatus } = useData();
  const { profile } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const path = debt?.receipt_path;
    if (!path) {
      setUrl(null);
      return;
    }
    setLoading(true);
    receiptUrl(path).then((next) => {
      if (!active) return;
      setUrl(next);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [debt, receiptUrl]);

  if (!debt) return null;

  const currency = profile?.currency ?? 'IDR';
  const paid = debt.status === 'paid';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-[900px] overflow-y-auto rounded-[28px] border border-white/[0.08] bg-card p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[26px] font-bold tracking-tight">Transfer Receipt</h2>
            <p className="mt-1 text-sm text-muted">
              Proof of transfer uploaded from mobile · Supabase Storage
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:text-ink"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101012]">
          {loading ? (
            <div className="flex h-[320px] items-center justify-center text-muted">
              Loading receipt...
            </div>
          ) : url ? (
            <img src={url} alt="Transfer receipt" className="max-h-[440px] w-full object-contain" />
          ) : (
            <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-faint">
              <ImageOff size={26} />
              <span className="text-sm">No receipt attached</span>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
          <Detail label="Borrower" value={debt.borrower_name} />
          <Detail label="Amount" value={formatMoney(Number(debt.amount), currency)} />
          <Detail label="Date & Time" value={formatDateTime(debt.loan_date)} />
          <Detail label="Loan Reason" value={debt.reason || 'No reason recorded.'} />
          <Detail label="Status" value={paid ? 'Paid' : 'Pending'} />
          <Detail label="Uploaded via" value="My Duit Gw mobile app" />
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            onClick={onClose}
            className="h-12 min-w-[140px] flex-1 rounded-2xl border border-white/10 text-[15px] font-medium text-[#D5D5DC] transition-colors hover:bg-white/[0.04]"
          >
            Close
          </button>
          <a
            href={url ?? undefined}
            download
            className={`flex h-12 min-w-[160px] flex-1 items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-semibold text-black transition-opacity hover:opacity-90 ${
              url ? '' : 'pointer-events-none opacity-40'
            }`}
          >
            <Download size={16} />
            Download Receipt
          </a>
          {!paid ? (
            <button
              onClick={() => {
                void setDebtStatus(debt.id, 'paid');
                onClose();
              }}
              className="flex h-12 min-w-[150px] flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Check size={16} />
              Mark as Paid
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11.5px] font-medium uppercase tracking-[1.2px] text-faint">{label}</p>
      <p className="mt-1.5 text-[15px] text-ink">{value}</p>
    </div>
  );
}
