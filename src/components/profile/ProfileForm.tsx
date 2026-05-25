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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "9px 14px",
    fontSize: 13,
    color: "#1e293b",
    outline: "none",
    transition: "border-color .15s, background .15s",
    fontFamily: "Manrope, sans-serif",
    fontWeight: 500,
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#93c5fd";
    e.target.style.background = "#fff";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.background = "#f8fafc";
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: ".03em",
    display: "block",
    marginBottom: 6,
  };
  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: ".08em",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 14,
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e8edf5",
        boxShadow: "0 2px 12px rgba(15,23,42,.05)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
        }}
      />
      <div style={{ padding: "24px" }}>
        <p style={sectionLabel}>Редагування профілю</p>

        {error && (
          <div
            style={{
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#e11d48",
              fontSize: 13,
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#16a34a",
              fontSize: 13,
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Профіль успішно оновлено
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={labelStyle}>Повне ім'я</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Іван Петренко"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div>
            <label style={labelStyle}>Телефон</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+380000000000"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {!isAdmin(user) && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Посада</label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Frontend Developer"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        )}

        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            paddingTop: 20,
            marginBottom: 20,
          }}
        >
          <p style={sectionLabel}>Зміна пароля (необов'язково)</p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={labelStyle}>Новий пароль</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>
                Мін. 8 символів, велика літера, цифра
              </p>
            </div>
            <div>
              <label style={labelStyle}>Підтвердити пароль</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                  }}
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
          style={{
            width: "100%",
            padding: "12px 20px",
            background: isLoading
              ? "#93c5fd"
              : "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "Manrope, sans-serif",
            letterSpacing: "-.1px",
            boxShadow: isLoading ? "none" : "0 4px 16px rgba(37,99,235,.25)",
            transition: "all .2s",
          }}
        >
          {isLoading ? "Збереження..." : "Зберегти зміни"}
        </button>
      </div>
    </div>
  );
}
