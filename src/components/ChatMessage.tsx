"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileCode, CheckCircle2, RotateCcw, Undo2, Copy, Check, Edit2, CheckCircle, Zap, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import CodeFrame from './CodeFrame';
import { showSuccess } from '@/utils/toast';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  fileChange?: {
    name: string;
    path: string;
    summary: string;
  };
  model?: string;
  timestamp: string;
  onApplyCode?: (code: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  role, 
  content, 
  thought, 
  fileChange, 
  model, 
  timestamp,
  onApplyCode 
}) => {
  const [isThoughtOpen, setIsThoughtOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    setIsApproved(true);
    showSuccess("Changes approved and merged into neural context.");
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/```(\w+)?\n([\s\S]*?)```/g);
    if (parts.length === 1) return <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>;

    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        if (parts[i]) elements.push(<p key={`text-${i}`} className="text-sm leading-relaxed whitespace-pre-wrap mb-4">{parts[i]}</p>);
      } else if (i % 3 === 1) {
        const language = parts[i] || 'javascript';
        const code = parts[i + 1];
        if (code) {
          elements.push(<CodeFrame key={`code-${i}`} code={code} language={language} onAdd={onApplyCode} />);
        }
        i++;
      }
    }
    return elements;
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-lg">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mb-8 group">
      {/* AI Metadata Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Zap size={16} className="fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{model || 'Yobest AI'}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                <ShieldCheck size={10} /> 98% Confidence
              </div>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-400">
                <Activity size={10} /> High Impact
              </div>
            </div>
          </div>
        </div>
        <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">{new Date(timestamp).toLocaleTimeString()}</span>
      </div>

      {thought && (
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="flex items-center gap-2 text-[11px] font-bold text-white/30 hover:text-white/60 transition-colors w-fit"
          >
            {isThoughtOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="uppercase tracking-widest">Neural Processing</span>
          </button>
          
          <AnimatePresence>
            {isThoughtOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-4 border-l border-white/10 text-sm text-white/40 leading-relaxed italic mb-2 overflow-hidden"
              >
                {thought}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="text-sm text-white/90 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5">
        {renderContent(content)}
      </div>

      {fileChange && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                <FileCode size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{fileChange.name}</h4>
                <p className="text-[10px] text-white/30 font-medium">{fileChange.path}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white/60 transition-all">
              <Edit2 size={14} /> Edit <ChevronRight size={14} />
            </button>
          </div>
          <p className="text-[11px] text-white/40 font-medium leading-relaxed">
            {fileChange.summary}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-4">
          <button onClick={handleCopy} className="text-white/20 hover:text-white transition-colors">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
          
          {isApproved ? (
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={14} />
              <span>Approved</span>
              <span className="text-white/10 ml-1">auto</span>
            </div>
          ) : (
            <button 
              onClick={handleApprove}
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
            >
              <CheckCircle size={12} />
              Approve
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white/60">
            <Undo2 size={14} /> Undo
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white/60">
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;