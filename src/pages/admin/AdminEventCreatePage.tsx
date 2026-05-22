import { useNavigate } from "react-router-dom";
import { eventsApi } from "../../api/events";
import EventForm from "../../components/events/EventForm";
import type { EventPayload } from "../../api/events";
import { ChevronLeftIcon } from "../../components/common/icons";

export default function AdminEventCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (payload: EventPayload) => {
    const event = await eventsApi.create(payload);
    navigate(`/admin/events/${event.id}`);
  };

  return (
    <div>
      <button
        onClick={() => navigate("/admin/events")}
        className="flex items-center gap-1.5 text-sm transition mb-5"
        style={{ color: "#64748b", fontWeight: 500 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
      >
        <ChevronLeftIcon /> Назад до подій
      </button>

      <div className="mb-4">
        <h1
          className="text-slate-900 mb-1"
          style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.4px" }}
        >
          Створення події
        </h1>
        <p className="text-sm text-slate-400">
          Заповніть форму для створення нової події
        </p>
      </div>

      <div className="max-w-4xl">
        <EventForm onSubmit={handleSubmit} submitLabel="Створити подію" />
      </div>
    </div>
  );
}
