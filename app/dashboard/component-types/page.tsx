'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';

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

function ComponentTypesList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category');
  const [types, setTypes] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiFetch('/component-types')
      .then((data) => setTypes(Array.isArray(data) ? data : []))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = category
    ? types.filter((t) => t.category === category)
    : types;

  if (loading) return <p className="p-6">Загрузка...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          Типы компонентов{category ? `: ${CATEGORY_LABELS[category] ?? category}` : ''} ({filtered.length})
        </h1>
        <Link
          href="/dashboard/component-types/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ➕ Добавить тип
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">Нет типов компонентов</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Бренд</th>
                <th className="text-left px-4 py-3 font-medium">Модель</th>
                <th className="text-left px-4 py-3 font-medium">Категория</th>
                <th className="text-left px-4 py-3 font-medium">Характеристики</th>
                <th className="text-left px-4 py-3 font-medium">Экземпляров</th>
                <th className="text-right px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/component-types/${t.slug}`)}
                >
                  <td className="px-4 py-3 font-medium">{t.brand}</td>
                  <td className="px-4 py-3">{t.modelName}</td>
                  <td className="px-4 py-3 text-xs">
                    {CATEGORY_LABELS[t.category] ?? t.category}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{t.specs ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {t._count?.instances ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/dashboard/component-types/${t.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-600 hover:underline text-xs"
                    >
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComponentTypesPage() {
  return (
    <Suspense fallback={<p className="p-6">Загрузка...</p>}>
      <ComponentTypesList />
    </Suspense>
  );
}