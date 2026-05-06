import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventsApi } from "../../api/events";
import { registrationsApi } from "../../api/registrations";
import type { EventParticipant } from "../../api/registrations";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { getCategoryColor } from "../../utils/categoryColor";
import { formatDate } from "../../utils/formatDate";
import LoadingState from "../../components/common/LoadingState";
import ConfirmModal from "../../components/common/ConfirmModal";
import { feedbackApi } from "../../api/feedback";
import type { Feedback } from "../../api/feedback";
import FeedbackList from "../../components/events/FeedbackList";
import {
  ChevronLeftIcon,
  CalendarIcon,
  UsersIcon,
  LocationIcon,
  LinkIcon,
  OnlineIcon,
  OfflineIcon,
} from "../../components/common/icons";
import type { Event } from "../../types";

const STATUS_CONFIG = {
  PUBLISHED: { label: "Published", bg: "#f0fdf4", color: "#16a34a" },
  ONGOING: { label: "Ongoing", bg: "#eff6ff", color: "#1a6fd4" },
  COMPLETED: { label: "Completed", bg: "#f8fafc", color: "#64748b" },
  CANCELED: { label: "Canceled", bg: "#fff1f2", color: "#e11d48" },
} as const;

const AVATAR_COLORS = [
  { bg: "#eff6ff", color: "#1d4ed8" },
  { bg: "#f5f3ff", color: "#6d28d9" },
  { bg: "#f0fdf4", color: "#15803d" },
  { bg: "#fff7ed", color: "#c2410c" },
  { bg: "#fdf2f8", color: "#a21caf" },
  { bg: "#fff1f2", color: "#be123c" },
];

function getInitials(fullName: string | null, email: string): string {
  if (fullName) {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [participantToCancel, setParticipantToCancel] = useState<string | null>(
    null,
  );
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      eventsApi.getById(id),
      registrationsApi.getEventParticipants(id),
      feedbackApi.getByEvent(id),
    ])
      .then(([eventData, participantsData, feedbacksData]) => {
        setEvent(eventData);
        setParticipants(participantsData);
        setFeedbacks(feedbacksData as Feedback[]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!id || !event) return;
    setIsCanceling(true);
    setShowCancelConfirm(false);
    try {
      const updated = await eventsApi.cancelById(id);
      setEvent(updated);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Помилка скасування події"));
    } finally {
      setIsCanceling(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setShowDeleteConfirm(false);
    try {
      await eventsApi.deleteById(id);
      navigate("/admin/events");
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Помилка видалення"));
    }
  };

  const handleCancelParticipant = async () => {
    if (!participantToCancel) return;
    try {
      await registrationsApi.cancelByRegistrationId(participantToCancel);
      setParticipants((prev) =>
        prev.filter((p) => p.registrationId !== participantToCancel),
      );
      if (event) {
        setEvent({ ...event, participantsCount: event.participantsCount - 1 });
      }
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Помилка скасування"));
    } finally {
      setParticipantToCancel(null);
    }
  };

  if (isLoading) return <LoadingState />;
  if (!event) return <LoadingState text="Подію не знайдено" />;

  const color = getCategoryColor(event.category?.name || "default");
  const status = STATUS_CONFIG[event.status];
  const max = event.maxParticipants;
  const registered = event.participantsCount;
  const free = max ? max - registered : null;
  const isEditable = event.status === "PUBLISHED" || event.status === "ONGOING";

  return (
    <div>
      <button
        onClick={() => navigate("/admin/events")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-4"
      >
        <ChevronLeftIcon />
        Назад до подій
      </button>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">Деталі події</span>
        <div className="flex items-center gap-2">
          {isEditable && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={isCanceling}
              className="px-4 py-2 text-sm text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-xl transition disabled:opacity-50"
            >
              {isCanceling ? "Скасування..." : "Скасувати подію"}
            </button>
          )}
          {isEditable && (
            <button
              onClick={() => navigate(`/admin/events/${id}/edit`)}
              className="px-4 py-2 text-sm text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
            >
              Редагувати
            </button>
          )}
          {event.status === "CANCELED" && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
            >
              Видалити
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
        {/* LEFT — event details */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: color.bar }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {event.category?.name && (
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: color.bg, color: color.text }}
                >
                  {event.category.name}
                </span>
              )}
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
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

            <h1 className="text-xl font-medium text-slate-800 mb-2">
              {event.title}
            </h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {event.description}
            </p>

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

            {event.format === "ONLINE" && event.onlineUrl && (
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

            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Учасники
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-700 mb-2">
                <UsersIcon />
                {max != null
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
          </div>
        </div>

        {/* RIGHT — participants */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-800">Учасники</span>
            <span className="text-xs text-slate-400">
              {participants.length} зареєстровано
            </span>
          </div>

          {participants.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              Ще немає зареєстрованих учасників
            </div>
          ) : (
            <div>
              {participants.map((p) => {
                const avatarColor = getAvatarColor(p.user.id);
                const initials = getInitials(p.user.fullName, p.user.email);
                return (
                  <div
                    key={p.registrationId}
                    className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                      style={{
                        background: avatarColor.bg,
                        color: avatarColor.color,
                      }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {p.user.fullName || p.user.email}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {p.user.email}
                        {p.user.position ? ` · ${p.user.position}` : ""}
                      </p>
                    </div>
                    {event.status !== "CANCELED" &&
                      event.status !== "COMPLETED" && (
                        <button
                          onClick={() =>
                            setParticipantToCancel(p.registrationId)
                          }
                          className="flex-shrink-0 text-xs px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                        >
                          Скасувати
                        </button>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {event.status === "COMPLETED" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-800">
                Відгуки учасників
              </span>
              <span className="text-xs text-slate-400">
                {feedbacks.length} відгуків
              </span>
            </div>
            <div className="p-5">
              <FeedbackList feedbacks={feedbacks} />
            </div>
          </div>
        )}
      </div>
      {showCancelConfirm && (
        <ConfirmModal
          title="Скасувати подію?"
          message="Учасники будуть повідомлені про скасування."
          confirmLabel="Скасувати подію"
          cancelLabel="Назад"
          variant="warning"
          onConfirm={handleCancel}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Видалити подію?"
          message="Цю дію не можна скасувати. Подія буде видалена назавжди."
          confirmLabel="Видалити"
          cancelLabel="Назад"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {participantToCancel && (
        <ConfirmModal
          title="Скасувати реєстрацію?"
          message="Учасник отримає email-повідомлення про скасування."
          confirmLabel="Скасувати реєстрацію"
          cancelLabel="Назад"
          variant="danger"
          onConfirm={handleCancelParticipant}
          onCancel={() => setParticipantToCancel(null)}
        />
      )}
    </div>
  );
}
