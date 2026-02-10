"use client";

import React, { useState } from 'react';
import { Copy, Check, Plus, Code } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

interface CodeFrameProps {
  code: string;
  language?: string;
  onAdd?: (code: string) => void;
}

const CodeFrame: React.FC<CodeFrameProps> = ({ code, language = 'javascript', onAdd }) => {
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
        <button 
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
      
      <div className="p-6 overflow-x-auto custom-scrollbar">
        <pre className="text-sm font-mono text-indigo-300 leading-relaxed">
          {code}
        </pre>
      </div>

      {onAdd && (
        <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex justify-end">
          <button 
            onClick={() => onAdd(code)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Plus size={14} />
            Add to Project
          </button>
        </div>
      )}
    </div>
  );
};

export default CodeFrame;