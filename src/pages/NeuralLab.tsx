import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, Activity, Database, ArrowRight, Info, Clock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { ChatMessage } from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import QrScanner from '@/components/QrScanner';
import { cn } from "@/lib/utils";

const NeuralLab = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [farmSnapshot, setFarmSnapshot] = useState<any>({ rabbits: [], sales: [], litters: [] });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchFarmSnapshot();
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Neural Link Established. I have access to your farm data. I can analyze images, scan QR codes, and perform actions like adding or editing rabbits. How can I assist you?",
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

  const handleSend = async (e: React.FormEvent, image?: string) => {
    if (!input.trim() && !image) return;
    
    const userMsg = { 
      id: Date.now(), 
      role: 'user', 
      content: input || "Analyze this image.", 
      timestamp: new Date().toISOString(),
      image 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      let responseText = "";
      const systemPrompt = `You are the Yobest AI Neural Architect. You manage a rabbit farm in Ghardaia.
      
      NEURAL SNAPSHOT:
      - Rabbits: ${farmSnapshot.rabbits.length} total
      - Sales: ${farmSnapshot.sales.length} total
      - Litters: ${farmSnapshot.litters.length} total
      
      ACTION CAPABILITIES:
      If you want to add a rabbit, include this tag in your response:
      [ACTION: ADD_RABBIT {"name": "...", "breed": "...", "gender": "...", "weight": "..."}]
      
      If you want to update a rabbit, include this tag:
      [ACTION: UPDATE_RABBIT {"id": "...", "updates": {"status": "..."}}]
      
      Be professional, data-driven, and helpful.`;

      await grokChat(input || "Analyze this image.", { 
        modelId: 'yobest-ai', 
        userId: user?.id, 
        stream: true,
        image,
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
            thought: "Analyzing neural context and visual data..."
          }];
        });
      });
    } finally {
      setIsGenerating(false);
      fetchFarmSnapshot(); 
    }
  };

  const handleQrScan = (decodedText: string) => {
    setIsScannerOpen(false);
    setInput(`Analyze this Neural ID: ${decodedText}`);
    const fakeEvent = { preventDefault: () => {} } as any;
    handleSend(fakeEvent);
  };

  return (
    <div className="h-screen bg-[#020408] text-white relative overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-1 mt-20 w-full relative z-10 overflow-hidden flex flex-col max-w-6xl mx-auto px-6">
        <div className="py-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Neural Lab</h1>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Cognitive Engine Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            <Database size={14} /> Farm Data Linked
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-10 pr-4 custom-scrollbar space-y-10" ref={scrollRef}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
          {isGenerating && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20" />
              <div className="h-4 w-48 bg-white/5 rounded-full mt-3" />
            </div>
          )}
        </div>

        <div className="pb-10 pt-6">
          <ChatInput 
            value={input} 
            onChange={setInput} 
            onSubmit={handleSend} 
            isGenerating={isGenerating} 
            selectedModelId="yobest-ai" 
            onModelChange={() => {}} 
            onQrScan={() => setIsScannerOpen(true)}
          />
        </div>
      </main>

      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
            <div className="max-w-lg w-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">Neural Scan</h2>
                <button onClick={() => setIsScannerOpen(false)} className="p-3 rounded-2xl bg-white/5 text-white/40"><X size={24} /></button>
              </div>
              <QrScanner onScanSuccess={handleQrScan} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeuralLab;