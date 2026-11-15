'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

const LAPTOP_STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Поступившие',
  REFACTORING: 'На доработке',
  REPAIR: 'В ремонте',
  FOR_SALE: 'В продаже',
  SOLD: 'Продан',
  ARCHIVED: 'Списан',
};

const CATEGORY_LABELS: Record<string, string> = {
  RAM: 'Оперативная память',
  HDD: 'HDD',
  SSD: 'SSD',
  BATTERY: 'Аккумуляторы',
  MOTHERBOARD: 'Материнские платы',
  SCREEN: 'Экраны',
  KEYBOARD: 'Клавиатуры',
  MOUSE: 'Мыши',
  CHARGER: 'Блоки питания',
  OTHER: 'Другое',
};

export default function DashboardPage() {
  const [laptops, setLaptops] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/laptops').catch(() => []),
      apiFetch('/components').catch(() => []),
    ])
      .then(([l, c]) => {
        setLaptops(Array.isArray(l) ? l : []);
        setComponents(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const laptopByStatus: Record<string, number> = {};
  laptops.forEach((l) => {
    laptopByStatus[l.status] = (laptopByStatus[l.status] ?? 0) + 1;
  });

  const componentByCategory: Record<string, number> = {};
  components.forEach((c) => {
    const cat = c.type?.category;
    if (cat) componentByCategory[cat] = (componentByCategory[cat] ?? 0) + 1;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <Link
          href="/dashboard/laptops/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ➕ Добавить ноутбук
        </Link>
      </div>

      {/* Сводка */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Всего ноутбуков" value={laptops.length} href="/dashboard/laptops" />
        <SummaryCard
          label="В ремонте"
          value={laptopByStatus['REPAIR'] ?? 0}
          href="/dashboard/laptops?status=REPAIR"
          accent="yellow"
        />
        <SummaryCard
          label="В продаже"
          value={laptopByStatus['FOR_SALE'] ?? 0}
          href="/dashboard/laptops?status=FOR_SALE"
          accent="blue"
        />
        <SummaryCard label="Всего компонентов" value={components.length} href="/dashboard/components" />
      </div>

      {/* Ноутбуки по статусам */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Ноутбуки по статусам</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(LAPTOP_STATUS_LABELS).map(([status, label]) => (
            <Link
              key={status}
              href={`/dashboard/laptops?status=${status}`}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <span className="text-gray-700">{label}</span>
              <span className="text-lg font-semibold">
                {laptopByStatus[status] ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Компоненты по категориям */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Компоненты по типам</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
            <Link
              key={cat}
              href={`/dashboard/components?category=${cat}`}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <span className="text-gray-700">{label}</span>
              <span className="text-lg font-semibold">
                {componentByCategory[cat] ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: 'yellow' | 'blue';
}) {
  const accentClass =
    accent === 'yellow'
      ? 'border-yellow-300 bg-yellow-50'
      : accent === 'blue'
        ? 'border-blue-300 bg-blue-50'
        : 'border-gray-200 bg-white';
  return (
    <Link
      href={href}
      className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${accentClass}`}
    >
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </Link>
  );
}