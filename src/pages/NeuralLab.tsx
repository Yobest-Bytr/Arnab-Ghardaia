import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, Activity, Database, ArrowRight, Info, Clock, X, Terminal, Shield, Globe
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
  const { language, t } = useLanguage();
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
        content: language === 'ar' 
          ? "تم إنشاء الرابط العصبي. لدي حق الوصول الكامل إلى بيانات مزرعتك. يمكنني تحليل الصور ومسح رموز QR وتنفيذ إجراءات مثل إضافة أو تعديل الأرانب. كيف يمكنني مساعدتك اليوم؟"
          : "Neural Link Established. I have full access to your farm data. I can analyze images, scan QR codes, and perform actions like adding or editing rabbits. How can I assist you today?",
        timestamp: new Date().toISOString(),
        model: 'Yobest AI 4.1'
      }]);
    }
  }, [user, language]);

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
      const today = new Date().toISOString().split('T')[0];
      const systemPrompt = `You are the Yobest AI Neural Architect. You manage a rabbit farm in Ghardaia.
      
      LANGUAGE: Respond strictly in ${language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : 'English'}.
      
      NEURAL SNAPSHOT (FULL ACCESS):
      - Rabbits: ${JSON.stringify(farmSnapshot.rabbits)}
      - Sales: ${JSON.stringify(farmSnapshot.sales)}
      - Litters: ${JSON.stringify(farmSnapshot.litters)}
      
      ACTION CAPABILITIES:
      If you want to perform an action, include the tag:
      [ACTION: ADD_RABBIT {"name": "...", "breed": "...", "gender": "...", "weight": "...", "birth_date": "${today}"}]
      [ACTION: UPDATE_RABBIT {"id": "...", "updates": {"status": "..."}}]
      [ACTION: RECORD_SALE {"customer_name": "...", "price": 0, "category": "...", "sale_date": "${today}"}]
      [ACTION: RECORD_MATING {"mother_name": "...", "father_name": "...", "mating_date": "${today}"}]`;

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
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-30" />
      <Navbar />
      
      <main className="flex-1 mt-20 w-full relative z-10 overflow-hidden flex flex-col max-w-6xl mx-auto px-6">
        <div className="py-8 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">{t('neuralLab')}.</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('engineOnline')}
                </span>
                <span className="text-white/10">•</span>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                  <Database size={10} /> {farmSnapshot.rabbits.length} {t('nodesLinked')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <Shield size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('secureUplink')}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <Globe size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('ghardaiaNode')}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-10 pr-4 custom-scrollbar space-y-12" ref={scrollRef}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
          {isGenerating && (
            <div className="flex gap-5 animate-in fade-in duration-500">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-2 mt-2">
                <div className="h-2 w-48 bg-white/5 rounded-full animate-pulse" />
                <div className="h-2 w-32 bg-white/5 rounded-full animate-pulse" />
              </div>
            </div>
          )}
        </div>

        <div className="pb-10 pt-6 shrink-0">
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
            <div className="max-w-lg w-full">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter">Neural <span className="text-indigo-400">Scan.</span></h2>
                  <p className="text-white/40 font-bold text-sm mt-1 uppercase tracking-widest">Align Neural ID Tag to Initialize</p>
                </div>
                <button onClick={() => setIsScannerOpen(false)} className="p-4 rounded-[1.5rem] bg-white/5 text-white/40 hover:text-white transition-all"><X size={28} /></button>
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