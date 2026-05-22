interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ message, onClose }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Помилка</h2>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-xl transition"
        >
          Зрозуміло
        </button>
      </div>
    </div>
  );
}
