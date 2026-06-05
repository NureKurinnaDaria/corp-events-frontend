import { formatDate } from "../../utils/formatDate";
import { getCategoryColor } from "../../utils/categoryColor";
import { CalendarIcon } from "../../components/common/icons";
import type { Registration } from "../../types";

interface RegistrationCardProps {
  registration: Registration;
  variant: "upcoming" | "completed";
  isCancelling?: boolean;
  hasFeedback?: boolean;
  animDelay?: number;
  onCancel?: () => void;
  onView: () => void;
  onFeedback?: () => void;
}

export default function RegistrationCard({
  registration,
  variant,
  isCancelling,
  hasFeedback,
  animDelay = 0,
  onCancel,
  onView,
  onFeedback,
}: RegistrationCardProps) {
  const { event } = registration;
  const color = getCategoryColor(event.category?.name || "default");
  const isOnline = event.format === "ONLINE";

  return (
    <div
      className="mr-card"
      style={{ animationDelay: `${animDelay}s` }}
      onClick={onView}
    >
      <div
        className="mr-card-accent"
        style={{
          background: `linear-gradient(180deg, ${color.bar}, ${color.bar}88)`,
        }}
      />
      <div className="mr-card-body">
        <div className="mr-card-info">
          <div className="mr-card-badges">
            <span
              className="mr-badge"
              style={{ background: color.bg, color: color.text }}
            >
              {event.category?.name || "Без категорії"}
            </span>
            <span
              className="mr-badge"
              style={{
                background: isOnline ? "#eff6ff" : "#fef9c3",
                color: isOnline ? "#1d4ed8" : "#92400e",
              }}
            >
              {isOnline ? (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              ) : (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#92400e"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )}
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <div className="mr-card-title">{event.title}</div>
          <div className="mr-card-date">
            <CalendarIcon />
            {formatDate(event.startAt)}
          </div>
        </div>

        <div className="mr-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="mr-btn mr-btn-ghost" onClick={onView}>
            Деталі
          </button>

          {variant === "upcoming" && (
            <button
              className="mr-btn mr-btn-cancel"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Скасування..." : "Скасувати участь"}
            </button>
          )}

          {variant === "completed" &&
            (hasFeedback ? (
              <span className="mr-btn mr-btn-feedback-done">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: 4 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Відгук залишено
              </span>
            ) : (
              <button className="mr-btn mr-btn-primary" onClick={onFeedback}>
                Залишити відгук
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
