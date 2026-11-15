'use client';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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

function ComponentTypeDetailContent() {
  const params = useParams();
  const slug = params.slug as string;
  const [type, setType] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    apiFetch(`/component-types/${slug}`)
      .then(setType)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="p-6">Загрузка...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!type) return <p className="p-6">Тип не найден</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/dashboard/component-types" className="hover:underline">
          Типы компонентов
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">
          {type.brand} {type.modelName}
        </span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {type.brand} {type.modelName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {CATEGORY_LABELS[type.category] ?? type.category}
            {type.specs ? ` · ${type.specs}` : ''}
          </p>
        </div>
        <Link
          href="/dashboard/component-types"
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          К списку
        </Link>
      </div>

      <section className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Основное</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Бренд</p>
            <p className="font-medium">{type.brand}</p>
          </div>
          <div>
            <p className="text-gray-500">Модель</p>
            <p className="font-medium">{type.modelName}</p>
          </div>
          <div>
            <p className="text-gray-500">Категория</p>
            <p className="font-medium">{CATEGORY_LABELS[type.category] ?? type.category}</p>
          </div>
          <div>
            <p className="text-gray-500">Характеристики</p>
            <p className="font-medium">{type.specs ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Создан</p>
            <p className="font-medium">
              {new Date(type.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Экземпляры ({type.instances?.length ?? 0})
        </h2>
        {!type.instances?.length ? (
          <p className="text-gray-500 text-sm">Нет экземпляров этого типа</p>
        ) : (
          <ul className="divide-y">
            {type.instances.map((c: any) => (
              <li key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm">{c.serialNumber ?? '—'}</p>
                  <p className="text-xs text-gray-500">
                    {STATUS_LABELS[c.status] ?? c.status}
                    {c.laptop ? ` · в ${c.laptop.serialNumber}` : ''}
                  </p>
                </div>
                <Link
                  href={`/dashboard/components/${c.id}`}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Открыть
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function ComponentTypeDetailPage() {
  return (
    <Suspense fallback={<p className="p-6">Загрузка...</p>}>
      <ComponentTypeDetailContent />
    </Suspense>
  );
}