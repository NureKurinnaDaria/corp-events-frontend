import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsApi } from "../../api/analytics";
import type { AnalyticsData } from "../../api/analytics";
import LoadingState from "../../components/common/LoadingState";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const CATEGORY_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ec4899",
  "#f97316",
];
const FORMAT_COLORS = ["#f59e0b", "#3b82f6"];

const KPI_CONFIG = [
  {
    key: "totalEvents",
    label: "Всього подій",
    grad: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    shadow: "rgba(37,99,235,0.35)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: "activeUsers",
    label: "Активних співробітників",
    grad: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    shadow: "rgba(124,58,237,0.35)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "avgRating",
    label: "Середній рейтинг",
    grad: "linear-gradient(135deg, #0891b2, #0e7490)",
    shadow: "rgba(8,145,178,0.35)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    key: "avgFillRate",
    label: "Середня заповненість",
    grad: "linear-gradient(135deg, #16a34a, #15803d)",
    shadow: "rgba(22,163,74,0.35)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    key: "totalFeedbacks",
    label: "Всього відгуків",
    grad: "linear-gradient(135deg, #ea580c, #c2410c)",
    shadow: "rgba(234,88,12,0.35)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0"}
          stroke={i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0"}
          strokeWidth="1"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    analyticsApi
      .get()
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState />;
  if (!data) return null;

  const categoryChartData = [...data.categoryStats]
    .filter((c) => c.registrationsCount > 0)
    .sort((a, b) => b.registrationsCount - a.registrationsCount)
    .map((c) => ({ name: c.name, value: c.registrationsCount }));

  const DarkTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: "#1e293b",
          borderRadius: 10,
          padding: "8px 12px",
          fontSize: 12,
          color: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: 2 }}>{payload[0]?.name}</p>
        <p style={{ color: "#94a3b8" }}>{payload[0]?.value} реєстрацій</p>
      </div>
    );
  };

  const LineTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: "#1e293b",
          borderRadius: 10,
          padding: "8px 12px",
          fontSize: 12,
          color: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: 2 }}>{label}</p>
        <p style={{ color: "#93c5fd" }}>{payload[0]?.value} подій</p>
      </div>
    );
  };

  const glass = {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)" as any,
    border: "1px solid rgba(59,130,246,0.10)",
    boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
    borderRadius: 16,
    padding: "20px",
  };

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-slate-900 mb-1"
          style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.4px" }}
        >
          Аналітика
        </h1>
        <p className="text-sm text-slate-400">
          Загальна статистика корпоративних подій
        </p>
      </div>

      {/* KPI Cards */}
      <div
        className="grid gap-4 mb-5"
        style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
      >
        {KPI_CONFIG.map(({ key, label, grad, shadow, icon }) => {
          const value = data[key as keyof AnalyticsData] as number;
          const display =
            key === "avgRating"
              ? `${value} / 5`
              : key === "avgFillRate"
                ? `${value}%`
                : value;
          return (
            <div
              key={key}
              style={{
                background: grad,
                borderRadius: 16,
                padding: "18px 20px",
                boxShadow: `0 8px 24px ${shadow}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative circle */}
              <div
                style={{
                  position: "absolute",
                  top: -24,
                  right: -24,
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                {icon}
              </div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.75)",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-1px",
                  lineHeight: 1,
                }}
              >
                {display}
              </p>
            </div>
          );
        })}
      </div>

      {/* Row 2: Monthly + Format */}
      <div
        className="grid gap-4 mb-4"
        style={{ gridTemplateColumns: "1fr 300px" }}
      >
        <div style={glass}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Активність по місяцях
          </p>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={data.monthlyActivity}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                allowDecimals={false}
              />
              <Tooltip content={<LineTooltip />} />
              <Line
                type="monotone"
                dataKey="події"
                stroke="url(#lineGrad)"
                strokeWidth={3}
                dot={{ fill: "#2563eb", r: 5, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, fill: "#6366f1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={glass}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Онлайн vs Офлайн
          </p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={data.formatStats}
              barSize={52}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(59,130,246,0.04)", radius: 8 }}
                formatter={(v) => [`${v} подій`]}
                contentStyle={{
                  borderRadius: 10,
                  fontSize: 12,
                  background: "#1e293b",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                }}
                labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: 2 }}
              />
              <Bar dataKey="value" name="Подій" radius={[8, 8, 0, 0]}>
                {data.formatStats.map((_, i) => (
                  <Cell
                    key={i}
                    fill={FORMAT_COLORS[i % FORMAT_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Category + Top by rating */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div style={glass}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Розподіл по категоріях
          </p>
          {categoryChartData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              Немає даних
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={82}
                  innerRadius={44}
                  paddingAngle={3}
                >
                  {categoryChartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={glass}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Топ-5 подій за рейтингом
          </p>
          {data.topByRating.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              Ще немає відгуків
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.topByRating.map((event, i) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/admin/events/${event.id}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "rgba(248,250,252,0.8)",
                    border: "1px solid #f1f5f9",
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(59,130,246,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1e293b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {event.title}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 2,
                      }}
                    >
                      <Stars rating={event.avgRating} />
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {event.avgRating.toFixed(1)} · {event.feedbackCount}{" "}
                        відгуків
                      </span>
                    </div>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
