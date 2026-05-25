import { useState, useRef } from "react";
import { createPortal } from "react-dom";
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

// ── Стопка фото ──────────────────────────────────────────────────────────────
interface PhotoStackProps {
  photos: string[];
  onOpen: (index: number) => void;
}

function PhotoStack({ photos, onOpen }: PhotoStackProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = photos.length;

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % total);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + total) % total);
  };

  // Показуємо до 3 карток у стопці (поточна + 2 під нею)
  const visibleCount = Math.min(total, 3);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Стопка */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          // висота = висота картки + зміщення стопки
          height: 260 + (visibleCount - 1) * 10,
        }}
      >
        {/* Картки під низом (від найдальшої до найближчої) */}
        {Array.from({ length: visibleCount - 1 })
          .reverse()
          .map((_, revI) => {
            const stackPos = visibleCount - 1 - revI; // 2, 1
            const nextIdx = (activeIndex + stackPos) % total;
            return (
              <div
                key={`stack-${nextIdx}`}
                style={{
                  position: "absolute",
                  top: stackPos * 8,
                  left: "50%",
                  transform: `translateX(-50%) rotate(${stackPos % 2 === 0 ? 2.5 : -2.5}deg) scale(${1 - stackPos * 0.025})`,
                  width: "100%",
                  height: 240,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  background: "#f1f5f9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  zIndex: visibleCount - 1 - stackPos,
                }}
              >
                <img
                  src={photos[nextIdx]}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            );
          })}

        {/* Активна (верхня) картка */}
        <div
          onClick={() => onOpen(activeIndex)}
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            height: 240,
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid #cbd5e1",
            background: "#f8fafc",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            cursor: "pointer",
            zIndex: visibleCount,
            transition: "transform .15s, box-shadow .15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform =
              "translateX(-50%) scale(1.015)";
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 8px 28px rgba(0,0,0,0.18)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform =
              "translateX(-50%)";
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 4px 20px rgba(0,0,0,0.12)";
          }}
        >
          <img
            src={photos[activeIndex]}
            alt={`Фото ${activeIndex + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* Бейдж «відкрити» */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
              borderRadius: 8,
              padding: "4px 10px",
              color: "#fff",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
              pointerEvents: "none",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Переглянути
          </div>
        </div>
      </div>

      {/* Навігація */}
      {total > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: (visibleCount - 1) * 2,
          }}
        >
          <button
            onClick={goPrev}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              transition: "background .15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#f1f5f9")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#fff")
            }
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Крапки */}
          <div style={{ display: "flex", gap: 6 }}>
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(i);
                }}
                style={{
                  width: i === activeIndex ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  border: "none",
                  background: i === activeIndex ? "#3b82f6" : "#cbd5e1",
                  cursor: "pointer",
                  padding: 0,
                  transition: "width .2s, background .2s",
                }}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              transition: "background .15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#f1f5f9")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#fff")
            }
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Лічильник */}
      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
        {activeIndex + 1} / {total} фото · натисніть, щоб відкрити
      </p>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

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
  const [localLightboxIndex, setLocalLightboxIndex] = useState<number | null>(
    null,
  );
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [notifyParticipants, setNotifyParticipants] = useState(false);

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
      const updated = await reportsApi.update(
        report.id,
        text.trim(),
        notifyParticipants,
      );
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
      setNotifyParticipants(false);
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
    setNotifyParticipants(false);
  };

  const handleCancel = () => {
    localPhotos.forEach((lp) => URL.revokeObjectURL(lp.preview));
    setLocalPhotos([]);
    setText(report?.text ?? "");
    setIsEditing(false);
    setError("");
    setNotifyParticipants(false);
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
            <p className="text-xs text-slate-400 mb-2">
              Наявні фото · {report.photos.length} шт. · натисніть щоб
              переглянути
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 6,
                scrollSnapType: "x mandatory",
              }}
            >
              {report.photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="relative group flex-shrink-0"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <img
                    src={`http://localhost:3000${photo.url}`}
                    alt="Фото звіту"
                    className="rounded-lg border border-slate-200 cursor-zoom-in block"
                    style={{
                      height: 140,
                      width: "auto",
                      maxWidth: 240,
                      objectFit: "cover",
                    }}
                    onClick={() => setLightboxIndex(idx)}
                  />
                  <button
                    onClick={() => handleDeleteExistingPhoto(photo.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm hidden group-hover:flex items-center justify-center shadow"
                    style={{ lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Лайтбокс для існуючих фото в режимі редагування */}
        {isEditing &&
          report &&
          lightboxIndex !== null &&
          createPortal(
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
            />,
            document.body,
          )}

        {/* Нові фото */}
        {localPhotos.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2">
              Нові фото · {localPhotos.length} шт. · натисніть щоб переглянути
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 6,
                scrollSnapType: "x mandatory",
              }}
            >
              {localPhotos.map((lp, idx) => (
                <div
                  key={lp.id}
                  className="relative group flex-shrink-0"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <img
                    src={lp.preview}
                    alt="preview"
                    className="rounded-lg border border-slate-200 cursor-zoom-in block"
                    style={{
                      height: 140,
                      width: "auto",
                      maxWidth: 240,
                      objectFit: "cover",
                    }}
                    onClick={() => setLocalLightboxIndex(idx)}
                  />
                  <button
                    onClick={() => handleRemoveLocalPhoto(lp.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm hidden group-hover:flex items-center justify-center shadow"
                    style={{ lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Лайтбокс для нових фото */}
        {localLightboxIndex !== null &&
          createPortal(
            <PhotoLightbox
              photos={localPhotos.map((lp) => lp.preview)}
              currentIndex={localLightboxIndex}
              onClose={() => setLocalLightboxIndex(null)}
              onPrev={() =>
                setLocalLightboxIndex(
                  (i) => (i! - 1 + localPhotos.length) % localPhotos.length,
                )
              }
              onNext={() =>
                setLocalLightboxIndex((i) => (i! + 1) % localPhotos.length)
              }
            />,
            document.body,
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

        {/* Чекбокс сповіщення — тільки при редагуванні існуючого звіту */}
        {isEditing && report && (
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={notifyParticipants}
              onChange={(e) => setNotifyParticipants(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition">
              Сповістити учасників про оновлення звіту
            </span>
          </label>
        )}

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
          <PhotoStack
            photos={report.photos.map((p) => `http://localhost:3000${p.url}`)}
            onOpen={(index) => setLightboxIndex(index)}
          />
        )}

        {lightboxIndex !== null &&
          createPortal(
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
            />,
            document.body,
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
