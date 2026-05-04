import type { Feedback } from "../../api/feedback";

interface FeedbackDisplayProps {
  feedback: Feedback;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#cbd5e1"}
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= feedback.rating} />
        ))}
        <span className="text-sm text-slate-500 ml-2">
          {feedback.rating} / 5
        </span>
      </div>

      <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-4 py-3">
        {feedback.comment}
      </p>

      <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
        ✓ Ваш відгук успішно надіслано
      </p>
    </div>
  );
}
