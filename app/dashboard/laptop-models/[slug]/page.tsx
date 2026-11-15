'use client';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Поступившие',
  REFACTORING: 'На доработке',
  REPAIR: 'В ремонте',
  FOR_SALE: 'В продаже',
  SOLD: 'Продан',
  ARCHIVED: 'Списан',
};

function LaptopModelDetailContent() {
  const params = useParams();
  const slug = params.slug as string;
  const [model, setModel] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    apiFetch(`/laptop-models/${slug}`)
      .then(setModel)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="p-6">Загрузка...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!model) return <p className="p-6">Модель не найдена</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500">
        <Link href="/dashboard/laptop-models" className="hover:underline">
          Модели ноутбуков
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">
          {model.brand} {model.modelName}
        </span>
      </nav>

      {/* Шапка */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {model.brand} {model.modelName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ноутбуков этой модели: {model.laptops?.length ?? 0}
          </p>
        </div>
        <Link
          href="/dashboard/laptop-models"
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          К списку
        </Link>
      </div>

      {/* Информация о модели */}
      <section className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">О модели</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Бренд</p>
            <p className="font-medium">{model.brand}</p>
          </div>
          <div>
            <p className="text-gray-500">Модель</p>
            <p className="font-medium">{model.modelName}</p>
          </div>
          <div>
            <p className="text-gray-500">Slug</p>
            <p className="font-mono text-xs">{model.slug}</p>
          </div>
          <div>
            <p className="text-gray-500">Создана</p>
            <p className="font-medium">
              {new Date(model.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Характеристики (процессор, ОЗУ, накопитель) указываются у каждого ноутбука отдельно,
          так как одна модель может иметь разные конфигурации.
        </p>
      </section>

      {/* Ноутбуки этой модели */}
      <section className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Ноутбуки этой модели ({model.laptops?.length ?? 0})
        </h2>
        {!model.laptops?.length ? (
          <p className="text-gray-500 text-sm">Нет ноутбуков этой модели</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Инвентарный</th>
                  <th className="text-left px-4 py-3 font-medium">Серийный</th>
                  <th className="text-left px-4 py-3 font-medium">Характеристики</th>
                  <th className="text-left px-4 py-3 font-medium">Статус</th>
                  <th className="text-right px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {model.laptops.map((l: any) => (
                  <tr key={l.id} className="border-t hover:bg-gray-50">
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
                      <span className="text-xs px-2 py-1 rounded bg-gray-100">
                        {STATUS_LABELS[l.status] ?? l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/laptops/${l.id}`}
                        className="text-blue-600 hover:underline text-xs"
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
      </section>
    </div>
  );
}

export default function LaptopModelDetailPage() {
  return (
    <Suspense fallback={<p className="p-6">Загрузка...</p>}>
      <LaptopModelDetailContent />
    </Suspense>
  );
}