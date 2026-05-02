import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "../../api/events";
import { categoriesApi } from "../../api/categories";
import { getCategoryColor } from "../../utils/categoryColor";
import type { Event } from "../../types";
import type { Category } from "../../types";
import { registrationsApi } from "../../api/registrations";

type ViewMode = "grid" | "list";
type SortMode = "asc" | "desc";
type DateFilter = "this_week" | "this_month";

const GridIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const OnlineIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a6fd4"
    strokeWidth="2"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const OfflineIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#92400e"
    strokeWidth="2"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
  );
}

interface EventCardProps {
  event: Event;
  onView: (id: string) => void;
  onRegister: (id: string, title: string) => void;
}

function EventCard({ event, onView, onRegister }: EventCardProps) {
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
          {!isFull && (
            <button
              onClick={() => onRegister(event.id, event.title)}
              className="flex-1 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Зареєструватись
            </button>
          )}
          {isFull && (
            <span className="flex-1 py-2 text-xs text-slate-400 text-center">
              Місць немає
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EventRow({ event, onView, onRegister }: EventCardProps) {
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
        {!isFull && (
          <button
            onClick={() => onRegister(event.id, event.title)}
            className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Зареєструватись
          </button>
        )}
        {isFull && (
          <span className="px-3 py-1.5 text-xs text-slate-400">
            Місць немає
          </span>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");
  const [successEvent, setSuccessEvent] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<DateFilter | "">("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  const loadEvents = () => {
    setIsLoading(true);
    eventsApi
      .getAll({
        search: search || undefined,
        format: (format as any) || undefined,
        categoryId: categoryId || undefined,
        date: (date as any) || undefined,
        sortOrder: sort,
      })
      .then(setEvents)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, [search, format, categoryId, date, sort]);

  const handleView = (id: string) => navigate(`/events/${id}`);

  const handleRegister = async (id: string, title: string) => {
    try {
      await registrationsApi.register(id);
      setSuccessEvent(title);
      loadEvents();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Помилка реєстрації");
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-medium text-slate-800 mb-1">Події</h1>
        <p className="text-sm text-slate-500">
          Перегляд майбутніх корпоративних подій
        </p>
      </div>

      {/* Filter row 1 */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 mb-2 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук по назві..."
            className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
        </div>

        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none cursor-pointer"
        >
          <option value="">Формат</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
        </select>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none cursor-pointer"
        >
          <option value="">Категорія</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={date}
          onChange={(e) => setDate(e.target.value as any)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none cursor-pointer"
        >
          <option value="">Дата</option>
          <option value="this_week">Цього тижня</option>
          <option value="this_month">Цього місяця</option>
        </select>

        <div className="flex border border-slate-200 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setView("grid")}
            className={`p-2 ${view === "grid" ? "bg-blue-600 text-white" : "bg-white text-slate-400"}`}
          >
            <GridIcon />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 ${view === "list" ? "bg-blue-600 text-white" : "bg-white text-slate-400"}`}
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {/* Filter row 2 */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 mb-5 flex items-center gap-3">
        <span className="text-sm text-slate-500">Сортування:</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none cursor-pointer"
        >
          <option value="asc">Найближчі</option>
          <option value="desc">Найпізніші</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Завантаження...
        </div>
      ) : events.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Подій не знайдено
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onView={handleView}
              onRegister={handleRegister}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <EventRow
              key={e.id}
              event={e}
              onView={handleView}
              onRegister={handleRegister}
            />
          ))}
        </div>
      )}

      {/* Success modal */}
      {successEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Реєстрацію підтверджено!
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Ви успішно зареєстровані на подію:
              <br />
              <span className="font-medium text-slate-700">{successEvent}</span>
            </p>
            <button
              onClick={() => setSuccessEvent(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition"
            >
              Чудово!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
