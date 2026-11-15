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

const STATUS_LABELS: Record<string, string> = {
  STOCK: 'На складе',
  INSTALLED: 'Установлен',
  REPAIR: 'В ремонте',
  ARCHIVED: 'Списан',
};

const STATUS_COLORS: Record<string, string> = {
  STOCK: 'bg-gray-100 text-gray-700',
  INSTALLED: 'bg-green-100 text-green-700',
  REPAIR: 'bg-yellow-100 text-yellow-700',
  ARCHIVED: 'bg-red-100 text-red-700',
};

function ComponentsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category');

  const [view, setView] = useState<'components' | 'types'>('components');
  const [components, setComponents] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/components').catch(() => []),
      apiFetch('/component-types').catch(() => []),
    ])
      .then(([c, t]) => {
        setComponents(Array.isArray(c) ? c : []);
        setTypes(Array.isArray(t) ? t : []);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleArchive = async (id: string) => {
    if (!confirm('Списать компонент? Он будет переведён в статус «Списан».')) return;
    try {
      await apiFetch(`/components/${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Ошибка списания');
    }
  };

  const filteredComponents = category
    ? components.filter((c) => c.type?.category === category)
    : components;

  const filteredTypes = category
    ? types.filter((t) => t.category === category)
    : types;

  if (loading) return <p className="p-6">Загрузка...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      {/* Шапка с вкладками */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">
          {view === 'components' ? 'Компоненты' : 'Типы компонентов'}
          {category ? `: ${CATEGORY_LABELS[category] ?? category}` : ''}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('components')}
              className={`px-3 py-1.5 text-sm ${
                view === 'components' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
              }`}
            >
              Экземпляры ({filteredComponents.length})
            </button>
            <button
              onClick={() => setView('types')}
              className={`px-3 py-1.5 text-sm ${
                view === 'types' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
              }`}
            >
              Типы ({filteredTypes.length})
            </button>
          </div>
          <Link
            href={
              view === 'components'
                ? '/dashboard/components/new'
                : '/dashboard/component-types/new'
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ {view === 'components' ? 'Добавить компонент' : 'Добавить тип'}
          </Link>
        </div>
      </div>

      {/* Вкладка «Экземпляры» */}
      {view === 'components' && (
        <>
          {filteredComponents.length === 0 ? (
            <p className="text-gray-500">Нет компонентов</p>
          ) : (
            <div className="overflow-x-auto bg-white border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Тип</th>
                    <th className="text-left px-4 py-3 font-medium">Серийный</th>
                    <th className="text-left px-4 py-3 font-medium">Категория</th>
                    <th className="text-left px-4 py-3 font-medium">Статус</th>
                    <th className="text-left px-4 py-3 font-medium">Ноутбук</th>
                    <th className="text-right px-4 py-3 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComponents.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/components/${c.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{c.type?.brand} {c.type?.modelName}</div>
                        <div className="text-xs text-gray-500">{c.type?.specs}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.serialNumber ?? '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {CATEGORY_LABELS[c.type?.category] ?? c.type?.category}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[c.status] ?? 'bg-gray-100'}`}>
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{c.laptop ? c.laptop.serialNumber : '—'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          href={`/dashboard/components/${c.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-600 hover:underline text-xs mr-3"
                        >
                          Открыть
                        </Link>
                        {c.status !== 'ARCHIVED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(c.id);
                            }}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Списать
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Вкладка «Типы» */}
      {view === 'types' && (
        <>
          {filteredTypes.length === 0 ? (
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
                  {filteredTypes.map((t) => (
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
        </>
      )}
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <Suspense fallback={<p className="p-6">Загрузка...</p>}>
      <ComponentsPageContent />
    </Suspense>
  );
}