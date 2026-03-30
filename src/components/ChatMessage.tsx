"use client";

import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, ChevronDown, FileCode, CheckCircle2, RotateCcw, 
  Undo2, Copy, Check, Edit2, CheckCircle, Zap, ShieldCheck, 
  Activity, X, Info, CornerDownRight, Clock, FileEdit, FilePlus,
  Check as CheckIcon, X as CloseIcon, Trash2, Sparkles, Database, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';
import { storage } from '@/lib/storage';

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
  const [isThoughtOpen, setIsThoughtOpen] = useState(true);
  const [actionExecuted, setActionExecuted] = useState(false);

  // Parse for Neural Actions: [ACTION: TYPE {DATA}]
  const { mainContent, action } = useMemo(() => {
    const actionMatch = content.match(/\[ACTION:\s*(\w+)\s*(\{[\s\S]*?\})\]/);
    if (actionMatch) {
      try {
        return {
          mainContent: content.replace(actionMatch[0], "").trim(),
          action: { type: actionMatch[1], data: JSON.parse(actionMatch[2]) }
        };
      } catch (e) {
        return { mainContent: content, action: null };
      }
    }
    return { mainContent: content, action: null };
  }, [content]);

  const handleExecuteAction = async () => {
    if (!action) return;
    try {
      const userId = JSON.parse(localStorage.getItem('yobest_demo_user') || '{}').id || 'demo-user';
      
      if (action.type === 'ADD_RABBIT') {
        await storage.insert('rabbits', userId, action.data);
        showSuccess(`Neural Action: Added ${action.data.name} to inventory.`);
      } else if (action.type === 'UPDATE_RABBIT') {
        await storage.update('rabbits', userId, action.data.id, action.data.updates);
        showSuccess(`Neural Action: Updated ${action.data.id}.`);
      }
      
      setActionExecuted(true);
    } catch (err) {
      showError("Neural Action failed to execute.");
    }
  };

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
    <div className="flex flex-col gap-4 mb-12 group animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        {mainContent}
      </div>

      {action && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-8 rounded-[2.5rem] border transition-all duration-500",
            actionExecuted ? "bg-emerald-500/10 border-emerald-500/30" : "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.1)]"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", actionExecuted ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400")}>
                <Database size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Proposed Neural Action</p>
                <p className="text-lg font-black">{action.type.replace('_', ' ')}</p>
              </div>
            </div>
            {actionExecuted ? (
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle size={16} /> Executed
              </div>
            ) : (
              <button 
                onClick={handleExecuteAction}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
              >
                <Play size={14} className="fill-current" /> Run Action
              </button>
            )}
          </div>
          <div className="bg-black/40 rounded-2xl p-6 font-mono text-[11px] text-indigo-300/60 overflow-x-auto border border-white/5">
            <pre>{JSON.stringify(action.data, null, 2)}</pre>
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