import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import {
  EyeIcon,
  EyeOffIcon,
  AppLogoIcon,
} from "../../components/common/icons";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: saveSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await authApi.login({ email, password });
      await saveSession(data.accessToken);
      navigate(data.user.role === "ADMIN" ? "/admin/events" : "/events");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Невірний email або пароль"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <AppLogoIcon />
            </div>
            <span className="text-lg font-medium text-slate-800">
              Corp Events
            </span>
          </div>
          <h1 className="text-2xl font-medium text-slate-800 mb-1">
            Вхід до системи
          </h1>
          <p className="text-sm text-slate-500">
            Введіть свої дані для продовження
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                required
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg py-2.5 text-sm transition"
            >
              {isLoading ? "Завантаження..." : "Увійти"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Немає акаунту?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Зареєструватись
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
