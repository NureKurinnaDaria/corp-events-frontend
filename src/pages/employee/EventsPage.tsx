import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "../../api/events";
import { categoriesApi } from "../../api/categories";
import { registrationsApi } from "../../api/registrations";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import EventCard from "../../components/events/EventCard";
import EventRow from "../../components/events/EventRow";
import SuccessModal from "../../components/common/SuccessModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import ErrorModal from "../../components/common/ErrorModal";
import LoadingState from "../../components/common/LoadingState";
import { GridIcon, ListIcon, SearchIcon } from "../../components/common/icons";
import type { Event, Category, MyRegistrationsResponse } from "../../types";
import type { EventFilters } from "../../api/events";
import { useEventsListSocket } from "../../hooks/useSocket";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState("");
  const [format, setFormat] = useState<FormatFilter>("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<DateFilter>("");
  const [sort, setSort] = useState<SortMode>("asc");

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
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
    loadEvents();
  }, [search, format, categoryId, date, sort]);

  // Real-time: оновлення лічильника учасників і нові події
  useEventsListSocket({
    onParticipantsUpdated: ({ eventId, participantsCount }) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, participantsCount } : e)),
      );
    },
    onEventCreated: (newEvent) => {
      setEvents((prev) => {
        // Уникаємо дублювання якщо подія вже є
        if (prev.some((e) => e.id === newEvent.id)) return prev;
        // Додаємо відповідно до поточного сортування
        const updated = [...prev, newEvent as Event];
        if (sort === "asc") {
          updated.sort(
            (a, b) =>
              new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
          );
        } else {
          updated.sort(
            (a, b) =>
              new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
          );
        }
        return updated;
      });
    },
  });

  const isRegistered = (eventId: string) =>
    myRegistrations.upcoming.some((r) => r.event.id === eventId);

  const handleView = (id: string) => navigate(`/events/${id}`);

  const handleRegister = async (id: string, title: string) => {
    try {
      await registrationsApi.register(id);
      setSuccessEvent(title);
      // Оновлюємо реєстрації юзера
      const updated = await registrationsApi.getMyRegistrations();
      setMyRegistrations(updated);
      // Лічильник оновлює WebSocket (participantsUpdatedGlobal) для всіх браузерів включно з цим
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, "Помилка реєстрації"));
    }
  };

  const handleCancel = (id: string) => setConfirmCancelId(id);

  const handleConfirmCancel = async () => {
    if (!confirmCancelId) return;
    try {
      await registrationsApi.cancel(confirmCancelId);
      const updated = await registrationsApi.getMyRegistrations();
      setMyRegistrations(updated);
      loadEvents();
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, "Помилка скасування"));
    } finally {
      setConfirmCancelId(null);
    }
  };

  const hasActiveFilters = search || format || categoryId || date;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .ep-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }

        @keyframes ep-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ep-fade-up { opacity: 0; animation: ep-fadeUp .4s ease forwards; }
        .ep-d1 { animation-delay: .04s; }
        .ep-d2 { animation-delay: .10s; }
        .ep-d3 { animation-delay: .16s; }

        .ep-header {
          position: relative;
          background: #fff;
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 4px 24px rgba(15,23,42,.07);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .ep-header::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 80% at 95% 50%, rgba(37,99,235,.1) 0%, transparent 60%),
            radial-gradient(ellipse 30% 60% at 5%  60%, rgba(124,58,237,.06) 0%, transparent 55%);
          pointer-events: none;
        }
        .ep-header-text { position: relative; z-index: 1; }
        .ep-title {
          font-size: 24px; font-weight: 800; letter-spacing: -.5px;
          color: #0f172a; margin: 0 0 4px;
        }
        .ep-subtitle {
          font-size: 13px; color: #64748b; font-weight: 500; margin: 0;
        }
        .ep-count-badge {
          position: relative; z-index: 1;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 13px; font-weight: 700;
          padding: 8px 18px; border-radius: 100px;
          white-space: nowrap;
        }

        .ep-filters {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e8edf5;
          box-shadow: 0 2px 12px rgba(15,23,42,.05);
          padding: 16px 20px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ep-search {
          flex: 1; min-width: 180px;
          display: flex; align-items: center; gap: 8px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 12px;
          transition: border-color .15s;
        }
        .ep-search:focus-within {
          border-color: #93c5fd;
          background: #fff;
        }
        .ep-search input {
          flex: 1; border: none; background: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          font-family: 'Manrope', sans-serif;
        }
        .ep-search input::placeholder { color: #94a3b8; }

        .ep-select {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 13px; font-weight: 500;
          color: #475569;
          outline: none; cursor: pointer;
          font-family: 'Manrope', sans-serif;
          transition: border-color .15s;
          appearance: none;
          padding-right: 28px;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }
        .ep-select:focus { border-color: #93c5fd; background-color: #fff; }
        .ep-select.active { border-color: #2563eb; color: #1d4ed8; background-color: #eff6ff; }

        .ep-divider {
          width: 1px; height: 28px; background: #e2e8f0; flex-shrink: 0;
        }

        .ep-view-toggle {
          display: flex;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .ep-view-btn {
          padding: 7px 10px; border: none; cursor: pointer;
          transition: all .15s; background: #f8fafc; color: #94a3b8;
          display: flex; align-items: center;
        }
        .ep-view-btn.active { background: #2563eb; color: #fff; }
        .ep-view-btn:first-child { border-right: 1px solid #e2e8f0; }

        .ep-sort-row {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 20px;
        }
        .ep-sort-label {
          font-size: 12px; font-weight: 600; color: #94a3b8;
          text-transform: uppercase; letter-spacing: .05em;
        }
        .ep-sort-btn {
          font-size: 12px; font-weight: 600;
          padding: 5px 14px; border-radius: 100px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc; color: #64748b;
          cursor: pointer; transition: all .15s;
          font-family: 'Manrope', sans-serif;
        }
        .ep-sort-btn.active {
          background: #0f172a; color: #fff; border-color: #0f172a;
        }

        .ep-empty {
          text-align: center; padding: 60px 20px;
          background: #fff; border-radius: 16px;
          border: 1px solid #e8edf5;
        }
        .ep-empty-icon {
          font-size: 40px; margin-bottom: 12px;
        }
        .ep-empty-text {
          font-size: 15px; font-weight: 600; color: #475569; margin: 0 0 4px;
        }
        .ep-empty-sub {
          font-size: 13px; color: #94a3b8; margin: 0;
        }

        .ep-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .ep-list { display: flex; flex-direction: column; gap: 10px; }

        .ep-card-wrap { opacity: 0; animation: ep-fadeUp .35s ease forwards; }
      `}</style>

      <div className="ep-wrap">
        {/* Header */}
        <div className={`ep-header${mounted ? " ep-fade-up" : ""}`}>
          <div className="ep-header-text">
            <h1 className="ep-title">Події</h1>
            <p className="ep-subtitle">
              Перегляд майбутніх корпоративних подій
            </p>
          </div>
          {!isLoading && (
            <span className="ep-count-badge">
              {events.length}{" "}
              {events.length === 1
                ? "подія"
                : events.length < 5
                  ? "події"
                  : "подій"}
            </span>
          )}
        </div>

        {/* Filters */}
        <div className={`ep-filters${mounted ? " ep-fade-up ep-d1" : ""}`}>
          <div className="ep-search">
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
            className={`ep-select${format ? " active" : ""}`}
          >
            <option value="">Формат</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`ep-select${categoryId ? " active" : ""}`}
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
            className={`ep-select${date ? " active" : ""}`}
          >
            <option value="">Дата</option>
            <option value="this_week">Цього тижня</option>
            <option value="this_month">Цього місяця</option>
          </select>

          {hasActiveFilters && (
            <>
              <div className="ep-divider" />
              <button
                onClick={() => {
                  setSearch("");
                  setFormat("");
                  setCategoryId("");
                  setDate("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#e11d48",
                  fontFamily: "Manrope, sans-serif",
                  padding: "0 4px",
                  whiteSpace: "nowrap",
                }}
              >
                ✕ Скинути
              </button>
            </>
          )}

          <div className="ep-divider" />

          <div className="ep-view-toggle">
            <button
              className={`ep-view-btn${view === "grid" ? " active" : ""}`}
              onClick={() => setView("grid")}
            >
              <GridIcon />
            </button>
            <button
              className={`ep-view-btn${view === "list" ? " active" : ""}`}
              onClick={() => setView("list")}
            >
              <ListIcon />
            </button>
          </div>
        </div>

        {/* Sort row */}
        <div className={`ep-sort-row${mounted ? " ep-fade-up ep-d2" : ""}`}>
          <span className="ep-sort-label">Сортування:</span>
          <button
            className={`ep-sort-btn${sort === "asc" ? " active" : ""}`}
            onClick={() => setSort("asc")}
          >
            ↑ Найближчі
          </button>
          <button
            className={`ep-sort-btn${sort === "desc" ? " active" : ""}`}
            onClick={() => setSort("desc")}
          >
            ↓ Найпізніші
          </button>
        </div>

        {/* Content */}
        <div className={mounted ? "ep-fade-up ep-d3" : ""}>
          {isLoading ? (
            <LoadingState />
          ) : events.length === 0 ? (
            <div className="ep-empty">
              <div className="ep-empty-icon">
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
              <p className="ep-empty-text">Подій не знайдено</p>
              <p className="ep-empty-sub">
                Спробуйте змінити фільтри або пошуковий запит
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="ep-grid">
              {events.map((e, i) => (
                <div
                  key={e.id}
                  className="ep-card-wrap"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <EventCard
                    event={e}
                    isRegistered={isRegistered(e.id)}
                    onView={handleView}
                    onRegister={handleRegister}
                    onCancel={handleCancel}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="ep-list">
              {events.map((e, i) => (
                <div
                  key={e.id}
                  className="ep-card-wrap"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <EventRow
                    event={e}
                    isRegistered={isRegistered(e.id)}
                    onView={handleView}
                    onRegister={handleRegister}
                    onCancel={handleCancel}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {successEvent && (
        <SuccessModal
          message={`Ви успішно зареєстровані на подію: ${successEvent}`}
          onClose={() => setSuccessEvent(null)}
        />
      )}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {confirmCancelId && (
        <ConfirmModal
          title="Скасувати участь?"
          message="Ви впевнені, що хочете скасувати реєстрацію на цю подію?"
          confirmLabel="Так, скасувати"
          cancelLabel="Ні, залишитись"
          variant="warning"
          onConfirm={handleConfirmCancel}
          onCancel={() => setConfirmCancelId(null)}
        />
      )}
    </>
  );
}
