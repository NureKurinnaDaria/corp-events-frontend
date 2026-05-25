import api from "./axios";

export interface TopEvent {
  id: string;
  title: string;
  registrations: number;
}

export interface TopRatedEvent {
  id: string;
  title: string;
  avgRating: number;
  feedbackCount: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  eventsCount: number;
  registrationsCount: number;
}

export interface MonthlyActivity {
  month: string;
  події: number;
}

export interface FormatStat {
  name: string;
  value: number;
}

export interface AnalyticsData {
  totalEvents: number;
  totalRegistrations: number;
  avgRating: number;
  avgFillRate: number;
  activeUsers: number;
  totalFeedbacks: number;
  topByRegistrations: TopEvent[];
  topByRating: TopRatedEvent[];
  categoryStats: CategoryStat[];
  monthlyActivity: MonthlyActivity[];
  formatStats: FormatStat[];
}

export const analyticsApi = {
  get: async (): Promise<AnalyticsData> => {
    const response = await api.get<AnalyticsData>("/analytics");
    return response.data;
  },
};

export interface ReportEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  format: string;
  status: string;
  registrations: number;
  maxParticipants: number | null;
  fillRate: number | null;
  avgRating: number | null;
  feedbackCount: number;
}

export interface PeriodReport {
  from: string;
  to: string;
  totalEvents: number;
  totalRegistrations: number;
  avgFillRate: number | null;
  avgRating: number | null;
  events: ReportEvent[];
}

export const periodReportApi = {
  get: async (from: string, to: string): Promise<PeriodReport> => {
    const response = await api.get<PeriodReport>("/analytics/report", {
      params: { from, to },
    });
    return response.data;
  },
};
