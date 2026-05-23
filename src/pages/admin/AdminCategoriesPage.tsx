import { useState, useEffect } from "react";
import { categoriesApi } from "../../api/categories";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { getCategoryColor } from "../../utils/categoryColor";
import ConfirmModal from "../../components/common/ConfirmModal";
import LoadingState from "../../components/common/LoadingState";
import type { Category } from "../../types";

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(59,130,246,0.10)",
  boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
  borderRadius: "16px",
  overflow: "hidden",
};

const inp: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  fontFamily: "inherit",
};
const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "#2563eb";
  e.target.style.background = "#fafcff";
};
const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "#e2e8f0";
  e.target.style.background = "#f8fafc";
};

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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-slate-900 mb-1"
          style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.4px" }}
        >
          Категорії
        </h1>
        <p className="text-sm text-slate-400">Управління категоріями подій</p>
      </div>

      {/* Create form */}
      <div style={{ ...glassCard, marginBottom: "16px" }}>
        <div
          style={{
            height: "4px",
            background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
          }}
        />
        <div className="p-5">
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
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
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
              style={inp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 whitespace-nowrap"
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
              {isCreating ? "Додавання..." : "Додати"}
            </button>
          </div>
          {createError && (
            <p className="text-xs text-red-500 mt-2">{createError}</p>
          )}
        </div>
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
            className="w-full pl-9 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
            style={inp}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        <button
          onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition"
          style={{
            color: "#64748b",
            background: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(59,130,246,0.10)",
            backdropFilter: "blur(12px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#2563eb";
            e.currentTarget.style.background = "#eff6ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#64748b";
            e.currentTarget.style.background = "rgba(255,255,255,0.75)";
          }}
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
      <div style={glassCard}>
        {isLoading ? (
          <LoadingState />
        ) : categories.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">
            {search ? "Нічого не знайдено" : "Категорій ще немає"}
          </div>
        ) : (
          <ul>
            {categories.map((category, i) => {
              const color = getCategoryColor(
                String(categories.indexOf(category)),
              );
              const isEditing = editingId === category.id;

              return (
                <li
                  key={category.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                  style={{
                    borderTop:
                      i > 0 ? "1px solid rgba(59,130,246,0.06)" : "none",
                  }}
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
                          className="flex-1 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none transition"
                          style={inp}
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                        <button
                          onClick={handleEditSave}
                          disabled={isSaving}
                          className="px-3.5 py-2 text-xs font-semibold text-white rounded-xl transition disabled:opacity-50"
                          style={{
                            background:
                              "linear-gradient(135deg, #2563eb, #1d4ed8)",
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
                          {isSaving ? "..." : "Зберегти"}
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="px-3.5 py-2 text-xs font-medium rounded-xl transition"
                          style={{
                            color: "#64748b",
                            background: "rgba(248,250,252,0.9)",
                            border: "1px solid #e2e8f0",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f1f5f9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgba(248,250,252,0.9)";
                          }}
                        >
                          Скасувати
                        </button>
                      </div>
                      {editingError && (
                        <p className="text-xs text-red-500 mt-1.5">
                          {editingError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
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
                          className="px-3 py-1.5 text-xs font-medium rounded-xl transition"
                          style={{
                            color: "#1d4ed8",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#dbeafe";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#eff6ff";
                          }}
                        >
                          Редагувати
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(category.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-xl transition"
                          style={{
                            color: "#e11d48",
                            background: "#fff1f2",
                            border: "1px solid #fecdd3",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#ffe4e6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff1f2";
                          }}
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
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mt-3 flex items-center justify-between">
          {deleteError}
          <button
            onClick={() => setDeleteError("")}
            className="text-red-400 hover:text-red-600 transition ml-3"
          >
            ✕
          </button>
        </div>
      )}

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
