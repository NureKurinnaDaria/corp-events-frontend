import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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
        this.r = Math.random() * 2.5 + 1;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.5 + 0.15;
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
    <div
      ref={wrapRef}
      className="flex h-screen relative overflow-hidden"
      style={{ background: "#f0f7ff" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <Sidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed(true)}
        onExpand={() => setCollapsed(false)}
      />
      <div
        className="flex-1 flex flex-col overflow-hidden relative"
        style={{ zIndex: 1 }}
      >
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
