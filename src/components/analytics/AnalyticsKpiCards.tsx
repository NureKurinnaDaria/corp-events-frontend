import type { AnalyticsData } from "../../api/analytics";

interface Props {
  data: AnalyticsData;
  mounted: boolean;
}

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

export default function AnalyticsKpiCards({ data, mounted }: Props) {
  return (
    <div
      className={mounted ? "aap-fade-up aap-d1" : ""}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 16,
        marginBottom: 16,
      }}
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
            ></div>
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
                letterSpacing: ".06em",
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
                margin: 0,
              }}
            >
              {display}
            </p>
          </div>
        );
      })}
    </div>
  );
}
