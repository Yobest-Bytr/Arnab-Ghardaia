"use client";

import React, { useState } from 'react';
import { Copy, Check, Plus, Code, FileEdit, ListPlus } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

interface CodeFrameProps {
  code: string;
  language?: string;
  onApply?: (code: string, mode: 'replace' | 'append') => void;
}

const CodeFrame: React.FC<CodeFrameProps> = ({ code, language = 'javascript', onApply }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showSuccess("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-black/60 backdrop-blur-xl group/frame">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            title="Copy Code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
          
          {onApply && (
            <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
              <button 
                onClick={() => onApply(code, 'replace')}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white text-[9px] font-black uppercase tracking-tighter transition-all"
                title="Replace Editor Content"
              >
                <FileEdit size={12} /> Replace
              </button>
              <button 
                onClick={() => onApply(code, 'append')}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-white/40 hover:bg-white/10 hover:text-white text-[9px] font-black uppercase tracking-tighter transition-all"
                title="Append to Editor"
              >
                <ListPlus size={12} /> Append
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6 overflow-x-auto custom-scrollbar max-h-[400px]">
        <pre className="text-xs font-mono text-indigo-300 leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
};

export default CodeFrame;