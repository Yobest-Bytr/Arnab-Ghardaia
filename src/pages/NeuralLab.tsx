import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, Activity, Database, ArrowRight, Info, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { ChatMessage } from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { cn } from "@/lib/utils";

const NeuralLab = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [farmSnapshot, setFarmSnapshot] = useState<any>({ rabbits: [], sales: [], litters: [] });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchFarmSnapshot();
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Neural Link Established. I have access to your farm data. How can I assist your cognitive workflow today?",
        timestamp: new Date().toISOString(),
        model: 'Yobest AI 4.1'
      }]);
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchFarmSnapshot = async () => {
    if (!user) return;
    const [rabbits, sales, litters] = await Promise.all([
      storage.get('rabbits', user.id),
      storage.get('sales', user.id),
      storage.get('litters', user.id)
    ]);
    setFarmSnapshot({ rabbits, sales, litters });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    
    const userMsg = { id: Date.now(), role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      let responseText = "";
      const systemPrompt = `You are the Yobest AI Neural Architect. You have access to the user's farm data.
      
      NEURAL SNAPSHOT:
      - Rabbits: ${farmSnapshot.rabbits.length} total
      - Sales: ${farmSnapshot.sales.length} total
      - Litters: ${farmSnapshot.litters.length} total
      
      Current Inventory: ${JSON.stringify(farmSnapshot.rabbits.slice(0, 10))}
      
      Help the user manage their farm, analyze data, or build their workspace. Be professional, concise, and data-driven.`;

      await grokChat(input, { 
        modelId: 'yobest-ai', 
        userId: user?.id, 
        stream: true,
        systemPrompt
      }, (chunk) => {
        responseText += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') return [...prev.slice(0, -1), { ...last, content: responseText }];
          return [...prev, { 
            id: Date.now() + 1, 
            role: 'assistant', 
            content: responseText, 
            model: 'Yobest AI 4.1', 
            timestamp: new Date().toISOString(),
            thought: "Analyzing farm snapshot and neural context..."
          }];
        });
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen bg-[#020408] text-white relative overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-1 mt-20 w-full relative z-10 overflow-hidden flex flex-col max-w-5xl mx-auto px-6">
        <div className="py-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Neural Lab</h1>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Cognitive Engine Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            <Database size={12} /> Farm Data Linked
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8 pr-2 custom-scrollbar space-y-8" ref={scrollRef}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
          {isGenerating && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20" />
              <div className="h-4 w-32 bg-white/5 rounded-full mt-2" />
            </div>
          )}
        </div>

        <div className="pb-10 pt-4">
          <ChatInput 
            value={input} 
            onChange={setInput} 
            onSubmit={handleSend} 
            isGenerating={isGenerating} 
            selectedModelId="yobest-ai" 
            onModelChange={() => {}} 
            onBuild={() => {}} 
            onFileAttach={() => {}} 
          />
        </div>
      </main>
    </div>
  );
};

export default NeuralLab;