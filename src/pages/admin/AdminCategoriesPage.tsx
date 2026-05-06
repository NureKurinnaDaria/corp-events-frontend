import { useState, useEffect } from "react";
import { categoriesApi } from "../../api/categories";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { getCategoryColor } from "../../utils/categoryColor";
import ConfirmModal from "../../components/common/ConfirmModal";
import LoadingState from "../../components/common/LoadingState";
import type { Category } from "../../types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingError, setEditingError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = (s = search, order = sortOrder) => {
    categoriesApi
      .getAll({ search: s || undefined, sortOrder: order })
      .then(setCategories)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortOrder]);

  const handleCreate = async () => {
    if (!newName.trim()) return setCreateError("Назва обов'язкова");
    setIsCreating(true);
    setCreateError("");
    try {
      const created = await categoriesApi.create(newName.trim());
      setCategories((prev) => [...prev, created]);
      setNewName("");
    } catch (err: unknown) {
      setCreateError(getApiErrorMessage(err, "Помилка створення"));
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditStart = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingError("");
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    if (!editingName.trim()) return setEditingError("Назва обов'язкова");
    setIsSaving(true);
    setEditingError("");
    try {
      const updated = await categoriesApi.update(editingId, editingName.trim());
      setCategories((prev) =>
        prev.map((c) => (c.id === editingId ? updated : c)),
      );
      setEditingId(null);
    } catch (err: unknown) {
      setEditingError(getApiErrorMessage(err, "Помилка оновлення"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
    setEditingError("");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await categoriesApi.delete(deleteTargetId);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err: unknown) {
      setDeleteTargetId(null);
      setDeleteError(getApiErrorMessage(err, "Помилка видалення"));
    } finally {
      setIsDeleting(false);
    }
  };

  const inputClass =
    "border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Категорії</h1>
        <p className="text-sm text-slate-500 mt-1">
          Управління категоріями подій
        </p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
        <p className="text-sm font-medium text-slate-700 mb-3">
          Нова категорія
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setCreateError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Назва категорії"
            className={`flex-1 ${inputClass}`}
          />
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
          >
            {isCreating ? "Додавання..." : "Додати"}
          </button>
        </div>
        {createError && (
          <p className="text-xs text-rose-500 mt-2">{createError}</p>
        )}
      </div>

      {/* Search + sort */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук категорій..."
            className={`w-full pl-9 ${inputClass}`}
          />
        </div>
        <button
          onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 20V4" />
          </svg>
          {sortOrder === "asc" ? "А → Я" : "Я → А"}
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState />
        ) : categories.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">
            {search ? "Нічого не знайдено" : "Категорій ще немає"}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((category) => {
              const color = getCategoryColor(
                String(categories.indexOf(category)),
              );
              const isEditing = editingId === category.id;

              return (
                <li
                  key={category.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  {isEditing ? (
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => {
                            setEditingName(e.target.value);
                            setEditingError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave();
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          autoFocus
                          className={`flex-1 ${inputClass}`}
                        />
                        <button
                          onClick={handleEditSave}
                          disabled={isSaving}
                          className="px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                        >
                          {isSaving ? "..." : "Зберегти"}
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="px-3.5 py-2 text-xs text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-lg transition"
                        >
                          Скасувати
                        </button>
                      </div>
                      {editingError && (
                        <p className="text-xs text-rose-500 mt-1.5">
                          {editingError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: color.bg,
                          color: color.text,
                          border: `1px solid ${color.border}`,
                        }}
                      >
                        {category.name}
                      </span>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => handleEditStart(category)}
                          className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition"
                        >
                          Редагувати
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(category.id)}
                          className="px-3 py-1.5 text-xs text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                        >
                          Видалити
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Count */}
      {!isLoading && categories.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 text-right">
          {categories.length} категорі
          {categories.length === 1 ? "я" : categories.length < 5 ? "ї" : "й"}
        </p>
      )}

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mt-3">
          {deleteError}
          <button
            onClick={() => setDeleteError("")}
            className="ml-3 text-red-400 hover:text-red-600 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Confirm delete */}
      {deleteTargetId && (
        <ConfirmModal
          title="Видалити категорію?"
          message="Категорія буде видалена назавжди. Це можливо лише якщо жодна подія не використовує цю категорію."
          confirmLabel={isDeleting ? "Видалення..." : "Видалити"}
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
