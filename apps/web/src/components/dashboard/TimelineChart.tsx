import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineData {
  glucose_data: { timestamp: string; value: number }[];
  events: { timestamp: string; type: string; value: number }[];
}

export const TimelineChart = ({ data }: { data: TimelineData }) => {
  const chartData = useMemo(() => {
    return data.glucose_data.map((g) => {
      const gTime = parseISO(g.timestamp);
      // Find events within 10 minutes of this reading
      const nearbyEvents = data.events.filter(
        (e) => Math.abs(differenceInMinutes(gTime, parseISO(e.timestamp))) <= 10
      );
      return {
        ...g,
        time: gTime.getTime(),
        displayTime: format(gTime, "HH:mm"),
        events: nearbyEvents,
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white/80 backdrop-blur-md p-3 border border-slate-200 shadow-xl rounded-xl text-xs min-w-[140px]">
          <p className="text-slate-500 font-medium mb-1 border-b border-slate-100 pb-1">{point.displayTime}</p>
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-xl font-black text-slate-900">{payload[0].value}</span>
            <span className="text-slate-400 font-medium text-[10px] uppercase">mg/dL</span>
          </div>
          {point.events?.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {point.events.map((e: any, idx: number) => (
                <div key={idx} className="px-2 py-1.5 bg-white rounded-lg border border-slate-100 flex justify-between items-center gap-3 shadow-sm">
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${e.type === 'meal' ? 'text-amber-600' : 'text-blue-600'}`}>
                    {e.type}
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {e.value}{e.type === 'meal' ? 'g' : 'u'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Glucose & Events Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#000" strokeOpacity={0.05} strokeDasharray="3 3" />
            <XAxis 
              dataKey="time"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(t) => format(t, "HH:mm")}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              minTickGap={30}
            />
            <YAxis 
              domain={[40, 300]}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              ticks={[70, 180, 250]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0f172a"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#0f172a", strokeWidth: 2, stroke: "#fff" }}
              animationDuration={1000}
            />
            {data.events.map((event, i) => (
              <ReferenceDot
                key={`event-${i}`}
                x={parseISO(event.timestamp).getTime()}
                y={60}
                r={5}
                fill={event.type === 'meal' ? "#f59e0b" : "#3b82f6"}
                stroke="#fff"
                strokeWidth={2}
                className="drop-shadow-sm"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
