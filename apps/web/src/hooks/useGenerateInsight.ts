import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";

export interface InsightResponse {
  title: string;
  summary: string;
  evidence_points: string[];
  recommendation: string;
  disclaimer: string;
}

interface GenerateInsightVariables {
  patientId: string;
  persona?: string;
}

export const useGenerateInsight = () => {
  return useMutation({
    mutationFn: async ({ patientId, persona = "patient" }: GenerateInsightVariables) => {
      const response = await api.post<InsightResponse>(
        `/ai/generate-insight?patient_id=${patientId}&persona=${persona}`
      );
      return response.data;
    },
  });
};
