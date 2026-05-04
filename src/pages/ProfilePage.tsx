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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    usersApi
      .getProfile()
      .then(setUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = (updated: User) => {
    setUser(updated);
  };

  if (isLoading) return <LoadingState />;
  if (!user) return <LoadingState text="Профіль не знайдено" />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-medium text-slate-800 mb-1">Профіль</h1>
        <p className="text-sm text-slate-500">
          {user.role === "ADMIN"
            ? "Управління вашим акаунтом адміністратора"
            : "Управління вашим акаунтом співробітника"}
        </p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "260px 1fr" }}>
        <ProfileInfo user={user} />
        <ProfileForm user={user} onSave={handleSave} />
      </div>
    </div>
  );
}
