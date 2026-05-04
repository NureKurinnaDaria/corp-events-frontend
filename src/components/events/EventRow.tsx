import { getCategoryColor } from "../../utils/categoryColor";
import { formatDate } from "../../utils/formatDate";
import {
  OnlineIcon,
  OfflineIcon,
  CalendarIcon,
  UsersIcon,
} from "../common/icons";
import type { Event } from "../../types";

interface EventRowProps {
  event: Event;
  isRegistered?: boolean;
  onView: (id: string) => void;
  onRegister: (id: string, title: string) => void;
  onCancel: (id: string) => void;
}

export default function EventRow({
  event,
  isRegistered,
  onView,
  onRegister,
  onCancel,
}: EventRowProps) {
  const color = getCategoryColor(event.category?.name || "default");
  const isFull =
    event.maxParticipants !== null &&
    event.maxParticipants !== undefined &&
    event.participantsCount >= event.maxParticipants;

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div
        className="w-1.5 self-stretch rounded-full flex-shrink-0"
        style={{ background: color.bar }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-800 truncate">
            {event.title}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: color.bg, color: color.text }}
          >
            {event.category?.name}
          </span>
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
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onView(event.id)}
          className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          Деталі
        </button>
        {isRegistered ? (
          <button
            onClick={() => onCancel(event.id)}
            className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
          >
            Скасувати участь
          </button>
        ) : isFull ? (
          <span className="px-3 py-1.5 text-xs text-slate-400">
            Місць немає
          </span>
        ) : (
          <button
            onClick={() => onRegister(event.id, event.title)}
            className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Зареєструватись
          </button>
        )}
      </div>
      {isFull && (
        <span className="px-3 py-1.5 text-xs text-slate-400">Місць немає</span>
      )}
    </div>
  );
}
