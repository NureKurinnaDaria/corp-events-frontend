import { useState } from "react";
import { reportsApi } from "../../api/reports";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import type { Report } from "../../api/reports";

interface EventReportProps {
  eventId: string;
  report: Report | null;
  isAdmin: boolean;
  onReportChange: (report: Report | null) => void;
}

export default function EventReport({
  eventId,
  report,
  isAdmin,
  onReportChange,
}: EventReportProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(report?.text ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!text.trim()) return setError("Текст звіту обов'язковий");
    setIsLoading(true);
    setError("");
    try {
      const created = await reportsApi.create(eventId, text.trim());
      onReportChange(created);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Помилка створення звіту"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!report) return;
    if (!text.trim()) return setError("Текст звіту обов'язковий");
    setIsLoading(true);
    setError("");
    try {
      const updated = await reportsApi.update(report.id, text.trim());
      onReportChange(updated);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Помилка оновлення звіту"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!report) return;
    setIsLoading(true);
    try {
      await reportsApi.delete(report.id);
      onReportChange(null);
      setText("");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Помилка видалення звіту"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setText(report?.text ?? "");
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setText(report?.text ?? "");
    setIsEditing(false);
    setError("");
  };

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none";

  // Перегляд звіту (для всіх)
  if (report && !isEditing) {
    return (
      <div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg px-4 py-3">
          {report.text}
        </p>
        {isAdmin && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-xs text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
            >
              Редагувати
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 text-xs text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl transition disabled:opacity-50"
            >
              Видалити
            </button>
          </div>
        )}
      </div>
    );
  }

  // Форма створення/редагування (тільки для адміна)
  if (isAdmin && (isEditing || !report)) {
    return (
      <div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-3">
            {error}
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError("");
          }}
          placeholder="Опишіть як пройшов захід, основні підсумки та враження учасників..."
          rows={5}
          className={inputClass}
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={report ? handleUpdate : handleCreate}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50"
          >
            {isLoading
              ? "Збереження..."
              : report
                ? "Зберегти зміни"
                : "Опублікувати звіт"}
          </button>
          {isEditing && (
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 text-sm text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-xl transition"
            >
              Скасувати
            </button>
          )}
        </div>
      </div>
    );
  }

  // Співробітник — звіту ще немає
  return (
    <p className="text-sm text-slate-400">
      Адміністратор ще не опублікував звіт про цю подію
    </p>
  );
}
