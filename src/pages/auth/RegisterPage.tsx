import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import {
  EyeIcon,
  EyeOffIcon,
  AppLogoIcon,
} from "../../components/common/icons";
import { validatePhone } from "../../utils/validatePhone";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: saveSession } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const page = pageRef.current;
    if (!canvas || !page) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = page.offsetWidth);
    let H = (canvas.height = page.offsetHeight);
    const mouse = { x: -999, y: -999 };
    const COLORS = ["#93c5fd", "#bfdbfe", "#60a5fa", "#dbeafe", "#3b82f6"];

    class Dot {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      constructor() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 4 + 2;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.45 + 0.25;
      }
      update() {
        const dx = mouse.x - this.x,
          dy = mouse.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          this.vx -= (dx / d) * 0.4;
          this.vy -= (dy / d) * 0.4;
        }
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = W;
        if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H;
        if (this.y > H) this.y = 0;
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx!.fillStyle = this.color;
        ctx!.globalAlpha = this.alpha;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }
    }

    const dots = Array.from({ length: 80 }, () => new Dot());

    const drawLines = () => {
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x,
            dy = dots[i].y - dots[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 85) {
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.strokeStyle = "#93c5fd";
            ctx!.globalAlpha = (1 - d / 85) * 0.18;
            ctx!.lineWidth = 0.6;
            ctx!.stroke();
            ctx!.globalAlpha = 1;
          }
        }
      }
    };

    const loop = () => {
      ctx!.clearRect(0, 0, W, H);
      drawLines();
      dots.forEach((d) => {
        d.update();
        d.draw();
      });
      animId = requestAnimationFrame(loop);
    };
    loop();

    const onMouseMove = (e: MouseEvent) => {
      const r = page.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onResize = () => {
      W = canvas.width = page.offsetWidth;
      H = canvas.height = page.offsetHeight;
    };

    page.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      page.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Паролі не співпадають");
      return;
    }
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

    setIsLoading(true);
    try {
      const data = await authApi.register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        position: form.position,
        password: form.password,
      });
      await saveSession(data.accessToken);
      navigate("/events");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Помилка реєстрації. Спробуйте ще раз"));
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
    letterSpacing: "0.01em",
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: "#f0f7ff", fontFamily: "'Inter', sans-serif" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-md">
        <div
          className="bg-white rounded-2xl p-10"
          style={{
            border: "1px solid rgba(59,130,246,0.12)",
            boxShadow: "0 2px 24px rgba(59,130,246,0.07)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <AppLogoIcon />
            </div>
            <span
              className="text-slate-900 text-base"
              style={{ fontWeight: 600, letterSpacing: "-0.3px" }}
            >
              Corp Events
            </span>
          </div>

          {/* Pill */}
          <div className="flex justify-center mb-5">
            <span
              className="flex items-center gap-1.5 text-blue-600 rounded-full px-3 py-1 text-xs"
              style={{ background: "#eff6ff", fontWeight: 500 }}
            >
              <span
                className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                style={{ animation: "pillpulse 2s infinite" }}
              />
              Корпоративна платформа
            </span>
          </div>

          <style>{`@keyframes pillpulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>

          <h1
            className="text-center text-slate-900 mb-1"
            style={{
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.4px",
            }}
          >
            Створити акаунт
          </h1>
          <p
            className="text-center text-slate-400 text-sm mb-6"
            style={{ fontWeight: 400 }}
          >
            Заповніть форму для реєстрації
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3.5">
              <label className="block text-slate-500 mb-1.5" style={lbl}>
                Повне ім'я
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Іван Петренко"
                required
                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
                style={inp}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div className="mb-3.5">
              <label className="block text-slate-500 mb-1.5" style={lbl}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@company.com"
                required
                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
                style={inp}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3.5">
              <div>
                <label className="block text-slate-500 mb-1.5" style={lbl}>
                  Телефон
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+380000000000"
                  required
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
                  style={inp}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1.5" style={lbl}>
                  Посада
                </label>
                <input
                  type="text"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="Frontend Dev"
                  required
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 outline-none transition"
                  style={inp}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>

            <div className="mb-3.5">
              <label className="block text-slate-500 mb-1.5" style={lbl}>
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
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
                Мінімум 8 символів, одна велика літера та одна цифра
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-slate-500 mb-1.5" style={lbl}>
                Підтвердити пароль
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white rounded-xl py-3 text-sm transition"
              style={{
                background: isLoading ? "#93c5fd" : "#2563eb",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                border: "none",
                fontFamily: "inherit",
                letterSpacing: "-0.1px",
              }}
            >
              {isLoading ? "Реєстрація..." : "Зареєструватись"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Вже є акаунт?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline"
              style={{ fontWeight: 500 }}
            >
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
