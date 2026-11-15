'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme, THEMES } from '@/components/ThemeProvider';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const t = THEMES[theme];
  const [query, setQuery] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/dashboard/laptops?search=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header className={`h-16 border-b flex items-center justify-between px-6 gap-4 transition-colors duration-300 ${t.header} ${t.headerBorder}`}>
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${t.headerText} opacity-60`}>🔍</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по серийному или инвентарному номеру..."
            className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${t.headerInput}`}
          />
        </div>
      </form>

      <div className="flex items-center gap-3">
        <span className={`text-sm ${t.headerText}`}>
          {user?.fullName ?? user?.email ?? 'Пользователь'}
        </span>
        <button
          onClick={handleLogout}
          className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${t.headerButton}`}
        >
          Выйти
        </button>
      </div>
    </header>
  );
}