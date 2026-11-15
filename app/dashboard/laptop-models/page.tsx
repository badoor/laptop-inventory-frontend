'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';

function LaptopModelsList() {
  const router = useRouter();
  const [models, setModels] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/laptop-models')
      .then((data) => setModels(Array.isArray(data) ? data : []))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Загрузка...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Модели ноутбуков ({models.length})</h1>
        <Link
          href="/dashboard/laptop-models/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ➕ Добавить модель
        </Link>
      </div>

      {models.length === 0 ? (
        <p className="text-gray-500">Нет моделей</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Бренд</th>
                <th className="text-left px-4 py-3 font-medium">Модель</th>
                <th className="text-left px-4 py-3 font-medium">Процессор</th>
                <th className="text-left px-4 py-3 font-medium">ОЗУ</th>
                <th className="text-left px-4 py-3 font-medium">Накопитель</th>
                <th className="text-left px-4 py-3 font-medium">Ноутбуков</th>
                <th className="text-right px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr
                  key={m.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/laptop-models/${m.slug}`)}
                >
                  <td className="px-4 py-3 font-medium">{m.brand}</td>
                  <td className="px-4 py-3">{m.modelName}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{m.processor}</td>
                  <td className="px-4 py-3 text-xs">{m.ramGb} ГБ</td>
                  <td className="px-4 py-3 text-xs">{m.storageGb} ГБ</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {m._count?.laptops ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/dashboard/laptop-models/${m.slug}`}
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

export default function LaptopModelsPage() {
  return <LaptopModelsList />;
}