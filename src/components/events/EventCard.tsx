import { useNavigate } from "react-router-dom";
import { getCategoryColor } from "../../utils/categoryColor";
import { formatDate } from "../../utils/formatDate";
import {
  OnlineIcon,
  OfflineIcon,
  CalendarIcon,
  UsersIcon,
} from "../common/icons";
import type { Event, EventStatus } from "../../types";

const STATUS_CONFIG: Record<
  EventStatus,
  { label: string; bg: string; color: string }
> = {
  PUBLISHED: { label: "Опубліковано", bg: "#f0fdf4", color: "#16a34a" },
  ONGOING: { label: "Триває", bg: "#eff6ff", color: "#1a6fd4" },
  COMPLETED: { label: "Завершено", bg: "#f8fafc", color: "#64748b" },
  CANCELED: { label: "Скасовано", bg: "#fff1f2", color: "#e11d48" },
};

interface EventCardBaseProps {
  event: Event;
  onView: (id: string) => void;
}
interface AdminEventCardProps extends EventCardBaseProps {
  isAdmin: true;
  onDelete: (id: string) => void;
  isRegistered?: never;
  onRegister?: never;
  onCancel?: never;
}
interface EmployeeEventCardProps extends EventCardBaseProps {
  isAdmin?: false;
  isRegistered?: boolean;
  onRegister: (id: string, title: string) => void;
  onCancel: (id: string) => void;
  onDelete?: never;
}
type EventCardProps = AdminEventCardProps | EmployeeEventCardProps;

export default function EventCard(props: EventCardProps) {
  const { event, onView } = props;
  const navigate = useNavigate();
  const color = getCategoryColor(event.category?.name || "default");
  const max = event.maxParticipants;
  const registered = event.participantsCount;
  const progress = max ? Math.min((registered / max) * 100, 100) : 0;
  const free = max ? max - registered : null;
  const isFull = max !== null && max !== undefined && registered >= max;
  const status = STATUS_CONFIG[event.status];
  const isCompleted =
    event.status === "COMPLETED" || event.status === "CANCELED";

  return (
    <div
      className="relative overflow-hidden rounded-2xl flex flex-col"
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${color.border}`,
        boxShadow:
          "0 4px 24px rgba(59,130,246,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        opacity: props.isAdmin && isCompleted ? 0.65 : 1,
        transition: "box-shadow 0.25s, transform 0.25s",
        cursor: "pointer",
      }}
      onClick={() => onView(event.id)}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = `0 12px 40px rgba(59,130,246,0.16), 0 2px 8px rgba(0,0,0,0.06)`;
        el.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow =
          "0 4px 24px rgba(59,130,246,0.07), 0 1px 4px rgba(0,0,0,0.04)";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Gradient top accent — товстіший, з градієнтом */}
      <div
        style={{
          height: "4px",
          background: `linear-gradient(90deg, ${color.bar}, ${color.bar}99)`,
        }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Category + format */}
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".04em",
              padding: "5px 12px",
              borderRadius: 100,
              textTransform: "uppercase",
              background: color.bg,
              color: color.text,
              border: `1px solid ${color.border}`,
            }}
          >
            {event.category?.name || "Без категорії"}
          </span>
          <div className="flex items-center gap-1.5">
            {props.isAdmin && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".04em",
                  padding: "5px 12px",
                  borderRadius: 100,
                  background: status.bg,
                  color: status.color,
                }}
              >
                {status.label}
              </span>
            )}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".04em",
                padding: "5px 12px",
                borderRadius: 100,
                textTransform: "uppercase",
                background: event.format === "ONLINE" ? "#eff6ff" : "#fef9c3",
                color: event.format === "ONLINE" ? "#1d4ed8" : "#92400e",
                border:
                  event.format === "ONLINE"
                    ? "1px solid #bfdbfe"
                    : "1px solid #fde68a",
              }}
            >
              {event.format === "ONLINE" ? <OnlineIcon /> : <OfflineIcon />}
              {event.format === "ONLINE" ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-slate-900 mb-2 leading-snug"
          style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.3px" }}
        >
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed flex-1">
          {event.description}
        </p>

        {/* Date */}
        <div
          className="inline-flex items-center gap-1.5 text-xs mb-3 px-2.5 py-1.5 rounded-xl w-fit"
          style={{
            background: "rgba(241,245,249,0.8)",
            color: "#475569",
            fontWeight: 500,
          }}
        >
          <CalendarIcon />
          {formatDate(event.startAt)}
        </div>

        {/* Participants + progress */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="flex items-center gap-1">
            <UsersIcon />
            {max ? `${registered} / ${max}` : `${registered} зареєстровано`}
          </span>
          {max && (
            <span style={{ color: color.text, fontWeight: 600 }}>
              {Math.round(progress)}%
            </span>
          )}
        </div>

        <div
          className="rounded-full overflow-hidden mb-3"
          style={{ height: "5px", background: "rgba(59,130,246,0.08)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: max ? `${progress}%` : "0%",
              background: `linear-gradient(90deg, ${color.bar}, ${color.bar}cc)`,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Free spots */}
        <div className="mb-4">
          {free !== null ? (
            <span
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                color: color.text,
                background: color.bg,
                border: `1px solid ${color.border}`,
              }}
            >
              <UsersIcon /> {free} місць вільно
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                color: color.text,
                background: color.bg,
                border: `1px solid ${color.border}`,
              }}
            >
              ∞ Необмежено
            </span>
          )}
        </div>

        {/* Buttons */}
        <div
          className="flex gap-2 pt-3"
          style={{ borderTop: "1px solid rgba(59,130,246,0.07)" }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(event.id);
            }}
            className="flex-1 py-2.5 text-xs rounded-xl font-medium transition-all"
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

          {props.isAdmin ? (
            <>
              {event.status !== "CANCELED" && event.status !== "COMPLETED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/events/${event.id}/edit`);
                  }}
                  className="flex-1 py-2.5 text-xs rounded-xl font-medium transition-all"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onDelete(event.id);
                  }}
                  className="flex-1 py-2.5 text-xs rounded-xl font-medium transition-all"
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
            </>
          ) : props.isRegistered ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onCancel(event.id);
              }}
              className="flex-1 py-2.5 text-xs rounded-xl font-medium transition-all"
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
              Скасувати участь
            </button>
          ) : isFull ? (
            <span className="flex-1 py-2.5 text-xs text-slate-400 text-center font-medium">
              Місць немає
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onRegister(event.id, event.title);
              }}
              className="flex-1 py-2.5 text-xs rounded-xl font-semibold transition-all text-white"
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                border: "none",
                letterSpacing: "-0.1px",
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
              Зареєструватись
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
