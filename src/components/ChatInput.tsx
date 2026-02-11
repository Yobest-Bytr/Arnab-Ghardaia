"use client";

import React, { useRef } from 'react';
import { Send, Plus, ChevronDown, Sparkles, ImageIcon, X, Cpu, Zap, Layers, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MODELS = [
  { id: 'yobest-ai', name: 'Auto', icon: Sparkles, desc: 'Unlimited Grok 3 Fast' },
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
  attachedImage: string | null;
  onImageAttach: (img: string | null) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  isGenerating, 
  selectedModelId, 
  onModelChange,
  attachedImage,
  onImageAttach
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageAttach(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl focus-within:border-indigo-500/50 transition-all">
        {attachedImage && (
          <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
              <img src={attachedImage} alt="Attached" className="w-full h-full object-cover" />
              <button 
                onClick={() => onImageAttach(null)}
                className="absolute top-0 right-0 bg-black/60 text-white p-0.5 hover:bg-rose-500 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Image Attached</span>
          </div>
        )}
        
        <form onSubmit={onSubmit} className="relative">
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
            disabled={isGenerating || (!value.trim() && !attachedImage)}
            className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
          </button>
        </form>

        {/* Bottom Bar */}
        <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-[11px] font-bold text-white/40 hover:text-white transition-all outline-none">
                <selectedModel.icon size={14} className="text-indigo-400" />
                <span>{selectedModel.name}</span>
                <ChevronDown size={12} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-64 p-2 z-[110]">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/20">Select AI Model</div>
                {MODELS.map(m => (
                  <DropdownMenuItem 
                    key={m.id} 
                    onClick={() => onModelChange(m)} 
                    className="flex flex-col items-start gap-1 p-3 cursor-pointer rounded-xl hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <m.icon size={14} className="text-indigo-400" />
                      <span className="font-bold text-xs">{m.name}</span>
                      {selectedModelId === m.id && <CheckCircle2 size={14} className="ml-auto text-indigo-400" />}
                    </div>
                    <p className="text-[10px] text-white/30">{m.desc}</p>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <ImageIcon size={18} />
            </button>
            <button type="button" className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all">
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;