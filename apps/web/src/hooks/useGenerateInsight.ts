import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";

export interface InsightResponse {
  title: string;
  summary: string;
  evidence_points: string[];
  recommendation: string;
  disclaimer: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  insight?: InsightResponse;
}

interface GenerateInsightVariables {
  patientId: string;
  persona?: string;
  history?: ChatMessage[];
}

export const useGenerateInsight = () => {
  return useMutation({
    mutationFn: async ({ patientId, persona = "patient", history = [] }: GenerateInsightVariables) => {
      const response = await api.post<InsightResponse>(
        `/ai/generate-insight`,
        {
          patient_id: patientId,
          persona,
          history: history.map(msg => ({ role: msg.role, content: msg.content }))
        }
      );
      return response.data;
    },
  });
};
