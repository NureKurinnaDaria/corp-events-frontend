import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { registrationsApi } from "../../api/registrations";
import { feedbackApi } from "../../api/feedback";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import LoadingState from "../../components/common/LoadingState";
import { formatDate } from "../../utils/formatDate";
import { getCategoryColor } from "../../utils/categoryColor";
import {
  CalendarIcon,
  OnlineIcon,
  OfflineIcon,
} from "../../components/common/icons";
import type { Registration } from "../../types";
import type { Feedback } from "../../api/feedback";

export default function MyRegistrationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");
  const [upcoming, setUpcoming] = useState<Registration[]>([]);
  const [completed, setCompleted] = useState<Registration[]>([]);
  const [myFeedbacks, setMyFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [regs, feedbacks] = await Promise.all([
        registrationsApi.getMyRegistrations(),
        feedbackApi.getMy(),
      ]);
      setUpcoming(regs.upcoming);
      setCompleted(regs.completed);
      setMyFeedbacks(feedbacks);
    } catch (err: unknown) {
      console.error(getApiErrorMessage(err, "Помилка завантаження"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [location.pathname]);

  const handleCancel = async (eventId: string) => {
    setCancellingId(eventId);
    try {
      await registrationsApi.cancel(eventId);
      await load();
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Помилка скасування"));
    } finally {
      setCancellingId(null);
    }
  };

  const hasFeedback = (eventId: string) =>
    myFeedbacks.some((f) => f.eventId === eventId);

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-medium text-slate-800 mb-1">
          Мої реєстрації
        </h1>
        <p className="text-sm text-slate-500">
          Управління вашими реєстраціями на події
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-5 w-fit">
        <button
          onClick={() => setTab("upcoming")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            tab === "upcoming"
              ? "bg-blue-600 text-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Майбутні
          {upcoming.length > 0 && (
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                tab === "upcoming"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {upcoming.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            tab === "completed"
              ? "bg-blue-600 text-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Завершені
          {completed.length > 0 && (
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                tab === "completed"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {completed.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {tab === "upcoming" ? (
        upcoming.length === 0 ? (
          <EmptyState text="Немає майбутніх реєстрацій" />
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((reg) => (
              <RegistrationCard
                key={reg.id}
                registration={reg}
                variant="upcoming"
                isCancelling={cancellingId === reg.event.id}
                onCancel={() => handleCancel(reg.event.id)}
                onView={() =>
                  navigate(`/my-registrations/${reg.event.id}`, {
                    state: { event: reg.event },
                  })
                }
              />
            ))}
          </div>
        )
      ) : completed.length === 0 ? (
        <EmptyState text="Немає завершених подій" />
      ) : (
        <div className="flex flex-col gap-3">
          {completed.map((reg) => (
            <RegistrationCard
              key={reg.id}
              registration={reg}
              variant="completed"
              hasFeedback={hasFeedback(reg.event.id)}
              onView={() =>
                navigate(`/my-registrations/${reg.event.id}`, {
                  state: { event: reg.event },
                })
              }
              onFeedback={() =>
                navigate(`/my-registrations/${reg.event.id}`, {
                  state: { event: reg.event, openFeedback: true },
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  );
}

interface RegistrationCardProps {
  registration: Registration;
  variant: "upcoming" | "completed";
  isCancelling?: boolean;
  hasFeedback?: boolean;
  onCancel?: () => void;
  onView: () => void;
  onFeedback?: () => void;
}

function RegistrationCard({
  registration,
  variant,
  isCancelling,
  hasFeedback,
  onCancel,
  onView,
  onFeedback,
}: RegistrationCardProps) {
  const { event } = registration;
  const color = getCategoryColor(event.category?.name || "default");

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex">
      <div className="w-1 flex-shrink-0" style={{ background: color.bar }} />
      <div className="flex-1 px-5 py-4 flex items-center gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
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

          <p className="text-sm font-medium text-slate-800 truncate">
            {event.title}
          </p>

          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <CalendarIcon />
            {formatDate(event.startAt)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {variant === "upcoming" && (
            <>
              <button
                onClick={onView}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Деталі
              </button>
              <button
                onClick={onCancel}
                disabled={isCancelling}
                className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                {isCancelling ? "Скасування..." : "Скасувати участь"}
              </button>
            </>
          )}

          {variant === "completed" && (
            <>
              <button
                onClick={onView}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Деталі
              </button>
              <button
                onClick={onFeedback}
                disabled={hasFeedback}
                className={`px-4 py-2 text-sm rounded-lg transition ${
                  hasFeedback
                    ? "text-slate-400 border border-slate-200 cursor-default"
                    : "text-white bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {hasFeedback ? "Відгук залишено ✓" : "Залишити відгук"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
