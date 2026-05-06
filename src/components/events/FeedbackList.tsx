import type { Feedback } from "../../api/feedback";

interface FeedbackListProps {
  feedbacks: Feedback[];
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#cbd5e1"}
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function getInitials(fullName: string | null, email: string): string {
  if (fullName) {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

const AVATAR_COLORS = [
  { bg: "#eff6ff", color: "#1d4ed8" },
  { bg: "#f5f3ff", color: "#6d28d9" },
  { bg: "#f0fdf4", color: "#15803d" },
  { bg: "#fff7ed", color: "#c2410c" },
  { bg: "#fdf2f8", color: "#a21caf" },
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function FeedbackList({ feedbacks }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <p className="text-sm text-slate-400">Ще немає відгуків про цю подію</p>
    );
  }

  const avgRating =
    feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

  return (
    <div>
      {/* Середня оцінка */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <span className="text-3xl font-medium text-slate-800">
          {avgRating.toFixed(1)}
        </span>
        <div>
          <div className="flex items-center gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= Math.round(avgRating)} />
            ))}
          </div>
          <p className="text-xs text-slate-400">{feedbacks.length} відгуків</p>
        </div>
      </div>

      {/* Список відгуків */}
      <div className="flex flex-col gap-4">
        {feedbacks.map((feedback) => {
          const user = feedback.user;
          const avatarColor = user ? getAvatarColor(user.id) : AVATAR_COLORS[0];
          const initials = user ? getInitials(user.fullName, user.email) : "?";

          return (
            <div key={feedback.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                style={{ background: avatarColor.bg, color: avatarColor.color }}
              >
                {initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-700">
                    {user?.fullName || user?.email || "Анонім"}
                  </p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= feedback.rating} />
                    ))}
                  </div>
                </div>
                {user?.position && (
                  <p className="text-xs text-slate-400 mb-1.5">
                    {user.position}
                  </p>
                )}
                {feedback.comment && (
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3.5 py-2.5">
                    {feedback.comment}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
