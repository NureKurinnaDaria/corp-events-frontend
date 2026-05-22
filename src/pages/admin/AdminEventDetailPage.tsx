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
import { reportsApi } from "../../api/reports";
import type { Report } from "../../api/reports";
import EventReport from "../../components/events/EventReport";
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

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(59,130,246,0.10)",
  boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
  borderRadius: "16px",
  overflow: "hidden",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  color: "#94a3b8",
  textTransform: "uppercase",
  marginBottom: "8px",
};

function getInitials(fullName: string | null, email: string) {
  if (fullName) {
    const p = fullName.trim().split(" ");
    return p.length >= 2
      ? (p[0][0] + p[1][0]).toUpperCase()
      : p[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
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
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      eventsApi.getById(id),
      registrationsApi.getEventParticipants(id),
      feedbackApi.getByEvent(id),
      reportsApi.getByEvent(id),
    ])
      .then(([eventData, participantsData, feedbacksData, reportData]) => {
        setEvent(eventData);
        setParticipants(participantsData);
        setFeedbacks(feedbacksData as Feedback[]);
        setReport(reportData);
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
      if (event)
        setEvent({ ...event, participantsCount: event.participantsCount - 1 });
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
  const progress = max ? Math.min((registered / max) * 100, 100) : 0;
  const isEditable = event.status === "PUBLISHED" || event.status === "ONGOING";

  return (
    <div>
      <button
        onClick={() => navigate("/admin/events")}
        className="flex items-center gap-1.5 text-sm transition mb-5"
        style={{ color: "#64748b", fontWeight: 500 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
      >
        <ChevronLeftIcon /> Назад до подій
      </button>

      {/* Action buttons row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-400" style={{ fontWeight: 500 }}>
          Деталі події
        </p>
        <div className="flex items-center gap-2">
          {isEditable && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={isCanceling}
              className="px-4 py-2 text-sm font-medium rounded-xl transition disabled:opacity-50"
              style={{
                color: "#92400e",
                background: "#fef9c3",
                border: "1px solid #fde68a",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef08a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fef9c3";
              }}
            >
              {isCanceling ? "Скасування..." : "Скасувати подію"}
            </button>
          )}
          {isEditable && (
            <button
              onClick={() => navigate(`/admin/events/${id}/edit`)}
              className="px-4 py-2 text-sm font-medium rounded-xl transition"
              style={{
                color: "#1d4ed8",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#dbeafe";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#eff6ff";
              }}
            >
              Редагувати
            </button>
          )}
          {event.status === "CANCELED" && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium rounded-xl transition"
              style={{
                color: "#e11d48",
                background: "#fff1f2",
                border: "1px solid #fecdd3",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ffe4e6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff1f2";
              }}
            >
              Видалити
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
        {/* LEFT */}
        <div style={glass}>
          <div
            style={{
              height: "4px",
              background: `linear-gradient(90deg, ${color.bar}, ${color.bar}99)`,
            }}
          />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {event.category?.name && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: color.bg, color: color.text }}
                >
                  {event.category.name}
                </span>
              )}
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
              <span
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: event.format === "ONLINE" ? "#eff6ff" : "#fef9c3",
                  color: event.format === "ONLINE" ? "#1d4ed8" : "#92400e",
                }}
              >
                {event.format === "ONLINE" ? <OnlineIcon /> : <OfflineIcon />}
                {event.format === "ONLINE" ? "Online" : "Offline"}
              </span>
            </div>

            <h1
              className="text-slate-900 mb-2"
              style={{
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.4px",
              }}
            >
              {event.title}
            </h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {event.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Початок", val: event.startAt },
                { label: "Кінець", val: event.endAt },
              ].map(({ label, val }) => (
                <div
                  key={label}
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(241,245,249,0.8)",
                    border: "1px solid rgba(59,130,246,0.07)",
                  }}
                >
                  <p style={sectionLabel}>{label}</p>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                    <CalendarIcon />
                    {formatDate(val)}
                  </p>
                </div>
              ))}
            </div>

            {event.format === "OFFLINE" && event.location && (
              <div
                className="mb-5 pt-5"
                style={{ borderTop: "1px solid rgba(59,130,246,0.07)" }}
              >
                <p style={sectionLabel}>Місце проведення</p>
                <p className="text-sm text-slate-700 flex items-center gap-2">
                  <LocationIcon />
                  {event.location}
                </p>
              </div>
            )}

            {event.format === "ONLINE" && event.onlineUrl && (
              <div
                className="mb-5 pt-5"
                style={{ borderTop: "1px solid rgba(59,130,246,0.07)" }}
              >
                <p style={sectionLabel}>Посилання</p>
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

            <div
              className="pt-5"
              style={{ borderTop: "1px solid rgba(59,130,246,0.07)" }}
            >
              <p style={sectionLabel}>Учасники</p>
              <div className="flex items-center justify-between text-sm text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <UsersIcon />
                  {max != null
                    ? `${registered} / ${max} зареєстровано`
                    : `${registered} зареєстровано`}
                  {free !== null && (
                    <span className="text-slate-400">
                      · {free} місць вільно
                    </span>
                  )}
                </span>
                {max && (
                  <span
                    style={{
                      color: color.text,
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    {Math.round(progress)}%
                  </span>
                )}
              </div>
              {max && (
                <div
                  className="rounded-full overflow-hidden"
                  style={{ height: "5px", background: "rgba(59,130,246,0.08)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${color.bar}, ${color.bar}cc)`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — participants */}
        <div style={glass}>
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(59,130,246,0.07)" }}
          >
            <span className="text-sm font-semibold text-slate-800">
              Учасники
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                fontWeight: 600,
              }}
            >
              {participants.length}
            </span>
          </div>

          {participants.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              Ще немає зареєстрованих учасників
            </div>
          ) : (
            <div>
              {participants.map((p, i) => {
                const avatarColor = getAvatarColor(p.user.id);
                const initials = getInitials(p.user.fullName, p.user.email);
                return (
                  <div
                    key={p.registrationId}
                    className="flex items-center gap-3 px-5 py-3"
                    style={{
                      borderTop:
                        i > 0 ? "1px solid rgba(59,130,246,0.06)" : "none",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden"
                      style={{
                        background: p.user.avatarUrl
                          ? "transparent"
                          : avatarColor.bg,
                        color: avatarColor.color,
                      }}
                    >
                      {p.user.avatarUrl ? (
                        <img
                          src={p.user.avatarUrl}
                          alt={p.user.fullName || p.user.email}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
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
                          className="flex-shrink-0 text-xs px-2.5 py-1 rounded-xl font-medium transition"
                          style={{
                            color: "#e11d48",
                            background: "#fff1f2",
                            border: "1px solid #fecdd3",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#ffe4e6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff1f2";
                          }}
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

        {/* Feedbacks */}
        {event.status === "COMPLETED" && (
          <div style={{ ...glass, marginTop: "0" }}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(59,130,246,0.07)" }}
            >
              <span className="text-sm font-semibold text-slate-800">
                Відгуки учасників
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 600,
                }}
              >
                {feedbacks.length}
              </span>
            </div>
            <div className="p-5">
              <FeedbackList feedbacks={feedbacks} />
            </div>
          </div>
        )}

        {/* Report */}
        {event.status === "COMPLETED" && (
          <div style={{ ...glass, marginTop: "0" }}>
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(59,130,246,0.07)" }}
            >
              <span className="text-sm font-semibold text-slate-800">
                Звіт про подію
              </span>
              {report && (
                <span className="text-xs text-slate-400">
                  {new Date(report.createdAt).toLocaleDateString("uk-UA")}
                </span>
              )}
            </div>
            <div className="p-5">
              <EventReport
                eventId={id!}
                report={report}
                isAdmin={true}
                onReportChange={setReport}
              />
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
