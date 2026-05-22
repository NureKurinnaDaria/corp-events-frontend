import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";
import type { ReactNode } from "react";
import { authApi } from "../api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (updated: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    const currentUser = await authApi.getMe();
    setUser(currentUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
