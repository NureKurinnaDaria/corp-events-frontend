import { useState, useEffect, useRef } from "react";
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

  const load = () => {
    notificationsApi.getAll().then(setNotifications).catch(console.error);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
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
    await notificationsApi.markAllAsRead();
    load();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeIcon: Record<string, string> = {
    EVENT_CREATED: "🎉",
    EVENT_CANCELED: "❌",
    EVENT_UPDATED: "✏️",
    FEEDBACK_REMINDER: "📝",
    REPORT_PUBLISHED: "📋",
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
                    className={`flex gap-3 px-4 py-3 border-b border-slate-50 last:border-0 ${
                      n.isRead ? "bg-white" : "bg-blue-50/40"
                    }`}
                  >
                    <span className="text-base mt-0.5 flex-shrink-0">
                      {typeIcon[n.type] ?? "🔔"}
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
    </div>
  );
}
