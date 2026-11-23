import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isCurrentMonth } from '@/lib/format';
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
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  categoryBreakdown: CategorySpend[];
  totalLentOut: number;
  activeDebtCount: number;
  settledDebtCount: number;
  addTransaction: (draft: TransactionDraft) => void;
  updateTransaction: (id: string, draft: TransactionDraft) => void;
  deleteTransaction: (id: string) => void;
  addDebt: (draft: DebtDraft) => void;
  toggleDebtStatus: (id: string) => void;
  deleteDebt: (id: string) => void;
  setCurrency: (currency: CurrencyCode) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  resetData: () => void;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

const STORAGE_KEY = 'myduitgw.state.v1';

export const EMPTY_PROFILE: Profile = {
  name: '',
  email: '',
  phone: '',
  username: '',
};

let sequence = 0;
function createId(prefix: string): string {
  sequence += 1;
  return `${prefix}_${Date.now().toString(36)}_${sequence}`;
}

interface StoredState {
  transactions?: Transaction[];
  debts?: Debt[];
  profile?: Profile;
  currency?: CurrencyCode;
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const stored = JSON.parse(raw) as StoredState;
        if (Array.isArray(stored.transactions)) setTransactions(stored.transactions);
        if (Array.isArray(stored.debts)) setDebts(stored.debts);
        if (stored.profile) setProfile({ ...EMPTY_PROFILE, ...stored.profile });
        if (stored.currency === 'USD' || stored.currency === 'IDR') {
          setCurrencyState(stored.currency);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ transactions, debts, profile, currency }),
    ).catch(() => undefined);
  }, [hydrated, transactions, debts, profile, currency]);

  const addTransaction = useCallback((draft: TransactionDraft) => {
    const transaction: Transaction = { ...draft, id: createId('txn') };
    setTransactions((current) => [transaction, ...current]);
  }, []);

  const updateTransaction = useCallback((id: string, draft: TransactionDraft) => {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === id ? { ...draft, id } : transaction,
      ),
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
  }, []);

  const addDebt = useCallback((draft: DebtDraft) => {
    const debt: Debt = { ...draft, id: createId('debt'), status: 'unpaid' };
    setDebts((current) => [debt, ...current]);
  }, []);

  const toggleDebtStatus = useCallback((id: string) => {
    setDebts((current) =>
      current.map((debt) =>
        debt.id === id
          ? { ...debt, status: debt.status === 'paid' ? 'unpaid' : 'paid' }
          : debt,
      ),
    );
  }, []);

  const deleteDebt = useCallback((id: string) => {
    setDebts((current) => current.filter((debt) => debt.id !== id));
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((current) => ({ ...current, ...patch }));
  }, []);

  const resetData = useCallback(() => {
    setTransactions([]);
    setDebts([]);
    setProfile(EMPTY_PROFILE);
  }, []);

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    const spendByCategory = new Map<TransactionCategory, number>();

    for (const transaction of transactions) {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }

      if (isCurrentMonth(new Date(transaction.date))) {
        if (transaction.type === 'income') {
          monthlyIncome += transaction.amount;
        } else {
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

    return {
      totalBalance: totalIncome - totalExpense,
      monthlyIncome,
      monthlyExpense,
      monthlyNet: monthlyIncome - monthlyExpense,
      categoryBreakdown,
      totalLentOut: unpaidDebts.reduce((sum, debt) => sum + debt.amount, 0),
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
      ...summary,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addDebt,
      toggleDebtStatus,
      deleteDebt,
      setCurrency,
      updateProfile,
      resetData,
    }),
    [
      transactions,
      debts,
      profile,
      currency,
      hydrated,
      summary,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addDebt,
      toggleDebtStatus,
      deleteDebt,
      setCurrency,
      updateProfile,
      resetData,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used inside a FinanceProvider');
  }
  return context;
}
