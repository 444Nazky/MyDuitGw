import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import type {
  DebtRow,
  NewDebtInput,
  ProfileRow,
  SyncLog,
  TransactionRow,
} from '../lib/types';

interface DataValue {
  transactions: TransactionRow[];
  debts: DebtRow[];
  profiles: ProfileRow[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  logs: SyncLog[];
  realtimeStatus: string;
  refresh: () => Promise<void>;
  setDebtStatus: (id: string, status: 'paid' | 'unpaid') => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  addDebt: (input: NewDebtInput) => Promise<void>;
  receiptUrl: (path: string | null) => Promise<string | null>;
}

const DataContext = createContext<DataValue | undefined>(undefined);

function summarize(value: unknown): string {
  try {
    const text = JSON.stringify(value);
    return text.length > 120 ? `${text.slice(0, 117)}...` : text;
  } catch {
    return '';
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const logSequence = useRef(0);

  const pushLog = useCallback((event: string, table: string, payload: unknown) => {
    logSequence.current += 1;
    const entry: SyncLog = {
      id: `log_${logSequence.current}`,
      time: new Date().toLocaleTimeString([], { hour12: false }),
      event,
      table,
      payload: summarize(payload),
      status: 'ok',
    };
    setLogs((current) => [entry, ...current].slice(0, 40));
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [transactionsResult, debtsResult, profilesResult] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('debts').select('*').order('loan_date', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
    ]);

    const firstError =
      transactionsResult.error ?? debtsResult.error ?? profilesResult.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setTransactions((transactionsResult.data as TransactionRow[]) ?? []);
    setDebts((debtsResult.data as DebtRow[]) ?? []);
    setProfiles((profilesResult.data as ProfileRow[]) ?? []);
    setError(null);
    setLastSync(new Date());
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    void refresh();

    const channel = supabase
      .channel('myduitgw-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          pushLog(payload.eventType, 'transactions', payload.new ?? payload.old);
          void refresh();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'debts' },
        (payload) => {
          pushLog(payload.eventType, 'debts', payload.new ?? payload.old);
          void refresh();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          pushLog(payload.eventType, 'profiles', payload.new ?? payload.old);
          void refresh();
        },
      )
      .subscribe((status) => {
        setRealtimeStatus(status.toLowerCase());
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, refresh, pushLog]);

  const setDebtStatus = useCallback(
    async (id: string, status: 'paid' | 'unpaid') => {
      setDebts((current) =>
        current.map((debt) => (debt.id === id ? { ...debt, status } : debt)),
      );
      const { error: updateError } = await supabase
        .from('debts')
        .update({ status })
        .eq('id', id);
      if (updateError) {
        setError(updateError.message);
        void refresh();
      }
    },
    [refresh],
  );

  const deleteDebt = useCallback(
    async (id: string) => {
      setDebts((current) => current.filter((debt) => debt.id !== id));
      const { error: deleteError } = await supabase.from('debts').delete().eq('id', id);
      if (deleteError) {
        setError(deleteError.message);
        void refresh();
      }
    },
    [refresh],
  );

  const addDebt = useCallback(
    async (input: NewDebtInput) => {
      if (!user) return;
      const { error: insertError } = await supabase.from('debts').insert({
        user_id: user.id,
        borrower_name: input.borrowerName,
        borrower_email: input.borrowerEmail?.trim() || null,
        amount: input.amount,
        loan_date: input.loanDate,
        reason: input.reason,
      });
      if (insertError) {
        setError(insertError.message);
        return;
      }
      await refresh();
    },
    [user, refresh],
  );

  const receiptUrl = useCallback(async (path: string | null) => {
    if (!path) return null;
    const { data, error: urlError } = await supabase.storage
      .from('receipts')
      .createSignedUrl(path, 60 * 60);
    if (urlError) return null;
    return data.signedUrl;
  }, []);

  const value = useMemo<DataValue>(
    () => ({
      transactions,
      debts,
      profiles,
      loading,
      error,
      lastSync,
      logs,
      realtimeStatus,
      refresh,
      setDebtStatus,
      deleteDebt,
      addDebt,
      receiptUrl,
    }),
    [
      transactions,
      debts,
      profiles,
      loading,
      error,
      lastSync,
      logs,
      realtimeStatus,
      refresh,
      setDebtStatus,
      deleteDebt,
      addDebt,
      receiptUrl,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside DataProvider');
  return context;
}
