'use client';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import PhotoCarousel, { Photo } from '@/components/PhotoCarousel';
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

function LaptopDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const [laptop, setLaptop] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  // QR
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [generatingQr, setGeneratingQr] = useState(false);

  const loadLaptop = () => {
    if (!id) return;
    apiFetch(`/laptops/${id}`)
      .then(setLaptop)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLaptop();
  }, [id]);

  // Автообновление, пока открыт QR (каждые 3 секунды)
  useEffect(() => {
    if (!showQr || !laptop) return;
    const interval = setInterval(async () => {
      try {
        const updated = await apiFetch(`/laptops/${laptop.id}`);
        const newPhotosCount = updated.photos?.length ?? 0;
        const oldPhotosCount = laptop.photos?.length ?? 0;
        if (
          newPhotosCount !== oldPhotosCount ||
          updated.photoUrl !== laptop.photoUrl
        ) {
          setLaptop(updated);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [showQr, laptop]);

  const handleArchive = async () => {
    if (
      !confirm(
        'Списать ноутбук? Он будет переведён в статус «Списан», но останется в базе.',
      )
    )
      return;
    setArchiving(true);
    try {
      await apiFetch(`/laptops/${laptop.slug}`, { method: 'DELETE' });
      const updated = await apiFetch(`/laptops/${laptop.id}`);
      setLaptop(updated);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Ошибка списания');
    } finally {
      setArchiving(false);
    }
  };

  const handleGenerateQr = async () => {
    setGeneratingQr(true);
    try {
      const res = await apiFetch('/uploads/session', {
        method: 'POST',
        body: JSON.stringify({ laptopId: laptop.id }),
      });
      setUploadUrl(res.uploadUrl);
      setShowQr(true);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Не удалось создать сессию для фото');
    } finally {
      setGeneratingQr(false);
    }
  };

  const handleRefreshPhotos = async () => {
    try {
      const updated = await apiFetch(`/laptops/${laptop.id}`);
      setLaptop(updated);
      setShowQr(false);
    } catch {}
  };

  if (loading) return <p className="p-6">Загрузка...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!laptop) return <p className="p-6">Ноутбук не найден</p>;

  const isArchived = laptop.status === 'ARCHIVED';
  const photos: Photo[] = laptop.photos ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500">
        <Link href="/dashboard/laptops" className="hover:underline">
          Ноутбуки
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{laptop.inventoryNumber}</span>
      </nav>

      {/* Шапка */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {laptop.model.brand} {laptop.model.modelName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Инв.: <span className="font-mono">{laptop.inventoryNumber}</span>
            {laptop.serialNumber && (
              <>
                {' '}
                · SN: <span className="font-mono">{laptop.serialNumber}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/laptops/${laptop.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Изменить
          </Link>
          {!isArchived && (
            <button
              onClick={handleArchive}
              disabled={archiving}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {archiving ? 'Списание...' : 'Списать'}
            </button>
          )}
          {isArchived && (
            <span className="px-4 py-2 text-sm text-gray-500">
              Ноутбук списан
            </span>
          )}
        </div>
      </div>

      {/* Фото + основное */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Фото */}
        <section className="bg-white border rounded-lg p-4 md:col-span-1">
          <h2 className="text-lg font-semibold mb-3">
            Фото ({photos.length})
          </h2>

          {photos.length > 0 ? (
            <PhotoCarousel photos={photos} />
          ) : laptop.photoUrl ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${laptop.photoUrl}`}
              alt="Фото ноутбука"
              className="w-full h-64 object-contain rounded border bg-gray-100"
            />
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed rounded text-gray-400">
              <span className="text-3xl">📷</span>
              <span className="text-sm mt-2">Фото нет</span>
            </div>
          )}

          {/* QR-блок */}
          {showQr && uploadUrl ? (
            <div className="mt-3 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Отсканируйте QR телефоном, чтобы сделать фото
              </p>
              <div className="bg-white p-3 inline-block rounded border">
                <QRCodeSVG value={uploadUrl} size={160} />
              </div>
              <button
                onClick={handleRefreshPhotos}
                className="block mx-auto text-xs text-green-600 underline"
              >
                Я загрузил фото — обновить
              </button>
              <button
                onClick={() => setShowQr(false)}
                className="block mx-auto text-xs text-gray-500 underline"
              >
                Отмена
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGenerateQr}
              disabled={generatingQr}
              className="mt-3 w-full px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
            >
              {generatingQr ? 'Генерация QR...' : '📷 Загрузить фото с телефона'}
            </button>
          )}
        </section>

        {/* Основное */}
        <section className="bg-white border rounded-lg p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Основное</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Статус</p>
              <span
                className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                  STATUS_COLORS[laptop.status] ?? 'bg-gray-100'
                }`}
              >
                {STATUS_LABELS[laptop.status] ?? laptop.status}
              </span>
            </div>
            <div>
              <p className="text-gray-500">Процессор</p>
              <p className="font-medium">{laptop.processor ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">ОЗУ</p>
              <p className="font-medium">
                {laptop.ramGb ? `${laptop.ramGb} ГБ` : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Накопитель</p>
              <p className="font-medium">
                {laptop.storageGb ? `${laptop.storageGb} ГБ` : '—'}
              </p>
            </div>
            {laptop.graphics && (
              <div>
                <p className="text-gray-500">Видеокарта</p>
                <p className="font-medium">{laptop.graphics}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500">Создан</p>
              <p className="font-medium">
                {new Date(laptop.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Компоненты */}
      <section className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Компоненты ({laptop.components?.length ?? 0})
        </h2>
        {!laptop.components?.length ? (
          <p className="text-gray-500 text-sm">Нет установленных компонентов</p>
        ) : (
          <ul className="divide-y">
            {laptop.components.map((c: any) => (
              <li key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {c.type?.brand} {c.type?.modelName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.type?.specs} · SN: {c.serialNumber ?? '—'}
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

      {/* История */}
      <section className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">История</h2>
        {!laptop.history?.length ? (
          <p className="text-gray-500 text-sm">Нет записей</p>
        ) : (
          <ul className="space-y-3">
            {laptop.history.map((h: any) => (
              <li key={h.id} className="border-l-2 border-blue-400 pl-4">
                <p className="text-sm">
                  <span className="text-gray-500">
                    {new Date(h.changedAt).toLocaleString('ru-RU')}
                  </span>{' '}
                  —{' '}
                  {h.oldStatus && h.newStatus && h.oldStatus !== h.newStatus
                    ? `${STATUS_LABELS[h.oldStatus] ?? h.oldStatus} → ${
                        STATUS_LABELS[h.newStatus] ?? h.newStatus
                      }`
                    : STATUS_LABELS[h.newStatus] ?? h.newStatus}
                </p>
                {h.comment && (
                  <p className="text-sm text-gray-800 mt-1">{h.comment}</p>
                )}
                {h.changedBy && (
                  <p className="text-xs text-gray-500 mt-1">
                    {h.changedBy.fullName}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function LaptopDetailPage() {
  return (
    <Suspense fallback={<p className="p-6">Загрузка...</p>}>
      <LaptopDetailContent />
    </Suspense>
  );
}