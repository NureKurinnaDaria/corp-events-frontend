interface SuccessModalProps {
  message: string;
  onClose: () => void;
}

export default function SuccessModal({ message, onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          Реєстрацію підтверджено!
        </h2>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition"
        >
          Чудово!
        </button>
      </div>
    </div>
  );
}
