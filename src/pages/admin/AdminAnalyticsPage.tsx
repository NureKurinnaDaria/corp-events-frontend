import { useState, useEffect } from "react";
import { analyticsApi } from "../../api/analytics";
import type { AnalyticsData } from "../../api/analytics";
import LoadingState from "../../components/common/LoadingState";

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

  const maxRegs =
    data.categoryStats.length > 0
      ? Math.max(...data.categoryStats.map((c) => c.registrationsCount))
      : 1;

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

      {/* Top lists */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-800">
              Топ за реєстраціями
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.topByRegistrations.length === 0 ? (
              <li className="px-5 py-4 text-sm text-slate-400">Немає даних</li>
            ) : (
              data.topByRegistrations.map((event, index) => (
                <li
                  key={event.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span className="text-xs text-slate-400 w-4 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">
                    {event.title}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
                    {event.registrations} уч.
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-800">
              Топ за рейтингом
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.topByRating.length === 0 ? (
              <li className="px-5 py-4 text-sm text-slate-400">Немає даних</li>
            ) : (
              data.topByRating.map((event, index) => (
                <li
                  key={event.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span className="text-xs text-slate-400 w-4 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">
                    {event.title}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex-shrink-0">
                    {event.avgRating.toFixed(1)} ★
                  </span>
                </li>
              ))
            )}
          </ul>
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
            {data.categoryStats
              .sort((a, b) => b.registrationsCount - a.registrationsCount)
              .map((cat) => (
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
                        width:
                          maxRegs > 0
                            ? `${(cat.registrationsCount / maxRegs) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-28 flex-shrink-0 text-right">
                    {cat.eventsCount} под.{" "}
                    <span className="text-slate-300">·</span>{" "}
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
