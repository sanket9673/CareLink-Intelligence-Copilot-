import React from 'react';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  // Using a mock patient ID for Phase 3
  const patientId = 'test-patient-123';
  const { data: dashboardData, isLoading } = useDashboardMetrics(patientId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 font-medium">Loading metrics...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-medium text-slate-700">No data available</h2>
        <p className="text-slate-500">We couldn't find any recent metrics for your account.</p>
      </div>
    );
  }

  const { time_in_range, daily_summary } = dashboardData;

  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Today</h1>
        <p className="text-slate-500 font-medium">{daily_summary?.date || 'No date available'}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time In Range Card */}
        <motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
          <Card className="rounded-3xl border border-slate-200 shadow-sm h-full p-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Time In Range
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center">
              <div className="text-5xl font-mono tracking-tight text-slate-900 mt-2">
                {time_in_range ? `${(time_in_range.percentage_in_range * 100).toFixed(0)}%` : '--'}
              </div>
              <p className="text-sm text-slate-400 mt-4 font-medium">
                Target: 70–180 mg/dL
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Avg Glucose Card */}
        <motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
          <Card className="rounded-3xl border border-slate-200 shadow-sm h-full p-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Avg Glucose
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center">
              <div className={`text-5xl font-mono tracking-tight mt-2 ${daily_summary?.avg_glucose && daily_summary.avg_glucose > 180 ? 'text-amber-600' : 'text-slate-900'}`}>
                {daily_summary?.avg_glucose ? daily_summary.avg_glucose.toFixed(0) : '--'}
              </div>
              <p className="text-sm text-slate-400 mt-4 font-medium">
                mg/dL Daily Average
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Insulin Card */}
        <motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
          <Card className="rounded-3xl border border-slate-200 shadow-sm h-full p-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Insulin
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center">
              <div className="text-5xl font-mono tracking-tight text-slate-900 mt-2">
                {daily_summary?.total_insulin ? daily_summary.total_insulin.toFixed(1) : '--'}
              </div>
              <p className="text-sm text-slate-400 mt-4 font-medium">
                Units delivered today
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
