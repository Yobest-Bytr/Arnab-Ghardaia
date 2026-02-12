"use client";

import React, { useState } from 'react';
import { 
  ChevronRight, ChevronDown, FileCode, CheckCircle2, RotateCcw, 
  Undo2, Copy, Check, Edit2, CheckCircle, Zap, ShieldCheck, 
  Activity, X, Info, CornerDownRight, Clock, FileEdit, FilePlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import CodeFrame from './CodeFrame';
import { showSuccess } from '@/utils/toast';

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
  const [approvedFiles, setApprovedFiles] = useState<string[]>([]);

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

  const renderFileSection = (path: string, sectionContent: string, index: number) => {
    const code = extractCode(sectionContent);
    const fileName = path.split('/').pop() || path;
    const isApproved = approvedFiles.includes(path);

    return (
      <div key={index} className="my-6 bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <FileCode size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">{fileName}</h4>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{path}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (code && onApplyCode) {
                  onApplyCode(code, path, 'replace');
                  setApprovedFiles(prev => [...prev, path]);
                  showSuccess(`Applied changes to ${fileName}`);
                }
              }}
              disabled={isApproved || !code}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                isApproved 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
              )}
            >
              {isApproved ? <CheckCircle2 size={14} /> : <FilePlus size={14} />}
              {isApproved ? "Applied" : "Apply Changes"}
            </button>
          </div>
        </div>
        
        {code && (
          <div className="p-0">
            <CodeFrame 
              code={code} 
              language={path.split('.').pop() || 'typescript'} 
              onApply={(c, mode) => onApplyCode?.(c, path, mode)} 
            />
          </div>
        )}
      </div>
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