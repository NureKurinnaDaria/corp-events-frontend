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

  const activeList = tab === "upcoming" ? upcoming : completed;

  return (
    <div>
      <div className="mb-5">
        <h1
          className="text-slate-900 mb-1"
          style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.4px" }}
        >
          Мої реєстрації
        </h1>
        <p className="text-sm text-slate-400">
          Управління вашими реєстраціями на події
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 mb-5 w-fit rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(59,130,246,0.10)",
          boxShadow: "0 2px 12px rgba(59,130,246,0.05)",
        }}
      >
        {(["upcoming", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2"
            style={
              tab === t
                ? {
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                  }
                : { color: "#64748b" }
            }
          >
            {t === "upcoming" ? "Майбутні" : "Завершені"}
            {(t === "upcoming" ? upcoming : completed).length > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={
                  tab === t
                    ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { background: "rgba(59,130,246,0.08)", color: "#2563eb" }
                }
              >
                {(t === "upcoming" ? upcoming : completed).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {activeList.length === 0 ? (
        <div
          className="py-16 text-center rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(59,130,246,0.10)",
          }}
        >
          <p className="text-slate-400 text-sm">
            {tab === "upcoming"
              ? "Немає майбутніх реєстрацій"
              : "Немає завершених подій"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeList.map((reg) => (
            <RegistrationCard
              key={reg.id}
              registration={reg}
              variant={tab}
              isCancelling={cancellingId === reg.event.id}
              hasFeedback={hasFeedback(reg.event.id)}
              onCancel={() => handleCancel(reg.event.id)}
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
    <div
      className="overflow-hidden flex transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(59,130,246,0.10)",
        boxShadow: "0 2px 12px rgba(59,130,246,0.05)",
        borderRadius: "16px",
        cursor: "pointer",
      }}
      onClick={onView}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 28px rgba(59,130,246,0.12)";
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 12px rgba(59,130,246,0.05)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Left accent bar */}
      <div
        className="w-1 flex-shrink-0"
        style={{
          background: `linear-gradient(180deg, ${color.bar}, ${color.bar}88)`,
        }}
      />

      <div className="flex-1 px-5 py-4 flex items-center gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: color.bg, color: color.text }}
            >
              {event.category?.name || "Без категорії"}
            </span>
            <span
              className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: event.format === "ONLINE" ? "#eff6ff" : "#fef9c3",
                color: event.format === "ONLINE" ? "#1d4ed8" : "#92400e",
              }}
            >
              {event.format === "ONLINE" ? <OnlineIcon /> : <OfflineIcon />}
              {event.format === "ONLINE" ? "Online" : "Offline"}
            </span>
          </div>

          <p
            className="text-sm font-semibold text-slate-800 truncate"
            style={{ letterSpacing: "-0.1px" }}
          >
            {event.title}
          </p>

          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <CalendarIcon />
            {formatDate(event.startAt)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="px-4 py-2 text-xs rounded-xl transition font-medium"
            style={{
              color: "#64748b",
              background: "rgba(248,250,252,0.9)",
              border: "1px solid #e2e8f0",
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
            Деталі
          </button>

          {variant === "upcoming" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel && onCancel();
              }}
              disabled={isCancelling}
              className="px-4 py-2 text-xs rounded-xl transition font-medium disabled:opacity-50"
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
              {isCancelling ? "Скасування..." : "Скасувати участь"}
            </button>
          )}

          {variant === "completed" &&
            (hasFeedback ? (
              <span
                className="px-4 py-2 text-xs rounded-xl font-medium"
                style={{
                  color: "#16a34a",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                Відгук залишено ✓
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFeedback && onFeedback();
                }}
                className="px-4 py-2 text-xs rounded-xl transition font-medium text-white"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  border: "none",
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
                Залишити відгук
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
