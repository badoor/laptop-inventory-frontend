'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useTheme, THEMES } from '@/components/ThemeProvider';
import { useAuth } from '@/lib/auth-context';

const LAPTOP_STATUSES = [
  { value: 'RECEIVED', label: 'Поступившие' },
  { value: 'REFACTORING', label: 'На доработке' },
  { value: 'REPAIR', label: 'В ремонте' },
  { value: 'FOR_SALE', label: 'В продаже' },
  { value: 'SOLD', label: 'Продан' },
  { value: 'ARCHIVED', label: 'Списан' },
];

const COMPONENT_CATEGORIES = [
  { value: 'RAM', label: 'Оперативная память' },
  { value: 'HDD', label: 'HDD' },
  { value: 'SSD', label: 'SSD' },
  { value: 'BATTERY', label: 'Аккумуляторы' },
  { value: 'MOTHERBOARD', label: 'Материнские платы' },
  { value: 'SCREEN', label: 'Экраны' },
  { value: 'KEYBOARD', label: 'Клавиатуры' },
  { value: 'MOUSE', label: 'Мыши' },
  { value: 'CHARGER', label: 'Блоки питания' },
  { value: 'OTHER', label: 'Другое' },
];

type Counts = Record<string, number>;

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status');
  const currentCategory = searchParams.get('category');

  const { theme, cycleTheme } = useTheme();
  const t = THEMES[theme];
  const { user } = useAuth(); // <-- добавьте эту строку

  const [laptopCounts, setLaptopCounts] = useState<Counts>({});
  const [componentCounts, setComponentCounts] = useState<Counts>({});
  const [expanded, setExpanded] = useState<'laptops' | 'components' | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/laptops').catch(() => []),
      apiFetch('/components').catch(() => []),
    ]).then(([laptops, components]) => {
      const lc: Counts = {};
      if (Array.isArray(laptops)) {
        laptops.forEach((l: any) => {
          lc[l.status] = (lc[l.status] ?? 0) + 1;
        });
      }
      const cc: Counts = {};
      if (Array.isArray(components)) {
        components.forEach((c: any) => {
          const cat = c.type?.category;
          if (cat) cc[cat] = (cc[cat] ?? 0) + 1;
        });
      }
      setLaptopCounts(lc);
      setComponentCounts(cc);
    });
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/laptops')) setExpanded('laptops');
    else if (pathname.startsWith('/dashboard/components')) setExpanded('components');
  }, [pathname]);

  const toggle = (section: 'laptops' | 'components') => {
    setExpanded((prev) => (prev === section ? null : section));
  };

  const totalLaptops = Object.values(laptopCounts).reduce((a, b) => a + b, 0);
  const totalComponents = Object.values(componentCounts).reduce((a, b) => a + b, 0);

  const badge = (count: number, active = false) => (
    <span
      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
        active ? t.asideBadgeActive : count === 0 ? 'opacity-50 ' + t.asideBadge : t.asideBadge
      }`}
    >
      {count}
    </span>
  );

  return (
    <aside
      className={`w-64 flex flex-col shadow-sm transition-colors duration-300 ${t.aside}`}
    >
      <div
        className={`p-4 text-xl font-bold border-b transition-colors duration-300 ${t.asideTitle}`}
      >
        Фирма
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {/* Дашборд */}
        <Link
          href="/dashboard"
          className={`block px-3 py-2 rounded-lg transition-colors duration-200 ${
            pathname === '/dashboard' ? t.asideLinkActive : `${t.asideLink} ${t.asideLinkHover}`
          }`}
        >
          🏠 Дашборд
        </Link>

        {/* Ноутбуки */}
        <div>
          <div
            className={`flex items-center justify-between rounded-lg transition-colors duration-200 ${
              pathname.startsWith('/dashboard/laptops')
                ? t.asideLinkActive
                : `${t.asideLink} ${t.asideLinkHover}`
            }`}
          >
            <Link
              href="/dashboard/laptops"
              className="flex-1 flex items-center gap-2 px-3 py-2"
            >
              💻 Ноутбуки
            </Link>
            <span className="mr-2">
              {badge(totalLaptops, pathname.startsWith('/dashboard/laptops'))}
            </span>
            <button
              onClick={() => toggle('laptops')}
              className="px-2 py-2"
              aria-label="Раскрыть статусы ноутбуков"
            >
              <span
                className={`inline-block transition-transform duration-300 ${
                  expanded === 'laptops' ? 'rotate-90' : ''
                }`}
              >
                ▸
              </span>
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expanded === 'laptops' ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
            }`}
          >
            <div className={`ml-4 space-y-1 border-l pl-2 ${t.asideBorder}`}>
              {LAPTOP_STATUSES.map((s) => {
                const count = laptopCounts[s.value] ?? 0;
                const isActive = currentStatus === s.value;
                return (
                  <Link
                    key={s.value}
                    href={`/dashboard/laptops?status=${s.value}`}
                    className={`flex items-center justify-between px-2 py-1 text-sm rounded-lg transition-colors duration-200 ${
                      isActive
                        ? t.asideSubLinkActive
                        : `${t.asideSubLink} ${t.asideSubLinkHover}`
                    }`}
                  >
                    <span>{s.label}</span>
                    {badge(count, isActive)}
                  </Link>
                );
              })}
              <Link
                href="/dashboard/laptops/new"
                className={`block px-2 py-1 text-sm rounded-lg transition-colors duration-200 ${
                  theme === 'gradient'
                    ? 'text-green-300 hover:text-green-200 hover:bg-white/10'
                    : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                }`}
              >
                ➕ Добавить ноутбук
              </Link>
            </div>
          </div>
        </div>

        {/* Модели ноутбуков */}
        <Link
          href="/dashboard/laptop-models"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
            pathname.startsWith('/dashboard/laptop-models')
              ? t.asideLinkActive
              : `${t.asideLink} ${t.asideLinkHover}`
          }`}
        >
          📋 Модели ноутбуков
        </Link>

        {/* Компоненты */}
        <div>
          <div
            className={`flex items-center justify-between rounded-lg transition-colors duration-200 ${
              pathname.startsWith('/dashboard/components')
                ? t.asideLinkActive
                : `${t.asideLink} ${t.asideLinkHover}`
            }`}
          >
            <Link
              href="/dashboard/components"
              className="flex-1 flex items-center gap-2 px-3 py-2"
            >
              🔧 Компоненты
            </Link>
            <span className="mr-2">
              {badge(totalComponents, pathname.startsWith('/dashboard/components'))}
            </span>
            <button
              onClick={() => toggle('components')}
              className="px-2 py-2"
              aria-label="Раскрыть категории компонентов"
            >
              <span
                className={`inline-block transition-transform duration-300 ${
                  expanded === 'components' ? 'rotate-90' : ''
                }`}
              >
                ▸
              </span>
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expanded === 'components' ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
            }`}
          >
            <div className={`ml-4 space-y-1 border-l pl-2 ${t.asideBorder}`}>
              {COMPONENT_CATEGORIES.map((cat) => {
                const count = componentCounts[cat.value] ?? 0;
                const isActive = currentCategory === cat.value;
                return (
                  <Link
                    key={cat.value}
                    href={`/dashboard/components?category=${cat.value}`}
                    className={`flex items-center justify-between px-2 py-1 text-sm rounded-lg transition-colors duration-200 ${
                      isActive
                        ? t.asideSubLinkActive
                        : `${t.asideSubLink} ${t.asideSubLinkHover}`
                    }`}
                  >
                    <span>{cat.label}</span>
                    {badge(count, isActive)}
                  </Link>
                );
              })}
              <Link
                href="/dashboard/component-types"
                className={`block px-2 py-1 text-sm rounded-lg transition-colors duration-200 ${t.asideSubLink} ${t.asideSubLinkHover}`}
              >
                📋 Справочник типов
              </Link>
            </div>
          </div>
        </div>
      </nav>

{user?.role === 'ADMIN' && (
      <Link
        href="/dashboard/users"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${pathname.startsWith('/dashboard/users')
            ? t.asideLinkActive
            : `${t.asideLink} ${t.asideLinkHover}`
          }`}
      >
        👥 Пользователи
      </Link>
)}

      {/* Кнопка переключения темы */}
      <button
        onClick={cycleTheme}
        className={`mx-2 mb-2 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 border transition-colors duration-200 ${
          theme === 'gradient'
            ? 'border-white/30 text-white hover:bg-white/10'
            : 'border-gray-200 text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Переключить тему"
      >
        🎨 Тема: {t.label}
      </button>

      <div
        className={`p-4 text-xs border-t transition-colors duration-300 ${t.asideFooter}`}
      >
        v1.0.0
      </div>
    </aside>
  );
}