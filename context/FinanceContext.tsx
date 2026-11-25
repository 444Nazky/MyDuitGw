import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isCurrentMonth, USD_TO_IDR } from '@/lib/format';
import type {
  CurrencyCode,
  Debt,
  DebtDraft,
  Profile,
  Transaction,
  TransactionCategory,
  TransactionDraft,
} from '@/types/finance';

interface CategorySpend {
  category: TransactionCategory;
  amount: number;
  share: number;
}

interface FinanceContextValue {
  transactions: Transaction[];
  debts: Debt[];
  profile: Profile;
  currency: CurrencyCode;
  hydrated: boolean;
  refresh: () => Promise<void>;
  session: Session | null;
  user: User | null;
  authLoading: boolean;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  categoryBreakdown: CategorySpend[];
  totalLentOut: number;
  activeDebtCount: number;
  settledDebtCount: number;
  addTransaction: (draft: TransactionDraft) => Promise<void>;
  updateTransaction: (id: string, draft: TransactionDraft) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addDebt: (draft: DebtDraft) => Promise<string | null>;
  toggleDebtStatus: (id: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  resetData: () => Promise<void>;
  resetProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, username: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  receiptUrl: (path: string | null) => Promise<string | null>;
}

interface TransactionRow {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number | string;
  category: TransactionCategory;
  note: string | null;
  date: string;
  created_at?: string;
}

interface DebtRow {
  id: string;
  user_id: string;
  borrower_name: string;
  borrower_email: string | null;
  amount: number | string;
  loan_date: string;
  reason: string;
  receipt_path: string | null;
  status: 'unpaid' | 'paid';
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  avatar_url: string | null;
  currency: CurrencyCode;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export const EMPTY_PROFILE: Profile = {
  name: '',
  email: '',
  phone: '',
  username: '',
};

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    category: row.category,
    note: row.note ?? undefined,
    date: row.date,
    createdAt: row.created_at,
  };
}

function toDebt(row: DebtRow): Debt {
  return {
    id: row.id,
    borrowerName: row.borrower_name,
    amount: Number(row.amount),
    loanDate: row.loan_date,
    reason: row.reason,
    receiptUri: row.receipt_path ?? undefined,
    status: row.status,
  };
}

function toProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    email: row.email,
    phone: row.phone,
    username: row.username,
    avatarUri: row.avatar_url ?? undefined,
  };
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [currency, setCurrencyState] = useState<CurrencyCode>('IDR');
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const loadData = useCallback(async (userId: string) => {
    const [transactionResult, debtResult, profileResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('loan_date', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    ]);

    if (transactionResult.data) setTransactions(transactionResult.data.map(toTransaction));
    if (debtResult.data) setDebts(debtResult.data.map(toDebt));

    if (profileResult.data) {
      const row = profileResult.data as ProfileRow;
      setProfile(toProfile(row));
      setCurrencyState(row.currency === 'IDR' ? 'IDR' : 'USD');
    } else {
      const { data: created } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: '',
          email: '',
          phone: '',
          username: '',
          currency: 'IDR',
        })
        .select()
        .maybeSingle();
      if (created) setProfile(toProfile(created as ProfileRow));
    }
    setHydrated(true);
  }, []);

  const userId = session?.user.id;

  const refresh = useCallback(async () => {
    if (!userId) return;
    await loadData(userId);
  }, [userId, loadData]);

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setDebts([]);
      setProfile(EMPTY_PROFILE);
      setHydrated(true);
      return;
    }

    setHydrated(false);
    void loadData(userId);

    const channel = supabase
      .channel('myduitgw-mobile')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        void loadData(userId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts' }, () => {
        void loadData(userId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        void loadData(userId);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, loadData]);

  const addTransaction = useCallback(
    async (draft: TransactionDraft) => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: draft.type,
          amount: draft.amount,
          category: draft.category,
          note: draft.note ?? null,
          date: draft.date,
        })
        .select()
        .single();
      if (error || !data) return;
      setTransactions((current) => [toTransaction(data as TransactionRow), ...current]);
    },
    [userId],
  );

  const updateTransaction = useCallback(
    async (id: string, draft: TransactionDraft) => {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          type: draft.type,
          amount: draft.amount,
          category: draft.category,
          note: draft.note ?? null,
          date: draft.date,
        })
        .eq('id', id)
        .select()
        .single();
      if (error || !data) return;
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === id ? toTransaction(data as TransactionRow) : transaction,
        ),
      );
    },
    [],
  );

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setTransactions((current) => current.filter((transaction) => transaction.id !== id));
  }, []);

  const uploadReceipt = useCallback(
    async (uri: string, debtId: string) => {
      if (!userId) return null;
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const path = `${userId}/${debtId}.jpg`;
        const { error } = await supabase.storage
          .from('receipts')
          .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
        return error ? null : path;
      } catch {
        return null;
      }
    },
    [userId],
  );

  const addDebt = useCallback(
    async (draft: DebtDraft) => {
      if (!userId) return 'You are not signed in.';

      // debts.id is a uuid with a database default; never send a custom string
      // here or Postgres rejects the whole insert.
      const { data, error } = await supabase
        .from('debts')
        .insert({
          user_id: userId,
          borrower_name: draft.borrowerName,
          amount: draft.amount,
          loan_date: draft.loanDate,
          reason: draft.reason,
        })
        .select()
        .single();

      if (error || !data) return error?.message ?? 'Could not save this debt.';

      const row = data as DebtRow;
      let receiptPath: string | null = null;
      if (draft.receiptUri && !draft.receiptUri.startsWith('http')) {
        const uploaded = await uploadReceipt(draft.receiptUri, row.id);
        if (uploaded) {
          const { error: receiptError } = await supabase
            .from('debts')
            .update({ receipt_path: uploaded })
            .eq('id', row.id);
          if (!receiptError) receiptPath = uploaded;
        }
      }

      setDebts((current) => [
        { ...toDebt(row), receiptUri: receiptPath ?? undefined },
        ...current,
      ]);
      return null;
    },
    [userId, uploadReceipt],
  );

  const toggleDebtStatus = useCallback(async (id: string) => {
    const current = debts.find((debt) => debt.id === id);
    if (!current) return;
    const status = current.status === 'paid' ? 'unpaid' : 'paid';
    const { error } = await supabase.from('debts').update({ status }).eq('id', id);
    if (error) return;
    setDebts((items) =>
      items.map((debt) => (debt.id === id ? { ...debt, status } : debt)),
    );
  }, [debts]);

  const deleteDebt = useCallback(async (id: string) => {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (!error) setDebts((current) => current.filter((debt) => debt.id !== id));
  }, []);

  const setCurrency = useCallback(
    async (next: CurrencyCode) => {
      if (!userId) return;
      setCurrencyState(next);
      await supabase.from('profiles').update({ currency: next }).eq('id', userId);
    },
    [userId],
  );

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!userId) return;
      const row: Record<string, string | null> = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.email !== undefined) row.email = patch.email;
      if (patch.phone !== undefined) row.phone = patch.phone;
      if (patch.username !== undefined) row.username = patch.username;
      if (patch.avatarUri !== undefined) row.avatar_url = patch.avatarUri;
      setProfile((current) => ({ ...current, ...patch }));
      if (Object.keys(row).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .upsert({ id: userId, ...row }, { onConflict: 'id' });
        if (!error && (patch.username !== undefined || patch.name !== undefined)) {
          // Mirror the values the app writes so a later sign-in or a rebuilt
          // profile row still shows the same username on the dashboard.
          await supabase.auth.updateUser({
            data: {
              ...(patch.username !== undefined ? { username: patch.username } : {}),
              ...(patch.name !== undefined ? { name: patch.name } : {}),
            },
          });
        }
      }
    },
    [userId],
  );

  const resetProfile = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, name: '', email: '', phone: '', username: '', avatar_url: null },
        { onConflict: 'id' },
      );
    if (error) return;
    setProfile(EMPTY_PROFILE);
    await supabase.auth.updateUser({ data: { name: '', username: '' } });
  }, [userId]);

  const resetData = useCallback(async () => {
    if (!userId) return;
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', userId),
      supabase.from('debts').delete().eq('user_id', userId),
    ]);
    setTransactions([]);
    setDebts([]);
    setProfile(EMPTY_PROFILE);
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, name: username } },
    });
    if (error) return error.message;

    // Keep the shared profile row in sync even if the DB trigger is missing,
    // so the web dashboard can show the same username.
    if (!data.session) {
      if ((data.user?.identities?.length ?? 0) === 0) {
        return 'This Gmail is already registered. Sign in instead.';
      }
      return 'Account created. Sign in to continue.';
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .upsert({ id: data.user.id, email, name: username, username }, { onConflict: 'id' });
    }

    return null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const receiptUrl = useCallback(async (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(path, 60 * 60);
    return error ? null : data.signedUrl;
  }, []);

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    const spendByCategory = new Map<TransactionCategory, number>();

    for (const transaction of transactions) {
      if (transaction.type === 'income') totalIncome += transaction.amount;
      else totalExpense += transaction.amount;

      if (isCurrentMonth(new Date(transaction.date))) {
        if (transaction.type === 'income') monthlyIncome += transaction.amount;
        else {
          monthlyExpense += transaction.amount;
          spendByCategory.set(
            transaction.category,
            (spendByCategory.get(transaction.category) ?? 0) + transaction.amount,
          );
        }
      }
    }

    const categoryBreakdown: CategorySpend[] = Array.from(spendByCategory.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        share: monthlyExpense > 0 ? amount / monthlyExpense : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const unpaidDebts = debts.filter((debt) => debt.status === 'unpaid');

    // Money that is currently lent out has left the balance. Marking a loan as
    // paid (or deleting it) drops it from this sum, so the money comes back.
    const totalLentOut = unpaidDebts.reduce((sum, debt) => sum + debt.amount, 0);

    return {
      totalBalance: totalIncome - totalExpense - totalLentOut,
      monthlyIncome,
      monthlyExpense,
      monthlyNet: monthlyIncome - monthlyExpense,
      categoryBreakdown,
      totalLentOut,
      activeDebtCount: unpaidDebts.length,
      settledDebtCount: debts.length - unpaidDebts.length,
    };
  }, [transactions, debts]);

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions,
      debts,
      profile,
      currency,
      hydrated,
      session,
      user: session?.user ?? null,
      authLoading,
      ...summary,
      refresh,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addDebt,
      toggleDebtStatus,
      deleteDebt,
      setCurrency,
      updateProfile,
      resetData,
      resetProfile,
      signIn,
      signUp,
      signOut,
      receiptUrl,
    }),
    [
      transactions,
      debts,
      profile,
      currency,
      hydrated,
      session,
      authLoading,
      summary,
      refresh,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addDebt,
      toggleDebtStatus,
      deleteDebt,
      setCurrency,
      updateProfile,
      resetData,
      resetProfile,
      signIn,
      signUp,
      signOut,
      receiptUrl,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside a FinanceProvider');
  return context;
}
