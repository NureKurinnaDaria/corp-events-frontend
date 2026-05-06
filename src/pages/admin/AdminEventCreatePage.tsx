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
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-4"
      >
        <ChevronLeftIcon />
        Назад до подій
      </button>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">Створення події</span>
      </div>

      <div className="max-w-4xl mx-auto">
        <EventForm onSubmit={handleSubmit} submitLabel="Створити подію" />
      </div>
    </div>
  );
}
