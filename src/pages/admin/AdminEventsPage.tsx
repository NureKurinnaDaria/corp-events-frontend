import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "../../api/events";
import { categoriesApi } from "../../api/categories";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import EventCard from "../../components/events/EventCard";
import EventRow from "../../components/events/EventRow";
import LoadingState from "../../components/common/LoadingState";
import { GridIcon, ListIcon, SearchIcon } from "../../components/common/icons";
import type { Event, Category, EventStatus } from "../../types";
import type { EventFilters } from "../../api/events";
import ConfirmModal from "../../components/common/ConfirmModal";

type ViewMode = "grid" | "list";
type SortMode = "asc" | "desc";
type FormatFilter = "" | NonNullable<EventFilters["format"]>;
type DateFilter = "" | NonNullable<EventFilters["date"]>;
type StatusFilter = "" | EventStatus;

const STATUS_LABELS: Record<EventStatus, string> = {
  PUBLISHED: "Published",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
};

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("list");

  const [search, setSearch] = useState("");
  const [format, setFormat] = useState<FormatFilter>("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<DateFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [sort, setSort] = useState<SortMode>("asc");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  const loadEvents = () => {
    setIsLoading(true);
    eventsApi
      .getAll({
        search: search || undefined,
        format: format || undefined,
        categoryId: categoryId || undefined,
        date: date || undefined,
        sortOrder: sort,
        status: status || undefined,
      })
      .then(setEvents)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadEvents();
  }, [search, format, categoryId, date, sort, status]);

  const handleView = (id: string) => navigate(`/admin/events/${id}`);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await eventsApi.deleteById(deleteTargetId);
      loadEvents();
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Помилка видалення"));
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-slate-800 mb-1">Події</h1>
          <p className="text-sm text-slate-500">
            Керування корпоративними подіями
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Видалення доступне лише для скасованих подій (
            <span className="font-medium">Canceled</span>)
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/events/create")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Створити подію
        </button>
      </div>

      {/* Filter row */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 mb-2 flex items-center gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
          <SearchIcon />
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
          onChange={(e) => setFormat(e.target.value as FormatFilter)}
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
          onChange={(e) => setDate(e.target.value as DateFilter)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none cursor-pointer"
        >
          <option value="">Дата</option>
          <option value="this_week">Цього тижня</option>
          <option value="this_month">Цього місяця</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none cursor-pointer"
        >
          <option value="">Статус</option>
          {(Object.keys(STATUS_LABELS) as EventStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
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

      {/* Sort row */}
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

      {isLoading ? (
        <LoadingState />
      ) : events.length === 0 ? (
        <LoadingState text="Подій не знайдено" />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              isAdmin
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <EventRow
              key={e.id}
              event={e}
              isAdmin
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      {deleteTargetId && (
        <ConfirmModal
          title="Видалити подію?"
          message="Цю дію не можна скасувати. Подія буде видалена назавжди."
          confirmLabel="Видалити"
          cancelLabel="Назад"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
