"use client";

import React, { useState } from 'react';
import { 
  ChevronRight, ChevronDown, FileCode, CheckCircle2, RotateCcw, 
  Undo2, Copy, Check, Edit2, CheckCircle, Zap, ShieldCheck, 
  Activity, X, Info, CornerDownRight, Clock, FileEdit, FilePlus,
  Check as CheckIcon, X as CloseIcon, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import CodeFrame from './CodeFrame';
import { showSuccess, showError } from '@/utils/toast';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  model?: string;
  timestamp: string;
  onApplyCode?: (code: string, path: string, mode: 'replace' | 'append') => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  role, 
  content, 
  thought: initialThought, 
  model, 
  timestamp,
  onApplyCode 
}) => {
  const [isThoughtOpen, setIsThoughtOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [fileStates, setFileStates] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>({});

  // Parse the content for Thinking and File sections
  const parseContent = (text: string) => {
    let thought = initialThought || "";
    let mainContent = text;

    if (text.includes('### Thinking')) {
      const parts = text.split(/### Thinking/i);
      if (parts.length > 1) {
        const thoughtPart = parts[1].split(/### File|# |## |### /)[0];
        thought = thoughtPart.trim();
        mainContent = text.replace(`### Thinking${thoughtPart}`, "").trim();
      }
    }

    // Split by file headers: ### File: path/to/file
    const fileSections = mainContent.split(/### File:?\s*([^\n]+)/g);
    
    return { thought, fileSections };
  };

  const { thought, fileSections } = parseContent(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extractCode = (text: string) => {
    const completeMatch = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (completeMatch) return completeMatch[1];
    const unclosedMatch = text.match(/```(?:\w+)?\n([\s\S]*)$/);
    if (unclosedMatch) return unclosedMatch[1];
    return null;
  };

  const handleAction = (path: string, code: string, action: 'approved' | 'rejected') => {
    if (action === 'approved' && onApplyCode) {
      onApplyCode(code, path, 'replace');
      showSuccess(`Script integrated: ${path}`);
    } else if (action === 'rejected') {
      showError(`Proposal rejected: ${path}`);
    }
    setFileStates(prev => ({ ...prev, [path]: action }));
  };

  const renderFileSection = (path: string, sectionContent: string, index: number) => {
    const code = extractCode(sectionContent);
    const fileName = path.split('/').pop() || path;
    const state = fileStates[path] || 'pending';

    return (
      <motion.div 
        key={index} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "my-6 rounded-2xl overflow-hidden border transition-all duration-500 shadow-2xl",
          state === 'approved' ? "border-emerald-500/30 bg-emerald-500/5" : 
          state === 'rejected' ? "border-rose-500/30 bg-rose-500/5 opacity-60" : 
          "border-white/10 bg-[#121212]"
        )}
      >
        <div className="px-5 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
              state === 'approved' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
              state === 'rejected' ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
              "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
            )}>
              <FileCode size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                {fileName}
                {state === 'approved' && <CheckCircle2 size={14} className="text-emerald-400" />}
              </h4>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{path}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {state === 'pending' ? (
              <>
                <button 
                  onClick={() => code && handleAction(path, code, 'rejected')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 border border-white/5 transition-all"
                  title="Reject Proposal"
                >
                  <CloseIcon size={16} />
                </button>
                <button 
                  onClick={() => code && handleAction(path, code, 'approved')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all"
                >
                  <CheckIcon size={14} /> Approve
                </button>
              </>
            ) : (
              <button 
                onClick={() => setFileStates(prev => {
                  const newState = { ...prev };
                  delete newState[path];
                  return newState;
                })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/5 transition-all"
              >
                <RotateCcw size={14} /> Undo
              </button>
            )}
          </div>
        </div>
        
        {code && (
          <div className={cn("p-0 transition-all", state === 'rejected' && "grayscale blur-[1px]")}>
            <CodeFrame 
              code={code} 
              language={path.split('.').pop() || 'typescript'} 
              onApply={state === 'pending' ? (c, mode) => onApplyCode?.(c, path, mode) : undefined} 
            />
          </div>
        )}
      </motion.div>
    );
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
              <Info size={12} /> Thinking
            </span>
          </button>
          
          <AnimatePresence>
            {isThoughtOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-4 border-l border-white/5 text-sm text-white/40 leading-relaxed italic mb-2 overflow-hidden whitespace-pre-wrap"
              >
                {thought}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-4">
        {fileSections.length === 1 ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-white/80">
            {fileSections[0]}
          </div>
        ) : (
          fileSections.map((section, i) => {
            if (i === 0) {
              return <div key={i} className="text-sm leading-relaxed whitespace-pre-wrap text-white/80">{section}</div>;
            }
            if (i % 2 === 1) {
              const path = section.trim();
              const nextSection = fileSections[i + 1] || "";
              return renderFileSection(path, nextSection, i);
            }
            return null;
          })
        )}
      </div>

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
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;