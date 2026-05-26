import React, { useState, useEffect, type ReactElement } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { eventsApi } from "../../api/events";
import { registrationsApi } from "../../api/registrations";
import { feedbackApi } from "../../api/feedback";
import { getCategoryColor } from "../../utils/categoryColor";
import { formatDate } from "../../utils/formatDate";
import LoadingState from "../../components/common/LoadingState";
import ConfirmModal from "../../components/common/ConfirmModal";
import SuccessModal from "../../components/common/SuccessModal";
import ErrorModal from "../../components/common/ErrorModal";
import FeedbackForm from "../../components/events/FeedbackForm";
import FeedbackDisplay from "../../components/events/FeedbackDisplay";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import FeedbackList from "../../components/events/FeedbackList";
import { reportsApi } from "../../api/reports";
import type { Report } from "../../api/reports";
import EventReport from "../../components/events/EventReport";
import {
  CalendarIcon,
  UsersIcon,
  LocationIcon,
  LinkIcon,
  ChevronLeftIcon,
} from "../../components/common/icons";
import type { Event } from "../../types";
import type { Feedback } from "../../api/feedback";
import { useEventSocket } from "../../hooks/useSocket";

type TabId = "my-feedback" | "all-feedbacks" | "report";

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
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [myFeedback, setMyFeedback] = useState<Feedback | null>(null);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [eventFeedbacks, setEventFeedbacks] = useState<Feedback[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("my-feedback");
  const [canceledByAdmin, setCanceledByAdmin] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

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

  // Real-time WebSocket
  useEventSocket({
    eventId: id,
    onStatusChanged: (payload) => {
      if (payload.status === "CANCELED") {
        setCanceledByAdmin(true);
        setEvent((prev) => (prev ? { ...prev, status: "CANCELED" } : prev));
      } else {
        setEvent((prev) =>
          prev ? { ...prev, status: payload.status as any } : prev,
        );
      }
    },
    onParticipantsUpdated: (payload) => {
      setEvent((prev) =>
        prev ? { ...prev, participantsCount: payload.participantsCount } : prev,
      );
    },
  });

  const handleRegister = async () => {
    if (!id || !event) return;
    setShowRegisterConfirm(false);
    setIsSubmitting(true);
    try {
      await registrationsApi.register(id);
      setIsRegistered(true);
      const updated = await eventsApi.getById(id);
      setEvent(updated);
      setSuccessMessage(`Ви успішно зареєстровані на подію: ${event.title}`);
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, "Помилка реєстрації"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setShowCancelConfirm(false);
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
      setErrorMessage(getApiErrorMessage(error, "Помилка скасування"));
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
  const isOnline = event.format === "ONLINE";

  const otherFeedbacks = eventFeedbacks.filter((f) => f.id !== myFeedback?.id);

  const tabs: {
    id: TabId;
    label: string;
    count?: number;
    dot?: boolean;
    icon: ReactElement;
  }[] = isCompleted
    ? [
        {
          id: "my-feedback",
          label: "Мій відгук",
          dot: !myFeedback,
          icon: (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ),
        },
        {
          id: "all-feedbacks",
          label: "Відгуки учасників",
          count: otherFeedbacks.length,
          icon: (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          ),
        },
        {
          id: "report",
          label: "Звіт",
          icon: (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="9" y="2" width="6" height="4" rx="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="16" x2="13" y2="16" />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .ed-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }

        @keyframes ed-fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ed-pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .5; transform: scale(1.4); }
        }

        .ed-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: #64748b;
          background: none; border: none; cursor: pointer; padding: 0;
          transition: color .2s, gap .2s; letter-spacing: -.01em;
        }
        .ed-back-btn:hover { color: #1e40af; gap: 10px; }
        .ed-back-btn svg { transition: transform .2s; }
        .ed-back-btn:hover svg { transform: translateX(-2px); }

        .ed-hero {
          position: relative; border-radius: 20px; overflow: hidden;
          background: #fff; padding: 36px 36px 32px; margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 4px 24px rgba(15,23,42,.07);
        }
        .ed-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 80% at 90% 50%, var(--hero-accent, #2563eb22) 0%, transparent 65%),
                      radial-gradient(ellipse 50% 60% at 10% 20%, var(--hero-accent2, #2563eb11) 0%, transparent 60%);
          pointer-events: none;
        }
        .ed-hero-badges { display: flex; gap: 8px; margin-bottom: 20px; position: relative; z-index: 1; flex-wrap: wrap; }
        .ed-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; letter-spacing: .04em;
          padding: 5px 12px; border-radius: 100px; text-transform: uppercase;
        }
        .ed-hero-title { font-size: 28px; font-weight: 800; letter-spacing: -.5px; color: #0f172a; line-height: 1.2; margin: 0 0 10px; position: relative; z-index: 1; }
        .ed-hero-desc { font-size: 14px; color: #64748b; line-height: 1.65; margin: 0; position: relative; z-index: 1; max-width: 580px; }

        .ed-card {
          background: #fff; border-radius: 16px;
          border: 1px solid #e8edf5;
          box-shadow: 0 2px 12px rgba(15,23,42,.05);
          overflow: hidden; margin-bottom: 16px;
        }
        .ed-card-header {
          padding: 18px 24px 16px; border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; gap: 10px;
        }
        .ed-card-header-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ed-card-header-title { font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: -.01em; }
        .ed-card-body { padding: 20px 24px; }

        .ed-date-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ed-date-item {
          background: #f8fafc; border: 1px solid #e8edf5;
          border-radius: 12px; padding: 14px 16px;
          position: relative; overflow: hidden;
        }
        .ed-date-item::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--accent, #2563eb); opacity: .5;
        }
        .ed-date-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; }
        .ed-date-value { font-size: 13px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 6px; }

        .ed-info-row { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
        .ed-info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .ed-info-row:first-child { padding-top: 0; }
        .ed-info-icon { width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #475569; }
        .ed-info-label { font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 2px; }
        .ed-info-value { font-size: 13px; font-weight: 600; color: #1e293b; }
        .ed-info-link { font-size: 13px; font-weight: 600; color: #2563eb; text-decoration: none; transition: color .15s; }
        .ed-info-link:hover { color: #1d4ed8; text-decoration: underline; }

        .ed-participants-bar-track { background: #f1f5f9; border-radius: 100px; height: 6px; overflow: hidden; margin-top: 10px; }
        .ed-participants-bar-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, var(--bar), var(--bar-end, var(--bar))); transition: width .6s cubic-bezier(.4,0,.2,1); }
        .ed-stat-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 100px; }

        .ed-actions { display: flex; gap: 10px; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
        .ed-btn { flex: 1; padding: 13px 20px; border-radius: 12px; border: none; cursor: pointer; font-size: 14px; font-weight: 700; letter-spacing: -.01em; transition: all .2s; position: relative; overflow: hidden; }
        .ed-btn-back { flex: 0 0 auto; background: #fff; border: 1.5px solid #e2e8f0; color: #64748b; padding-left: 18px; padding-right: 18px; }
        .ed-btn-back:hover { background: #f8fafc; border-color: #cbd5e1; color: #334155; }
        .ed-btn-primary { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #fff; box-shadow: 0 4px 16px rgba(37,99,235,.3); }
        .ed-btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); box-shadow: 0 6px 20px rgba(37,99,235,.4); transform: translateY(-1px); }
        .ed-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .ed-btn-cancel { background: #fff1f2; color: #e11d48; border: 1.5px solid #fecdd3; }
        .ed-btn-cancel:hover:not(:disabled) { background: #ffe4e6; border-color: #fda4af; transform: translateY(-1px); }
        .ed-btn-cancel:disabled { opacity: .6; cursor: not-allowed; }
        .ed-btn-registered { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #fff; cursor: default; box-shadow: 0 4px 16px rgba(5,150,105,.25); }
        .ed-btn-full { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; border: 1.5px solid #e2e8f0; }
        .ed-btn-completed { background: #f8fafc; color: #94a3b8; cursor: default; border: 1.5px dashed #e2e8f0; }

        /* ─── Tab Panel ─── */
        .ed-panel {
          background: #fff; border-radius: 20px;
          border: 1px solid #e8edf5;
          box-shadow: 0 2px 12px rgba(15,23,42,.05);
          overflow: hidden; margin-bottom: 16px;
        }
        .ed-tabs-bar {
          display: flex; gap: 4px; padding: 6px;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
        }
        .ed-tab-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all .18s; color: #64748b; background: transparent;
          font-family: 'Manrope', sans-serif; white-space: nowrap;
          position: relative;
        }
        .ed-tab-btn:hover { background: #fff; color: #1e293b; }
        .ed-tab-btn.active {
          background: #fff; color: #2563eb;
          box-shadow: 0 1px 8px rgba(37,99,235,.12), 0 0 0 1px rgba(37,99,235,.1);
        }
        .ed-tab-count {
          font-size: 11px; font-weight: 700;
          padding: 2px 7px; border-radius: 100px;
          background: #eff6ff; color: #2563eb; transition: all .18s;
        }
        .ed-tab-btn:not(.active) .ed-tab-count { background: #f1f5f9; color: #94a3b8; }
        .ed-tab-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #f59e0b; flex-shrink: 0;
          animation: ed-pulse-dot 2s ease-in-out infinite;
        }
        .ed-tab-body {
          padding: 24px;
          animation: ed-fadeUp .25s ease forwards;
        }

        .ed-fade-up { opacity: 0; animation: ed-fadeUp .45s ease forwards; }
        .ed-delay-1 { animation-delay: .05s; }
        .ed-delay-2 { animation-delay: .12s; }
        .ed-delay-3 { animation-delay: .19s; }
        .ed-delay-4 { animation-delay: .26s; }
      `}</style>

      <div className="ed-wrap">
        {/* Real-time: банер скасування події */}
        {canceledByAdmin && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
              border: "1.5px solid #fecdd3",
              borderRadius: 14,
              padding: "14px 20px",
              marginBottom: 16,
              animation: "ed-fadeUp .4s ease forwards",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#be123c",
                  margin: "0 0 2px",
                }}
              >
                Подію скасовано
              </p>
              <p style={{ fontSize: 12, color: "#e11d48", margin: 0 }}>
                Адміністратор щойно скасував цю подію
              </p>
            </div>
          </div>
        )}

        {/* Back */}
        <div
          className={mounted ? "ed-fade-up" : ""}
          style={{ marginBottom: 20 }}
        >
          <button className="ed-back-btn" onClick={() => navigate(backPath)}>
            <ChevronLeftIcon />
            {backPath === "/my-registrations"
              ? "Назад до реєстрацій"
              : "Назад до подій"}
          </button>
        </div>

        {/* Hero */}
        <div
          className={`ed-hero${mounted ? " ed-fade-up ed-delay-1" : ""}`}
          style={
            {
              "--hero-accent": color.bar + "55",
              "--hero-accent2": color.bar + "22",
            } as React.CSSProperties
          }
        >
          <div className="ed-hero-badges">
            <span
              className="ed-badge"
              style={{
                background: color.bg,
                color: color.text,
                border: `1px solid ${color.border}`,
              }}
            >
              {event.category?.name || "Без категорії"}
            </span>
            <span
              className="ed-badge"
              style={{
                background: isOnline ? "#eff6ff" : "#fef9c3",
                color: isOnline ? "#1d4ed8" : "#92400e",
                border: isOnline ? "1px solid #bfdbfe" : "1px solid #fde68a",
              }}
            >
              {isOnline ? (
                <svg
                  width="12"
                  height="12"
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
                  width="12"
                  height="12"
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
            {isCompleted && (
              <span
                className="ed-badge"
                style={{
                  background: "#f0fdf4",
                  color: "#16a34a",
                  border: "1px solid #bbf7d0",
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Завершено
              </span>
            )}
          </div>
          <h1 className="ed-hero-title">{event.title}</h1>
          {event.description && (
            <p className="ed-hero-desc">{event.description}</p>
          )}
        </div>

        {/* Dates card */}
        <div className={`ed-card${mounted ? " ed-fade-up ed-delay-2" : ""}`}>
          <div className="ed-card-header">
            <div
              className="ed-card-header-icon"
              style={{ background: color.bg }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke={color.text}
                strokeWidth="2.2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="16" y1="2" x2="16" y2="6" />
              </svg>
            </div>
            <span className="ed-card-header-title">Дата та час</span>
          </div>
          <div className="ed-card-body">
            <div className="ed-date-grid">
              {[
                { label: "Початок", val: event.startAt },
                { label: "Кінець", val: event.endAt },
              ].map(({ label, val }) => (
                <div
                  key={label}
                  className="ed-date-item"
                  style={{ "--accent": color.bar } as React.CSSProperties}
                >
                  <div className="ed-date-label">{label}</div>
                  <div className="ed-date-value">
                    <CalendarIcon />
                    {formatDate(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details card */}
        <div className={`ed-card${mounted ? " ed-fade-up ed-delay-3" : ""}`}>
          <div className="ed-card-header">
            <div
              className="ed-card-header-icon"
              style={{ background: "#f0f9ff" }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span className="ed-card-header-title">Деталі події</span>
          </div>
          <div className="ed-card-body" style={{ padding: "8px 24px 20px" }}>
            {!isOnline && event.location && (
              <div className="ed-info-row">
                <div className="ed-info-icon">
                  <LocationIcon />
                </div>
                <div>
                  <div className="ed-info-label">Місце проведення</div>
                  <div className="ed-info-value">{event.location}</div>
                </div>
              </div>
            )}
            {isOnline && event.onlineUrl && isRegistered && (
              <div className="ed-info-row">
                <div className="ed-info-icon">
                  <LinkIcon />
                </div>
                <div>
                  <div className="ed-info-label">Посилання на подію</div>
                  <a
                    href={event.onlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ed-info-link"
                  >
                    {event.onlineUrl}
                  </a>
                </div>
              </div>
            )}
            <div className="ed-info-row">
              <div className="ed-info-icon">
                <UsersIcon />
              </div>
              <div style={{ flex: 1 }}>
                <div className="ed-info-label">Учасники</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="ed-info-value">
                    {max != null
                      ? `${registered} / ${max}`
                      : `${registered} зареєстровано`}
                  </div>
                  {free !== null && (
                    <span
                      className="ed-stat-chip"
                      style={{
                        background: isFull ? "#fff1f2" : "#f0fdf4",
                        color: isFull ? "#e11d48" : "#16a34a",
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8">
                        <circle
                          cx="4"
                          cy="4"
                          r="4"
                          fill={isFull ? "#e11d48" : "#16a34a"}
                        />
                      </svg>
                      {isFull ? "Немає місць" : `${free} вільно`}
                    </span>
                  )}
                </div>
                {max && (
                  <>
                    <div className="ed-participants-bar-track">
                      <div
                        className="ed-participants-bar-fill"
                        style={
                          {
                            width: `${progress}%`,
                            "--bar": color.bar,
                            "--bar-end": color.bar + "cc",
                          } as React.CSSProperties
                        }
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          fontWeight: 500,
                        }}
                      >
                        Заповненість
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: color.text,
                        }}
                      >
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="ed-actions">
            <button
              className="ed-btn ed-btn-back"
              onClick={() => navigate(backPath)}
            >
              Назад
            </button>
            {isCompleted ? (
              <button className="ed-btn ed-btn-completed">
                ✓ Подія завершена
              </button>
            ) : isRegistered ? (
              <button
                className="ed-btn ed-btn-cancel"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Скасування..." : "Скасувати реєстрацію"}
              </button>
            ) : isFull ? (
              <button className="ed-btn ed-btn-full" disabled>
                Місць немає
              </button>
            ) : (
              <button
                className="ed-btn ed-btn-primary"
                onClick={() => setShowRegisterConfirm(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Реєстрація..." : "Зареєструватись →"}
              </button>
            )}
          </div>
        </div>

        {/* Tab Panel — only for completed events */}
        {isCompleted && (
          <div className={`ed-panel${mounted ? " ed-fade-up ed-delay-4" : ""}`}>
            <div className="ed-tabs-bar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`ed-tab-btn${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.dot && <span className="ed-tab-dot" />}
                  {tab.count !== undefined && (
                    <span className="ed-tab-count">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="ed-tab-body" key={activeTab}>
              {/* ── My feedback ── */}
              {activeTab === "my-feedback" && (
                <>
                  {myFeedback ? (
                    <FeedbackDisplay feedback={myFeedback} />
                  ) : showFeedback ? (
                    <FeedbackForm
                      onSubmit={handleFeedbackSubmit}
                      isLoading={isSendingFeedback}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#94a3b8",
                          marginBottom: 16,
                        }}
                      >
                        Ви ще не залишили відгук про цю подію
                      </p>
                      <button
                        onClick={() => setShowFeedback(true)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "10px 20px",
                          borderRadius: 12,
                          border: "none",
                          background:
                            "linear-gradient(135deg, #2563eb, #1d4ed8)",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 4px 14px rgba(37,99,235,.3)",
                          fontFamily: "Manrope, sans-serif",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Залишити відгук
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── All feedbacks ── */}
              {activeTab === "all-feedbacks" && (
                <FeedbackList feedbacks={otherFeedbacks} />
              )}

              {/* ── Report ── */}
              {activeTab === "report" && (
                <EventReport
                  eventId={id!}
                  report={report}
                  isAdmin={false}
                  onReportChange={setReport}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {showRegisterConfirm && event && (
        <ConfirmModal
          title="Зареєструватись на подію?"
          message={`Підтвердіть реєстрацію на подію «${event.title}».`}
          confirmLabel="Зареєструватись"
          cancelLabel="Скасувати"
          variant="warning"
          onConfirm={handleRegister}
          onCancel={() => setShowRegisterConfirm(false)}
        />
      )}
      {showCancelConfirm && (
        <ConfirmModal
          title="Скасувати участь?"
          message="Ви впевнені, що хочете скасувати реєстрацію на цю подію?"
          confirmLabel="Так, скасувати"
          cancelLabel="Ні, залишитись"
          variant="warning"
          onConfirm={handleCancel}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </>
  );
}
