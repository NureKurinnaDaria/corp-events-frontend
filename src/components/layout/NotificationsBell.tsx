import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotificationsSocket } from "../../hooks/useSocket";
import { createPortal } from "react-dom";
import { notificationsApi } from "../../api/notifications";
import type { Notification } from "../../api/notifications";

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const [selected, setSelected] = useState<Notification | null>(null);

  // Real-time: отримуємо userId з контексту і підписуємось на нові сповіщення
  const { user } = useAuth();
  const userId = user?.id;

  useNotificationsSocket({
    userId,
    onNewNotification: (payload) => {
      setNotifications((prev) => {
        // уникаємо дублікатів
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [
          { ...payload, createdAt: new Date(payload.createdAt).toISOString() },
          ...prev,
        ];
      });
    },
  });

  const load = () => {
    notificationsApi.getAll().then(setNotifications).catch(console.error);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 320; // w-80 = 320px
      setDropdownPos({
        top: rect.top - 8, // відступ вгору від кнопки
        left: rect.left + rect.width / 2 - dropdownWidth / 2,
      });
    }
    setOpen((v) => !v);
  };

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await notificationsApi.markAllAsRead();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeIconColor: Record<string, string> = {
    EVENT_CREATED: "#2563eb",
    EVENT_CANCELED: "#e11d48",
    EVENT_UPDATED: "#7c3aed",
    FEEDBACK_REMINDER: "#d97706",
    REPORT_PUBLISHED: "#059669",
    SYSTEM: "#0891b2",
  };

  const TypeIcon = ({ type, size = 16 }: { type: string; size?: number }) => {
    const color = typeIconColor[type] ?? "#64748b";
    const s = size;
    if (type === "EVENT_CREATED")
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="14" x2="12" y2="18" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
      );
    if (type === "EVENT_CANCELED")
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    if (type === "EVENT_UPDATED")
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    if (type === "FEEDBACK_REMINDER")
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    if (type === "REPORT_PUBLISHED")
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    if (type === "SYSTEM")
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative flex items-center justify-center p-1.5 rounded-lg transition"
        style={{ color: "#94a3b8" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#2563eb";
          e.currentTarget.style.background = "#eff6ff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#94a3b8";
          e.currentTarget.style.background = "transparent";
        }}
        title="Сповіщення"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown via portal - renders outside sidebar to avoid overflow:hidden clipping */}
      {open &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9999,
              transform: "translateY(-100%)", // відкривається вгору
            }}
            ref={dropdownRef}
            className="w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            {" "}
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-800">
                Сповіщення
                {unreadCount > 0 && (
                  <span className="ml-2 bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount} нових
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-blue-500 hover:text-blue-700 transition"
                >
                  Прочитати всі
                </button>
              )}
            </div>
            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  Немає сповіщень
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setSelected(n)}
                    className={`flex gap-3 px-4 py-3 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition ${
                      n.isRead ? "bg-white" : "bg-blue-50/40"
                    }`}
                  >
                    <span
                      className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: `${typeIconColor[n.type] ?? "#64748b"}15`,
                      }}
                    >
                      <TypeIcon type={n.type} size={14} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs mb-0.5 text-slate-800 ${n.isRead ? "font-normal" : "font-medium"}`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed mb-1">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* Selected notification modal */}
      {selected &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 10000, background: "rgba(15,23,42,0.5)" }}
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 w-full"
              style={{ maxWidth: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <span
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `${typeIconColor[selected.type] ?? "#64748b"}15`,
                  }}
                >
                  <TypeIcon type={selected.type} size={20} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    {selected.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-slate-600 transition flex-shrink-0"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {selected.message}
              </p>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
