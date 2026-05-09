import React from "react";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, type Variants } from "framer-motion";
import { InsightSection } from "../components/dashboard/InsightSection";

export const Dashboard = () => {
  // Hardcoded patientId for scaffolding phase
  const { data, isLoading } = useDashboardMetrics("patient-123");

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Summary</h1>
          <p className="text-slate-500 mt-1">Loading your metabolic health overview...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-2 pt-6 px-6">
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Skeleton className="h-10 w-20 mt-1 mb-3" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Avg Glucose",
      value: data?.daily_summary?.avg_glucose,
      unit: "mg/dL",
      caption: "Past 24 hours",
      alert: data?.daily_summary?.avg_glucose && data.daily_summary.avg_glucose > 140,
    },
    {
      title: "Time in Range",
      value: data?.time_in_range?.percentage_in_range,
      unit: "%",
      caption: "Target 70 - 180 mg/dL",
      alert: false,
    },
    {
      title: "Total Insulin",
      value: data?.daily_summary?.total_insulin,
      unit: "U",
      caption: "Basal + Bolus",
      alert: false,
    },
    {
      title: "Carbs Consumed",
      value: data?.daily_summary?.total_carbs,
      unit: "g",
      caption: "Dietary estimation",
      alert: false,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Summary</h1>
        <p className="text-slate-500 mt-1">Your recent metabolic health overview.</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {metrics.map((metric, i) => (
          <motion.div key={i} variants={item}>
            {/* Apple style: Clean white card, very light border, rounded-3xl */}
            <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-baseline space-x-1 mt-1">
                  {metric.value == null || metric.value === 0 ? (
                    <span className="text-sm font-medium text-slate-400 mt-2">No data for this period</span>
                  ) : (
                    <>
                      <span
                        className={`text-4xl font-mono tracking-tight font-medium ${
                          metric.alert ? "text-amber-600" : "text-slate-900"
                        }`}
                      >
                        {metric.value}
                      </span>
                      <span className="text-sm font-medium text-slate-400 ml-1">{metric.unit}</span>
                    </>
                  )}
                </div>
                {metric.value != null && metric.value !== 0 && (
                  <p className="text-xs text-slate-400 mt-2 font-medium">{metric.caption}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <InsightSection patientId="patient-123" />
    </div>
  );
};
