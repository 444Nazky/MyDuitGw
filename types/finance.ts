export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Kuota'
  | 'Shopping'
  | 'Food'
  | 'Salary'
  | 'Bills'
  | 'Game'
  | 'Etc';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  note?: string;
  date: string; // ISO timestamp
}

export interface Debt {
  id: string;
  borrowerName: string;
  amount: number;
  loanDate: string; // ISO timestamp
  reason: string;
  receiptUri?: string; // local URI in phase 1, storage URL in phase 2
  status: 'unpaid' | 'paid';
}

export type CurrencyCode = 'IDR' | 'USD';

export interface Profile {
  name: string;
  email: string;
  phone: string;
  username: string;
  avatarUri?: string;
}

export type TransactionDraft = Omit<Transaction, 'id'>;

export type DebtDraft = Omit<Debt, 'id' | 'status'>;

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  'Kuota',
  'Shopping',
  'Food',
  'Salary',
  'Bills',
  'Game',
  'Etc',
];

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Kuota: '#7C5CFF',
  Shopping: '#FF5F5F',
  Food: '#FFB020',
  Salary: '#7C5CFF',
  Bills: '#5EA8FF',
  Game: '#C77DFF',
  Etc: '#8E8E96',
};
