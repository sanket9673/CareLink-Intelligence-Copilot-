import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGenerateInsight } from "../../hooks/useGenerateInsight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Typewriter component for fluid text reveal
const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    if (!text) return;
    
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 15); // Smooth, fast typing speed
    
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

export const InsightSection = ({ patientId }: { patientId: string }) => {
  const { mutate, data, isPending } = useGenerateInsight();
  const [followUp, setFollowUp] = useState("");

  const handleGenerate = () => {
    mutate({ patientId, persona: followUp || "patient" });
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUp.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="mt-12 max-w-2xl mx-auto w-full">
      {!data && !isPending && (
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            className="px-8 py-3.5 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Generate Insight
          </button>
        </div>
      )}

      {isPending && (
        <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-slate-200 rounded-md w-1/3"></div>
              <div className="space-y-3 mt-4">
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                <div className="h-4 bg-slate-100 rounded w-4/6"></div>
              </div>
              <div className="mt-8 space-y-3">
                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                 <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              </div>
            </div>
            <p className="text-center text-sm font-medium text-slate-400 mt-8 animate-pulse">Analyzing metabolic data...</p>
          </CardContent>
        </Card>
      )}

      {data && !isPending && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="px-8 pt-8 pb-4">
              <CardTitle className="font-medium text-lg text-slate-900">
                {data.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="text-slate-600 space-y-6 leading-relaxed">
                <p>
                  <TypewriterText text={data.summary} />
                </p>

                {data.evidence_points && data.evidence_points.length > 0 && (
                  <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600 marker:text-slate-300">
                    {data.evidence_points.map((point, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                      >
                        {point}
                      </motion.li>
                    ))}
                  </ul>
                )}

                {data.recommendation && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50"
                  >
                    <h4 className="font-medium text-amber-900 mb-2">Recommendation</h4>
                    <p className="text-amber-800/80 text-sm leading-relaxed">{data.recommendation}</p>
                  </motion.div>
                )}
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-xs text-slate-400 mt-8 pt-6 border-t border-slate-50"
                >
                  {data.disclaimer}
                </motion.p>
              </div>

              <form onSubmit={handleFollowUpSubmit} className="mt-8 flex gap-3">
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Ask a follow-up or refine the prompt..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 transition-all text-slate-700 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!followUp.trim()}
                  className="px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
                >
                  Ask
                </button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
