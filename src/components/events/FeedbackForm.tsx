import { useState } from "react";

interface FeedbackFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isLoading: boolean;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#cbd5e1"}
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function FeedbackForm({
  onSubmit,
  isLoading,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) return;
    await onSubmit(rating, comment);
  };

  return (
    <div>
      {/* Зірки */}
      <p className="text-sm text-slate-600 mb-2">Оцінка</p>
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition"
          >
            <StarIcon filled={star <= (hoverRating || rating)} />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-slate-400 ml-2">{rating} / 5</span>
        )}
      </div>

      {/* Коментар */}
      <p className="text-sm text-slate-600 mb-2">Коментар</p>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Поділіться враженнями про подію..."
        rows={3}
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={isLoading || rating === 0 || !comment.trim()}
        className="mt-3 px-5 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Надсилання..." : "Надіслати відгук"}
      </button>
    </div>
  );
}
