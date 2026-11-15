'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';

export default function ComponentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [component, setComponent] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    apiFetch(`/components/${id}`)
      .then(setComponent)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'));
  }, [id]);

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!component) return <p className="p-6">Загрузка...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        {component.type.brand} {component.type.modelName}
      </h1>

      <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-white">
        <div>
          <p className="text-sm text-gray-500">Категория</p>
          <p className="font-medium">{component.type.category}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Характеристики</p>
          <p className="font-medium">{component.type.specs ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Серийный номер</p>
          <p className="font-medium">{component.serialNumber ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Статус</p>
          <p className="font-medium">{component.status}</p>
        </div>
      </div>

      {component.laptop && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Установлен в ноутбук</h2>
          <Link
            href={`/laptops/${component.laptop.slug}`}
            className="text-blue-600 hover:underline"
          >
            {component.laptop.serialNumber}
          </Link>
        </section>
      )}
    </div>
  );
}