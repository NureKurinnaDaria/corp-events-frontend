import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import SidebarLogo from "./SidebarLogo";
import SidebarNav from "./SidebarNav";
import SidebarUserPanel from "./SidebarUserPanel";
import { adminNav, employeeNav } from "./navigation";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
}

export default function Sidebar({
  collapsed,
  onCollapse,
  onExpand,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === "ADMIN" ? adminNav : employeeNav;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = wrap.offsetWidth);
    let H = (canvas.height = wrap.offsetHeight);
    const mouse = { x: -999, y: -999 };
    const COLORS = ["#93c5fd", "#bfdbfe", "#60a5fa", "#dbeafe"];

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
        this.r = Math.random() * 2 + 0.8;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.4 + 0.1;
      }
      update() {
        const dx = mouse.x - this.x,
          dy = mouse.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          this.vx -= (dx / d) * 0.3;
          this.vy -= (dy / d) * 0.3;
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

    const dots = Array.from({ length: 35 }, () => new Dot());

    const drawLines = () => {
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x,
            dy = dots[i].y - dots[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 70) {
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.strokeStyle = "#93c5fd";
            ctx!.globalAlpha = (1 - d / 70) * 0.12;
            ctx!.lineWidth = 0.5;
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
      const r = wrap.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onResize = () => {
      W = canvas.width = wrap.offsetWidth;
      H = canvas.height = wrap.offsetHeight;
    };

    wrap.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      wrap.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <aside
      ref={wrapRef}
      className="flex flex-col flex-shrink-0 transition-all duration-300 relative"
      style={{
        width: collapsed ? "64px" : "260px",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(59,130,246,0.10)",
        boxShadow: "2px 0 16px rgba(59,130,246,0.06)",
        zIndex: 10,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="relative flex flex-col flex-1" style={{ zIndex: 1 }}>
        <SidebarLogo collapsed={collapsed} onCollapse={onCollapse} />
        <SidebarNav
          role={user?.role}
          collapsed={collapsed}
          navItems={navItems}
        />
        <SidebarUserPanel
          user={user}
          collapsed={collapsed}
          onExpand={onExpand}
          onLogout={handleLogout}
        />
      </div>
    </aside>
  );
}
