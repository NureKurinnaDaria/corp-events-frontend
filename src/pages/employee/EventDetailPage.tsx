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

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    const eventPromise = locationEvent
      ? Promise.resolve(locationEvent)
      : eventsApi.getById(id);

    Promise.all([
      eventPromise,
      registrationsApi.getMyRegistrations(),
      feedbackApi.getMy(),
      feedbackApi.getByEvent(id),
    ])
      .then(([eventData, registrationsData, feedbacks, eventFeedbacksData]) => {
        setEvent(eventData);
        setIsCompleted(eventData.status === "COMPLETED");

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

        const existing = feedbacks.find((f) => f.eventId === id);
        if (existing) setMyFeedback(existing);
        setEventFeedbacks(eventFeedbacksData as Feedback[]);
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

  return (
    <div>
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-4"
      >
        <ChevronLeftIcon />
        {backPath === "/my-registrations"
          ? "Назад до реєстрацій"
          : "Назад до подій"}
      </button>

      {/* Картка події */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: color.bar }} />
        <div className="p-6">
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

          <div className="border-t border-slate-100 pt-5 mb-6">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Учасники
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-700 mb-2">
              <UsersIcon />
              {max != null && registered != null
                ? `${registered} / ${max} зареєстровано`
                : registered != null
                  ? `${registered} зареєстровано`
                  : "Дані недоступні"}
              {free !== null && free !== undefined && (
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

          <div className="flex gap-3">
            <button
              onClick={() => navigate(backPath)}
              className="px-5 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
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

      {/* Блок відгуку */}
      {isCompleted && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-4">
          <div className="h-1.5 w-full" style={{ background: color.bar }} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Відгук про подію
              </p>
              {!myFeedback && !showFeedback && (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="text-sm text-blue-600 hover:underline"
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
      {isCompleted && eventFeedbacks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-4">
          <div className="h-1.5 w-full" style={{ background: color.bar }} />
          <div className="p-6">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
              Відгуки учасників
            </p>
            <FeedbackList
              feedbacks={eventFeedbacks.filter((f) => f.id !== myFeedback?.id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
