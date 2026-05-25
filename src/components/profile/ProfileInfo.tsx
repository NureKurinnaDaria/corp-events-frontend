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

  const handleAvatarClick = () => fileInputRef.current?.click();

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

  return (
    <>
      <style>{`
        @keyframes pi-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Avatar card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #e8edf5",
            boxShadow: "0 2px 12px rgba(15,23,42,.05)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "3px",
              background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
            }}
          />
          <div style={{ padding: "24px 20px", textAlign: "center" }}>
            {/* Avatar */}
            <div
              style={{
                position: "relative",
                width: 80,
                height: 80,
                margin: "0 auto 14px",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: avatarSrc
                    ? "transparent"
                    : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 800,
                  boxShadow: "0 6px 20px rgba(37,99,235,.25)",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "box-shadow .2s",
                  position: "relative",
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

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "rgba(15,23,42,.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: hover || isUploading ? 1 : 0,
                    transition: "opacity .18s",
                    cursor: "pointer",
                  }}
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
                      style={{ animation: "pi-spin .9s linear infinite" }}
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

              {!isUploading && (
                <div
                  onClick={handleAvatarClick}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(37,99,235,.4)",
                    transition: "transform .15s",
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {uploadError && (
              <p style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>
                {uploadError}
              </p>
            )}

            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-.2px",
                marginBottom: 8,
              }}
            >
              {user.fullName || "Без імені"}
            </p>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
              Натисніть на фото щоб змінити
            </p>
          </div>
        </div>

        {/* Contacts card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #e8edf5",
            boxShadow: "0 2px 12px rgba(15,23,42,.05)",
            padding: "20px",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".08em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Контактна інформація
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Email", value: user.email },
              { label: "Телефон", value: user.phone || "Не вказано" },
              ...(user.role !== "ADMIN"
                ? [{ label: "Посада", value: user.position || "Не вказано" }]
                : []),
              { label: "В системі з", value: createdAt },
            ].map((item, i) => (
              <div
                key={item.label}
                style={{
                  padding: "10px 0",
                  borderTop: i === 0 ? "none" : "1px solid #f1f5f9",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    fontWeight: 600,
                    marginBottom: 2,
                    letterSpacing: ".02em",
                  }}
                >
                  {item.label}
                </p>
                <p style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
