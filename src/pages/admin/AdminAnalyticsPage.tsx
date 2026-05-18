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

  const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

  const CustomTooltipCategory = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-xs">
          <p className="font-medium text-slate-800 mb-1">{d.fullName}</p>
          <p className="text-blue-600">Реєстрації: {d.реєстрації}</p>
          <p className="text-slate-500">Подій: {d.події}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipEvents = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-xs">
          <p className="font-medium text-slate-800 mb-1">{d.fullName}</p>
          <p className="text-blue-600">Реєстрації: {d.реєстрації}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-slate-800 mb-1">Аналітика</h1>
        <p className="text-sm text-slate-500">Загальна статистика системи</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">Всього подій</p>
          <p className="text-2xl font-medium text-slate-800">
            {data.totalEvents}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">Всього реєстрацій</p>
          <p className="text-2xl font-medium text-slate-800">
            {data.totalRegistrations}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">Середній рейтинг</p>
          <p className="text-2xl font-medium text-slate-800">
            {data.avgRating > 0 ? (
              <>
                {data.avgRating.toFixed(1)}
                <span className="text-sm font-normal text-slate-400 ml-1">
                  / 5
                </span>
              </>
            ) : (
              <span className="text-sm font-normal text-slate-400">
                Немає даних
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Category bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-800">
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
                    stroke="#f1f5f9"
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
                  <Tooltip content={<CustomTooltipCategory />} />
                  <Bar dataKey="реєстрації" radius={[4, 4, 0, 0]}>
                    {categoryChartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top events bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-800">
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
                    stroke="#f1f5f9"
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
                  <Tooltip content={<CustomTooltipEvents />} />
                  <Bar
                    dataKey="реєстрації"
                    radius={[0, 4, 4, 0]}
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Category stats */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-800">
            Популярність категорій
          </span>
        </div>
        {data.categoryStats.length === 0 ? (
          <p className="px-5 py-4 text-sm text-slate-400">Немає даних</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {[...data.categoryStats]
              .sort((a, b) => b.registrationsCount - a.registrationsCount)
              .map((cat) => {
                const max = Math.max(
                  ...data.categoryStats.map((c) => c.registrationsCount),
                  1,
                );
                return (
                  <li
                    key={cat.id}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <span className="text-sm text-slate-700 w-28 flex-shrink-0 truncate">
                      {cat.name}
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full transition-all"
                        style={{
                          width: `${(cat.registrationsCount / max) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-28 flex-shrink-0 text-right">
                      {cat.eventsCount} под.{" "}
                      <span className="text-slate-300">·</span>{" "}
                      {cat.registrationsCount} уч.
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
}
