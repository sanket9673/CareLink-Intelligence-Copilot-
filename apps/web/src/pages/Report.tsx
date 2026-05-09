import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { usePatientStore } from '@/store/usePatientStore';
import { TimelineChart } from '@/components/dashboard/TimelineChart';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';

export const Report = () => {
  const { patientId } = useParams();
  const [reportData, setReportData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(`http://localhost:8000/reports/${patientId}`);
      const data = await res.json();
      setReportData(data);
    };

    const fetchTimeline = async () => {
      const res = await fetch(`http://localhost:8000/analytics/patients/${patientId}/timeline`);
      const data = await res.json();
      setTimelineData(data);
    };

    fetchReport();
    fetchTimeline();
  }, [patientId]);

  if (!reportData) return <div className="p-8 text-center">Loading Clinical Report...</div>;

  const { patient, metrics, insight } = reportData;

  return (
    <div className="bg-white min-h-screen text-slate-900 selection:bg-blue-100">
      {/* Action Bar (Hidden in Print) */}
      <div className="max-w-5xl mx-auto py-4 px-6 flex justify-between items-center border-b border-slate-100 print:hidden mb-8">
        <h1 className="text-xl font-bold text-slate-400">Clinical Summary Report</h1>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer size={16} />
          Generate PDF
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-10 pb-20 space-y-10 print:px-0 print:pb-0">
        {/* Header Section */}
        <header className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
              {patient.name}
            </h2>
            <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
              <span>DOB: {format(parseISO(patient.dob), 'MMM dd, yyyy')}</span>
              <span>Patient ID: {patient.id}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Generated On</p>
            <p className="text-sm font-bold text-slate-900">{format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
        </header>

        {/* Metabolic Scorecard */}
        <section>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Metabolic Scorecard (Last 7 Days)</h3>
          <div className="grid grid-cols-4 gap-6">
            <Card className="border-2 border-slate-900 shadow-none rounded-none">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase text-slate-400 font-sans">Time in Range</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-black">{metrics.tir.percentage_in_range.toFixed(1)}%</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">70-180 mg/dL</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-slate-900 shadow-none rounded-none">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase text-slate-400 font-sans">Avg Glucose</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-black">{Math.round(metrics.avg_glucose)}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">mg/dL</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-slate-900 shadow-none rounded-none">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase text-slate-400 font-sans">GMI</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-black">{metrics.gmi.toFixed(1)}%</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated A1c</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-slate-900 shadow-none rounded-none">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase text-slate-400 font-sans">Hyperglycemia</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-red-600">
                <div className="text-2xl font-black">{metrics.tir.percentage_above.toFixed(1)}%</div>
                <div className="text-[10px] font-bold uppercase opacity-60">&gt; 180 mg/dL</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="bg-slate-50 p-8 border-l-8 border-slate-900 break-inside-avoid">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Executive Summary</h3>
          <div className="font-serif">
            <h4 className="text-xl font-bold text-slate-900 mb-3">{insight.summary}</h4>
            <div className="text-slate-700 leading-relaxed text-lg whitespace-pre-line prose prose-slate max-w-none">
              {insight.recommendation}
            </div>
          </div>
        </section>

        {/* Data Visualization */}
        <section className="break-inside-avoid">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Correlation Timeline (Last 24h)</h3>
          <div className="border-2 border-slate-100 p-6">
            {timelineData ? <TimelineChart data={timelineData} /> : <div>Loading timeline...</div>}
          </div>
        </section>

        {/* Footer & Disclaimer */}
        <footer className="pt-20 border-t border-slate-100">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            <span>CareLink Intelligence Copilot - Clinical Summary</span>
            <span>Confidential - For Patient Use Only</span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-300 italic">
            Disclaimer: This report is generated by an AI-assisted diagnostic tool and is intended for clinical review by a qualified healthcare professional. It should not be used as the sole basis for making medical decisions. Data reflects the period provided and may be subject to sensor inaccuracies.
          </p>
        </footer>
      </div>
    </div>
  );
};
