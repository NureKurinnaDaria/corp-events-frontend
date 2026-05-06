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
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
      style={{ opacity: props.isAdmin && isCompleted ? 0.7 : 1 }}
    >
      <div className="h-1.5 w-full" style={{ background: color.bar }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: color.bg, color: color.text }}
          >
            {event.category?.name || "Без категорії"}
          </span>
          <div className="flex items-center gap-2">
            {props.isAdmin && (
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
            )}
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
        </div>

        <h3 className="text-sm font-medium text-slate-800 mb-1.5">
          {event.title}
        </h3>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <CalendarIcon />
          {formatDate(event.startAt)}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <UsersIcon />
          {max
            ? `${registered} / ${max} учасників`
            : `${registered} зареєстровано`}
        </div>

        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: max ? `${progress}%` : "0%",
              background: color.bar,
            }}
          />
        </div>

        <div className="mb-3">
          {free !== null ? (
            <span
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border"
              style={{
                color: color.text,
                background: color.bg,
                borderColor: color.border,
              }}
            >
              <UsersIcon />
              {free} місць вільно
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border"
              style={{
                color: color.text,
                background: color.bg,
                borderColor: color.border,
              }}
            >
              ∞ Необмежено
            </span>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={() => onView(event.id)}
            className="flex-1 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Деталі
          </button>
          {props.isAdmin ? (
            <>
              {event.status !== "CANCELED" && event.status !== "COMPLETED" && (
                <button
                  onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                  className="flex-1 py-2 text-xs text-blue-700 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  Редагувати
                </button>
              )}
              {event.status === "CANCELED" && (
                <button
                  onClick={() => props.onDelete(event.id)}
                  className="flex-1 py-2 text-xs text-rose-600 border border-rose-200 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
                >
                  Видалити
                </button>
              )}
            </>
          ) : props.isRegistered ? (
            <button
              onClick={() => props.onCancel(event.id)}
              className="flex-1 py-2 text-xs text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition"
            >
              Скасувати участь
            </button>
          ) : isFull ? (
            <span className="flex-1 py-2 text-xs text-slate-400 text-center">
              Місць немає
            </span>
          ) : (
            <button
              onClick={() => props.onRegister(event.id, event.title)}
              className="flex-1 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Зареєструватись
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
