import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";
import type { ReactNode } from "react";
import { authApi } from "../api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
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
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("token"));

  // Тільки при першому завантаженні сторінки — відновлюємо сесію з localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
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
  }, []); // порожній масив — лише один раз при mount

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
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
