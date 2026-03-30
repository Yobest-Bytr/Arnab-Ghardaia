"use client";

import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, ChevronDown, CheckCircle2, Info, Clock, 
  Play, ShoppingBag, Heart, Database, ListChecks, Sparkles, Palette, Cpu, Zap, Activity, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';

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

  const parsedData = useMemo(() => {
    const chartMatch = content.match(/<<<CHART:\s*([\s\S]*?)>>>/);
    const planMatch = content.match(/<<<PLAN:\s*([\s\S]*?)>>>/);
    const styleMatch = content.match(/<<<STYLE:\s*([\s\S]*?)>>>/);

    let chart = null;
    let plan = null;
    let style = null;

    try {
      if (chartMatch) chart = JSON.parse(chartMatch[1].trim());
    } catch (e) {}
    
    try {
      if (planMatch) plan = planMatch[1].split('\n').filter(line => line.trim());
    } catch (e) {}
    
    try {
      if (styleMatch) style = JSON.parse(styleMatch[1].trim());
    } catch (e) {}

    const cleanContent = content
      .replace(/<<<CHART:[\s\S]*?>>>/g, "")
      .replace(/<<<PLAN:[\s\S]*?>>>/g, "")
      .replace(/<<<STYLE:[\s\S]*?>>>/g, "")
      .trim();

    return { cleanContent, chart, plan, style };
  }, [content]);

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-10">
        <div className="max-w-[85%] space-y-4">
          {image && (
            <motion.img 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={image} 
              alt="User Upload" 
              className="w-full max-w-sm rounded-[2.5rem] border border-white/10 shadow-2xl ml-auto" 
            />
          )}
          <div className="bg-indigo-600 text-white p-8 rounded-[3rem] rounded-tr-none shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <p className="text-base leading-relaxed whitespace-pre-wrap font-bold relative z-10">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mb-16 group relative">
      {/* Neural Glow Background */}
      <div className="absolute -inset-10 bg-indigo-500/5 blur-[100px] rounded-[5rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      {thought && (
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="flex items-center gap-3 text-[10px] font-black text-white/20 hover:text-indigo-400 transition-all w-fit uppercase tracking-[0.3em] group/thought"
          >
            <div className={cn(
              "w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center transition-all",
              isThoughtOpen ? "bg-indigo-500/20 text-indigo-400" : "group-hover/thought:bg-white/10"
            )}>
              {isThoughtOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            <span className="flex items-center gap-2">
              <Cpu size={12} className="animate-pulse" /> Neural Processing
            </span>
          </button>
          <AnimatePresence>
            {isThoughtOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="pl-6 border-l-2 border-indigo-500/20 text-xs text-white/30 leading-relaxed italic mb-4 overflow-hidden whitespace-pre-wrap font-medium"
              >
                {thought}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div 
        className={cn(
          "text-base leading-relaxed whitespace-pre-wrap font-medium p-10 rounded-[3.5rem] border transition-all duration-700 relative overflow-hidden",
          parsedData.style?.bg ? "" : "bg-white/5 border-white/10 backdrop-blur-2xl group-hover:border-indigo-500/30 shadow-2xl"
        )}
        style={{ 
          backgroundColor: parsedData.style?.bg ? `${parsedData.style.bg}30` : undefined,
          borderColor: parsedData.style?.bg ? `${parsedData.style.color}50` : undefined,
          boxShadow: parsedData.style?.bg ? `0 0 60px ${parsedData.style.color}15` : undefined,
          color: parsedData.style?.color
        }}
      >
        {/* Animated Gradient Overlay */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="relative z-10">
          {parsedData.cleanContent}
        </div>
      </div>

      {/* Render AI Chart */}
      {parsedData.chart && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="my-8 p-10 rounded-[3.5rem] bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 ai-gradient" />
          <div className="flex items-center justify-between mb-10">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <TrendingUp size={20} />
              </div>
              {parsedData.chart.title || "Neural Data Visualization"}
            </h4>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-75" />
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {parsedData.chart.type === 'bar' ? (
                <BarChart data={parsedData.chart.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#ffffff30', fontWeight: 'bold' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020408', border: '1px solid #ffffff10', borderRadius: '1.5rem', padding: '1rem' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '13px' }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {parsedData.chart.data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart data={parsedData.chart.data}>
                  <defs>
                    <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#ffffff30', fontWeight: 'bold' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020408', border: '1px solid #ffffff10', borderRadius: '1.5rem', padding: '1rem' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '13px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={5} fill="url(#colorAi)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Render AI Project Plan */}
      {parsedData.plan && (
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="my-8 p-10 rounded-[3.5rem] bg-indigo-600/10 border border-indigo-500/20 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400 mb-10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <ListChecks size={20} />
            </div>
            Strategic Project Plan
          </h4>
          <div className="space-y-6 relative z-10">
            {parsedData.plan.map((step, i) => (
              <div key={i} className="flex items-start gap-6 group/step">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-xs font-black text-indigo-400 shrink-0 mt-0.5 group-hover/step:bg-indigo-600 group-hover/step:text-white group-hover/step:scale-110 transition-all duration-500 border border-indigo-500/20">
                  {i + 1}
                </div>
                <p className="text-base font-bold text-white/70 leading-relaxed group-hover/step:text-white transition-colors">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between mt-4 px-8">
        <div className="flex items-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <Clock size={12} /> {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="flex items-center gap-2 text-indigo-400/60">
            <Zap size={12} className="fill-current" /> {model || 'Neural Link'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;