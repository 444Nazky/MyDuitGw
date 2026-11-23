export type Page = 'dashboard' | 'transactions' | 'debts' | 'users' | 'sync';

export const PAGES: { key: Page; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'debts', label: 'Debts' },
  { key: 'users', label: 'Users' },
  { key: 'sync', label: 'Supabase Sync' },
];
