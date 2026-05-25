import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { periodReportApi } from "../../api/analytics";
import type { PeriodReport } from "../../api/analytics";

const card = {
  background: "#fff",
  border: "1px solid rgba(0,0,0,.06)",
  boxShadow: "0 2px 12px rgba(15,23,42,.05)",
  borderRadius: 16,
  padding: "24px",
};

function formatStatus(s: string) {
  const map: Record<string, string> = {
    PUBLISHED: "Заплановано",
    ONGOING: "Триває",
    COMPLETED: "Завершено",
    CANCELED: "Скасовано",
  };
  return map[s] ?? s;
}

function statusStyle(status: string): React.CSSProperties {
  const styles: Record<string, React.CSSProperties> = {
    COMPLETED: { background: "#f0fdf4", color: "#16a34a" },
    CANCELED: { background: "#fef2f2", color: "#dc2626" },
    ONGOING: { background: "#fffbeb", color: "#d97706" },
    PUBLISHED: { background: "#f8fafc", color: "#64748b" },
  };
  return styles[status] ?? { background: "#f8fafc", color: "#64748b" };
}

interface SummaryKpi {
  label: string;
  value: string | number;
  color: string;
}

export default function AnalyticsPeriodReport({
  mounted,
}: {
  mounted: boolean;
}) {
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .slice(0, 10);

  const [reportFrom, setReportFrom] = useState(firstOfMonth);
  const [reportTo, setReportTo] = useState(today);
  const [report, setReport] = useState<PeriodReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const loadReport = async () => {
    if (!reportFrom || !reportTo) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const result = await periodReportApi.get(reportFrom, reportTo);
      setReport(result);
    } catch {
      setReportError("Не вдалося завантажити звіт");
    } finally {
      setReportLoading(false);
    }
  };

  const exportCsv = () => {
    if (!report) return;
    const BOM = "\uFEFF";
    const header = [
      "Назва",
      "Категорія",
      "Дата",
      "Формат",
      "Статус",
      "Реєстрацій",
      "Макс. учасників",
      "Заповненість %",
      "Рейтинг",
      "Відгуків",
    ].join(";");
    const rows = report.events.map((e) =>
      [
        `"${e.title.replace(/"/g, '""')}"`,
        `"${e.category}"`,
        new Date(e.date).toLocaleDateString("uk-UA"),
        e.format === "ONLINE" ? "Онлайн" : "Офлайн",
        formatStatus(e.status),
        e.registrations,
        e.maxParticipants ?? "—",
        e.fillRate != null ? `${e.fillRate}%` : "—",
        e.avgRating != null ? e.avgRating.toFixed(1) : "—",
        e.feedbackCount,
      ].join(";"),
    );
    const csv = BOM + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `звіт_${reportFrom}_${reportTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryKpis: SummaryKpi[] = report
    ? [
        { label: "Подій", value: report.totalEvents, color: "#2563eb" },
        {
          label: "Реєстрацій",
          value: report.totalRegistrations,
          color: "#7c3aed",
        },
        {
          label: "Середня заповненість",
          value: report.avgFillRate != null ? `${report.avgFillRate}%` : "—",
          color: "#16a34a",
        },
        {
          label: "Середній рейтинг",
          value:
            report.avgRating != null
              ? `${report.avgRating.toFixed(1)} / 5`
              : "—",
          color: "#0891b2",
        },
      ]
    : [];

  return (
    <div
      className={mounted ? "aap-fade-up aap-d4" : ""}
      style={{ marginTop: 16 }}
    >
      <div style={card}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".06em",
                color: "#94a3b8",
                textTransform: "uppercase",
                margin: "0 0 4px",
              }}
            >
              Звіт за період
            </p>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Оберіть діапазон дат для детального звіту по подіях
            </p>
          </div>
          {report && (
            <button
              onClick={exportCsv}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Експорт CSV
            </button>
          )}
        </div>

        {/* Date range controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
              Від
            </label>
            <input
              type="date"
              value={reportFrom}
              onChange={(e) => setReportFrom(e.target.value)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "7px 10px",
                fontSize: 13,
                color: "#1e293b",
                outline: "none",
                fontFamily: "Manrope, sans-serif",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
              До
            </label>
            <input
              type="date"
              value={reportTo}
              onChange={(e) => setReportTo(e.target.value)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "7px 10px",
                fontSize: 13,
                color: "#1e293b",
                outline: "none",
                fontFamily: "Manrope, sans-serif",
              }}
            />
          </div>
          <button
            onClick={loadReport}
            disabled={reportLoading}
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: reportLoading ? "not-allowed" : "pointer",
              opacity: reportLoading ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            {reportLoading ? "Завантаження..." : "Сформувати звіт"}
          </button>
        </div>

        {/* Error */}
        {reportError && (
          <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>
            {reportError}
          </p>
        )}

        {/* Summary KPIs */}
        {report && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {summaryKpis.map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  borderRadius: 12,
                  padding: "14px 16px",
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    margin: "0 0 6px",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Events table */}
        {report && report.events.length === 0 && (
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "#94a3b8",
              padding: "32px 0",
            }}
          >
            За обраний період події не знайдено
          </p>
        )}

        {report && report.events.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  {[
                    "Назва події",
                    "Категорія",
                    "Дата",
                    "Формат",
                    "Статус",
                    "Реєстрацій",
                    "Заповненість",
                    "Рейтинг",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                        borderBottom: "1px solid #f1f5f9",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.events.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => navigate(`/admin/events/${event.id}`)}
                    style={{ cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "11px 12px",
                        fontWeight: 600,
                        color: "#1e293b",
                        borderBottom: "1px solid #f8fafc",
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {event.title}
                    </td>
                    <td
                      style={{
                        padding: "11px 12px",
                        color: "#64748b",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      {event.category || "—"}
                    </td>
                    <td
                      style={{
                        padding: "11px 12px",
                        color: "#64748b",
                        borderBottom: "1px solid #f8fafc",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(event.date).toLocaleDateString("uk-UA")}
                    </td>
                    <td
                      style={{
                        padding: "11px 12px",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background:
                            event.format === "ONLINE" ? "#eff6ff" : "#f0fdf4",
                          color:
                            event.format === "ONLINE" ? "#2563eb" : "#16a34a",
                          borderRadius: 6,
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {event.format === "ONLINE" ? "Онлайн" : "Офлайн"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "11px 12px",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      <span
                        style={{
                          ...statusStyle(event.status),
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 6,
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {formatStatus(event.status)}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "11px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      {event.registrations}
                      {event.maxParticipants != null && (
                        <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                          {" "}
                          / {event.maxParticipants}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "11px 12px",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      {event.fillRate != null ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 60,
                              height: 5,
                              background: "#e2e8f0",
                              borderRadius: 99,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(event.fillRate, 100)}%`,
                                height: "100%",
                                background:
                                  event.fillRate >= 80
                                    ? "#16a34a"
                                    : event.fillRate >= 50
                                      ? "#f59e0b"
                                      : "#94a3b8",
                                borderRadius: 99,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 12, color: "#64748b" }}>
                            {event.fillRate}%
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      style={{
                        padding: "11px 12px",
                        borderBottom: "1px solid #f8fafc",
                      }}
                    >
                      {event.avgRating != null ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="#f59e0b"
                            stroke="#f59e0b"
                            strokeWidth="1"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>
                            {event.avgRating.toFixed(1)}
                          </span>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>
                            ({event.feedbackCount})
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state before first load */}
        {!report && !reportLoading && !reportError && (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                marginBottom: 12,
                display: "block",
                margin: "0 auto 12px",
              }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p style={{ fontSize: 13, margin: 0 }}>
              Оберіть діапазон дат і натисніть «Сформувати звіт»
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
