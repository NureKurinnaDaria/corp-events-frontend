import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventsApi } from "../../api/events";
import { registrationsApi } from "../../api/registrations";
import { getCategoryColor } from "../../utils/categoryColor";
import { formatDate } from "../../utils/formatDate";
import SuccessModal from "../../components/common/SuccessModal";
import LoadingState from "../../components/common/LoadingState";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import {
  OnlineIcon,
  OfflineIcon,
  CalendarIcon,
  UsersIcon,
  LocationIcon,
  LinkIcon,
  ChevronLeftIcon,
} from "../../components/common/icons";
import type { Event } from "../../types";

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
          (registration) =>
            registration.event.id === id &&
            registration.status === "REGISTERED",
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
    } catch (error: unknown) {
      alert(getApiErrorMessage(error, "Помилка реєстрації"));
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
    } catch (error: unknown) {
      alert(getApiErrorMessage(error, "Помилка скасування"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (!event) return <LoadingState text="Подію не знайдено" />;

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
        <ChevronLeftIcon />
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
              {event.format === "ONLINE" ? <OnlineIcon /> : <OfflineIcon />}
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
                <CalendarIcon />
                {formatDate(event.startAt)}
              </p>
            </div>
            <div className="rounded-lg p-3" style={{ background: "#E6F1FB" }}>
              <p className="text-xs text-slate-500 mb-1">Кінець</p>
              <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <CalendarIcon />
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
                <LocationIcon />
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
                <LinkIcon />
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
              <UsersIcon />
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

      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}
