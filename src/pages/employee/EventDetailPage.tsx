import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventsApi } from "../../api/events";
import { registrationsApi } from "../../api/registrations";
import { getCategoryColor } from "../../utils/categoryColor";
import type { Event } from "../../types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    Promise.all([eventsApi.getById(id), registrationsApi.getMyRegistrations()])
      .then(([eventData, registrationsData]) => {
        setEvent(eventData);
        const allRegistrations = [
          ...registrationsData.upcoming,
          ...registrationsData.completed,
        ];
        const found = allRegistrations.find(
          (r: any) => r.event.id === id && r.status === "REGISTERED",
        );
        setIsRegistered(!!found);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!id || !event) return;
    setIsSubmitting(true);
    try {
      await registrationsApi.register(id);
      setIsRegistered(true);
      setSuccessMessage(`Ви успішно зареєстровані на подію: ${event.title}`);
      const updated = await eventsApi.getById(id);
      setEvent(updated);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Помилка реєстрації");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await registrationsApi.cancel(id);
      setIsRegistered(false);
      const updated = await eventsApi.getById(id);
      setEvent(updated);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Помилка скасування");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        Завантаження...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        Подію не знайдено
      </div>
    );
  }

  const color = getCategoryColor(event.category?.name || "default");
  const max = event.maxParticipants;
  const registered = event.participantsCount;
  const free = max ? max - registered : null;
  const isFull = max !== null && max !== undefined && registered >= max;

  return (
    <div>
      {/* Назад */}
      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-4"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Назад до подій
      </button>

      {/* Картка */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: color.bar }} />
        <div className="p-6">
          {/* Категорія та формат */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: color.bg, color: color.text }}
            >
              {event.category?.name || "Без категорії"}
            </span>
            <span
              className="flex items-center gap-1 text-xs"
              style={{
                color: event.format === "ONLINE" ? "#1a6fd4" : "#92400e",
              }}
            >
              {event.format === "ONLINE" ? (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1a6fd4"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              ) : (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#92400e"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )}
              {event.format === "ONLINE" ? "Online" : "Offline"}
            </span>
          </div>

          {/* Назва та опис */}
          <h1 className="text-xl font-medium text-slate-800 mb-2">
            {event.title}
          </h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {event.description}
          </p>

          {/* Дати */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-lg p-3" style={{ background: "#E6F1FB" }}>
              <p className="text-xs text-slate-500 mb-1">Початок</p>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(event.startAt)}
              </p>
            </div>
            <div className="rounded-lg p-3" style={{ background: "#E6F1FB" }}>
              <p className="text-xs text-slate-500 mb-1">Кінець</p>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(event.endAt)}
              </p>
            </div>
          </div>

          {/* Адреса для OFFLINE */}
          {event.format === "OFFLINE" && event.location && (
            <div className="border-t border-slate-100 pt-5 mb-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Місце проведення
              </p>
              <p className="text-sm text-slate-700 flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {event.location}
              </p>
            </div>
          )}

          {/* Посилання для ONLINE — тільки зареєстрованим */}
          {event.format === "ONLINE" && event.onlineUrl && isRegistered && (
            <div className="border-t border-slate-100 pt-5 mb-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Посилання
              </p>
              <a
                href={event.onlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-2"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                {event.onlineUrl}
              </a>
            </div>
          )}

          {/* Учасники */}
          <div className="border-t border-slate-100 pt-5 mb-6">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Учасники
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-700 mb-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {max
                ? `${registered} / ${max} зареєстровано`
                : `${registered} зареєстровано`}
              {free !== null && (
                <span className="text-slate-400">· {free} місць вільно</span>
              )}
            </div>
            {max && (
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((registered / max) * 100, 100)}%`,
                    background: color.bar,
                  }}
                />
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/events")}
              className="px-5 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              Назад
            </button>
            {isRegistered ? (
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
              >
                {isSubmitting ? "Скасування..." : "Скасувати реєстрацію"}
              </button>
            ) : isFull ? (
              <span className="flex-1 py-2.5 text-sm text-slate-400 text-center">
                Місць немає
              </span>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50"
              >
                {isSubmitting ? "Реєстрація..." : "Зареєструватись"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Модалка успіху */}
      {successMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Реєстрацію підтверджено!
            </h2>
            <p className="text-sm text-slate-500 mb-6">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition"
            >
              Чудово!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
