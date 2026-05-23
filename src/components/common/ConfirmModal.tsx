interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Підтвердити",
  cancelLabel = "Скасувати",
  variant = "warning",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const isWarning = variant === "warning";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: isWarning ? "#fff7ed" : "#fff1f2" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isWarning ? "#d97706" : "#e11d48"}
            strokeWidth="2.5"
          >
            <path d="M12 9v4" />
            <circle
              cx="12"
              cy="17"
              r="1.25"
              fill={isWarning ? "#d97706" : "#e11d48"}
              stroke="none"
            />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm rounded-xl transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-white text-sm rounded-xl transition"
            style={{ background: isWarning ? "#d97706" : "#e11d48" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
