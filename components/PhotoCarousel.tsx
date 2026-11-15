'use client';
import { useEffect, useState } from 'react';

export type Photo = { id: string; url: string };

export default function PhotoCarousel({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Закрытие по Esc
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, index]);

  if (!photos.length) return null;

  const current = photos[index];
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';

  const prev = () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <>
      {/* Мини-карусель в карточке */}
      <div className="relative">
        <div className="relative w-full h-64 bg-gray-100 rounded border overflow-hidden">
          <img
            src={`${base}${current.url}`}
            alt="Фото"
            onClick={() => setFullscreen(true)}
            className="w-full h-full object-contain cursor-zoom-in"
          />

          {photos.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full hover:bg-black/70 text-lg leading-none"
                aria-label="Предыдущее фото"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full hover:bg-black/70 text-lg leading-none"
                aria-label="Следующее фото"
              >
                ›
              </button>
            </>
          )}

          <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
            {index + 1} / {photos.length}
          </span>
        </div>

        {photos.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Фото ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Модалка с большой каруселью */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/90 z-999 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          {/* Закрыть */}
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300"
            aria-label="Закрыть"
          >
            ×
          </button>

          {/* Счётчик */}
          <span className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded">
            {index + 1} / {photos.length}
          </span>

          {/* Стрелки */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl w-12 h-12 rounded-full hover:bg-white/10"
                aria-label="Предыдущее фото"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl w-12 h-12 rounded-full hover:bg-white/10"
                aria-label="Следующее фото"
              >
                ›
              </button>
            </>
          )}

          {/* Большое фото */}
          <img
            src={`${base}${current.url}`}
            alt="Фото"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[95vw] max-h-[90vh] object-contain"
          />

          {/* Точки внизу */}
          {photos.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === index ? 'bg-white' : 'bg-white/40'
                  }`}
                  aria-label={`Фото ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}