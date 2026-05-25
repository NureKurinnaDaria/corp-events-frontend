import { useState, useEffect } from "react";
import { analyticsApi } from "../../api/analytics";
import type { AnalyticsData } from "../../api/analytics";
import LoadingState from "../../components/common/LoadingState";
import AnalyticsKpiCards from "../../components/analytics/AnalyticsKpiCards";
import AnalyticsCharts from "../../components/analytics/AnalyticsCharts";
import AnalyticsPeriodReport from "../../components/analytics/AnalyticsPeriodReport";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    analyticsApi
      .get()
      .then(setData)
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => setMounted(true), 50);
      });
  }, []);

  if (isLoading) return <LoadingState />;
  if (!data) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .aap-wrap * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }
        @keyframes aap-fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .aap-fade-up { opacity:0; animation: aap-fadeUp .4s ease forwards; }
        .aap-d1{animation-delay:.05s} .aap-d2{animation-delay:.10s} .aap-d3{animation-delay:.15s} .aap-d4{animation-delay:.20s}
        .aap-header {
          position:relative; background:#fff; border-radius:20px; padding:28px 32px; margin-bottom:16px;
          border:1px solid rgba(0,0,0,.06); box-shadow:0 4px 24px rgba(15,23,42,.07);
          overflow:hidden; display:flex; align-items:center; justify-content:space-between; gap:16px;
        }
        .aap-header::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(ellipse 55% 80% at 95% 50%, rgba(37,99,235,.1) 0%, transparent 60%),
            radial-gradient(ellipse 30% 60% at 5% 60%, rgba(124,58,237,.06) 0%, transparent 55%);
          pointer-events:none;
        }
        .aap-chart-label { font-size:11px; font-weight:700; letter-spacing:.06em; color:#94a3b8; text-transform:uppercase; margin-bottom:16px; }
        .aap-top-row-item {
          display:flex; align-items:center; gap:12px; padding:10px 14px;
          border-radius:12px; background:rgba(248,250,252,0.8); border:1px solid #f1f5f9;
          cursor:pointer; transition:transform .15s, box-shadow .15s;
        }
        .aap-top-row-item:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(59,130,246,.12); }
      `}</style>

      <div className="aap-wrap">
        {/* Header */}
        <div className={`aap-header${mounted ? " aap-fade-up" : ""}`}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-.5px",
                color: "#0f172a",
                margin: "0 0 4px",
              }}
            >
              Аналітика
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "#64748b",
                fontWeight: 500,
                margin: 0,
              }}
            >
              Загальна статистика корпоративних подій
            </p>
          </div>
        </div>

        <AnalyticsKpiCards data={data} mounted={mounted} />
        <AnalyticsCharts data={data} mounted={mounted} />
        <AnalyticsPeriodReport mounted={mounted} />
      </div>
    </>
  );
}
