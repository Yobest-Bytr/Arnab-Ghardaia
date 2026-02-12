"use client";

import React, { useRef, useState } from 'react';
import { 
  Send, Plus, ChevronDown, Sparkles, X, Cpu, Zap, 
  Layers, FileUp, Box, Wand2, MessageSquare, ArrowRight 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showSuccess } from '@/utils/toast';

const MODELS = [
  { id: 'auto', name: 'Auto', icon: Wand2, desc: 'Automatic Model Selection' },
  { id: 'yobest-ai', name: 'Yobest AI 4.1', icon: Sparkles, desc: 'Native Cognitive Engine' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5', icon: Zap, desc: 'Anthropic Sonnet' },
  { id: 'gpt-4o', name: 'GPT-4o', icon: Cpu, desc: 'OpenAI Multimodal' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0', icon: Layers, desc: 'Google Flash Pro' },
];

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  selectedModelId: string;
  onModelChange: (model: any) => void;
  onBuild: () => void;
  onFileAttach: (file: File) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  isGenerating, 
  selectedModelId, 
  onModelChange,
  onBuild,
  onFileAttach
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      onFileAttach(file);
      showSuccess(`Attached ${file.name}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quick Actions */}
      <div className="flex gap-2">
        <button type="button" className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-[11px] font-bold text-white hover:bg-white/5 transition-all flex items-center gap-2">
          Summarize to new chat
        </button>
        <button type="button" className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-[11px] font-bold text-white hover:bg-white/5 transition-all flex items-center gap-2">
          Keep going
        </button>
      </div>

      <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl focus-within:border-indigo-500/50 transition-all">
        {attachedFileName && (
          <div className="px-4 py-2 bg-indigo-500/10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400">
              <FileUp size={12} />
              <span>{attachedFileName}</span>
            </div>
            <button onClick={() => setAttachedFileName(null)} className="text-white/20 hover:text-white">
              <X size={12} />
            </button>
          </div>
        )}
        
        <form onSubmit={onSubmit} className="relative">
          <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask Yobest AI to build or modify..."
            className="w-full bg-transparent p-4 pr-14 text-sm text-white outline-none resize-none min-h-[100px] max-h-[300px] custom-scrollbar"
          />
          <button 
            type="submit" 
            disabled={isGenerating || !value.trim()}
            className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={20} />}
          </button>
        </form>

        {/* Bottom Toolbar */}
        <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBuild}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-[11px] font-bold text-white hover:bg-white/5 transition-all"
            >
              Build
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-[11px] font-bold text-white hover:bg-white/5 transition-all outline-none">
                Model: <span className="text-indigo-400">{selectedModel.name}</span>
                <ChevronDown size={12} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-64 p-2 z-[110]">
                {MODELS.map(m => (
                  <DropdownMenuItem key={m.id} onClick={() => onModelChange(m)} className="flex flex-col items-start gap-1 p-3 cursor-pointer rounded-xl hover:bg-white/5">
                    <div className="flex items-center gap-2 w-full">
                      <m.icon size={14} className="text-indigo-400" />
                      <span className="font-bold text-xs">{m.name}</span>
                    </div>
                    <span className="text-[10px] text-white/40">{m.desc}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-[11px] font-bold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all">
              <Sparkles size={14} /> Pro
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;