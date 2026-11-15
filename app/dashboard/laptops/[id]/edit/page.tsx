'use client';
import { Suspense, useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';

const STATUS_OPTIONS = [
  { value: 'RECEIVED', label: 'Поступившие' },
  { value: 'REFACTORING', label: 'На доработке' },
  { value: 'REPAIR', label: 'В ремонте' },
  { value: 'FOR_SALE', label: 'В продаже' },
  { value: 'SOLD', label: 'Продан' },
  { value: 'ARCHIVED', label: 'Списан' },
];

function EditLaptopContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [laptop, setLaptop] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    serialNumber: '',
    inventoryNumber: '',
    status: 'RECEIVED',
    comment: '',
    processor: '',
    ramGb: 0,
    storageGb: 0,
    graphics: '',
  });

  useEffect(() => {
    setOpen(true);
    if (!id) return;
    apiFetch(`/laptops/${id}`)
      .then((l) => {
        setLaptop(l);
        setForm({
          serialNumber: l.serialNumber ?? '',
          inventoryNumber: l.inventoryNumber ?? '',
          status: l.status ?? 'RECEIVED',
          comment: '',
          processor: l.processor ?? '',
          ramGb: l.ramGb ?? 0,
          storageGb: l.storageGb ?? 0,
          graphics: l.graphics ?? '',
        });
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [id]);

  const close = (redirectTo?: string) => {
    setOpen(false);
    setTimeout(() => router.push(redirectTo ?? '/dashboard/laptops'), 200);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await apiFetch(`/laptops/${laptop.slug}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: form.status,
          comment: form.comment || undefined,
          serialNumber: form.serialNumber || undefined,
          processor: form.processor || undefined,
          ramGb: form.ramGb || undefined,
          storageGb: form.storageGb || undefined,
          graphics: form.graphics || undefined,
        }),
      });
      if (laptop) close(`/dashboard/laptops/${laptop.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center text-white">
        Загрузка...
      </div>
    );
  }

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
          <h2 className="text-xl font-bold">Редактировать ноутбук</h2>
          <button onClick={() => close()} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Закрыть">×</button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Модель — read-only (не меняется) */}
            <div>
              <label className="block text-sm font-medium mb-1">Модель</label>
              <input
                value={laptop?.model ? `${laptop.model.brand} ${laptop.model.modelName}` : ''}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700"
              />
            </div>

            {/* Инвентарный номер — read-only */}
            <div>
              <label className="block text-sm font-medium mb-1">Инвентарный номер</label>
              <input
                value={form.inventoryNumber}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700"
              />
            </div>

            {/* Серийный номер — редактируемый */}
            <div>
              <label className="block text-sm font-medium mb-1">Серийный номер</label>
              <input
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Замените временный на реальный"
              />
            </div>

            {/* Процессор */}
            <div>
              <label className="block text-sm font-medium mb-1">Процессор</label>
              <input
                value={form.processor}
                onChange={(e) => setForm({ ...form, processor: e.target.value })}
                className="w-full border rounded px-3 py-2"
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
              />
            </div>

            {/* Статус */}
            <div>
              <label className="block text-sm font-medium mb-1">Статус</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Комментарий */}
            <div>
              <label className="block text-sm font-medium mb-1">Комментарий к изменению</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Причина смены статуса..."
              />
            </div>
          </div>

          <div className="border-t px-6 py-4 flex gap-3">
            <button type="button" onClick={() => close()} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
              Отмена
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

export default function EditLaptopDrawer() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center text-white">Загрузка...</div>}>
      <EditLaptopContent />
    </Suspense>
  );
}