import { useEffect } from "react";

interface PhotoLightboxProps {
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: PhotoLightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Закрити */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Лічильник */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {/* Стрілка ліво */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 text-white/70 hover:text-white transition p-2"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Фото */}
      <img
        src={photos[currentIndex]}
        alt={`Фото ${currentIndex + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Стрілка право */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 text-white/70 hover:text-white transition p-2"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
