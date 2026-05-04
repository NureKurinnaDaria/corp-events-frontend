import type { User } from "../../types";

interface ProfileInfoProps {
  user: User;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        className="rounded-xl p-5 text-center"
        style={{ background: "#334155" }}
      >
        <div
          className="w-18 h-18 rounded-full flex items-center justify-center text-white font-medium text-xl mx-auto mb-3"
          style={{
            width: "72px",
            height: "72px",
            background: "#2563eb",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: 500,
            color: "white",
            margin: "0 auto 12px",
          }}
        >
          {initials}
        </div>
        <p className="text-white font-medium text-sm mb-1.5">
          {user.fullName || "Без імені"}
        </p>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {user.role === "ADMIN" ? "Адміністратор" : "Співробітник"}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          Контактна інформація
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Email</p>
            <p className="text-sm text-slate-700">{user.email}</p>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400 mb-0.5">Телефон</p>
            <p className="text-sm text-slate-700">
              {user.phone || "Не вказано"}
            </p>
          </div>
          {user.role !== "ADMIN" && (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400 mb-0.5">Посада</p>
              <p className="text-sm text-slate-700">
                {user.position || "Не вказано"}
              </p>
            </div>
          )}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400 mb-0.5">В системі з</p>
            <p className="text-sm text-slate-700">{createdAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
