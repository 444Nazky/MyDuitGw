export type Page =
  | 'dashboard'
  | 'transactions'
  | 'debts'
  | 'users'
  | 'server'
  | 'sync'
  | 'settings';

export const PAGES: { key: Page; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'debts', label: 'Debts' },
  { key: 'users', label: 'Users' },
  { key: 'server', label: 'Server' },
  { key: 'sync', label: 'Supabase Sync' },
  { key: 'settings', label: 'Settings' },
];
