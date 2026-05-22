import { useState, useEffect } from "react";
import { usersApi } from "../api/users";
import LoadingState from "../components/common/LoadingState";
import ProfileInfo from "../components/profile/ProfileInfo";
import ProfileForm from "../components/profile/ProfileForm";
import type { User } from "../types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    usersApi
      .getProfile()
      .then(setUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState />;
  if (!user) return <LoadingState text="Профіль не знайдено" />;

  return (
    <div>
      <div className="mb-5">
        <h1
          className="text-slate-900 mb-1"
          style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.4px" }}
        >
          Профіль
        </h1>
        <p className="text-sm text-slate-400">
          {user.role === "ADMIN"
            ? "Управління вашим акаунтом адміністратора"
            : "Управління вашим акаунтом співробітника"}
        </p>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "260px 1fr" }}>
        <ProfileInfo user={user} onAvatarUpdate={setUser} />
        <ProfileForm user={user} onSave={setUser} />
      </div>
    </div>
  );
}
