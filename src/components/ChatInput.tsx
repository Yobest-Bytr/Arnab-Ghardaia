"use client";

import React from 'react';
import { Send, Plus, ChevronDown, Sparkles } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  selectedModel: string;
  onModelChange?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit, isGenerating, selectedModel, onModelChange }) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Quick Actions */}
      <div className="flex gap-2">
        <button type="button" className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white/40 hover:text-white/60 hover:bg-white/10 transition-all">
          Summarize
        </button>
        <button type="button" className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white/40 hover:text-white/60 hover:bg-white/10 transition-all">
          Fix Errors
        </button>
      </div>

      {/* Input Console */}
      <form onSubmit={onSubmit} className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl focus-within:border-indigo-500/50 transition-all">
        <div className="relative">
          <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask AI to explain or modify code..."
            className="w-full bg-transparent p-4 pr-14 text-sm text-white outline-none resize-none min-h-[80px] max-h-[200px] custom-scrollbar"
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
            className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={onModelChange}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-[11px] font-bold text-white/40 hover:text-white transition-all"
            >
              <Sparkles size={14} className="text-indigo-400" />
              <span>{selectedModel}</span>
              <ChevronDown size={12} />
            </button>
          </div>
          
          <button type="button" className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all">
            <Plus size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;