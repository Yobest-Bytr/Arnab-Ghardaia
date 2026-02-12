"use client";

import React, { useState } from 'react';
import { 
  ChevronRight, ChevronDown, FileCode, CheckCircle2, RotateCcw, 
  Undo2, Copy, Check, Edit2, CheckCircle, Zap, ShieldCheck, 
  Activity, X, Info, CornerDownRight, Clock, FileEdit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import CodeFrame from './CodeFrame';
import { showSuccess } from '@/utils/toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  onApplyCode?: (code: string, mode: 'replace' | 'append') => void;
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
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);

  // Improved code extraction that handles truncated blocks
  const extractCode = (text: string) => {
    // Try to find a complete block first
    const completeMatch = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (completeMatch) return completeMatch[1];
    
    // If no complete block, look for an unclosed one at the end (common with truncation)
    const unclosedMatch = text.match(/```(?:\w+)?\n([\s\S]*)$/);
    if (unclosedMatch) return unclosedMatch[1];
    
    return null;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    const code = extractCode(content);
    if (code && onApplyCode) {
      onApplyCode(code, 'replace');
      setIsApproved(true);
      showSuccess("Changes merged into workspace.");
    } else {
      showSuccess("Approved (no code found to merge).");
      setIsApproved(true);
    }
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/```(\w+)?\n([\s\S]*?)(?:```|$)/g);
    if (parts.length === 1) return <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/80">{text}</p>;

    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        if (parts[i]) elements.push(<p key={`text-${i}`} className="text-sm leading-relaxed whitespace-pre-wrap text-white/80 mb-4">{parts[i]}</p>);
      } else if (i % 3 === 1) {
        const language = parts[i] || 'javascript';
        const code = parts[i + 1];
        if (code) {
          elements.push(<CodeFrame key={`code-${i}`} code={code} language={language} onApply={onApplyCode} />);
        }
        i++;
      }
    }
    return elements;
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-lg border border-white/10">
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mb-10 group animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Thought Section */}
      {thought && (
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="flex items-center gap-2 text-[11px] font-black text-white/20 hover:text-white/40 transition-colors w-fit uppercase tracking-widest"
          >
            {isThoughtOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="flex items-center gap-2">
              <Info size={12} /> Thought <span className="text-white/10 font-medium normal-case tracking-normal">Analyzing Request</span>
            </span>
          </button>
          
          <AnimatePresence>
            {isThoughtOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-4 border-l border-white/5 text-sm text-white/30 leading-relaxed italic mb-2 overflow-hidden"
              >
                {thought}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-4">
        {renderContent(content)}
      </div>

      {/* File Change Card */}
      {fileChange && (
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative overflow-hidden group/card">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <FileCode size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  {fileChange.name}
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{fileChange.path}</span>
                </h4>
                <p className="text-[11px] text-white/40 font-medium mt-1">
                  Summary: {fileChange.summary}
                </p>
              </div>
            </div>
            <button className="p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <FileEdit size={18} />
            </button>
          </div>
          
          {/* Approval Workflow */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleApprove}
                disabled={isApproved}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                  isApproved 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                )}
              >
                {isApproved ? <CheckCircle2 size={14} /> : <Check size={14} />}
                {isApproved ? "Approved" : "Approve"}
              </button>
              <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest text-white/40 border border-white/10 transition-all">
                <X size={14} /> Reject
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch 
                  id="auto-approve" 
                  checked={autoApprove} 
                  onCheckedChange={setAutoApprove}
                  className="scale-75"
                />
                <Label htmlFor="auto-approve" className="text-[10px] font-black text-white/20 uppercase tracking-widest cursor-pointer">Auto</Label>
              </div>
              {isApproved && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle size={12} /> Merged
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/20">
            <Clock size={12} /> {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span className="mx-1">•</span>
            <span className="text-indigo-400/60">{model || 'Auto'}</span>
          </div>
          <button onClick={handleCopy} className="text-white/20 hover:text-white transition-colors p-1">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest text-white/40 border border-white/5 transition-all">
            <Undo2 size={14} /> Undo
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest text-white/40 border border-white/5 transition-all">
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;