import { useState, useRef } from "react";
import PhotoLightbox from "../common/PhotoLightbox";
import ConfirmModal from "../common/ConfirmModal";
import { reportsApi } from "../../api/reports";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import type { Report } from "../../api/reports";

interface EventReportProps {
  eventId: string;
  report: Report | null;
  isAdmin: boolean;
  onReportChange: (report: Report | null) => void;
}

interface LocalPhoto {
  id: string;
  file: File;
  preview: string;
}

export default function EventReport({
  eventId,
  report,
  isAdmin,
  onReportChange,
}: EventReportProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(report?.text ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [localPhotos, setLocalPhotos] = useState<LocalPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newPhotos = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setLocalPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveLocalPhoto = (id: string) => {
    setLocalPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleCreate = async () => {
    if (!text.trim()) return setError("Текст звіту обов'язковий");
    setIsLoading(true);
    setError("");
    try {
      const created = await reportsApi.create(eventId, text.trim());
      // завантажуємо всі вибрані фото
      for (const lp of localPhotos) {
        const url = await reportsApi.uploadImage(lp.file);
        await reportsApi.addPhoto(created.id, url);
        URL.revokeObjectURL(lp.preview);
      }
      // отримуємо оновлений звіт з фото
      const final = await reportsApi.getByEvent(eventId);
      onReportChange(final);
      setLocalPhotos([]);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Помилка створення звіту"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!report) return;
    if (!text.trim()) return setError("Текст звіту обов'язковий");
    setIsLoading(true);
    setError("");
    try {
      const updated = await reportsApi.update(report.id, text.trim());
      // завантажуємо нові фото якщо є
      for (const lp of localPhotos) {
        const url = await reportsApi.uploadImage(lp.file);
        await reportsApi.addPhoto(updated.id, url);
        URL.revokeObjectURL(lp.preview);
      }
      const final = await reportsApi.getByEvent(eventId);
      onReportChange(final);
      setLocalPhotos([]);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Помилка оновлення звіту"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!report) return;
    setIsLoading(true);
    try {
      await reportsApi.delete(report.id);
      onReportChange(null);
      setText("");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Помилка видалення звіту"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExistingPhoto = async (photoId: string) => {
    if (!report) return;
    try {
      await reportsApi.deletePhoto(photoId);
      onReportChange({
        ...report,
        photos: report.photos.filter((p) => p.id !== photoId),
      });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Помилка видалення фото"));
    }
  };

  const handleEdit = () => {
    setText(report?.text ?? "");
    setLocalPhotos([]);
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    localPhotos.forEach((lp) => URL.revokeObjectURL(lp.preview));
    setLocalPhotos([]);
    setText(report?.text ?? "");
    setIsEditing(false);
    setError("");
  };

  const inputClass =
    "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none";

  // ── Форма створення / редагування ──
  if (isAdmin && (isEditing || !report)) {
    return (
      <div className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError("");
          }}
          placeholder="Опишіть як пройшов захід, основні підсумки та враження учасників..."
          rows={4}
          className={inputClass}
        />

        {/* Існуючі фото при редагуванні */}
        {isEditing && report && report.photos.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Наявні фото:</p>
            <div className="grid grid-cols-3 gap-2">
              {report.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={`http://localhost:3000${photo.url}`}
                    alt="Фото звіту"
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={() => handleDeleteExistingPhoto(photo.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Нові фото */}
        {localPhotos.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Нові фото:</p>
            <div className="grid grid-cols-3 gap-2">
              {localPhotos.map((lp) => (
                <div key={lp.id} className="relative group">
                  <img
                    src={lp.preview}
                    alt="preview"
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={() => handleRemoveLocalPhoto(lp.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Зона додавання фото */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 rounded-lg py-3 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 transition flex items-center justify-center gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Додати фото
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex gap-2">
          <button
            onClick={report ? handleUpdate : handleCreate}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50"
          >
            {isLoading
              ? "Збереження..."
              : report
                ? "Зберегти зміни"
                : "Опублікувати звіт"}
          </button>
          {isEditing && (
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition"
            >
              Скасувати
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Перегляд опублікованого звіту ──
  if (report && !isEditing) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg px-4 py-3">
          {report.text}
        </p>

        {report.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {report.photos.map((photo, index) => (
              <img
                key={photo.id}
                src={`http://localhost:3000${photo.url}`}
                alt="Фото звіту"
                className="w-full h-28 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition"
                onClick={() => setLightboxIndex(index)}
              />
            ))}
          </div>
        )}

        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={report.photos.map((p) => `http://localhost:3000${p.url}`)}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={() =>
              setLightboxIndex(
                (i) => (i! - 1 + report.photos.length) % report.photos.length,
              )
            }
            onNext={() =>
              setLightboxIndex((i) => (i! + 1) % report.photos.length)
            }
          />
        )}

        {isAdmin && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-xs text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
            >
              Редагувати
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              disabled={isLoading}
              className="px-4 py-2 text-xs text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl transition disabled:opacity-50"
            >
              Видалити
            </button>
          </div>
        )}

        {showConfirmDelete && (
          <ConfirmModal
            title="Видалити звіт?"
            message="Звіт та всі фото до нього будуть видалені назавжди. Цю дію неможливо скасувати."
            confirmLabel="Видалити"
            cancelLabel="Скасувати"
            variant="danger"
            onConfirm={() => {
              setShowConfirmDelete(false);
              handleDelete();
            }}
            onCancel={() => setShowConfirmDelete(false)}
          />
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <p className="text-sm text-slate-400">
      Адміністратор ще не опублікував звіт про цю подію
    </p>
  );
}
