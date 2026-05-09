import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGenerateInsight, type ChatMessage } from "../../hooks/useGenerateInsight";
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
  const { mutate, isPending } = useGenerateInsight();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUp, setFollowUp] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending]);

  const handleGenerate = () => {
    const userMessage: ChatMessage = { 
      role: "user", 
      content: followUp || "Generate insight" 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setFollowUp("");

    mutate(
      { 
        patientId, 
        persona: followUp || "patient",
        history: messages
      },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.summary, insight: data }
          ]);
        }
      }
    );
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUp.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="mt-12 max-w-2xl mx-auto w-full">
      {messages.length === 0 && !isPending && (
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            className="px-8 py-3.5 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Generate Insight
          </button>
        </div>
      )}

      {(messages.length > 0 || isPending) && (
        <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden flex flex-col h-[600px]">
          <CardHeader className="px-8 pt-8 pb-4 border-b border-slate-50 shrink-0">
            <CardTitle className="font-medium text-lg text-slate-900">
              Copilot Chat
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto px-8 py-6 space-y-6 flex flex-col">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-5 ${
                  msg.role === "user" 
                    ? "bg-slate-900 text-white rounded-br-none" 
                    : "bg-slate-50 border border-slate-100 rounded-bl-none text-slate-700"
                }`}>
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="space-y-4">
                      {msg.insight && (
                        <h4 className="font-medium text-slate-900 mb-2">
                          {msg.insight.title}
                        </h4>
                      )}
                      <p className="text-sm leading-relaxed">
                        {idx === messages.length - 1 ? (
                          <TypewriterText text={msg.content} />
                        ) : (
                          msg.content
                        )}
                      </p>
                      
                      {msg.insight?.evidence_points && msg.insight.evidence_points.length > 0 && (
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-sm text-slate-600 marker:text-slate-300">
                          {msg.insight.evidence_points.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      )}

                      {msg.insight?.recommendation && (
                        <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
                          <h5 className="font-medium text-amber-900 mb-1 text-sm">Recommendation</h5>
                          <p className="text-amber-800/80 text-xs leading-relaxed">{msg.insight.recommendation}</p>
                        </div>
                      )}
                      
                      {msg.insight?.disclaimer && (
                        <p className="text-[10px] text-slate-400 mt-4 pt-4 border-t border-slate-200/50">
                          {msg.insight.disclaimer}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isPending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full justify-start"
              >
                <div className="max-w-[85%] bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-none p-5">
                  <div className="flex space-x-2 items-center h-5">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-6 bg-white border-t border-slate-50 shrink-0">
            <form onSubmit={handleFollowUpSubmit} className="flex gap-3">
              <input
                type="text"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="Ask a follow-up or refine the prompt..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 transition-all text-slate-700 placeholder:text-slate-400"
                disabled={isPending}
              />
              <button
                type="submit"
                disabled={!followUp.trim() || isPending}
                className="px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </Card>
      )}
    </div>
  );
};
