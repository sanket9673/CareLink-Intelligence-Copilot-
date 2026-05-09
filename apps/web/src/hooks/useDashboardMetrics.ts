import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface TimeInRange {
  percentage_in_range: number;
  percentage_below: number;
  percentage_above: number;
}

export interface DailySummary {
  date: string;
  avg_glucose: number | null;
  min_glucose: number | null;
  max_glucose: number | null;
  total_insulin: number;
  total_carbs: number;
}

export interface DashboardSummary {
  time_in_range: TimeInRange | null;
  daily_summary: DailySummary | null;
}

const fetchDashboardSummary = async (patientId: string): Promise<DashboardSummary | null> => {
  try {
    const response = await api.get(`/analytics/summary/${patientId}`);
    return response.data;
  } catch (error) {
    // Return null gracefully instead of throwing hard errors
    console.warn("Failed to fetch dashboard summary", error);
    return null;
  }
};

export const useDashboardMetrics = (patientId: string) => {
  return useQuery({
    queryKey: ['dashboard', patientId],
    queryFn: () => fetchDashboardSummary(patientId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
