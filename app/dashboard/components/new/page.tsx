'use client';
import { useEffect, useMemo, useState, FormEvent } from 'react';
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

export default function NewComponentDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState<any[]>([]);
  const [laptops, setLaptops] = useState<any[]>([]);
  const [form, setForm] = useState({
    category: '',
    typeId: '',
    serialNumber: '',
    laptopId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOpen(true);
    Promise.all([
      apiFetch('/component-types').catch(() => []),
      apiFetch('/laptops').catch(() => []),
    ]).then(([t, l]) => {
      setTypes(Array.isArray(t) ? t : []);
      setLaptops(Array.isArray(l) ? l : []);
    });
  }, []);

  // Типы, отфильтрованные по выбранной категории
  const filteredTypes = useMemo(
    () => types.filter((t) => t.category === form.category),
    [types, form.category],
  );

  const close = (redirectTo?: string) => {
    setOpen(false);
    setTimeout(() => router.push(redirectTo ?? '/dashboard/components'), 200);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/components', {
        method: 'POST',
        body: JSON.stringify({
          typeId: form.typeId,
          serialNumber: form.serialNumber || undefined,
          laptopId: form.laptopId || undefined,
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
          <h2 className="text-xl font-bold">Новый компонент</h2>
          <button onClick={() => close()} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Закрыть">×</button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* 1. Категория */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Категория <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value, typeId: '' })
                }
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">— Выберите категорию —</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Тип (зависит от категории) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Тип компонента <span className="text-red-500">*</span>
              </label>
              <select
                value={form.typeId}
                onChange={(e) => setForm({ ...form, typeId: e.target.value })}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-50"
                required
                disabled={!form.category}
              >
                <option value="">
                  {form.category
                    ? filteredTypes.length
                      ? '— Выберите тип —'
                      : 'Нет типов в этой категории'
                    : 'Сначала выберите категорию'}
                </option>
                {filteredTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.brand} {t.modelName}
                    {t.specs ? ` (${t.specs})` : ''}
                  </option>
                ))}
              </select>
              {form.category && filteredTypes.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  В категории «{CATEGORY_OPTIONS.find((c) => c.value === form.category)?.label}» пока нет типов. Создайте тип в{' '}
                  <a href="/dashboard/component-types" className="underline">
                    справочнике типов
                  </a>
                  .
                </p>
              )}
            </div>

            {/* 3. Серийный номер */}
            <div>
              <label className="block text-sm font-medium mb-1">Серийный номер</label>
              <input
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Опционально"
              />
            </div>

            {/* 4. Ноутбук */}
            <div>
              <label className="block text-sm font-medium mb-1">Установить в ноутбук</label>
              <select
                value={form.laptopId}
                onChange={(e) => setForm({ ...form, laptopId: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">— На склад —</option>
                {laptops.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.model.brand} {l.model.modelName} ({l.serialNumber})
                  </option>
                ))}
              </select>
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