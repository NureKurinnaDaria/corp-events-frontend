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
      className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
      style={{ opacity: isCompleted ? 0.7 : 1 }}
    >
      <div
        className="w-1.5 self-stretch rounded-full flex-shrink-0"
        style={{ background: color.bar }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-medium text-slate-800 truncate">
            {event.title}
          </span>
          {event.category?.name && (
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: color.bg, color: color.text }}
            >
              {event.category.name}
            </span>
          )}
          {props.isAdmin && (
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
              style={{ background: status.bg, color: status.color }}
            >
              {status.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CalendarIcon />
            {formatDate(event.startAt)}
          </span>
          <span
            className="flex items-center gap-1"
            style={{ color: event.format === "ONLINE" ? "#1a6fd4" : "#92400e" }}
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

      {props.isAdmin ? (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onView(event.id)}
            className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Деталі
          </button>
          {event.status !== "CANCELED" && event.status !== "COMPLETED" && (
            <button
              onClick={() => navigate(`/admin/events/${event.id}/edit`)}
              className="px-3 py-1.5 text-xs text-blue-700 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              Редагувати
            </button>
          )}
          {event.status === "CANCELED" && (
            <button
              onClick={() => props.onDelete(event.id)}
              className="px-3 py-1.5 text-xs text-rose-600 border border-rose-200 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
            >
              Видалити
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onView(event.id)}
            className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Деталі
          </button>
          {props.isRegistered ? (
            <button
              onClick={() => props.onCancel(event.id)}
              className="px-3 py-1.5 text-xs text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition"
            >
              Скасувати участь
            </button>
          ) : isFull ? (
            <span className="px-3 py-1.5 text-xs text-slate-400">
              Місць немає
            </span>
          ) : (
            <button
              onClick={() => props.onRegister(event.id, event.title)}
              className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Зареєструватись
            </button>
          )}
        </div>
      )}
    </div>
  );
}
