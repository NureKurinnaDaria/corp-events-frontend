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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .acreate-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }
        .acreate-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: #64748b;
          background: none; border: none; cursor: pointer; padding: 0;
          margin-bottom: 16px; transition: color .15s; font-family: 'Manrope', sans-serif;
        }
        .acreate-back:hover { color: #2563eb; }
        .acreate-header {
          position: relative; background: #fff; border-radius: 20px;
          padding: 28px 32px; margin-bottom: 20px;
          border: 1px solid rgba(0,0,0,.06); box-shadow: 0 4px 24px rgba(15,23,42,.07);
          overflow: hidden;
        }
        .acreate-header::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 55% 80% at 95% 50%, rgba(37,99,235,.1) 0%, transparent 60%);
          pointer-events: none;
        }
      `}</style>
      <div className="acreate-wrap">
        <button
          className="acreate-back"
          onClick={() => navigate("/admin/events")}
        >
          <ChevronLeftIcon /> Назад до подій
        </button>
        <div className="acreate-header">
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
            Створення події
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
            Заповніть форму для створення нової події
          </p>
        </div>
        <div style={{ maxWidth: "56rem" }}>
          <EventForm onSubmit={handleSubmit} submitLabel="Створити подію" />
        </div>
      </div>
    </>
  );
}
