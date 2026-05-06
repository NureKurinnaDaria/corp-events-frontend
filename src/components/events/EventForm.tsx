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

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white";
  const labelClass = "block text-xs font-medium text-slate-600 mb-1.5";
  const sectionLabel =
    "text-xs font-medium text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 block";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {/* Основна інформація */}
      <span className={sectionLabel}>Основна інформація</span>

      <div className="mb-4">
        <label className={labelClass}>
          Назва події <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Frontend Workshop 2026"
          className={inputClass}
        />
      </div>

      <div className="mb-4">
        <label className={labelClass}>Опис</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Короткий опис події..."
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div>
          <label className={labelClass}>
            Дата початку <span className="text-red-400">*</span>
          </label>
          <input
            type="datetime-local"
            name="startAt"
            value={form.startAt}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Дата завершення <span className="text-red-400">*</span>
          </label>
          <input
            type="datetime-local"
            name="endAt"
            value={form.endAt}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      {/* Формат та місце */}
      <span className={sectionLabel}>Формат та місце</span>

      <div className="mb-4">
        <label className={labelClass}>
          Формат <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setForm((p) => ({ ...p, format: "ONLINE" }));
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg border transition ${
              form.format === "ONLINE"
                ? "bg-blue-50 border-blue-300 text-blue-700 font-medium"
                : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
            }`}
          >
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
            Онлайн
          </button>
          <button
            type="button"
            onClick={() => {
              setForm((p) => ({ ...p, format: "OFFLINE" }));
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg border transition ${
              form.format === "OFFLINE"
                ? "bg-blue-50 border-blue-300 text-blue-700 font-medium"
                : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
            }`}
          >
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
            Офлайн
          </button>
        </div>
      </div>

      {form.format === "ONLINE" && (
        <div className="mb-6">
          <label className={labelClass}>
            Посилання <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            name="onlineUrl"
            value={form.onlineUrl}
            onChange={handleChange}
            placeholder="https://meet.google.com/..."
            className={inputClass}
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Zoom, Google Meet, Teams або інший сервіс
          </p>
        </div>
      )}

      {form.format === "OFFLINE" && (
        <div className="mb-6">
          <label className={labelClass}>
            Місце проведення <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Конференц-зал A, вул. Хрещатик 1"
            className={inputClass}
          />
        </div>
      )}

      {/* Додаткові параметри */}
      <span className={sectionLabel}>Додаткові параметри</span>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div>
          <label className={labelClass}>Категорія</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className={inputClass}
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
          <label className={labelClass}>Максимум учасників</label>
          <input
            type="number"
            name="maxParticipants"
            value={form.maxParticipants}
            onChange={handleChange}
            placeholder="Необмежено"
            min={1}
            className={inputClass}
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Залиште порожнім для необмеженої кількості
          </p>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50"
        >
          {isLoading ? "Збереження..." : submitLabel}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-xl transition"
        >
          Скасувати
        </button>
      </div>
    </div>
  );
}
