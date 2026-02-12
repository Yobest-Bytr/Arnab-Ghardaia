"use client";

import React, { useState } from 'react';
import { 
  ChevronRight, ChevronDown, FileCode, CheckCircle2, RotateCcw, 
  Undo2, Copy, Check, Edit2, CheckCircle, Zap, ShieldCheck, 
  Activity, X, Info, CornerDownRight
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
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    setIsApproved(true);
    showSuccess("Changes approved and merged.");
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
    <div className="flex flex-col gap-4 mb-8 group animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Thought Section */}
      {thought && (
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="flex items-center gap-2 text-[11px] font-bold text-white/30 hover:text-white/60 transition-colors w-fit"
          >
            {isThoughtOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="uppercase tracking-widest flex items-center gap-2">
              <Info size={12} /> Thought <span className="text-white/10 font-medium normal-case">Addressing the request</span>
            </span>
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

      {/* Main Content */}
      <div className="text-sm text-white/90 leading-relaxed">
        {renderContent(content)}
      </div>

      {/* File Change Card */}
      {fileChange && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <FileCode size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {fileChange.name}
                  <span className="text-[10px] font-medium text-white/20">{fileChange.path}</span>
                </h4>
                <p className="text-[11px] text-white/40 font-medium mt-0.5">
                  Summary: {fileChange.summary}
                </p>
              </div>
            </div>
            <button className="p-2 text-white/20 hover:text-white transition-colors">
              <Edit2 size={16} />
            </button>
          </div>
          
          {/* Approval Workflow */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleApprove}
                disabled={isApproved}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                  isApproved 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                )}
              >
                <Check size={14} /> {isApproved ? "Approved" : "Approve"}
              </button>
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white border border-white/10 transition-all">
                <X size={14} /> Reject
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                id="auto-approve" 
                checked={autoApprove} 
                onCheckedChange={setAutoApprove}
                className="scale-75"
              />
              <Label htmlFor="auto-approve" className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Auto-approve</Label>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-medium text-white/20 flex items-center gap-2">
            <Clock size={12} /> {new Date(timestamp).toLocaleTimeString()} • {model || 'Auto'}
          </span>
          <button onClick={handleCopy} className="text-white/20 hover:text-white transition-colors">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white/60 border border-white/5">
            <Undo2 size={14} /> Undo
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white/60 border border-white/5">
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      </div>
    </div>
  );
};

import { Clock } from 'lucide-react';
export default ChatMessage;