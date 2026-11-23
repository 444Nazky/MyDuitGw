export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Kuota'
  | 'Shopping'
  | 'Food'
  | 'Salary'
  | 'Bills'
  | 'Game'
  | 'Etc';

export type CurrencyCode = 'USD' | 'IDR';

export type DebtStatus = 'unpaid' | 'paid';

export interface TransactionRow {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number | string;
  category: TransactionCategory;
  note: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface DebtRow {
  id: string;
  user_id: string;
  borrower_name: string;
  borrower_email: string | null;
  amount: number | string;
  loan_date: string;
  reason: string;
  receipt_path: string | null;
  status: DebtStatus;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  avatar_url: string | null;
  currency: CurrencyCode;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewDebtInput {
  borrowerName: string;
  borrowerEmail?: string;
  amount: number;
  loanDate: string;
  reason: string;
}

export interface SyncLog {
  id: string;
  time: string;
  event: string;
  table: string;
  payload: string;
  status: string;
}
