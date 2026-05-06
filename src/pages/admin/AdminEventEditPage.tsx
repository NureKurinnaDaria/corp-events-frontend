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
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-4"
      >
        <ChevronLeftIcon />
        Назад до деталей події
      </button>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">Редагування події</span>
      </div>

      <div className="max-w-4xl mx-auto">
        <EventForm
          initialData={event}
          onSubmit={handleSubmit}
          submitLabel="Зберегти зміни"
        />
      </div>
    </div>
  );
}
