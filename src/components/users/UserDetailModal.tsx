import LoadingState from "../common/LoadingState";
import Avatar from "./Avatar";
import StarRating from "./StarRating";
import type { AdminUser, AdminUserDetails } from "../../api/users";

interface UserDetailModalProps {
  selectedUser: AdminUserDetails | null;
  isDetailLoading: boolean;
  users: AdminUser[];
  onClose: () => void;
  onBlockClick: (user: AdminUser) => void;
}

export default function UserDetailModal({
  selectedUser,
  isDetailLoading,
  users,
  onClose,
  onBlockClick,
}: UserDetailModalProps) {
  return (
    <div
      className="aup-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="aup-modal">
        {isDetailLoading ? (
          <div style={{ padding: 40 }}>
            <LoadingState />
          </div>
        ) : selectedUser ? (
          <>
            <div className="aup-modal-header">
              <Avatar
                name={selectedUser.fullName}
                url={selectedUser.avatarUrl}
              />
              <div className="aup-modal-title">
                <p className="aup-modal-name">{selectedUser.fullName || "—"}</p>
                <p className="aup-modal-email">{selectedUser.email}</p>
              </div>
              <span
                className={`aup-status-pill ${selectedUser.isActive ? "aup-status-active" : "aup-status-blocked"}`}
                style={{ flexShrink: 0 }}
              >
                {selectedUser.isActive ? "Активний" : "Заблокований"}
              </span>
              <button className="aup-modal-close" onClick={onClose}>
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

            <div className="aup-modal-body">
              <div className="aup-modal-section">
                <p className="aup-modal-section-title">Інформація</p>
                <div className="aup-info-grid">
                  <div className="aup-info-cell">
                    <p className="aup-info-label">Посада</p>
                    <p className="aup-info-value">
                      {selectedUser.position || "—"}
                    </p>
                  </div>
                  <div className="aup-info-cell">
                    <p className="aup-info-label">Телефон</p>
                    <p className="aup-info-value">
                      {selectedUser.phone || "—"}
                    </p>
                  </div>
                  <div className="aup-info-cell">
                    <p className="aup-info-label">Реєстрацій на подіях</p>
                    <p className="aup-info-value">
                      {selectedUser.registrations.length}
                    </p>
                  </div>
                  <div className="aup-info-cell">
                    <p className="aup-info-label">Дата реєстрації</p>
                    <p className="aup-info-value">
                      {new Date(selectedUser.createdAt).toLocaleDateString(
                        "uk-UA",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="aup-modal-section">
                <p className="aup-modal-section-title">Останні реєстрації</p>
                {selectedUser.registrations.length === 0 ? (
                  <p className="aup-empty-list">Немає реєстрацій</p>
                ) : (
                  selectedUser.registrations.slice(0, 5).map((r) => (
                    <div key={r.id} className="aup-event-item">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="aup-event-title">{r.event.title}</span>
                      <span className="aup-event-date">
                        {new Date(r.event.startAt).toLocaleDateString("uk-UA")}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {selectedUser.feedbacks.length > 0 && (
                <div className="aup-modal-section">
                  <p className="aup-modal-section-title">Відгуки</p>
                  {selectedUser.feedbacks.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        padding: "9px 0",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 3,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {f.event.title}
                        </span>
                        <StarRating rating={f.rating} />
                      </div>
                      {f.comment && (
                        <p
                          style={{ fontSize: 12, color: "#64748b", margin: 0 }}
                        >
                          {f.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="aup-modal-footer">
              <button
                className={`aup-btn-block ${selectedUser.isActive ? "aup-btn-block-do" : "aup-btn-unblock"}`}
                onClick={() => {
                  const u = users.find((u) => u.id === selectedUser.id);
                  if (u) onBlockClick(u);
                }}
              >
                {selectedUser.isActive ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      justifyContent: "center",
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
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Заблокувати користувача
                  </span>
                ) : (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      justifyContent: "center",
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
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                    Розблокувати користувача
                  </span>
                )}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
