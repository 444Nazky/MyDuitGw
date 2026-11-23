import { useState } from 'react';
import { Bell, Filter, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { PAGES, type Page } from '../lib/nav';
import { Avatar } from './Avatar';

interface TopNavProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

export function TopNav({ page, onNavigate }: TopNavProps) {
  const { profile, user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = profile?.name || user?.email || 'Account';

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-obsidian/90 backdrop-blur">
      <div className="mx-auto flex h-[88px] max-w-[1920px] items-center gap-6 px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[18px] font-extrabold text-black">
            M
          </div>
          <span className="text-[22px] font-semibold tracking-tight">My Duit Gw</span>
        </div>

        <nav className="mx-auto hidden items-center gap-1 rounded-full border border-white/[0.07] bg-card p-1.5 md:flex">
          {PAGES.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`rounded-full px-5 py-2.5 text-[14px] transition-colors ${
                page === item.key
                  ? 'bg-white font-semibold text-black'
                  : 'font-medium text-muted hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] text-muted transition-colors hover:text-ink"
            title="Notifications"
          >
            <Bell size={19} />
          </button>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] text-muted transition-colors hover:text-ink"
            title="Filters"
          >
            <Filter size={19} />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="relative flex items-center"
              aria-label="Account menu"
            >
              <Avatar name={name} url={profile?.avatar_url} size={44} />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-obsidian bg-emerald-400" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-14 w-64 rounded-2xl border border-white/[0.08] bg-raised p-4 shadow-2xl">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
                {profile?.is_admin ? (
                  <span className="mt-2 inline-block rounded-full bg-neon/20 px-2 py-0.5 text-[11px] font-medium text-[#B3A3FF]">
                    Admin
                  </span>
                ) : null}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut();
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-coral transition-colors hover:bg-white/[0.04]"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-8 pb-3 md:hidden">
        {PAGES.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] ${
              page === item.key ? 'bg-white font-semibold text-black' : 'text-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
