import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "../../api/events";
import { categoriesApi } from "../../api/categories";
import { registrationsApi } from "../../api/registrations";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import EventCard from "../../components/events/EventCard";
import EventRow from "../../components/events/EventRow";
import SuccessModal from "../../components/common/SuccessModal";
import LoadingState from "../../components/common/LoadingState";
import { GridIcon, ListIcon, SearchIcon } from "../../components/common/icons";
import type { Event, Category, MyRegistrationsResponse } from "../../types";
import type { EventFilters } from "../../api/events";

type ViewMode = "grid" | "list";
type SortMode = "asc" | "desc";
type FormatFilter = "" | NonNullable<EventFilters["format"]>;
type DateFilter = "" | NonNullable<EventFilters["date"]>;

export default function EventsPage() {
  const navigate = useNavigate();
  const [myRegistrations, setMyRegistrations] =
    useState<MyRegistrationsResponse>({ upcoming: [], completed: [] });
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");
  const [successEvent, setSuccessEvent] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [format, setFormat] = useState<FormatFilter>("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<DateFilter>("");
  const [sort, setSort] = useState<SortMode>("asc");

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
    registrationsApi
      .getMyRegistrations()
      .then(setMyRegistrations)
      .catch(console.error);
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
      })
      .then(setEvents)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents();
  }, [search, format, categoryId, date, sort]);

  const isRegistered = (eventId: string) =>
    myRegistrations.upcoming.some((r) => r.event.id === eventId);

  const handleView = (id: string) => navigate(`/events/${id}`);

  const handleRegister = async (id: string, title: string) => {
    try {
      await registrationsApi.register(id);
      setSuccessEvent(title);
      const updated = await registrationsApi.getMyRegistrations();
      setMyRegistrations(updated);
      loadEvents();
    } catch (error: unknown) {
      alert(getApiErrorMessage(error, "Помилка реєстрації"));
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await registrationsApi.cancel(id);
      const updated = await registrationsApi.getMyRegistrations();
      setMyRegistrations(updated);
      loadEvents();
    } catch (error: unknown) {
      alert(getApiErrorMessage(error, "Помилка скасування"));
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1
          className="text-slate-900 mb-1"
          style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.4px" }}
        >
          Події
        </h1>
        <p className="text-sm text-slate-400" style={{ fontWeight: 400 }}>
          Перегляд майбутніх корпоративних подій
        </p>
      </div>

      {/* Filter row 1 */}
      <div
        className="px-4 py-2.5 mb-2 flex items-center gap-3 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(59,130,246,0.10)",
          boxShadow: "0 2px 12px rgba(59,130,246,0.05)",
        }}
      >
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
      <div
        className="px-4 py-2.5 mb-5 flex items-center gap-3 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(59,130,246,0.10)",
          boxShadow: "0 2px 12px rgba(59,130,246,0.05)",
        }}
      >
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
        <LoadingState />
      ) : events.length === 0 ? (
        <LoadingState text="Подій не знайдено" />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              isRegistered={isRegistered(e.id)}
              onView={handleView}
              onRegister={handleRegister}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <EventRow
              key={e.id}
              event={e}
              isRegistered={isRegistered(e.id)}
              onView={handleView}
              onRegister={handleRegister}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {successEvent && (
        <SuccessModal
          message={`Ви успішно зареєстровані на подію: ${successEvent}`}
          onClose={() => setSuccessEvent(null)}
        />
      )}
    </div>
  );
}
