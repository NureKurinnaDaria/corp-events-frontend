import { useState, useEffect } from "react";
import { usersApi } from "../api/users";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/common/LoadingState";
import ProfileInfo from "../components/profile/ProfileInfo";
import ProfileForm from "../components/profile/ProfileForm";
import type { User } from "../types";

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [isLoading, setIsLoading] = useState(!authUser);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    let cancelled = false;
    setIsLoading(true);
    usersApi
      .getProfile()
      .then((fresh) => {
        if (cancelled) return;
        setUser(fresh);
        updateUser(fresh);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = (updated: User) => {
    setUser(updated);
    updateUser(updated);
  };

  if (isLoading) return <LoadingState />;
  if (!user) return <LoadingState text="Профіль не знайдено" />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .pp-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }

        @keyframes pp-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pp-fade-up { opacity: 0; animation: pp-fadeUp .4s ease forwards; }
        .pp-d1 { animation-delay: .06s; }
        .pp-d2 { animation-delay: .12s; }

        .pp-header {
          position: relative;
          background: #fff;
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 20px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 4px 24px rgba(15,23,42,.07);
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .pp-header::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 80% at 95% 50%, rgba(37,99,235,.1) 0%, transparent 60%),
            radial-gradient(ellipse 30% 60% at 5% 60%, rgba(124,58,237,.06) 0%, transparent 55%);
          pointer-events: none;
        }
        .pp-header-text { position: relative; z-index: 1; }
        .pp-title { font-size: 24px; font-weight: 800; letter-spacing: -.5px; color: #0f172a; margin: 0 0 4px; }
        .pp-subtitle { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; }
        .pp-role-badge {
          position: relative; z-index: 1; margin-left: auto;
          background: #eff6ff; border: 1px solid #bfdbfe;
          color: #1d4ed8; font-size: 12px; font-weight: 700;
          padding: 7px 16px; border-radius: 100px;
        }

        .pp-grid {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 16px;
        }
      `}</style>

      <div className="pp-wrap">
        {/* Header */}
        <div className={`pp-header${mounted ? " pp-fade-up" : ""}`}>
          <div className="pp-header-text">
            <h1 className="pp-title">Профіль</h1>
            <p className="pp-subtitle">
              {user.role === "ADMIN"
                ? "Управління вашим акаунтом адміністратора"
                : "Управління вашим акаунтом співробітника"}
            </p>
          </div>
          <span className="pp-role-badge">
            {user.role === "ADMIN" ? "Адміністратор" : "Співробітник"}
          </span>
        </div>

        <div className={`pp-grid${mounted ? " pp-fade-up pp-d1" : ""}`}>
          <ProfileInfo user={user} onAvatarUpdate={handleSave} />
          <ProfileForm user={user} onSave={handleSave} />
        </div>
      </div>
    </>
  );
}
