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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .aedit-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }
        .aedit-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: #64748b;
          background: none; border: none; cursor: pointer; padding: 0;
          margin-bottom: 16px; transition: color .15s; font-family: 'Manrope', sans-serif;
        }
        .aedit-back:hover { color: #2563eb; }
        .aedit-header {
          position: relative; background: #fff; border-radius: 20px;
          padding: 28px 32px; margin-bottom: 20px;
          border: 1px solid rgba(0,0,0,.06); box-shadow: 0 4px 24px rgba(15,23,42,.07);
          overflow: hidden;
        }
        .aedit-header::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 55% 80% at 95% 50%, rgba(37,99,235,.1) 0%, transparent 60%);
          pointer-events: none;
        }
      `}</style>
      <div className="aedit-wrap">
        <button
          className="aedit-back"
          onClick={() => navigate(`/admin/events/${id}`)}
        >
          <ChevronLeftIcon /> Назад до деталей події
        </button>
        <div className="aedit-header">
          <h1
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-.5px",
              color: "#0f172a",
              margin: "0 0 4px",
            }}
          >
            Редагування події
          </h1>
          <p
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: 13,
              color: "#64748b",
              fontWeight: 500,
              margin: 0,
            }}
          >
            {event.title}
          </p>
        </div>
        <div style={{ maxWidth: "56rem" }}>
          <EventForm
            initialData={event}
            onSubmit={handleSubmit}
            submitLabel="Зберегти зміни"
          />
        </div>
      </div>
    </>
  );
}
