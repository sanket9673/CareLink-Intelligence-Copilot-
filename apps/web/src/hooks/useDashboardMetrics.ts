import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

interface DailySummary {
  date: string;
  avg_glucose: number | null;
  min_glucose: number | null;
  max_glucose: number | null;
  total_insulin: number;
  total_carbs: number;
}

interface TimeInRangeSummary {
  percentage_in_range: number;
  percentage_below: number;
  percentage_above: number;
}

export interface DashboardMetrics {
  daily_summary: DailySummary;
  time_in_range: TimeInRangeSummary;
}

export const useDashboardMetrics = (patientId: string) => {
  return useQuery<DashboardMetrics, Error>({
    queryKey: ["dashboardMetrics", patientId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/summary/${patientId}`);
      return data;
    },
    // Adding some placeholder data in case the backend endpoint isn't fully returning data yet
    initialData: {
      daily_summary: {
        date: new Date().toISOString(),
        avg_glucose: 110,
        min_glucose: 85,
        max_glucose: 145,
        total_insulin: 32.5,
        total_carbs: 120,
      },
      time_in_range: {
        percentage_in_range: 85.5,
        percentage_below: 2.1,
        percentage_above: 12.4,
      }
    }
  });
};
