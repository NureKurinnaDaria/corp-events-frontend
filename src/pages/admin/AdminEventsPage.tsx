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
  PUBLISHED: "Опубліковано",
  ONGOING: "Триває",
  COMPLETED: "Завершено",
  CANCELED: "Скасовано",
};

interface AdminEventsPageProps {
  initialStatus?: StatusFilter;
  archiveMode?: boolean;
}

export default function AdminEventsPage({
  initialStatus = "",
  archiveMode = false,
}: AdminEventsPageProps) {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("list");
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState("");
  const [format, setFormat] = useState<FormatFilter>("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<DateFilter>("");
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [sort, setSort] = useState<SortMode>("asc");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
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
  const handleDelete = (id: string) => setDeleteTargetId(id);

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

  const hasActiveFilters = search || format || categoryId || date || status;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .aep-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }

        @keyframes aep-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .aep-fade-up { opacity: 0; animation: aep-fadeUp .4s ease forwards; }
        .aep-d1 { animation-delay: .05s; }
        .aep-d2 { animation-delay: .10s; }
        .aep-d3 { animation-delay: .16s; }

        .aep-header {
          position: relative; background: #fff; border-radius: 20px;
          padding: 28px 32px; margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 4px 24px rgba(15,23,42,.07);
          overflow: hidden; display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
        }
        .aep-header::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 80% at 95% 50%, rgba(37,99,235,.1) 0%, transparent 60%),
            radial-gradient(ellipse 30% 60% at 5% 60%, rgba(124,58,237,.06) 0%, transparent 55%);
          pointer-events: none;
        }
        .aep-header-text { position: relative; z-index: 1; }
        .aep-title { font-size: 24px; font-weight: 800; letter-spacing: -.5px; color: #0f172a; margin: 0 0 4px; }
        .aep-subtitle { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; }
        .aep-header-right { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .aep-count-badge {
          background: #eff6ff; border: 1px solid #bfdbfe;
          color: #1d4ed8; font-size: 13px; font-weight: 700;
          padding: 8px 18px; border-radius: 100px; white-space: nowrap;
        }
        .aep-create-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 18px; font-size: 13px; font-weight: 700;
          color: #fff; border: none; border-radius: 12px; cursor: pointer;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 4px 14px rgba(37,99,235,.35);
          transition: transform .15s, box-shadow .15s;
          font-family: 'Manrope', sans-serif;
        }
        .aep-create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37,99,235,.4);
        }

        .aep-filters {
          background: #fff; border-radius: 16px;
          border: 1px solid #e8edf5;
          box-shadow: 0 2px 12px rgba(15,23,42,.05);
          padding: 16px 20px; margin-bottom: 12px;
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .aep-search {
          flex: 1; min-width: 180px;
          display: flex; align-items: center; gap: 8px;
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 10px; padding: 8px 12px; transition: border-color .15s;
        }
        .aep-search:focus-within { border-color: #93c5fd; background: #fff; }
        .aep-search input {
          flex: 1; border: none; background: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          font-family: 'Manrope', sans-serif;
        }
        .aep-search input::placeholder { color: #94a3b8; }
        .aep-select {
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 10px; padding: 8px 28px 8px 12px;
          font-size: 13px; font-weight: 500; color: #475569;
          outline: none; cursor: pointer; font-family: 'Manrope', sans-serif;
          transition: border-color .15s; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 10px center;
        }
        .aep-select:focus { border-color: #93c5fd; background-color: #fff; }
        .aep-select.active { border-color: #2563eb; color: #1d4ed8; background-color: #eff6ff; }
        .aep-divider { width: 1px; height: 28px; background: #e2e8f0; flex-shrink: 0; }
        .aep-view-toggle {
          display: flex; border: 1.5px solid #e2e8f0;
          border-radius: 10px; overflow: hidden; flex-shrink: 0;
        }
        .aep-view-btn {
          padding: 7px 10px; border: none; cursor: pointer;
          transition: all .15s; background: #f8fafc; color: #94a3b8;
          display: flex; align-items: center;
        }
        .aep-view-btn.active { background: #2563eb; color: #fff; }
        .aep-view-btn:first-child { border-right: 1px solid #e2e8f0; }
        .aep-reset-btn {
          font-size: 12px; font-weight: 600; color: #64748b;
          background: none; border: 1.5px solid #e2e8f0;
          border-radius: 10px; padding: 7px 12px; cursor: pointer;
          transition: all .15s; font-family: 'Manrope', sans-serif;
          white-space: nowrap;
        }
        .aep-reset-btn:hover { color: #e11d48; border-color: #fecdd3; background: #fff1f2; }

        .aep-sort-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .aep-sort-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }
        .aep-sort-btn {
          font-size: 12px; font-weight: 600; padding: 5px 14px; border-radius: 100px;
          border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b;
          cursor: pointer; transition: all .15s; font-family: 'Manrope', sans-serif;
        }
        .aep-sort-btn.active { background: #0f172a; color: #fff; border-color: #0f172a; }

        .aep-empty {
          text-align: center; padding: 60px 20px;
          background: #fff; border-radius: 16px; border: 1px solid #e8edf5;
        }
        .aep-empty-icon { color: #cbd5e1; margin-bottom: 12px; display: flex; justify-content: center; }
        .aep-empty-text { font-size: 15px; font-weight: 600; color: #475569; margin: 0 0 4px; }
        .aep-empty-sub { font-size: 13px; color: #94a3b8; margin: 0; }
        .aep-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .aep-list { display: flex; flex-direction: column; gap: 10px; }
        .aep-card-wrap { opacity: 0; animation: aep-fadeUp .35s ease forwards; }
      `}</style>

      <div className="aep-wrap">
        {/* Header */}
        <div className={`aep-header${mounted ? " aep-fade-up" : ""}`}>
          <div className="aep-header-text">
            <h1 className="aep-title">
              {archiveMode ? "Архів подій" : "Події"}
            </h1>
            <p className="aep-subtitle">
              {archiveMode
                ? "Завершені корпоративні заходи"
                : "Керування корпоративними подіями"}
            </p>
            {!archiveMode && (
              <p
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  margin: "4px 0 0",
                  fontWeight: 500,
                }}
              >
                Видалення доступне лише для скасованих подій
              </p>
            )}
          </div>
          <div className="aep-header-right">
            {!isLoading && (
              <span className="aep-count-badge">
                {events.length}{" "}
                {events.length === 1
                  ? "подія"
                  : events.length < 5
                    ? "події"
                    : "подій"}
              </span>
            )}
            {!archiveMode && (
              <button
                className="aep-create-btn"
                onClick={() => navigate("/admin/events/create")}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Створити подію
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className={`aep-filters${mounted ? " aep-fade-up aep-d1" : ""}`}>
          <div className="aep-search">
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук по назві..."
            />
          </div>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as FormatFilter)}
            className={`aep-select${format ? " active" : ""}`}
          >
            <option value="">Формат</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`aep-select${categoryId ? " active" : ""}`}
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
            className={`aep-select${date ? " active" : ""}`}
          >
            <option value="">Дата</option>
            <option value="this_week">Цього тижня</option>
            <option value="this_month">Цього місяця</option>
          </select>
          {!archiveMode && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className={`aep-select${status ? " active" : ""}`}
            >
              <option value="">Статус</option>
              {(Object.keys(STATUS_LABELS) as EventStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          )}
          <div className="aep-divider" />
          <div className="aep-view-toggle">
            <button
              onClick={() => setView("grid")}
              className={`aep-view-btn${view === "grid" ? " active" : ""}`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setView("list")}
              className={`aep-view-btn${view === "list" ? " active" : ""}`}
            >
              <ListIcon />
            </button>
          </div>
          {hasActiveFilters && (
            <button
              className="aep-reset-btn"
              onClick={() => {
                setSearch("");
                setFormat("");
                setCategoryId("");
                setDate("");
                setStatus(initialStatus);
              }}
            >
              ✕ Скинути
            </button>
          )}
        </div>

        {/* Sort row */}
        <div className={`aep-sort-row${mounted ? " aep-fade-up aep-d2" : ""}`}>
          <span className="aep-sort-label">Сортування:</span>
          <button
            onClick={() => setSort("asc")}
            className={`aep-sort-btn${sort === "asc" ? " active" : ""}`}
          >
            ↑ Найближчі
          </button>
          <button
            onClick={() => setSort("desc")}
            className={`aep-sort-btn${sort === "desc" ? " active" : ""}`}
          >
            ↓ Найпізніші
          </button>
        </div>

        {/* Content */}
        <div className={mounted ? "aep-fade-up aep-d3" : ""}>
          {isLoading ? (
            <LoadingState />
          ) : events.length === 0 ? (
            <div className="aep-empty">
              <div className="aep-empty-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p className="aep-empty-text">Подій не знайдено</p>
              <p className="aep-empty-sub">
                Спробуйте змінити фільтри або пошуковий запит
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="aep-grid">
              {events.map((e, i) => (
                <div
                  key={e.id}
                  className="aep-card-wrap"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <EventCard
                    event={e}
                    isAdmin
                    onView={handleView}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="aep-list">
              {events.map((e, i) => (
                <div
                  key={e.id}
                  className="aep-card-wrap"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <EventRow
                    event={e}
                    isAdmin
                    onView={handleView}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
    </>
  );
}
