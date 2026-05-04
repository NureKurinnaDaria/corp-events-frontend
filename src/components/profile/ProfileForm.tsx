import { useState } from "react";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { usersApi } from "../../api/users";
import { EyeIcon, EyeOffIcon } from "../common/icons";
import type { User } from "../../types";
import { validatePhone } from "../../utils/validatePhone";

interface ProfileFormProps {
  user: User;
  onSave: (updated: User) => void;
}

const isAdmin = (user: User) => user.role === "ADMIN";

export default function ProfileForm({ user, onSave }: ProfileFormProps) {
  const [form, setForm] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    position: user.position || "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (form.phone) {
      const phoneError = validatePhone(form.phone);
      if (phoneError) {
        setError(phoneError);
        return;
      }
    }

    if (form.password) {
      if (form.password.length < 8) {
        setError("Пароль має бути не менше 8 символів");
        return;
      }
      if (!/[A-Z]/.test(form.password)) {
        setError("Пароль має містити хоча б одну велику літеру");
        return;
      }
      if (!/[0-9]/.test(form.password)) {
        setError("Пароль має містити хоча б одну цифру");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Паролі не співпадають");
        return;
      }
    }

    setIsLoading(true);
    try {
      const updated = await usersApi.updateProfile({
        fullName: form.fullName || undefined,
        phone: form.phone || undefined,
        position: isAdmin(user) ? undefined : form.position || undefined,
        password: form.password || undefined,
      });
      onSave(updated);
      setSuccess(true);
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Помилка збереження"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-5">
        Редагування профілю
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3 mb-4">
          ✓ Профіль успішно оновлено
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Повне ім'я
          </label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Іван Петренко"
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Телефон
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+380000000000"
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {!isAdmin(user) && (
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Посада
          </label>
          <input
            type="text"
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="Frontend Developer"
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      )}

      <div className="border-t border-slate-100 pt-5 mb-5">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          Зміна пароля (необов'язково)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Новий пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
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
            <p className="text-xs text-slate-400 mt-1.5">
              Мін. 8 символів, велика літера, цифра
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Підтвердити пароль
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50"
      >
        {isLoading ? "Збереження..." : "Зберегти зміни"}
      </button>
    </div>
  );
}
