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
  PUBLISHED: { label: "Published", bg: "#f0fdf4", color: "#16a34a" },
  ONGOING: { label: "Ongoing", bg: "#eff6ff", color: "#1a6fd4" },
  COMPLETED: { label: "Completed", bg: "#f8fafc", color: "#64748b" },
  CANCELED: { label: "Canceled", bg: "#fff1f2", color: "#e11d48" },
};

interface EventRowBaseProps {
  event: Event;
  onView: (id: string) => void;
}
interface AdminEventRowProps extends EventRowBaseProps {
  isAdmin: true;
  onDelete: (id: string) => void;
  isRegistered?: never;
  onRegister?: never;
  onCancel?: never;
}
interface EmployeeEventRowProps extends EventRowBaseProps {
  isAdmin?: false;
  isRegistered?: boolean;
  onRegister: (id: string, title: string) => void;
  onCancel: (id: string) => void;
  onDelete?: never;
}
type EventRowProps = AdminEventRowProps | EmployeeEventRowProps;

export default function EventRow(props: EventRowProps) {
  const { event, onView } = props;
  const navigate = useNavigate();
  const color = getCategoryColor(event.category?.name || "default");
  const status = STATUS_CONFIG[event.status];
  const isFull =
    event.maxParticipants !== null &&
    event.maxParticipants !== undefined &&
    event.participantsCount >= event.maxParticipants;
  const isCompleted =
    event.status === "COMPLETED" || event.status === "CANCELED";

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(59,130,246,0.10)",
        boxShadow: "0 2px 12px rgba(59,130,246,0.05)",
        borderRadius: "16px",
        opacity: isCompleted ? 0.7 : 1,
        cursor: "pointer",
      }}
      onClick={() => onView(event.id)}
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
      {/* Accent bar */}
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{
          background: `linear-gradient(180deg, ${color.bar}, ${color.bar}88)`,
        }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="text-sm font-semibold text-slate-800 truncate"
            style={{ letterSpacing: "-0.1px" }}
          >
            {event.title}
          </span>
          {event.category?.name && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: color.bg, color: color.text }}
            >
              {event.category.name}
            </span>
          )}
          {props.isAdmin && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: status.bg, color: status.color }}
            >
              {status.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CalendarIcon />
            {formatDate(event.startAt)}
          </span>
          <span
            className="flex items-center gap-1 font-medium px-2 py-0.5 rounded-full"
            style={{
              background: event.format === "ONLINE" ? "#eff6ff" : "#fef9c3",
              color: event.format === "ONLINE" ? "#1d4ed8" : "#92400e",
            }}
          >
            {event.format === "ONLINE" ? <OnlineIcon /> : <OfflineIcon />}
            {event.format === "ONLINE" ? "Online" : "Offline"}
          </span>
          <span className="flex items-center gap-1">
            <UsersIcon />
            {event.maxParticipants
              ? `${event.participantsCount} / ${event.maxParticipants}`
              : `${event.participantsCount} зареєстровано`}
          </span>
        </div>
      </div>

      {/* Actions */}
      {props.isAdmin ? (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(event.id);
            }}
            className="px-3 py-1.5 text-xs rounded-xl font-medium transition"
            style={{
              color: "#64748b",
              background: "rgba(248,250,252,0.9)",
              border: "1px solid #e2e8f0",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(248,250,252,0.9)";
            }}
          >
            Деталі
          </button>
          {event.status !== "CANCELED" && event.status !== "COMPLETED" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/events/${event.id}/edit`);
              }}
              className="px-3 py-1.5 text-xs rounded-xl font-medium transition"
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
              className="px-3 py-1.5 text-xs rounded-xl font-medium transition"
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
      ) : (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(event.id);
            }}
            className="px-3 py-1.5 text-xs rounded-xl font-medium transition"
            style={{
              color: "#64748b",
              background: "rgba(248,250,252,0.9)",
              border: "1px solid #e2e8f0",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(248,250,252,0.9)";
            }}
          >
            Деталі
          </button>
          {props.isRegistered ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onCancel(event.id);
              }}
              className="px-3 py-1.5 text-xs rounded-xl font-medium transition"
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
            <span className="px-3 py-1.5 text-xs text-slate-400 font-medium">
              Місць немає
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.onRegister(event.id, event.title);
              }}
              className="px-3 py-1.5 text-xs rounded-xl font-semibold text-white transition"
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
              Зареєструватись
            </button>
          )}
        </div>
      )}
    </div>
  );
}
