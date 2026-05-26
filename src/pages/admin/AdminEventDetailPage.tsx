import React, { useState, useEffect, type ReactElement } from "react";
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
  PUBLISHED: { label: "Опубліковано", bg: "#f0fdf4", color: "#16a34a" },
  ONGOING: { label: "Триває", bg: "#eff6ff", color: "#1a6fd4" },
  COMPLETED: { label: "Завершено", bg: "#f8fafc", color: "#64748b" },
  CANCELED: { label: "Скасовано", bg: "#fff1f2", color: "#e11d48" },
} as const;

const AVATAR_COLORS = [
  { bg: "#eff6ff", color: "#1d4ed8" },
  { bg: "#f5f3ff", color: "#6d28d9" },
  { bg: "#f0fdf4", color: "#15803d" },
  { bg: "#fff7ed", color: "#c2410c" },
  { bg: "#fdf2f8", color: "#a21caf" },
  { bg: "#fff1f2", color: "#be123c" },
];

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

type TabId = "participants" | "feedbacks" | "report";

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
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("participants");

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
        setTimeout(() => setMounted(true), 50);
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
  const isFull = free !== null && free <= 0;
  const progress = max ? Math.min((registered / max) * 100, 100) : 0;
  const isEditable = event.status === "PUBLISHED" || event.status === "ONGOING";
  const isCompleted = event.status === "COMPLETED";

  const tabs: {
    id: TabId;
    label: string;
    count?: number;
    icon: ReactElement;
  }[] = [
    {
      id: "participants",
      label: "Учасники",
      count: participants.length,
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    ...(isCompleted
      ? [
          {
            id: "feedbacks" as TabId,
            label: "Відгуки",
            count: feedbacks.length,
            icon: (
              <svg
                width="15"
                height="15"
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
            id: "report" as TabId,
            label: "Звіт",
            icon: (
              <svg
                width="15"
                height="15"
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
      : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .adp-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }

        @keyframes adp-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .adp-fade-up { opacity: 0; animation: adp-fadeUp .4s ease forwards; }
        .adp-d1 { animation-delay: .05s; } .adp-d2 { animation-delay: .10s; }
        .adp-d3 { animation-delay: .15s; } .adp-d4 { animation-delay: .20s; }

        .adp-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: #64748b;
          background: none; border: none; cursor: pointer; padding: 0;
          margin-bottom: 16px; transition: color .15s;
          font-family: 'Manrope', sans-serif;
        }
        .adp-back-btn:hover { color: #2563eb; }

        .adp-hero {
          position: relative; background: #fff; border-radius: 20px;
          padding: 28px 32px; margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 4px 24px rgba(15,23,42,.07);
          overflow: hidden;
        }
        .adp-hero::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 50% 80% at 98% 50%, var(--hero-glow, rgba(37,99,235,.12)) 0%, transparent 60%),
            radial-gradient(ellipse 30% 60% at 2% 60%, rgba(124,58,237,.05) 0%, transparent 55%);
          pointer-events: none;
        }
        .adp-hero-top { position: relative; z-index: 1; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .adp-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .adp-badge { font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 100px; }
        .adp-format-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 100px;
        }
        .adp-hero-title { font-size: 22px; font-weight: 800; letter-spacing: -.4px; color: #0f172a; margin: 0 0 6px; }
        .adp-hero-desc { font-size: 13px; color: #64748b; margin: 0; line-height: 1.6; }
        .adp-action-btns { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .adp-btn {
          padding: 8px 16px; font-size: 13px; font-weight: 600;
          border-radius: 12px; cursor: pointer; border: 1px solid;
          transition: all .15s; font-family: 'Manrope', sans-serif;
        }
        .adp-btn-warn { color: #92400e; background: #fef9c3; border-color: #fde68a; }
        .adp-btn-warn:hover { background: #fef08a; }
        .adp-btn-blue { color: #1d4ed8; background: #eff6ff; border-color: #bfdbfe; }
        .adp-btn-blue:hover { background: #dbeafe; }
        .adp-btn-danger { color: #e11d48; background: #fff1f2; border-color: #fecdd3; }
        .adp-btn-danger:hover { background: #ffe4e6; }
        .adp-btn-primary {
          color: #fff; background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(37,99,235,.3);
        }
        .adp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,99,235,.4); }

        .adp-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; position: relative; z-index: 1; }
        .adp-info-cell {
          background: #f8fafc; border: 1px solid rgba(59,130,246,.07);
          border-radius: 12px; padding: 12px 14px;
        }
        .adp-info-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; }
        .adp-info-val { font-size: 13px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 6px; }

        .adp-divider { border: none; border-top: 1px solid rgba(59,130,246,.07); margin: 16px 0; }

        .adp-participants-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; position: relative; z-index: 1; }
        .adp-stat-chip {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 100px;
        }
        .adp-progress-track { height: 5px; background: rgba(59,130,246,.08); border-radius: 100px; overflow: hidden; }
        .adp-progress-fill { height: 100%; border-radius: 100px; transition: width .4s ease; }

        /* ─── Tab Panel ─── */
        .adp-panel {
          background: #fff;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 4px 24px rgba(15,23,42,.07);
          border-radius: 20px;
          overflow: hidden;
        }
        .adp-tabs-bar {
          display: flex;
          gap: 4px;
          padding: 6px;
          background: #f8fafc;
          border-bottom: 1px solid rgba(59,130,246,.07);
        }
        .adp-tab-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all .18s; color: #64748b; background: transparent;
          font-family: 'Manrope', sans-serif;
          white-space: nowrap;
        }
        .adp-tab-btn:hover { background: #fff; color: #1e293b; }
        .adp-tab-btn.active {
          background: #fff;
          color: #2563eb;
          box-shadow: 0 1px 8px rgba(37,99,235,.12), 0 0 0 1px rgba(37,99,235,.1);
        }
        .adp-tab-count {
          font-size: 11px; font-weight: 700;
          padding: 2px 7px; border-radius: 100px;
          background: #eff6ff; color: #2563eb;
          transition: all .18s;
        }
        .adp-tab-btn:not(.active) .adp-tab-count {
          background: #f1f5f9; color: #94a3b8;
        }
        .adp-tab-body {
          padding: 24px;
          animation: adp-fadeUp .25s ease forwards;
        }

        /* participants list */
        .adp-participant-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 0; transition: background .15s;
        }
        .adp-participant-sep { border: none; border-top: 1px solid rgba(59,130,246,.06); margin: 0; }
      `}</style>

      <div className="adp-wrap">
        <button
          className="adp-back-btn"
          onClick={() => navigate("/admin/events")}
        >
          <ChevronLeftIcon /> Назад до подій
        </button>

        {/* Hero */}
        <div
          className={`adp-hero${mounted ? " adp-fade-up" : ""}`}
          style={{ "--hero-glow": color.bar + "22" } as React.CSSProperties}
        >
          <div className="adp-hero-top">
            <div style={{ flex: 1 }}>
              <div className="adp-badges">
                {event.category?.name && (
                  <span
                    className="adp-badge"
                    style={{ background: color.bg, color: color.text }}
                  >
                    {event.category.name}
                  </span>
                )}
                <span
                  className="adp-badge"
                  style={{ background: status.bg, color: status.color }}
                >
                  {status.label}
                </span>
                <span
                  className="adp-format-badge"
                  style={{
                    background:
                      event.format === "ONLINE" ? "#eff6ff" : "#fef9c3",
                    color: event.format === "ONLINE" ? "#1d4ed8" : "#92400e",
                  }}
                >
                  {event.format === "ONLINE" ? <OnlineIcon /> : <OfflineIcon />}
                  {event.format === "ONLINE" ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <h1 className="adp-hero-title">{event.title}</h1>
              <p className="adp-hero-desc">{event.description}</p>
            </div>
            <div className="adp-action-btns">
              {isEditable && (
                <button
                  className="adp-btn adp-btn-warn"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isCanceling}
                >
                  {isCanceling ? "Скасування..." : "Скасувати подію"}
                </button>
              )}
              {isEditable && (
                <button
                  className="adp-btn adp-btn-primary"
                  onClick={() => navigate(`/admin/events/${id}/edit`)}
                >
                  Редагувати
                </button>
              )}
              {event.status === "CANCELED" && (
                <button
                  className="adp-btn adp-btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Видалити
                </button>
              )}
            </div>
          </div>

          <div className="adp-info-grid">
            <div className="adp-info-cell">
              <p className="adp-info-label">Початок</p>
              <p className="adp-info-val">
                <CalendarIcon />
                {formatDate(event.startAt)}
              </p>
            </div>
            <div className="adp-info-cell">
              <p className="adp-info-label">Кінець</p>
              <p className="adp-info-val">
                <CalendarIcon />
                {formatDate(event.endAt)}
              </p>
            </div>
            {event.format === "OFFLINE" && event.location && (
              <div className="adp-info-cell" style={{ gridColumn: "1/-1" }}>
                <p className="adp-info-label">Місце проведення</p>
                <p className="adp-info-val">
                  <LocationIcon />
                  {event.location}
                </p>
              </div>
            )}
            {event.format === "ONLINE" && event.onlineUrl && (
              <div className="adp-info-cell" style={{ gridColumn: "1/-1" }}>
                <p className="adp-info-label">Посилання</p>
                <a
                  href={event.onlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                  }}
                >
                  <LinkIcon />
                  {event.onlineUrl}
                </a>
              </div>
            )}
          </div>

          <hr className="adp-divider" />

          <div style={{ position: "relative", zIndex: 1 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".08em",
                color: "#94a3b8",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Учасники
            </p>
            <div className="adp-participants-row">
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                <UsersIcon />
                {max != null
                  ? `${registered} / ${max} зареєстровано`
                  : `${registered} зареєстровано`}
              </span>
              {free !== null && (
                <span
                  className="adp-stat-chip"
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
              {max && (
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: color.text }}
                >
                  {Math.round(progress)}%
                </span>
              )}
            </div>
            {max && (
              <div className="adp-progress-track">
                <div
                  className="adp-progress-fill"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${color.bar}, ${color.bar}cc)`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Tab Panel */}
        <div className={`adp-panel${mounted ? " adp-fade-up adp-d1" : ""}`}>
          {/* Tabs bar */}
          <div className="adp-tabs-bar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`adp-tab-btn${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className="adp-tab-count">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="adp-tab-body" key={activeTab}>
            {/* ── Participants ── */}
            {activeTab === "participants" && (
              <>
                {participants.length === 0 ? (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                      textAlign: "center",
                      padding: "24px 0",
                    }}
                  >
                    Ще немає зареєстрованих учасників
                  </p>
                ) : (
                  <div>
                    {participants.map((p, i) => {
                      const avatarColor = getAvatarColor(p.user.id);
                      const initials = getInitials(
                        p.user.fullName,
                        p.user.email,
                      );
                      return (
                        <div key={p.registrationId}>
                          {i > 0 && <hr className="adp-participant-sep" />}
                          <div className="adp-participant-row">
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: "50%",
                                flexShrink: 0,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 700,
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
                                  }}
                                />
                              ) : (
                                initials
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#1e293b",
                                  margin: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.user.fullName || p.user.email}
                              </p>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "#94a3b8",
                                  margin: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.user.email}
                                {p.user.position ? ` · ${p.user.position}` : ""}
                              </p>
                            </div>
                            {event.status !== "CANCELED" &&
                              event.status !== "COMPLETED" && (
                                <button
                                  className="adp-btn adp-btn-danger"
                                  style={{ fontSize: 12, padding: "5px 12px" }}
                                  onClick={() =>
                                    setParticipantToCancel(p.registrationId)
                                  }
                                >
                                  Скасувати
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── Feedbacks ── */}
            {activeTab === "feedbacks" && (
              <FeedbackList feedbacks={feedbacks} />
            )}

            {/* ── Report ── */}
            {activeTab === "report" && (
              <EventReport
                eventId={id!}
                report={report}
                isAdmin={true}
                onReportChange={setReport}
              />
            )}
          </div>
        </div>
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
    </>
  );
}
