"use client";

import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, X, Filter, Circle, AlertCircle, Info as InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemMessagesProps {
  messages: any[];
  isOpen: boolean;
  onToggle: () => void;
}

const SystemMessages: React.FC<SystemMessagesProps> = ({ messages, isOpen, onToggle }) => {
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.type === filter;
  });

  const counts = {
    info: messages.filter(m => m.type === 'info').length,
    warn: messages.filter(m => m.type === 'warn').length,
    error: messages.filter(m => m.type === 'error').length,
  };

  return (
    <div className={cn(
      "border-t border-white/5 bg-[#0a0a0a] transition-all duration-300 flex flex-col",
      isOpen ? 'h-64' : 'h-10'
    )}>
      <div 
        className="h-10 px-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors shrink-0"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">System Console</span>
          {isOpen && (
            <div className="flex items-center gap-4 ml-8">
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter('all'); }}
                className={cn("text-[9px] font-bold uppercase tracking-widest transition-colors", filter === 'all' ? "text-white" : "text-white/20 hover:text-white/40")}
              >
                All
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter('info'); }}
                className={cn("flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors", filter === 'info' ? "text-indigo-400" : "text-white/20 hover:text-white/40")}
              >
                <InfoIcon size={10} /> Info ({counts.info})
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter('warn'); }}
                className={cn("flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors", filter === 'warn' ? "text-amber-400" : "text-white/20 hover:text-white/40")}
              >
                <AlertCircle size={10} /> Warn ({counts.warn})
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter('error'); }}
                className={cn("flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors", filter === 'error' ? "text-rose-400" : "text-white/20 hover:text-white/40")}
              >
                <Circle size={8} className="fill-current" /> Error ({counts.error})
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!isOpen && (
            <div className="flex items-center gap-3 text-[9px] font-bold">
              <span className="text-rose-400">{counts.error} Errors</span>
              <span className="text-amber-400">{counts.warn} Warnings</span>
            </div>
          )}
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>
      
      {isOpen && (
        <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-1 custom-scrollbar bg-black/20">
          {filteredMessages.map((msg, i) => (
            <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-white/10 shrink-0">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
              <span className={cn(
                "shrink-0 font-bold",
                msg.type === 'error' ? 'text-rose-400' : msg.type === 'warn' ? 'text-amber-400' : 'text-indigo-400'
              )}>
                {msg.type.toUpperCase()}
              </span>
              <span className="text-white/60 break-all">{msg.text}</span>
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <div className="text-white/10 italic py-4 text-center">No logs matching filter.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemMessages;