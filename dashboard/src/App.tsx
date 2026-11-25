import { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { TopNav } from './components/TopNav';
import { DataProvider, useData } from './data/DataProvider';
import type { Page } from './lib/nav';
import { DashboardPage } from './pages/Dashboard';
import { DebtsPage } from './pages/Debts';
import { LoginPage } from './pages/Login';
import { ServerPage } from './pages/Server';
import { SettingsPage } from './pages/Settings';
import { SyncMonitorPage } from './pages/SyncMonitor';
import { TransactionsPage } from './pages/Transactions';
import { UsersPage } from './pages/Users';

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

function Root() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian text-muted">
        Loading My Duit Gw...
      </div>
    );
  }

  if (!session) return <LoginPage />;

  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  );
}

function Shell() {
  const [page, setPage] = useState<Page>('dashboard');
  const { error } = useData();

  return (
    <div className="min-h-screen bg-obsidian">
      <TopNav page={page} onNavigate={setPage} />
      {error ? (
        <div className="mx-auto mt-5 max-w-[1920px] px-8">
          <div className="rounded-2xl border border-coral/30 bg-coral/10 px-5 py-3 text-[13.5px] text-coral">
            {error}
          </div>
        </div>
      ) : null}
      <main>
        {page === 'dashboard' ? <DashboardPage onNavigate={setPage} /> : null}
        {page === 'transactions' ? <TransactionsPage /> : null}
        {page === 'debts' ? <DebtsPage /> : null}
        {page === 'users' ? <UsersPage /> : null}
        {page === 'server' ? <ServerPage /> : null}
        {page === 'sync' ? <SyncMonitorPage /> : null}
        {page === 'settings' ? <SettingsPage /> : null}
      </main>
    </div>
  );
}
