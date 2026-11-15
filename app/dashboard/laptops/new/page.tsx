'use client';
import { useEffect, useMemo, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';

export default function NewLaptopDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [form, setForm] = useState({
    brand: '',
    modelName: '',
    processor: '',
    ramGb: 8,
    storageGb: 256,
    graphics: '',
    serialNumber: '',
    status: 'RECEIVED',
    comment: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOpen(true);
    apiFetch('/laptop-models')
      .then((data) => setModels(Array.isArray(data) ? data : []))
      .catch(() => setModels([]));
  }, []);

  const brands = useMemo(
    () => Array.from(new Set(models.map((m) => m.brand))).sort(),
    [models],
  );
  const modelNames = useMemo(
    () =>
      Array.from(
        new Set(
          models
            .filter((m) => !form.brand || m.brand === form.brand)
            .map((m) => m.modelName),
        ),
      ).sort(),
    [models, form.brand],
  );

  const close = (redirectTo?: string) => {
    setOpen(false);
    setTimeout(() => router.push(redirectTo ?? '/dashboard/laptops'), 200);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/laptops', {
        method: 'POST',
        body: JSON.stringify({
          brand: form.brand,
          modelName: form.modelName,
          processor: form.processor || undefined,
          ramGb: form.ramGb || undefined,
          storageGb: form.storageGb || undefined,
          graphics: form.graphics || undefined,
          serialNumber: form.serialNumber || undefined,
          status: form.status,
          comment: form.comment || undefined,
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
          <h2 className="text-xl font-bold">Новый ноутбук</h2>
          <button onClick={() => close()} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Закрыть">×</button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Бренд */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Бренд <span className="text-red-500">*</span>
              </label>
              <input
                list="brands"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Dell, Lenovo, Apple..."
                required
              />
              <datalist id="brands">
                {brands.map((b) => <option key={b} value={b} />)}
              </datalist>
            </div>

            {/* Модель */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Модель <span className="text-red-500">*</span>
              </label>
              <input
                list="models"
                value={form.modelName}
                onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="XPS 15, ThinkPad T14..."
                required
              />
              <datalist id="models">
                {modelNames.map((m) => <option key={m} value={m} />)}
              </datalist>
            </div>

            {/* Процессор */}
            <div>
              <label className="block text-sm font-medium mb-1">Процессор</label>
              <input
                value={form.processor}
                onChange={(e) => setForm({ ...form, processor: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Core i7-13700H, Apple M2..."
              />
            </div>

            {/* ОЗУ и накопитель */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ОЗУ (ГБ)</label>
                <input
                  type="number"
                  min={0}
                  value={form.ramGb}
                  onChange={(e) => setForm({ ...form, ramGb: Number(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Накопитель (ГБ)</label>
                <input
                  type="number"
                  min={0}
                  value={form.storageGb}
                  onChange={(e) => setForm({ ...form, storageGb: Number(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Видеокарта */}
            <div>
              <label className="block text-sm font-medium mb-1">Видеокарта</label>
              <input
                value={form.graphics}
                onChange={(e) => setForm({ ...form, graphics: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="NVIDIA RTX 4060..."
              />
            </div>

            {/* Серийный номер */}
            <div>
              <label className="block text-sm font-medium mb-1">Серийный номер</label>
              <input
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Оставьте пустым, если нет под рукой"
              />
              <p className="text-xs text-gray-500 mt-1">Если пусто — будет присвоен временный номер</p>
            </div>

            {/* Статус */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Статус <span className="text-red-500">*</span>
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="RECEIVED">Поступившие</option>
                <option value="REFACTORING">На доработке</option>
                <option value="REPAIR">В ремонте</option>
                <option value="FOR_SALE">В продаже</option>
                <option value="SOLD">Продан</option>
                <option value="ARCHIVED">Списан</option>
              </select>
            </div>

            {/* Комментарий */}
            <div>
              <label className="block text-sm font-medium mb-1">Комментарии</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Причина ремонта, данные покупателя..."
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