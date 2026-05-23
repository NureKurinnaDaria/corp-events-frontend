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

  const inp: React.CSSProperties = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontFamily: "inherit",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#2563eb";
    e.target.style.background = "#fafcff";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.background = "#f8fafc";
  };
  const lbl: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 500,
    color: "#64748b",
    marginBottom: "6px",
    display: "block",
  };
  const sectionLabel: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: "12px",
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(59,130,246,0.10)",
        boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "4px",
          background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
        }}
      />
      <div className="p-6">
        <p style={sectionLabel}>Редагування профілю</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-3 mb-4">
            Профіль успішно оновлено
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label style={lbl}>Повне ім'я</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Іван Петренко"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
              style={inp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div>
            <label style={lbl}>Телефон</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+380000000000"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
              style={inp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {!isAdmin(user) && (
          <div className="mb-5">
            <label style={lbl}>Посада</label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Frontend Developer"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
              style={inp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        )}

        <div
          className="pt-5 mb-5"
          style={{ borderTop: "1px solid rgba(59,130,246,0.07)" }}
        >
          <p style={sectionLabel}>Зміна пароля (необов'язково)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={lbl}>Новий пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition pr-10"
                  style={inp}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p className="text-slate-400 mt-1.5" style={{ fontSize: "10px" }}>
                Мін. 8 символів, велика літера, цифра
              </p>
            </div>
            <div>
              <label style={lbl}>Підтвердити пароль</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition pr-10"
                  style={inp}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
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
          className="w-full py-2.5 text-sm rounded-xl transition text-white"
          style={{
            background: isLoading
              ? "#93c5fd"
              : "linear-gradient(135deg, #2563eb, #1d4ed8)",
            border: "none",
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            letterSpacing: "-0.1px",
          }}
        >
          {isLoading ? "Збереження..." : "Зберегти зміни"}
        </button>
      </div>
    </div>
  );
}
