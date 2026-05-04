import { getCategoryColor } from "../../utils/categoryColor";
import { formatDate } from "../../utils/formatDate";
import {
  OnlineIcon,
  OfflineIcon,
  CalendarIcon,
  UsersIcon,
} from "../common/icons";
import type { Event } from "../../types";

interface EventCardProps {
  event: Event;
  isRegistered?: boolean;
  onView: (id: string) => void;
  onRegister: (id: string, title: string) => void;
  onCancel: (id: string) => void;
}

export default function EventCard({
  event,
  isRegistered,
  onView,
  onRegister,
  onCancel,
}: EventCardProps) {
  const color = getCategoryColor(event.category?.name || "default");
  const max = event.maxParticipants;
  const registered = event.participantsCount;
  const progress = max ? Math.min((registered / max) * 100, 100) : 0;
  const free = max ? max - registered : null;
  const isFull = max !== null && max !== undefined && registered >= max;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1.5 w-full" style={{ background: color.bar }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: color.bg, color: color.text }}
          >
            {event.category?.name || "Без категорії"}
          </span>
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: event.format === "ONLINE" ? "#1a6fd4" : "#92400e" }}
          >
            {event.format === "ONLINE" ? <OnlineIcon /> : <OfflineIcon />}
            {event.format === "ONLINE" ? "Online" : "Offline"}
          </span>
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
          {isRegistered ? (
            <button
              onClick={() => onCancel(event.id)}
              className="flex-1 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              Скасувати участь
            </button>
          ) : isFull ? (
            <span className="flex-1 py-2 text-xs text-slate-400 text-center">
              Місць немає
            </span>
          ) : (
            <button
              onClick={() => onRegister(event.id, event.title)}
              className="flex-1 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Зареєструватись
            </button>
          )}
        </div>
        {isFull && (
          <span className="flex-1 py-2 text-xs text-slate-400 text-center">
            Місць немає
          </span>
        )}
      </div>
    </div>
  );
}
