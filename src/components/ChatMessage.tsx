"use client";

import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, ChevronDown, CheckCircle2, Info, Clock, 
  Play, ShoppingBag, Heart, Database, ListChecks, Sparkles, Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';
import { storage } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  model?: string;
  timestamp: string;
  image?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  role, 
  content, 
  thought, 
  model, 
  timestamp,
  image
}) => {
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);

  // Parse special AI tags
  const parsedData = useMemo(() => {
    const chartMatch = content.match(/\[CHART:\s*([\s\S]*?)\]/);
    const planMatch = content.match(/\[PLAN:\s*([\s\S]*?)\]/);
    const styleMatch = content.match(/\[STYLE:\s*([\s\S]*?)\]/);

    let chart = null;
    let plan = null;
    let style = null;

    try {
      if (chartMatch) chart = JSON.parse(chartMatch[1]);
      if (planMatch) plan = planMatch[1].split('\n').filter(line => line.trim());
      if (styleMatch) style = JSON.parse(styleMatch[1]);
    } catch (e) {
      console.error("Failed to parse AI tag", e);
    }

    // Clean content by removing tags
    const cleanContent = content
      .replace(/\[CHART:[\s\S]*?\]/g, "")
      .replace(/\[PLAN:[\s\S]*?\]/g, "")
      .replace(/\[STYLE:[\s\S]*?\]/g, "")
      .trim();

    return { cleanContent, chart, plan, style };
  }, [content]);

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-8">
        <div className="max-w-[80%] space-y-3">
          {image && (
            <img src={image} alt="User Upload" className="w-full max-w-sm rounded-[2rem] border border-white/10 shadow-2xl ml-auto" />
          )}
          <div className="bg-indigo-600 text-white p-6 rounded-[2.5rem] rounded-tr-none shadow-xl border border-white/10">
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-bold">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col gap-4 mb-12 group animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ 
        color: parsedData.style?.color,
        backgroundColor: parsedData.style?.bg ? `${parsedData.style.bg}10` : undefined,
        padding: parsedData.style?.bg ? '2rem' : undefined,
        borderRadius: parsedData.style?.bg ? '2.5rem' : undefined,
        border: parsedData.style?.bg ? `1px solid ${parsedData.style.color}20` : undefined
      }}
    >
      {thought && (
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="flex items-center gap-2 text-[10px] font-black text-white/20 hover:text-white/40 transition-colors w-fit uppercase tracking-[0.2em]"
          >
            {isThoughtOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="flex items-center gap-2">
              <Info size={12} /> Neural Processing
            </span>
          </button>
          <AnimatePresence>
            {isThoughtOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-4 border-l border-white/5 text-xs text-white/30 leading-relaxed italic mb-2 overflow-hidden whitespace-pre-wrap"
              >
                {thought}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="text-sm leading-relaxed whitespace-pre-wrap text-white/80 font-medium">
        {parsedData.cleanContent}
      </div>

      {/* Render AI Chart */}
      {parsedData.chart && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="my-6 p-8 rounded-[2.5rem] bg-white/5 border border-white/10">
          <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-400" /> {parsedData.chart.title || "Neural Data Visualization"}
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {parsedData.chart.type === 'bar' ? (
                <BarChart data={parsedData.chart.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#ffffff40' }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#020408', border: 'none', borderRadius: '1rem' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {parsedData.chart.data.map((entry: any, index: number) => (
                      <rect key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart data={parsedData.chart.data}>
                  <defs>
                    <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#020408', border: 'none', borderRadius: '1rem' }} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fill="url(#colorAi)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Render AI Project Plan */}
      {parsedData.plan && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="my-6 p-8 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20">
          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
            <ListChecks size={16} /> Strategic Project Plan
          </h4>
          <div className="space-y-4">
            {parsedData.plan.map((step, i) => (
              <div key={i} className="flex items-start gap-4 group/step">
                <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 mt-0.5 group-hover/step:bg-indigo-600 group-hover/step:text-white transition-all">
                  {i + 1}
                </div>
                <p className="text-sm font-bold text-white/70 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-4 text-[10px] font-bold text-white/20">
          <Clock size={12} /> {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <span className="mx-1">•</span>
          <span className="text-indigo-400/60">{model || 'Neural Link'}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;