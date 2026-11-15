'use client';
import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';

const CATEGORY_OPTIONS = [
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

export default function NewComponentTypeDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    category: '',
    brand: '',
    modelName: '',
    specs: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  const close = (redirectTo?: string) => {
    setOpen(false);
    setTimeout(() => router.push(redirectTo ?? '/dashboard/component-types'), 200);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/component-types', {
        method: 'POST',
        body: JSON.stringify({
          category: form.category,
          brand: form.brand,
          modelName: form.modelName,
          specs: form.specs || undefined,
        }),
      });
      close();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => close()}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[40%] bg-white z-50 shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Новый тип компонента</h2>
          <button onClick={() => close()} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Закрыть">×</button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div>
              <label className="block text-sm font-medium mb-1">
                Категория <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">— Выберите категорию —</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Бренд <span className="text-red-500">*</span>
              </label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Kingston, Samsung, Crucial..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Модель <span className="text-red-500">*</span>
              </label>
              <input
                value={form.modelName}
                onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Fury DDR4, 970 EVO..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Характеристики</label>
              <input
                value={form.specs}
                onChange={(e) => setForm({ ...form, specs: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="16GB 3200MHz, 1TB NVMe..."
              />
            </div>
          </div>

          <div className="border-t px-6 py-4 flex gap-3">
            <button type="button" onClick={() => close()} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}