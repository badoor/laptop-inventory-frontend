'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Поступившие',
  REFACTORING: 'На доработке',
  REPAIR: 'В ремонте',
  FOR_SALE: 'В продаже',
  SOLD: 'Продан',
  ARCHIVED: 'Списан',
};

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: 'bg-gray-100 text-gray-700',
  REFACTORING: 'bg-purple-100 text-purple-700',
  REPAIR: 'bg-yellow-100 text-yellow-700',
  FOR_SALE: 'bg-blue-100 text-blue-700',
  SOLD: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-red-100 text-red-700',
};

function LaptopsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase().trim() ?? '';

  const [laptops, setLaptops] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/laptops')
      .then((data) => setLaptops(Array.isArray(data) ? data : []))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = laptops
    .filter((l) => (status ? l.status === status : true))
    .filter((l) => {
      if (!search) return true;
      const haystack = [
        l.serialNumber,
        l.inventoryNumber,
        l.model?.brand,
        l.model?.modelName,
        l.processor,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });

  if (loading) return <p className="p-6">Загрузка...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">
          Ноутбуки
          {status ? `: ${STATUS_LABELS[status] ?? status}` : ''}
          {search ? ` — поиск: «${search}»` : ''} ({filtered.length})
        </h1>
        <Link
          href="/dashboard/laptops/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ➕ Добавить ноутбук
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">
          {search || status ? 'Ничего не найдено по заданным фильтрам' : 'Нет ноутбуков'}
        </p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Модель</th>
                <th className="text-left px-4 py-3 font-medium">Инвентарный</th>
                <th className="text-left px-4 py-3 font-medium">Серийный</th>
                <th className="text-left px-4 py-3 font-medium">Характеристики</th>
                <th className="text-left px-4 py-3 font-medium">Статус</th>
                <th className="text-right px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/laptops/${l.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {l.model?.brand} {l.model?.modelName}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{l.inventoryNumber}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {l.serialNumber ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {[
                      l.processor,
                      l.ramGb ? `${l.ramGb} ГБ ОЗУ` : null,
                      l.storageGb ? `${l.storageGb} ГБ` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        STATUS_COLORS[l.status] ?? 'bg-gray-100'
                      }`}
                    >
                      {STATUS_LABELS[l.status] ?? l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/dashboard/laptops/${l.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:underline text-xs mr-3"
                    >
                      Изменить
                    </Link>
                    <Link
                      href={`/dashboard/laptops/${l.id}`}
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

export default function LaptopsPage() {
  return (
    <Suspense fallback={<p className="p-6">Загрузка...</p>}>
      <LaptopsList />
    </Suspense>
  );
}