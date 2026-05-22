import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventsApi } from "../../api/events";
import EventForm from "../../components/events/EventForm";
import LoadingState from "../../components/common/LoadingState";
import type { EventPayload } from "../../api/events";
import type { Event } from "../../types";
import { ChevronLeftIcon } from "../../components/common/icons";

export default function AdminEventEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    eventsApi
      .getById(id)
      .then(setEvent)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (payload: Partial<EventPayload>) => {
    if (!id) return;
    await eventsApi.update(id, payload);
    navigate(`/admin/events/${id}`);
  };

  if (isLoading) return <LoadingState />;
  if (!event) return <LoadingState text="Подію не знайдено" />;

  return (
    <div>
      <button
        onClick={() => navigate(`/admin/events/${id}`)}
        className="flex items-center gap-1.5 text-sm transition mb-5"
        style={{ color: "#64748b", fontWeight: 500 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
      >
        <ChevronLeftIcon /> Назад до деталей події
      </button>

      <div className="mb-4">
        <h1
          className="text-slate-900 mb-1"
          style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.4px" }}
        >
          Редагування події
        </h1>
        <p className="text-sm text-slate-400">{event.title}</p>
      </div>

      <div className="max-w-4xl">
        <EventForm
          initialData={event}
          onSubmit={handleSubmit}
          submitLabel="Зберегти зміни"
        />
      </div>
    </div>
  );
}
