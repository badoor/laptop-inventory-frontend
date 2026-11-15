'use client';
import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function PhoneUploadContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalUploaded, setTotalUploaded] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !token) return;

    setStatus('uploading');
    setErrorMsg('');

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    formData.append('token', token);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/photos`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const count = data.photos?.length ?? files.length;
        setUploadedCount(count);
        setTotalUploaded((prev) => prev + count);
        setStatus('done');
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.message ?? 'Ошибка загрузки');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Не удалось связаться с сервером');
      setStatus('error');
    } finally {
      // Сбрасываем input, чтобы можно было выбрать новый файл
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const reset = () => {
    setStatus('idle');
    setUploadedCount(0);
    setTotalUploaded(0);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <p className="text-red-600">Неверная ссылка: нет токена</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto text-center space-y-6">
      <h1 className="text-xl font-bold">Загрузка фото ноутбука</h1>

      {status === 'done' ? (
        <div className="space-y-4">
          <p className="text-green-600 text-lg">
            ✅ Загружено фото: {uploadedCount}
          </p>
          {totalUploaded > uploadedCount && (
            <p className="text-sm text-gray-500">
              Всего загружено за сессию: {totalUploaded}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Можно сделать ещё или закрыть страницу.
          </p>

          <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
            📷 Сделать ещё фото
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />
          </label>

          <button
            onClick={reset}
            className="block mx-auto text-xs text-gray-500 underline"
          >
            Сбросить
          </button>
        </div>
      ) : (
        <>
          <p className="text-gray-600">
            Сделайте один или несколько снимков. Они прикрепятся к карточке автоматически.
          </p>

          <label
            className={`inline-block px-6 py-3 rounded-lg text-white cursor-pointer ${
              status === 'uploading'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status === 'uploading' ? 'Загрузка...' : '📷 Сделать фото'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFilesChange}
              disabled={status === 'uploading'}
              className="hidden"
            />
          </label>

          {status === 'error' && (
            <div className="space-y-2">
              <p className="text-red-600 text-sm">{errorMsg}</p>
              <button
                onClick={() => {
                  setStatus('idle');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-sm text-blue-600 underline"
              >
                Попробовать снова
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PhoneUploadPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center">Загрузка...</p>}>
      <PhoneUploadContent />
    </Suspense>
  );
}