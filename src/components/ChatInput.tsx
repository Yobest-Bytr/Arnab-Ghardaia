"use client";

import React from 'react';
import { Send, Plus, Sparkles, ChevronDown, Zap, Cpu } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  selectedModel: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit, isGenerating, selectedModel }) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Quick Actions */}
      <div className="flex gap-2">
        <button className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white/60 hover:bg-white/10 transition-all">
          Summarize to new chat
        </button>
        <button className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white/60 hover:bg-white/10 transition-all">
          Keep going
        </button>
      </div>

      {/* Input Console */}
      <form onSubmit={onSubmit} className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative">
          <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask AI to explain or modify code..."
            className="w-full bg-transparent p-4 pr-14 text-sm text-white outline-none resize-none min-h-[100px] custom-scrollbar"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e as any);
              }
            }}
          />
          <button 
            type="submit" 
            disabled={isGenerating || !value.trim()}
            className="absolute right-4 bottom-4 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button type="button" className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
              Build
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-[11px] font-bold text-white/40 hover:text-white transition-all">
              Model: <span className="text-indigo-400">{selectedModel}</span>
              <ChevronDown size={12} />
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-[11px] font-bold text-white/40 hover:text-white transition-all">
              <Sparkles size={14} className="text-amber-400" />
              Pro
            </button>
          </div>
          
          <button type="button" className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all">
            <Plus size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;