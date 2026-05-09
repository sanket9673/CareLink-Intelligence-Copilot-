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
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-xl text-xs">
          <p className="text-slate-400 font-medium mb-1">{point.displayTime}</p>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-lg font-bold text-slate-900">{payload[0].value}</span>
            <span className="text-slate-400">mg/dL</span>
          </div>
          {point.events?.map((e: any, idx: number) => (
            <div key={idx} className="mt-1 px-2 py-1 bg-slate-50 rounded border border-slate-100 flex justify-between gap-4">
              <span className="capitalize font-semibold text-blue-600">{e.type}</span>
              <span className="font-mono">{e.value}{e.type === 'meal' ? 'g' : 'u'}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Glucose & Event Correlation
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4" />
            <XAxis 
              dataKey="time"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(t) => format(t, "HH:mm")}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
            />
            <YAxis 
              domain={[40, 300]}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              ticks={[70, 180, 250]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#0f172a" }}
            />
            {data.events.map((event, i) => (
              <ReferenceDot
                key={i}
                x={parseISO(event.timestamp).getTime()}
                y={100}
                r={4}
                fill={event.type === 'meal' ? "#f59e0b" : "#3b82f6"}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
