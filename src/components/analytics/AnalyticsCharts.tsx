import { useNavigate } from "react-router-dom";
import type { AnalyticsData } from "../../api/analytics";
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

interface Props {
  data: AnalyticsData;
  mounted: boolean;
}

const CATEGORY_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ec4899",
  "#f97316",
];
const FORMAT_COLORS = ["#f59e0b", "#3b82f6"];

const card = {
  background: "#fff",
  border: "1px solid rgba(0,0,0,.06)",
  boxShadow: "0 2px 12px rgba(15,23,42,.05)",
  borderRadius: 16,
  padding: "20px",
};

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

function DarkTooltip({ active, payload }: any) {
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
}

function LineTooltip({ active, payload, label }: any) {
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
}

export default function AnalyticsCharts({ data, mounted }: Props) {
  const navigate = useNavigate();

  const categoryChartData = [...data.categoryStats]
    .filter((c) => c.registrationsCount > 0)
    .sort((a, b) => b.registrationsCount - a.registrationsCount)
    .map((c) => ({ name: c.name, value: c.registrationsCount }));

  return (
    <>
      {/* Row 2 — line chart + bar chart */}
      <div
        className={mounted ? "aap-fade-up aap-d2" : ""}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={card}>
          <p className="aap-chart-label">Активність по місяцях</p>
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

        <div style={card}>
          <p className="aap-chart-label">Онлайн vs Офлайн</p>
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
                cursor={{ fill: "rgba(59,130,246,0.04)", radius: 8 } as any}
                formatter={(v) => [`${v} подій`]}
                contentStyle={{
                  borderRadius: 10,
                  fontSize: 12,
                  background: "#1e293b",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                }}
                labelStyle={{ color: "#fff", fontWeight: 600 }}
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

      {/* Row 3 — pie chart + top by rating */}
      <div
        className={mounted ? "aap-fade-up aap-d3" : ""}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={card}>
          <p className="aap-chart-label">Розподіл по категоріях</p>
          {categoryChartData.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#94a3b8",
                padding: "40px 0",
              }}
            >
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

        <div style={card}>
          <p className="aap-chart-label">Топ-5 подій за рейтингом</p>
          {data.topByRating.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#94a3b8",
                padding: "40px 0",
              }}
            >
              Ще немає відгуків
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.topByRating.map((event, i) => (
                <div
                  key={event.id}
                  className="aap-top-row-item"
                  onClick={() => navigate(`/admin/events/${event.id}`)}
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
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
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
    </>
  );
}
