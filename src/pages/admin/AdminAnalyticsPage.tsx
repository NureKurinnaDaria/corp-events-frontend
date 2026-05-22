import { useState, useEffect } from "react";
import { analyticsApi } from "../../api/analytics";
import type { AnalyticsData } from "../../api/analytics";
import LoadingState from "../../components/common/LoadingState";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(59,130,246,0.10)",
  boxShadow: "0 4px 24px rgba(59,130,246,0.07)",
  borderRadius: "16px",
  overflow: "hidden",
};

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

const KPI_CONFIG = [
  {
    key: "totalEvents",
    label: "Всього подій",
    accent: "#2563eb",
    bg: "#eff6ff",
  },
  {
    key: "totalRegistrations",
    label: "Всього реєстрацій",
    accent: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    key: "avgRating",
    label: "Середній рейтинг",
    accent: "#0891b2",
    bg: "#ecfeff",
  },
];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    .sort((a, b) => b.registrationsCount - a.registrationsCount)
    .map((c) => ({
      name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
      fullName: c.name,
      реєстрації: c.registrationsCount,
      події: c.eventsCount,
    }));

  const topEventsChartData = [...data.topByRegistrations].map((e) => ({
    name: e.title.length > 18 ? e.title.slice(0, 18) + "…" : e.title,
    fullName: e.title,
    реєстрації: e.registrations,
  }));

  const CustomTooltipCategory = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ ...glassCard, padding: "10px 14px", fontSize: "12px" }}>
        <p className="font-semibold text-slate-800 mb-1">{d.fullName}</p>
        <p style={{ color: "#2563eb" }}>Реєстрації: {d.реєстрації}</p>
        <p className="text-slate-500">Подій: {d.події}</p>
      </div>
    );
  };

  const CustomTooltipEvents = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ ...glassCard, padding: "10px 14px", fontSize: "12px" }}>
        <p className="font-semibold text-slate-800 mb-1">{d.fullName}</p>
        <p style={{ color: "#2563eb" }}>Реєстрації: {d.реєстрації}</p>
      </div>
    );
  };

  const kpiValues: Record<string, React.ReactNode> = {
    totalEvents: (
      <span
        style={{
          fontSize: "28px",
          fontWeight: 700,
          letterSpacing: "-0.5px",
          color: "#1e293b",
        }}
      >
        {data.totalEvents}
      </span>
    ),
    totalRegistrations: (
      <span
        style={{
          fontSize: "28px",
          fontWeight: 700,
          letterSpacing: "-0.5px",
          color: "#1e293b",
        }}
      >
        {data.totalRegistrations}
      </span>
    ),
    avgRating:
      data.avgRating > 0 ? (
        <span
          style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "#1e293b",
          }}
        >
          {data.avgRating.toFixed(1)}
          <span
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#94a3b8",
              marginLeft: "4px",
            }}
          >
            / 5
          </span>
        </span>
      ) : (
        <span style={{ fontSize: "14px", color: "#94a3b8" }}>Немає даних</span>
      ),
  };

  const maxCat = Math.max(
    ...data.categoryStats.map((c) => c.registrationsCount),
    1,
  );

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-slate-900 mb-1"
          style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.4px" }}
        >
          Аналітика
        </h1>
        <p className="text-sm text-slate-400">Загальна статистика системи</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {KPI_CONFIG.map(({ key, label, accent, bg }) => (
          <div key={key} style={glassCard}>
            <div
              style={{
                height: "4px",
                background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
              }}
            />
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </p>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: bg }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: accent }}
                  />
                </div>
              </div>
              {kpiValues[key]}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div style={glassCard}>
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid rgba(59,130,246,0.07)" }}
          >
            <span className="text-sm font-semibold text-slate-800">
              Реєстрації за категоріями
            </span>
          </div>
          <div className="px-2 py-4">
            {categoryChartData.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-400">
                Немає даних
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={categoryChartData}
                  margin={{ top: 4, right: 16, left: -20, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(59,130,246,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
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
                    content={<CustomTooltipCategory />}
                    cursor={{ fill: "rgba(59,130,246,0.04)" }}
                  />
                  <Bar dataKey="реєстрації" radius={[6, 6, 0, 0]}>
                    {categoryChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={glassCard}>
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid rgba(59,130,246,0.07)" }}
          >
            <span className="text-sm font-semibold text-slate-800">
              Топ-5 подій за реєстраціями
            </span>
          </div>
          <div className="px-2 py-4">
            {topEventsChartData.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-400">
                Немає даних
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={topEventsChartData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(59,130,246,0.06)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    content={<CustomTooltipEvents />}
                    cursor={{ fill: "rgba(59,130,246,0.04)" }}
                  />
                  <Bar
                    dataKey="реєстрації"
                    radius={[0, 6, 6, 0]}
                    fill="url(#blueGrad)"
                  />
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Category popularity */}
      <div style={glassCard}>
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid rgba(59,130,246,0.07)" }}
        >
          <span className="text-sm font-semibold text-slate-800">
            Популярність категорій
          </span>
        </div>
        {data.categoryStats.length === 0 ? (
          <p className="px-5 py-4 text-sm text-slate-400">Немає даних</p>
        ) : (
          <ul>
            {[...data.categoryStats]
              .sort((a, b) => b.registrationsCount - a.registrationsCount)
              .map((cat, i) => (
                <li
                  key={cat.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{
                    borderTop:
                      i > 0 ? "1px solid rgba(59,130,246,0.06)" : "none",
                  }}
                >
                  <span className="text-sm font-medium text-slate-700 w-28 flex-shrink-0 truncate">
                    {cat.name}
                  </span>
                  <div
                    className="flex-1 rounded-full overflow-hidden"
                    style={{
                      height: "6px",
                      background: "rgba(59,130,246,0.08)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(cat.registrationsCount / maxCat) * 100}%`,
                        background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-28 flex-shrink-0 text-right">
                    {cat.eventsCount} под.{" "}
                    <span style={{ color: "#cbd5e1" }}>·</span>{" "}
                    {cat.registrationsCount} уч.
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
