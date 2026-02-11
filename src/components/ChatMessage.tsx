"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileCode, Edit3, CheckCircle2, RotateCcw, Undo2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, thought, fileChange, model, timestamp }) => {
  const [isThoughtOpen, setIsThoughtOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {/* Thought Section */}
      {thought && (
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="flex items-center gap-2 text-[11px] font-bold text-white/30 hover:text-white/60 transition-colors w-fit"
          >
            {isThoughtOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="uppercase tracking-widest">Thought</span>
            <span className="font-medium normal-case">Addressing the request</span>
          </button>
          
          {isThoughtOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pl-4 border-l border-white/10 text-sm text-white/50 leading-relaxed italic"
            >
              {thought}
            </motion.div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>

      {/* File Change Card */}
      {fileChange && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
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
              Edit <ChevronRight size={14} />
            </button>
          </div>
          <p className="text-[11px] text-white/40 font-medium leading-relaxed">
            Summary: {fileChange.summary}
          </p>
        </div>
      )}

      {/* Status & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handleCopy} className="text-white/20 hover:text-white transition-colors">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
          <div className="flex items-center gap-2 text-emerald-400/60 text-[11px] font-bold">
            <CheckCircle2 size={14} />
            <span>Approved</span>
            <span className="text-white/20 font-medium ml-1">auto</span>
          </div>
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
      
      <div className="text-[9px] font-black text-white/10 uppercase tracking-widest">
        {new Date(timestamp).toLocaleTimeString()} • {model}
      </div>
    </div>
  );
};

import { motion } from 'framer-motion';
export default ChatMessage;