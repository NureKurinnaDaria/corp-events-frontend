import { useState, useEffect } from "react";
import {
  usersApi,
  type AdminUser,
  type AdminUserDetails,
} from "../../api/users";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import LoadingState from "../../components/common/LoadingState";
import ConfirmModal from "../../components/common/ConfirmModal";

function Avatar({ name, url }: { name: string | null; url?: string | null }) {
  if (url)
    return (
      <img
        src={url}
        alt=""
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    );
  const initials = name
    ? name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#2563eb,#6366f1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: 13 }}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [actionError, setActionError] = useState("");

  const [selectedUser, setSelectedUser] = useState<AdminUserDetails | null>(
    null,
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [confirmBlock, setConfirmBlock] = useState<AdminUser | null>(null);
  const [isActing, setIsActing] = useState(false);

  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "blocked"
  >("all");

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const loadUsers = (s = search) => {
    setIsLoading(true);
    usersApi.admin
      .getAll(s || undefined)
      .then(setUsers)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const openDetails = async (userId: string) => {
    setIsDetailLoading(true);
    try {
      const data = await usersApi.admin.getDetails(userId);
      setSelectedUser(data);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Помилка завантаження деталей"));
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!confirmBlock) return;
    setIsActing(true);
    try {
      if (confirmBlock.isActive) {
        await usersApi.admin.block(confirmBlock.id);
      } else {
        await usersApi.admin.unblock(confirmBlock.id);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === confirmBlock.id ? { ...u, isActive: !u.isActive } : u,
        ),
      );
      if (selectedUser?.id === confirmBlock.id) {
        setSelectedUser((prev) =>
          prev ? { ...prev, isActive: !prev.isActive } : prev,
        );
      }
      setConfirmBlock(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Помилка операції"));
      setConfirmBlock(null);
    } finally {
      setIsActing(false);
    }
  };

  const filtered = users.filter((u) => {
    if (filterStatus === "active") return u.isActive;
    if (filterStatus === "blocked") return !u.isActive;
    return true;
  });

  const activeCount = users.filter((u) => u.isActive).length;
  const blockedCount = users.filter((u) => !u.isActive).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .aup-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }

        @keyframes aup-fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .aup-fade-up { opacity: 0; animation: aup-fadeUp .4s ease forwards; }
        .aup-d1 { animation-delay: .05s; } .aup-d2 { animation-delay: .10s; } .aup-d3 { animation-delay: .16s; }

        .aup-header {
          position: relative; background: #fff; border-radius: 20px;
          padding: 28px 32px; margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 4px 24px rgba(15,23,42,.07);
          overflow: hidden; display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .aup-header::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 80% at 95% 50%, rgba(37,99,235,.1) 0%, transparent 60%),
            radial-gradient(ellipse 30% 60% at 5% 60%, rgba(124,58,237,.06) 0%, transparent 55%);
          pointer-events: none;
        }
        .aup-header-text { position: relative; z-index: 1; }
        .aup-title { font-size: 24px; font-weight: 800; letter-spacing: -.5px; color: #0f172a; margin: 0 0 4px; }
        .aup-subtitle { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; }
        .aup-stats { position: relative; z-index: 1; display: flex; gap: 8px; }
        .aup-stat-badge { padding: 8px 18px; border-radius: 100px; font-size: 13px; font-weight: 700; white-space: nowrap; }
        .aup-stat-total { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
        .aup-stat-blocked { background: #fff1f2; border: 1px solid #fecdd3; color: #e11d48; }

        .aup-toolbar {
          background: #fff; border-radius: 16px; border: 1px solid #e8edf5;
          box-shadow: 0 2px 12px rgba(15,23,42,.05);
          padding: 14px 20px; margin-bottom: 12px;
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .aup-search {
          flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 10px; padding: 8px 12px; transition: border-color .15s;
        }
        .aup-search:focus-within { border-color: #93c5fd; background: #fff; }
        .aup-search input { flex: 1; border: none; background: none; outline: none; font-size: 13px; color: #1e293b; font-weight: 500; font-family: 'Manrope', sans-serif; }
        .aup-search input::placeholder { color: #94a3b8; }
        .aup-filter-group { display: flex; gap: 6px; }
        .aup-filter-btn { padding: 7px 14px; font-size: 12px; font-weight: 600; border-radius: 10px; cursor: pointer; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b; font-family: 'Manrope', sans-serif; transition: all .15s; }
        .aup-filter-btn.active { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
        .aup-filter-btn:hover:not(.active) { background: #f1f5f9; }

        .aup-table-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.06); box-shadow: 0 2px 12px rgba(15,23,42,.05); overflow: hidden; }
        .aup-row { display: flex; align-items: center; gap: 14px; padding: 13px 20px; transition: background .15s; cursor: pointer; }
        .aup-row:hover { background: #f8fafc; }
        .aup-row + .aup-row { border-top: 1px solid rgba(59,130,246,.06); }
        .aup-row-info { flex: 1; min-width: 0; }
        .aup-row-name { font-size: 14px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .aup-row-email { font-size: 12px; color: #64748b; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .aup-row-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .aup-position-tag { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 8px; background: #f1f5f9; color: #475569; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .aup-reg-count { font-size: 12px; font-weight: 600; color: #64748b; white-space: nowrap; }
        .aup-status-pill { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; white-space: nowrap; }
        .aup-status-active { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .aup-status-blocked { background: #fff1f2; border: 1px solid #fecdd3; color: #e11d48; }

        /* Modal overlay */
        .aup-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.45); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .aup-modal { background: #fff; border-radius: 20px; box-shadow: 0 24px 60px rgba(15,23,42,.18); width: 100%; max-width: 560px; max-height: 85vh; overflow-y: auto; animation: aup-fadeUp .25s ease; }
        .aup-modal-header { padding: 24px 24px 0; display: flex; align-items: flex-start; gap: 14px; }
        .aup-modal-title { flex: 1; }
        .aup-modal-name { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 3px; }
        .aup-modal-email { font-size: 13px; color: #64748b; font-weight: 500; }
        .aup-modal-close { width: 32px; height: 32px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .aup-modal-close:hover { background: #f1f5f9; }
        .aup-modal-body { padding: 20px 24px 24px; }
        .aup-modal-section { margin-bottom: 20px; }
        .aup-modal-section-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; }
        .aup-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .aup-info-cell { background: #f8fafc; border-radius: 10px; padding: 10px 14px; }
        .aup-info-label { font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 3px; }
        .aup-info-value { font-size: 13px; font-weight: 700; color: #0f172a; }
        .aup-event-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #f1f5f9; }
        .aup-event-item:last-child { border-bottom: none; }
        .aup-event-title { font-size: 13px; font-weight: 600; color: #0f172a; flex: 1; }
        .aup-event-date { font-size: 11px; color: #94a3b8; font-weight: 500; white-space: nowrap; }
        .aup-empty-list { font-size: 13px; color: #94a3b8; padding: 12px 0; }
        .aup-modal-footer { padding: 0 24px 24px; }
        .aup-btn-block { width: 100%; padding: 11px; font-size: 14px; font-weight: 700; border-radius: 12px; cursor: pointer; border: none; font-family: 'Manrope', sans-serif; transition: all .15s; }
        .aup-btn-block-do { background: linear-gradient(135deg,#e11d48,#be123c); color: #fff; box-shadow: 0 4px 12px rgba(225,29,72,.25); }
        .aup-btn-block-do:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(225,29,72,.35); }
        .aup-btn-unblock { background: linear-gradient(135deg,#16a34a,#15803d); color: #fff; box-shadow: 0 4px 12px rgba(22,163,74,.25); }
        .aup-btn-unblock:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(22,163,74,.35); }
      `}</style>

      <div className="aup-wrap">
        {/* Header */}
        <div className={`aup-header${mounted ? " aup-fade-up" : ""}`}>
          <div className="aup-header-text">
            <h1 className="aup-title">Користувачі</h1>
            <p className="aup-subtitle">Управління акаунтами співробітників</p>
          </div>
          {!isLoading && (
            <div className="aup-stats">
              <span className="aup-stat-badge aup-stat-total">
                {users.length} всього
              </span>
              {blockedCount > 0 && (
                <span className="aup-stat-badge aup-stat-blocked">
                  {blockedCount} заблоковано
                </span>
              )}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className={`aup-toolbar${mounted ? " aup-fade-up aup-d1" : ""}`}>
          <div className="aup-search">
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
              placeholder="Пошук за іменем або email..."
            />
          </div>
          <div className="aup-filter-group">
            {(["all", "active", "blocked"] as const).map((f) => (
              <button
                key={f}
                className={`aup-filter-btn${filterStatus === f ? " active" : ""}`}
                onClick={() => setFilterStatus(f)}
              >
                {f === "all"
                  ? "Всі"
                  : f === "active"
                    ? `Активні (${activeCount})`
                    : `Заблоковані (${blockedCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div
          className={`aup-table-card${mounted ? " aup-fade-up aup-d2" : ""}`}
        >
          {isLoading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              {search ? "Нікого не знайдено" : "Користувачів ще немає"}
            </div>
          ) : (
            filtered.map((user) => (
              <div
                key={user.id}
                className="aup-row"
                onClick={() => openDetails(user.id)}
              >
                <Avatar name={user.fullName} />
                <div className="aup-row-info">
                  <div className="aup-row-name">{user.fullName || "—"}</div>
                  <div className="aup-row-email">{user.email}</div>
                </div>
                <div className="aup-row-meta">
                  {user.position && (
                    <span className="aup-position-tag">{user.position}</span>
                  )}
                  <span className="aup-reg-count">
                    {user.registrationsCount} реєстр.
                  </span>
                  <span
                    className={`aup-status-pill ${user.isActive ? "aup-status-active" : "aup-status-blocked"}`}
                  >
                    {user.isActive ? "Активний" : "Заблокований"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {actionError && (
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
            {actionError}
            <button
              onClick={() => setActionError("")}
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

      {/* Detail modal */}
      {(isDetailLoading || selectedUser) && (
        <div
          className="aup-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUser(null);
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
                    <p className="aup-modal-name">
                      {selectedUser.fullName || "—"}
                    </p>
                    <p className="aup-modal-email">{selectedUser.email}</p>
                  </div>
                  <span
                    className={`aup-status-pill ${selectedUser.isActive ? "aup-status-active" : "aup-status-blocked"}`}
                    style={{ flexShrink: 0 }}
                  >
                    {selectedUser.isActive ? "Активний" : "Заблокований"}
                  </span>
                  <button
                    className="aup-modal-close"
                    onClick={() => setSelectedUser(null)}
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

                <div className="aup-modal-body">
                  {/* Info */}
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

                  {/* Recent registrations */}
                  <div className="aup-modal-section">
                    <p className="aup-modal-section-title">
                      Останні реєстрації
                    </p>
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
                          <span className="aup-event-title">
                            {r.event.title}
                          </span>
                          <span className="aup-event-date">
                            {new Date(r.event.startAt).toLocaleDateString(
                              "uk-UA",
                            )}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Feedbacks */}
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
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                margin: 0,
                              }}
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
                      if (u) setConfirmBlock(u);
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
      )}

      {/* Confirm block/unblock */}
      {confirmBlock && (
        <ConfirmModal
          title={
            confirmBlock.isActive
              ? "Заблокувати користувача?"
              : "Розблокувати користувача?"
          }
          message={
            confirmBlock.isActive
              ? `${confirmBlock.fullName || confirmBlock.email} більше не зможе увійти в систему.`
              : `${confirmBlock.fullName || confirmBlock.email} знову зможе увійти в систему.`
          }
          confirmLabel={
            isActing
              ? "..."
              : confirmBlock.isActive
                ? "Заблокувати"
                : "Розблокувати"
          }
          variant={confirmBlock.isActive ? "danger" : "warning"}
          onConfirm={handleToggleBlock}
          onCancel={() => setConfirmBlock(null)}
        />
      )}
    </>
  );
}
