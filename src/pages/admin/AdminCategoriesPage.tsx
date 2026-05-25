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
  const [mounted, setMounted] = useState(false);

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
    setTimeout(() => setMounted(true), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .acp-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }

        @keyframes acp-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .acp-fade-up { opacity: 0; animation: acp-fadeUp .4s ease forwards; }
        .acp-d1 { animation-delay: .05s; } .acp-d2 { animation-delay: .10s; } .acp-d3 { animation-delay: .16s; }

        .acp-header {
          position: relative; background: #fff; border-radius: 20px;
          padding: 28px 32px; margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 4px 24px rgba(15,23,42,.07);
          overflow: hidden; display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .acp-header::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 80% at 95% 50%, rgba(37,99,235,.1) 0%, transparent 60%),
            radial-gradient(ellipse 30% 60% at 5% 60%, rgba(124,58,237,.06) 0%, transparent 55%);
          pointer-events: none;
        }
        .acp-header-text { position: relative; z-index: 1; }
        .acp-title { font-size: 24px; font-weight: 800; letter-spacing: -.5px; color: #0f172a; margin: 0 0 4px; }
        .acp-subtitle { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; }
        .acp-count-badge {
          position: relative; z-index: 1;
          background: #eff6ff; border: 1px solid #bfdbfe;
          color: #1d4ed8; font-size: 13px; font-weight: 700;
          padding: 8px 18px; border-radius: 100px; white-space: nowrap;
        }

        .acp-card {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 2px 12px rgba(15,23,42,.05);
          overflow: hidden; margin-bottom: 12px;
        }
        .acp-card-accent { height: 4px; background: linear-gradient(90deg, #2563eb, #6366f1); }

        .acp-create-body { padding: 20px; }
        .acp-create-label { font-size: 11px; font-weight: 700; letter-spacing: .06em; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; }
        .acp-create-row { display: flex; gap: 8px; }
        .acp-input {
          flex: 1; background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 10px; padding: 9px 14px;
          font-size: 13px; font-weight: 500; color: #1e293b;
          outline: none; transition: all .15s;
          font-family: 'Manrope', sans-serif;
        }
        .acp-input:focus { border-color: #93c5fd; background: #fff; }
        .acp-input::placeholder { color: #94a3b8; }
        .acp-btn-primary {
          padding: 9px 20px; font-size: 13px; font-weight: 700;
          color: #fff; background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: none; border-radius: 10px; cursor: pointer;
          box-shadow: 0 4px 12px rgba(37,99,235,.3);
          transition: transform .15s, box-shadow .15s;
          font-family: 'Manrope', sans-serif; white-space: nowrap;
        }
        .acp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37,99,235,.4); }
        .acp-btn-primary:disabled { opacity: .5; transform: none; }

        .acp-toolbar {
          background: #fff; border-radius: 16px;
          border: 1px solid #e8edf5;
          box-shadow: 0 2px 12px rgba(15,23,42,.05);
          padding: 14px 20px; margin-bottom: 12px;
          display: flex; align-items: center; gap: 10px;
        }
        .acp-search {
          flex: 1; display: flex; align-items: center; gap: 8px;
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 10px; padding: 8px 12px; transition: border-color .15s;
        }
        .acp-search:focus-within { border-color: #93c5fd; background: #fff; }
        .acp-search input {
          flex: 1; border: none; background: none; outline: none;
          font-size: 13px; color: #1e293b; font-weight: 500;
          font-family: 'Manrope', sans-serif;
        }
        .acp-search input::placeholder { color: #94a3b8; }
        .acp-sort-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; font-size: 13px; font-weight: 600;
          color: #64748b; background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 10px; cursor: pointer; transition: all .15s;
          font-family: 'Manrope', sans-serif; white-space: nowrap;
        }
        .acp-sort-btn:hover { color: #2563eb; background: #eff6ff; border-color: #bfdbfe; }

        .acp-list-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.06); box-shadow: 0 2px 12px rgba(15,23,42,.05); overflow: hidden; }
        .acp-list-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px; transition: background .15s;
        }
        .acp-list-item:hover { background: #f8fafc; }

        .acp-btn { padding: 6px 14px; font-size: 12px; font-weight: 600; border-radius: 10px; cursor: pointer; border: 1px solid; transition: all .15s; font-family: 'Manrope', sans-serif; }
        .acp-btn-blue { color: #1d4ed8; background: #eff6ff; border-color: #bfdbfe; }
        .acp-btn-blue:hover { background: #dbeafe; }
        .acp-btn-danger { color: #e11d48; background: #fff1f2; border-color: #fecdd3; }
        .acp-btn-danger:hover { background: #ffe4e6; }
        .acp-btn-save { color: #fff; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-color: transparent; }
        .acp-btn-save:disabled { opacity: .5; }
        .acp-btn-cancel { color: #64748b; background: #f8fafc; border-color: #e2e8f0; }
        .acp-btn-cancel:hover { background: #f1f5f9; }
      `}</style>

      <div className="acp-wrap">
        {/* Header */}
        <div className={`acp-header${mounted ? " acp-fade-up" : ""}`}>
          <div className="acp-header-text">
            <h1 className="acp-title">Категорії</h1>
            <p className="acp-subtitle">Управління категоріями подій</p>
          </div>
          {!isLoading && (
            <span className="acp-count-badge">
              {categories.length}{" "}
              {categories.length === 1
                ? "категорія"
                : categories.length < 5
                  ? "категорії"
                  : "категорій"}
            </span>
          )}
        </div>

        {/* Create form */}
        <div className={`acp-card${mounted ? " acp-fade-up acp-d1" : ""}`}>
          <div className="acp-card-accent" />
          <div className="acp-create-body">
            <p className="acp-create-label">Нова категорія</p>
            <div className="acp-create-row">
              <input
                type="text"
                value={newName}
                placeholder="Назва категорії"
                onChange={(e) => {
                  setNewName(e.target.value);
                  setCreateError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="acp-input"
              />
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="acp-btn-primary"
              >
                {isCreating ? "Додавання..." : "Додати"}
              </button>
            </div>
            {createError && (
              <p style={{ fontSize: 12, color: "#e11d48", marginTop: 8 }}>
                {createError}
              </p>
            )}
          </div>
        </div>

        {/* Search & sort */}
        <div className={`acp-toolbar${mounted ? " acp-fade-up acp-d2" : ""}`}>
          <div className="acp-search">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук категорій..."
            />
          </div>
          <button
            className="acp-sort-btn"
            onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 20V4" />
            </svg>
            {sortOrder === "asc" ? "А → Я" : "Я → А"}
          </button>
        </div>

        {/* List */}
        <div className={`acp-list-card${mounted ? " acp-fade-up acp-d3" : ""}`}>
          {isLoading ? (
            <LoadingState />
          ) : categories.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              {search ? "Нічого не знайдено" : "Категорій ще немає"}
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {categories.map((category, i) => {
                const color = getCategoryColor(
                  String(categories.indexOf(category)),
                );
                const isEditing = editingId === category.id;
                return (
                  <li
                    key={category.id}
                    className="acp-list-item"
                    style={{
                      borderTop:
                        i > 0 ? "1px solid rgba(59,130,246,.06)" : "none",
                    }}
                  >
                    {isEditing ? (
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="text"
                            value={editingName}
                            autoFocus
                            onChange={(e) => {
                              setEditingName(e.target.value);
                              setEditingError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditSave();
                              if (e.key === "Escape") handleEditCancel();
                            }}
                            className="acp-input"
                            style={{ flex: 1 }}
                          />
                          <button
                            onClick={handleEditSave}
                            disabled={isSaving}
                            className="acp-btn acp-btn-save"
                          >
                            {isSaving ? "..." : "Зберегти"}
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="acp-btn acp-btn-cancel"
                          >
                            Скасувати
                          </button>
                        </div>
                        {editingError && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#e11d48",
                              marginTop: 6,
                            }}
                          >
                            {editingError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "5px 12px",
                            borderRadius: 100,
                            background: color.bg,
                            color: color.text,
                            border: `1px solid ${color.border}`,
                          }}
                        >
                          {category.name}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginLeft: "auto",
                          }}
                        >
                          <button
                            onClick={() => handleEditStart(category)}
                            className="acp-btn acp-btn-blue"
                          >
                            Редагувати
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(category.id)}
                            className="acp-btn acp-btn-danger"
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

        {deleteError && (
          <div
            style={{
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#e11d48",
              fontSize: 13,
              borderRadius: 12,
              padding: "12px 16px",
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {deleteError}
            <button
              onClick={() => setDeleteError("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#e11d48",
                padding: 0,
              }}
            >
              <svg
                width="14"
                height="14"
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
        )}
      </div>

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
    </>
  );
}
