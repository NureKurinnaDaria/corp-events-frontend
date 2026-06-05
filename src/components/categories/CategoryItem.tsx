import { getCategoryColor } from "../../utils/categoryColor";
import type { Category } from "../../types";

interface CategoryItemProps {
  category: Category;
  index: number;
  isEditing: boolean;
  editingName: string;
  editingError: string;
  isSaving: boolean;
  onEditStart: (category: Category) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditNameChange: (name: string) => void;
  onDeleteClick: (id: string) => void;
}

export default function CategoryItem({
  category,
  index,
  isEditing,
  editingName,
  editingError,
  isSaving,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditNameChange,
  onDeleteClick,
}: CategoryItemProps) {
  const color = getCategoryColor(String(index));

  return (
    <li
      className="acp-list-item"
      style={{
        borderTop: index > 0 ? "1px solid rgba(59,130,246,.06)" : "none",
      }}
    >
      {isEditing ? (
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={editingName}
              autoFocus
              onChange={(e) => onEditNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditSave();
                if (e.key === "Escape") onEditCancel();
              }}
              className="acp-input"
              style={{ flex: 1 }}
            />
            <button
              onClick={onEditSave}
              disabled={isSaving}
              className="acp-btn acp-btn-save"
            >
              {isSaving ? "..." : "Зберегти"}
            </button>
            <button onClick={onEditCancel} className="acp-btn acp-btn-cancel">
              Скасувати
            </button>
          </div>
          {editingError && (
            <p style={{ fontSize: 12, color: "#e11d48", marginTop: 6 }}>
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
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button
              onClick={() => onEditStart(category)}
              className="acp-btn acp-btn-blue"
            >
              Редагувати
            </button>
            <button
              onClick={() => onDeleteClick(category.id)}
              className="acp-btn acp-btn-danger"
            >
              Видалити
            </button>
          </div>
        </>
      )}
    </li>
  );
}
