import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { registrationsApi } from "../../api/registrations";
import { feedbackApi } from "../../api/feedback";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import LoadingState from "../../components/common/LoadingState";
import { formatDate } from "../../utils/formatDate";
import { getCategoryColor } from "../../utils/categoryColor";
import { CalendarIcon } from "../../components/common/icons";
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
  const [mounted, setMounted] = useState(false);

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
    setTimeout(() => setMounted(true), 50);
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .mr-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }

        @keyframes mr-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mr-fade-up { opacity: 0; animation: mr-fadeUp .4s ease forwards; }
        .mr-d1 { animation-delay: .04s; }
        .mr-d2 { animation-delay: .10s; }
        .mr-d3 { animation-delay: .16s; }

        .mr-header {
          position: relative;
          background: #fff;
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 4px 24px rgba(15,23,42,.07);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .mr-header::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 80% at 95% 50%, rgba(37,99,235,.1) 0%, transparent 60%),
            radial-gradient(ellipse 30% 60% at 5% 60%, rgba(124,58,237,.06) 0%, transparent 55%);
          pointer-events: none;
        }
        .mr-header-text { position: relative; z-index: 1; }
        .mr-title { font-size: 24px; font-weight: 800; letter-spacing: -.5px; color: #0f172a; margin: 0 0 4px; }
        .mr-subtitle { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; }

        .mr-tabs {
          display: flex; gap: 6px;
          background: #fff;
          border: 1px solid #e8edf5;
          border-radius: 14px;
          padding: 5px;
          box-shadow: 0 2px 12px rgba(15,23,42,.05);
          width: fit-content;
          margin-bottom: 16px;
        }
        .mr-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 20px; border-radius: 10px;
          font-size: 13px; font-weight: 600;
          border: none; cursor: pointer;
          transition: all .2s;
          font-family: 'Manrope', sans-serif;
          color: #64748b; background: transparent;
        }
        .mr-tab.active {
          background: #0f172a;
          color: #fff;
          box-shadow: 0 4px 12px rgba(15,23,42,.2);
        }
        .mr-tab-count {
          font-size: 11px; font-weight: 700;
          padding: 2px 7px; border-radius: 100px;
        }
        .mr-tab.active .mr-tab-count { background: rgba(255,255,255,.2); color: #fff; }
        .mr-tab:not(.active) .mr-tab-count { background: #f1f5f9; color: #475569; }

        .mr-empty {
          text-align: center; padding: 60px 20px;
          background: #fff; border-radius: 16px;
          border: 1px solid #e8edf5;
        }
        .mr-empty-icon { font-size: 36px; margin-bottom: 10px; }
        .mr-empty-text { font-size: 15px; font-weight: 600; color: #475569; margin: 0 0 4px; }
        .mr-empty-sub { font-size: 13px; color: #94a3b8; margin: 0; }

        .mr-list { display: flex; flex-direction: column; gap: 10px; }

        .mr-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e8edf5;
          box-shadow: 0 2px 10px rgba(15,23,42,.04);
          overflow: hidden;
          display: flex;
          cursor: pointer;
          transition: box-shadow .2s, transform .2s;
          opacity: 0;
          animation: mr-fadeUp .35s ease forwards;
        }
        .mr-card:hover {
          box-shadow: 0 8px 28px rgba(15,23,42,.10);
          transform: translateY(-2px);
        }
        .mr-card-accent { width: 4px; flex-shrink: 0; }
        .mr-card-body { flex: 1; padding: 14px 18px; display: flex; align-items: center; gap: 14px; }
        .mr-card-info { flex: 1; min-width: 0; }
        .mr-card-badges { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .mr-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 700; letter-spacing: .03em;
          padding: 3px 9px; border-radius: 100px;
        }
        .mr-card-title {
          font-size: 14px; font-weight: 700; color: #0f172a;
          letter-spacing: -.2px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .mr-card-date {
          font-size: 12px; color: #94a3b8; font-weight: 500;
          display: flex; align-items: center; gap: 5px;
        }
        .mr-card-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .mr-btn {
          padding: 7px 14px; border-radius: 9px;
          font-size: 12px; font-weight: 600;
          border: none; cursor: pointer; transition: all .15s;
          font-family: 'Manrope', sans-serif; white-space: nowrap;
        }
        .mr-btn-ghost { background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0 !important; border: none; }
        .mr-btn-ghost:hover { background: #f1f5f9; color: #334155; }
        .mr-btn-cancel { background: #fff1f2; color: #e11d48; border: 1.5px solid #fecdd3 !important; border: none; }
        .mr-btn-cancel:hover:not(:disabled) { background: #ffe4e6; }
        .mr-btn-cancel:disabled { opacity: .5; cursor: not-allowed; }
        .mr-btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          box-shadow: 0 3px 10px rgba(37,99,235,.25);
        }
        .mr-btn-primary:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
        .mr-btn-feedback-done { background: #f0fdf4; color: #16a34a; border: 1.5px solid #bbf7d0 !important; border: none; cursor: default; }
      `}</style>

      <div className="mr-wrap">
        {/* Header */}
        <div className={`mr-header${mounted ? " mr-fade-up" : ""}`}>
          <div className="mr-header-text">
            <h1 className="mr-title">Мої реєстрації</h1>
            <p className="mr-subtitle">
              Управління вашими реєстраціями на події
            </p>
          </div>
          <div
            style={{ position: "relative", zIndex: 1, display: "flex", gap: 8 }}
          >
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#16a34a",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: 100,
                whiteSpace: "nowrap",
              }}
            >
              {upcoming.length} майбутніх
            </div>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: 100,
                whiteSpace: "nowrap",
              }}
            >
              {completed.length} завершених
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={mounted ? "mr-fade-up mr-d1" : ""}>
          <div className="mr-tabs">
            {(["upcoming", "completed"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`mr-tab${tab === t ? " active" : ""}`}
              >
                {t === "upcoming" ? (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ) : (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {t === "upcoming" ? "Майбутні" : "Завершені"}
                {(t === "upcoming" ? upcoming : completed).length > 0 && (
                  <span className="mr-tab-count">
                    {(t === "upcoming" ? upcoming : completed).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className={mounted ? "mr-fade-up mr-d2" : ""}>
          {activeList.length === 0 ? (
            <div className="mr-empty">
              <div className="mr-empty-icon">
                {tab === "upcoming" ? (
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                ) : (
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                )}
              </div>
              <p className="mr-empty-text">
                {tab === "upcoming"
                  ? "Немає майбутніх реєстрацій"
                  : "Немає завершених подій"}
              </p>
              <p className="mr-empty-sub">
                {tab === "upcoming"
                  ? "Зареєструйтесь на нову подію"
                  : "Завершені події з'являться тут"}
              </p>
            </div>
          ) : (
            <div className="mr-list">
              {activeList.map((reg, i) => (
                <RegistrationCard
                  key={reg.id}
                  registration={reg}
                  variant={tab}
                  isCancelling={cancellingId === reg.event.id}
                  hasFeedback={hasFeedback(reg.event.id)}
                  animDelay={i * 0.05}
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
      </div>
    </>
  );
}

interface RegistrationCardProps {
  registration: Registration;
  variant: "upcoming" | "completed";
  isCancelling?: boolean;
  hasFeedback?: boolean;
  animDelay?: number;
  onCancel?: () => void;
  onView: () => void;
  onFeedback?: () => void;
}

function RegistrationCard({
  registration,
  variant,
  isCancelling,
  hasFeedback,
  animDelay = 0,
  onCancel,
  onView,
  onFeedback,
}: RegistrationCardProps) {
  const { event } = registration;
  const color = getCategoryColor(event.category?.name || "default");
  const isOnline = event.format === "ONLINE";

  return (
    <div
      className="mr-card"
      style={{ animationDelay: `${animDelay}s` }}
      onClick={onView}
    >
      <div
        className="mr-card-accent"
        style={{
          background: `linear-gradient(180deg, ${color.bar}, ${color.bar}88)`,
        }}
      />
      <div className="mr-card-body">
        <div className="mr-card-info">
          <div className="mr-card-badges">
            <span
              className="mr-badge"
              style={{ background: color.bg, color: color.text }}
            >
              {event.category?.name || "Без категорії"}
            </span>
            <span
              className="mr-badge"
              style={{
                background: isOnline ? "#eff6ff" : "#fef9c3",
                color: isOnline ? "#1d4ed8" : "#92400e",
              }}
            >
              {isOnline ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              ) : (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#92400e"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )}
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <div className="mr-card-title">{event.title}</div>
          <div className="mr-card-date">
            <CalendarIcon />
            {formatDate(event.startAt)}
          </div>
        </div>

        <div className="mr-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="mr-btn mr-btn-ghost" onClick={onView}>
            Деталі
          </button>

          {variant === "upcoming" && (
            <button
              className="mr-btn mr-btn-cancel"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Скасування..." : "Скасувати участь"}
            </button>
          )}

          {variant === "completed" &&
            (hasFeedback ? (
              <span className="mr-btn mr-btn-feedback-done">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: 4 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Відгук залишено
              </span>
            ) : (
              <button className="mr-btn mr-btn-primary" onClick={onFeedback}>
                Залишити відгук
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
