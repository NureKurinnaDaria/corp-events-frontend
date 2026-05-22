import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesApi } from "../../api/categories";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import type { Category, Event } from "../../types";
import type { EventPayload } from "../../api/events";

interface EventFormProps {
  initialData?: Event;
  onSubmit: (payload: EventPayload) => Promise<void>;
  submitLabel: string;
}

function toLocalDateTimeValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inp: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  fontFamily: "inherit",
};
const onFocus = (
  e: React.FocusEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => {
  (e.target as HTMLElement).style.borderColor = "#2563eb";
  (e.target as HTMLElement).style.background = "#fafcff";
};
const onBlur = (
  e: React.FocusEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => {
  (e.target as HTMLElement).style.borderColor = "#e2e8f0";
  (e.target as HTMLElement).style.background = "#f8fafc";
};

export default function EventForm({
  initialData,
  onSubmit,
  submitLabel,
}: EventFormProps) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    startAt: initialData?.startAt
      ? toLocalDateTimeValue(initialData.startAt)
      : "",
    endAt: initialData?.endAt ? toLocalDateTimeValue(initialData.endAt) : "",
    format: initialData?.format ?? "ONLINE",
    location: initialData?.location ?? "",
    onlineUrl: initialData?.onlineUrl ?? "",
    maxParticipants: initialData?.maxParticipants
      ? String(initialData.maxParticipants)
      : "",
    categoryId: initialData?.categoryId ?? "",
  });

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim()) return setError("Назва події обов'язкова");
    if (!form.startAt) return setError("Дата початку обов'язкова");
    if (!form.endAt) return setError("Дата завершення обов'язкова");
    if (new Date(form.endAt) <= new Date(form.startAt))
      return setError("Дата завершення має бути пізніше дати початку");
    if (form.format === "ONLINE" && !form.onlineUrl.trim())
      return setError("Посилання обов'язкове для онлайн події");
    if (form.format === "OFFLINE" && !form.location.trim())
      return setError("Місце проведення обов'язкове для офлайн події");

    const payload: EventPayload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      format: form.format as "ONLINE" | "OFFLINE",
      location: form.format === "OFFLINE" ? form.location.trim() : undefined,
      onlineUrl: form.format === "ONLINE" ? form.onlineUrl.trim() : undefined,
      maxParticipants: form.maxParticipants
        ? Number(form.maxParticipants)
        : undefined,
      categoryId: form.categoryId || undefined,
    };

    setIsLoading(true);
    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Помилка збереження"));
    } finally {
      setIsLoading(false);
    }
  };

  const lbl: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 500,
    color: "#64748b",
    marginBottom: "6px",
    display: "block",
  };
  const sectionLbl: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#94a3b8",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "1px solid rgba(59,130,246,0.07)",
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(59,130,246,0.10)",
        boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "4px",
          background: "linear-gradient(90deg, #2563eb, #6366f1)",
        }}
      />
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <span style={sectionLbl}>Основна інформація</span>

        <div className="mb-4">
          <label style={lbl}>
            Назва події <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Frontend Workshop 2026"
            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
            style={inp}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div className="mb-4">
          <label style={lbl}>Опис</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Короткий опис події..."
            rows={3}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition resize-none"
            style={inp}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Дата початку", name: "startAt" },
            { label: "Дата завершення", name: "endAt" },
          ].map((f) => (
            <div key={f.name}>
              <label style={lbl}>
                {f.label} <span style={{ color: "#f87171" }}>*</span>
              </label>
              <input
                type="datetime-local"
                name={f.name}
                value={form[f.name as keyof typeof form]}
                onChange={handleChange}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none transition"
                style={inp}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          ))}
        </div>

        <span style={sectionLbl}>Формат та місце</span>

        <div className="mb-4">
          <label style={lbl}>
            Формат <span style={{ color: "#f87171" }}>*</span>
          </label>
          <div className="flex gap-2">
            {[
              {
                val: "ONLINE",
                icon: (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                ),
                label: "Онлайн",
              },
              {
                val: "OFFLINE",
                icon: (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                ),
                label: "Офлайн",
              },
            ].map(({ val, icon, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setForm((p) => ({
                    ...p,
                    format: val as "ONLINE" | "OFFLINE",
                  }));
                  setError("");
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl transition font-medium"
                style={
                  form.format === val
                    ? {
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        color: "#1d4ed8",
                      }
                    : {
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#64748b",
                      }
                }
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {form.format === "ONLINE" && (
          <div className="mb-6">
            <label style={lbl}>
              Посилання <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              type="url"
              name="onlineUrl"
              value={form.onlineUrl}
              onChange={handleChange}
              placeholder="https://meet.google.com/..."
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
              style={inp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Zoom, Google Meet, Teams або інший сервіс
            </p>
          </div>
        )}

        {form.format === "OFFLINE" && (
          <div className="mb-6">
            <label style={lbl}>
              Місце проведення <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Конференц-зал A, вул. Хрещатик 1"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
              style={inp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        )}

        <span style={sectionLbl}>Додаткові параметри</span>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div>
            <label style={lbl}>Категорія</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none transition cursor-pointer"
              style={inp}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="">— Без категорії —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>Максимум учасників</label>
            <input
              type="number"
              name="maxParticipants"
              value={form.maxParticipants}
              onChange={handleChange}
              placeholder="Необмежено"
              min={1}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
              style={inp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Залиште порожнім для необмеженої кількості
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 pt-5"
          style={{ borderTop: "1px solid rgba(59,130,246,0.07)" }}
        >
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #1d4ed8, #1e40af)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #2563eb, #1d4ed8)";
            }}
          >
            {isLoading ? "Збереження..." : submitLabel}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-sm font-medium rounded-xl transition"
            style={{
              color: "#64748b",
              background: "rgba(248,250,252,0.9)",
              border: "1px solid #e2e8f0",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(248,250,252,0.9)";
            }}
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}
