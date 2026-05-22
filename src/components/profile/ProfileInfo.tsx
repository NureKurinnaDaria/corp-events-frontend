import { useRef, useState } from "react";
import { usersApi } from "../../api/users";
import type { User } from "../../types";

const BASE_URL = "";

function getAvatarSrc(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return `${BASE_URL}${avatarUrl}`;
}

export default function ProfileInfo({
  user,
  onAvatarUpdate,
}: {
  user: User;
  onAvatarUpdate?: (updated: User) => void;
}) {
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const createdAt = new Date(user.createdAt).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hover, setHover] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const avatarSrc = getAvatarSrc(user.avatarUrl);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setIsUploading(true);
    try {
      const url = await usersApi.uploadAvatar(file);
      const updated = await usersApi.updateProfile({ avatarUrl: url });
      onAvatarUpdate?.(updated);
    } catch {
      setUploadError("Не вдалося завантажити фото");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(59,130,246,0.10)",
    boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
    borderRadius: "16px",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: "10px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Avatar card */}
      <div style={{ ...cardStyle, overflow: "hidden" }}>
        <div
          style={{
            height: "4px",
            background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
          }}
        />
        <div className="p-5 text-center">
          {/* Clickable avatar */}
          <div
            className="relative mx-auto mb-3"
            style={{ width: "72px", height: "72px" }}
          >
            {/* Avatar circle */}
            <div
              className="flex items-center justify-center text-white w-full h-full"
              style={{
                borderRadius: "50%",
                background: avatarSrc
                  ? "transparent"
                  : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                fontSize: "22px",
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
                overflow: "hidden",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
              onClick={handleAvatarClick}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                initials
              )}

              {/* Hover overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(15,23,42,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: hover || isUploading ? 1 : 0,
                  transition: "opacity 0.18s",
                  cursor: "pointer",
                }}
                onClick={handleAvatarClick}
              >
                {isUploading ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{
                      animation: "spin 0.9s linear infinite",
                    }}
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </div>
            </div>

            {/* Small camera badge */}
            {!isUploading && (
              <div
                onClick={handleAvatarClick}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.4)",
                  transition: "transform 0.15s",
                  transform: hover ? "scale(1.12)" : "scale(1)",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {uploadError && (
            <p className="text-xs mb-2" style={{ color: "#e11d48" }}>
              {uploadError}
            </p>
          )}

          <p
            className="text-slate-900 font-semibold text-sm mb-2"
            style={{ letterSpacing: "-0.1px" }}
          >
            {user.fullName || "Без імені"}
          </p>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: "#eff6ff", color: "#1d4ed8" }}
          >
            {user.role === "ADMIN" ? "Адміністратор" : "Співробітник"}
          </span>

          <p className="text-xs mt-3" style={{ color: "#94a3b8" }}>
            Натисніть на фото щоб змінити
          </p>
        </div>
      </div>

      {/* Contacts card */}
      <div style={{ ...cardStyle, padding: "20px" }}>
        <p style={sectionLabel}>Контактна інформація</p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Email</p>
            <p className="text-sm text-slate-700 font-medium">{user.email}</p>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(59,130,246,0.07)",
              paddingTop: "10px",
            }}
          >
            <p className="text-xs text-slate-400 mb-0.5">Телефон</p>
            <p className="text-sm text-slate-700 font-medium">
              {user.phone || "Не вказано"}
            </p>
          </div>
          {user.role !== "ADMIN" && (
            <div
              style={{
                borderTop: "1px solid rgba(59,130,246,0.07)",
                paddingTop: "10px",
              }}
            >
              <p className="text-xs text-slate-400 mb-0.5">Посада</p>
              <p className="text-sm text-slate-700 font-medium">
                {user.position || "Не вказано"}
              </p>
            </div>
          )}
          <div
            style={{
              borderTop: "1px solid rgba(59,130,246,0.07)",
              paddingTop: "10px",
            }}
          >
            <p className="text-xs text-slate-400 mb-0.5">В системі з</p>
            <p className="text-sm text-slate-700 font-medium">{createdAt}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
