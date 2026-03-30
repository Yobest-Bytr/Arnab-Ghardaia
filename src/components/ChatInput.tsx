"use client";

import React, { useRef, useState } from 'react';
import { 
  Send, Plus, ChevronDown, Sparkles, X, Cpu, Zap, 
  Layers, FileUp, Box, Wand2, MessageSquare, ArrowRight, Camera, QrCode
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showSuccess } from '@/utils/toast';

const MODELS = [
  { id: 'yobest-ai', name: 'Yobest AI 4.1', icon: Sparkles, desc: 'Native Cognitive Engine' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5', icon: Zap, desc: 'Anthropic Sonnet' },
  { id: 'gpt-4o', name: 'GPT-4o', icon: Cpu, desc: 'OpenAI Multimodal' },
];

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent, image?: string) => void;
  isGenerating: boolean;
  selectedModelId: string;
  onModelChange: (model: any) => void;
  onQrScan?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  isGenerating, 
  selectedModelId, 
  onModelChange,
  onQrScan
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
        showSuccess("Image attached to neural link.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, attachedImage || undefined);
    setAttachedImage(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#121212] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl focus-within:border-indigo-500/50 transition-all">
        {attachedImage && (
          <div className="px-6 py-4 bg-indigo-500/10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={attachedImage} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Visual Data Attached</span>
            </div>
            <button onClick={() => setAttachedImage(null)} className="p-2 rounded-lg hover:bg-white/10 text-white/20 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask Yobest AI to analyze, add, or edit..."
            className="w-full bg-transparent p-6 pr-16 text-sm text-white outline-none resize-none min-h-[120px] max-h-[300px] custom-scrollbar font-medium"
          />
          <button 
            type="submit" 
            disabled={isGenerating || !value.trim()}
            className="absolute right-6 top-6 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-all disabled:opacity-30 shadow-lg shadow-indigo-500/20"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight size={24} />}
          </button>
        </form>

        <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all outline-none">
                Model: <span className="text-indigo-400">{selectedModel.name}</span>
                <ChevronDown size={12} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-64 p-2 z-[110] rounded-2xl">
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

            <button 
              type="button"
              onClick={onQrScan}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all"
            >
              <QrCode size={14} className="text-indigo-400" /> Neural Scan
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*"
              className="hidden" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              title="Attach Image"
            >
              <Camera size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;