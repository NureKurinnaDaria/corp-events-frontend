import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { eventsApi } from "../../api/events";
import { registrationsApi } from "../../api/registrations";
import { feedbackApi } from "../../api/feedback";
import { getCategoryColor } from "../../utils/categoryColor";
import { formatDate } from "../../utils/formatDate";
import LoadingState from "../../components/common/LoadingState";
import FeedbackForm from "../../components/events/FeedbackForm";
import FeedbackDisplay from "../../components/events/FeedbackDisplay";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import FeedbackList from "../../components/events/FeedbackList";
import { reportsApi } from "../../api/reports";
import type { Report } from "../../api/reports";
import EventReport from "../../components/events/EventReport";
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
import type { Feedback } from "../../api/feedback";

const card: React.CSSProperties = {
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

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const locationEvent =
    (location.state as { event?: Event } | null)?.event ?? null;
  const backPath = location.pathname.startsWith("/my-registrations")
    ? "/my-registrations"
    : "/events";
  const openFeedback =
    (location.state as { openFeedback?: boolean } | null)?.openFeedback ??
    false;
  const [showFeedback, setShowFeedback] = useState(openFeedback);

  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [myFeedback, setMyFeedback] = useState<Feedback | null>(null);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [eventFeedbacks, setEventFeedbacks] = useState<Feedback[]>([]);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    const eventPromise = locationEvent
      ? Promise.resolve(locationEvent)
      : eventsApi.getById(id);
    Promise.all([
      eventPromise,
      registrationsApi.getMyRegistrations(),
      feedbackApi.getMy(),
      feedbackApi.getByEvent(id),
      reportsApi.getByEvent(id),
    ])
      .then(
        ([
          eventData,
          registrationsData,
          feedbacks,
          eventFeedbacksData,
          reportData,
        ]) => {
          setEvent(eventData);
          setIsCompleted(eventData.status === "COMPLETED");
          setEventFeedbacks(eventFeedbacksData as Feedback[]);
          setReport(reportData);
          const allRegistrations = [
            ...registrationsData.upcoming,
            ...registrationsData.completed,
          ];
          const found = allRegistrations.find(
            (r) => r.event.id === id && r.status === "REGISTERED",
          );
          setIsRegistered(!!found);
          const existing = feedbacks.find((f) => f.eventId === id);
          if (existing) setMyFeedback(existing);
        },
      )
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!id || !event) return;
    setIsSubmitting(true);
    try {
      await registrationsApi.register(id);
      setIsRegistered(true);
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
      if (backPath === "/my-registrations") {
        navigate("/my-registrations");
      } else {
        setIsRegistered(false);
        const updated = await eventsApi.getById(id);
        setEvent(updated);
      }
    } catch (error: unknown) {
      alert(getApiErrorMessage(error, "Помилка скасування"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!id) return;
    setIsSendingFeedback(true);
    try {
      const created = await feedbackApi.create({
        eventId: id,
        rating,
        comment,
      });
      setMyFeedback(created);
    } catch (error: unknown) {
      alert(getApiErrorMessage(error, "Помилка надсилання відгуку"));
    } finally {
      setIsSendingFeedback(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (!event) return <LoadingState text="Подію не знайдено" />;

  const color = getCategoryColor(event.category?.name || "default");
  const max = event.maxParticipants;
  const registered = event.participantsCount;
  const free = max ? max - registered : null;
  const isFull = max !== null && max !== undefined && registered >= max;
  const progress = max ? Math.min((registered / max) * 100, 100) : 0;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-1.5 text-sm transition mb-5"
        style={{ color: "#64748b", fontWeight: 500 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
      >
        <ChevronLeftIcon />
        {backPath === "/my-registrations"
          ? "Назад до реєстрацій"
          : "Назад до подій"}
      </button>

      {/* Main card */}
      <div style={card}>
        <div
          style={{
            height: "4px",
            background: `linear-gradient(90deg, ${color.bar}, ${color.bar}99)`,
          }}
        />
        <div className="p-6">
          {/* Category + format */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: color.bg, color: color.text }}
            >
              {event.category?.name || "Без категорії"}
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

          {/* Title + description */}
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

          {/* Date grid */}
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

          {/* Location */}
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

          {/* Online link */}
          {event.format === "ONLINE" && event.onlineUrl && isRegistered && (
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

          {/* Participants */}
          <div
            className="mb-6 pt-5"
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
                  <span className="text-slate-400">· {free} місць вільно</span>
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
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(backPath)}
              className="px-5 py-2.5 text-sm rounded-xl transition"
              style={{
                color: "#64748b",
                background: "rgba(248,250,252,0.9)",
                border: "1px solid #e2e8f0",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.color = "#334155";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(248,250,252,0.9)";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              Назад
            </button>
            {isCompleted ? (
              <span className="flex-1 py-2.5 text-sm text-slate-400 text-center">
                Подія завершена
              </span>
            ) : isRegistered ? (
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-sm rounded-xl transition disabled:opacity-50"
                style={{
                  color: "#e11d48",
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ffe4e6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff1f2";
                }}
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
                className="flex-1 py-2.5 text-sm rounded-xl transition disabled:opacity-50 text-white"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  border: "none",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #1d4ed8, #1e40af)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #2563eb, #1d4ed8)";
                }}
              >
                {isSubmitting ? "Реєстрація..." : "Зареєструватись"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback block */}
      {isCompleted && (
        <div style={{ ...card, marginTop: "16px" }}>
          <div
            style={{
              height: "4px",
              background: `linear-gradient(90deg, ${color.bar}, ${color.bar}99)`,
            }}
          />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p style={sectionLabel}>Відгук про подію</p>
              {!myFeedback && !showFeedback && (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="text-sm text-blue-600 hover:underline"
                  style={{ fontWeight: 500 }}
                >
                  Залишити відгук
                </button>
              )}
            </div>
            {myFeedback ? (
              <FeedbackDisplay feedback={myFeedback} />
            ) : showFeedback ? (
              <FeedbackForm
                onSubmit={handleFeedbackSubmit}
                isLoading={isSendingFeedback}
              />
            ) : (
              <p className="text-sm text-slate-400">
                Ви ще не залишили відгук про цю подію
              </p>
            )}
          </div>
        </div>
      )}

      {/* Report block */}
      {isCompleted && (
        <div style={{ ...card, marginTop: "16px" }}>
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
              isAdmin={false}
              onReportChange={setReport}
            />
          </div>
        </div>
      )}

      {/* All feedbacks */}
      {isCompleted && eventFeedbacks.length > 0 && (
        <div style={{ ...card, marginTop: "16px" }}>
          <div
            style={{
              height: "4px",
              background: `linear-gradient(90deg, ${color.bar}, ${color.bar}99)`,
            }}
          />
          <div className="p-6">
            <p style={sectionLabel}>Відгуки учасників</p>
            <FeedbackList
              feedbacks={eventFeedbacks.filter((f) => f.id !== myFeedback?.id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
