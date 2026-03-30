import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, Activity, Database, ArrowRight, Info, Clock, X,
  Layout, BarChart3, FileText, Palette, Target, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { ChatMessage } from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import QrScanner from '@/components/QrScanner';
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NeuralLab = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'strategy' | 'charts'>('chat');
  const [farmSnapshot, setFarmSnapshot] = useState<any>({ rabbits: [], sales: [], litters: [], expenses: [] });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchFarmSnapshot();
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: language === 'ar' 
          ? "تم تفعيل المختبر العصبي. يمكنني الآن إنشاء خطط مشاريع، تحليل الأرباح، وتنسيق البيانات بصرياً. كيف يمكنني مساعدتك في تطوير مزرعتك اليوم؟"
          : "Neural Lab Activated. I can now generate project plans, analyze profits, and visualize data. How can I help you scale your farm today?",
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
    const [rabbits, sales, litters, expenses] = await Promise.all([
      storage.get('rabbits', user.id),
      storage.get('sales', user.id),
      storage.get('litters', user.id),
      storage.get('expenses', user.id)
    ]);
    setFarmSnapshot({ rabbits, sales, litters, expenses });
  };

  const handleSend = async (e: React.FormEvent, image?: string) => {
    if (!input.trim() && !image) return;
    
    const userMsg = { id: Date.now(), role: 'user', content: input || "Analyze this image.", timestamp: new Date().toISOString(), image };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      let responseText = "";
      const today = new Date().toISOString().split('T')[0];
      const systemPrompt = `You are the Yobest AI Neural Architect.
      
      CAPABILITIES:
      - Generate Project Plans: Use [PLAN: ...] tag.
      - Visual Charts: Use [CHART: {"type": "area", "data": [...]}] tag.
      - Custom Styling: You can use [STYLE: {"color": "#hex", "bg": "#hex"}] to suggest UI themes.
      
      FARM DATA:
      - Rabbits: ${farmSnapshot.rabbits.length}
      - Revenue: ${farmSnapshot.sales.reduce((a:any,b:any)=>a+(parseFloat(b.price)||0),0)} DA
      - Expenses: ${farmSnapshot.expenses.reduce((a:any,b:any)=>a+(parseFloat(b.amount)||0),0)} DA
      
      Respond in ${language === 'ar' ? 'Arabic' : 'English'}. Be strategic and data-driven.`;

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
            thought: "Synthesizing neural strategy..."
          }];
        });
      });
    } finally {
      setIsGenerating(false);
      fetchFarmSnapshot(); 
    }
  };

  return (
    <div className="h-screen bg-[#020408] text-white relative overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-1 mt-20 w-full relative z-10 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Sidebar: Navigation */}
        <div className="w-full lg:w-20 bg-white/5 border-r border-white/5 flex lg:flex-col items-center py-6 gap-6 shrink-0">
          <button onClick={() => setActiveTab('chat')} className={cn("p-3 rounded-2xl transition-all", activeTab === 'chat' ? "bg-indigo-600 text-white" : "text-white/20 hover:text-white")}><MessageSquare size={24} /></button>
          <button onClick={() => setActiveTab('strategy')} className={cn("p-3 rounded-2xl transition-all", activeTab === 'strategy' ? "bg-indigo-600 text-white" : "text-white/20 hover:text-white")}><Target size={24} /></button>
          <button onClick={() => setActiveTab('charts')} className={cn("p-3 rounded-2xl transition-all", activeTab === 'charts' ? "bg-indigo-600 text-white" : "text-white/20 hover:text-white")}><BarChart3 size={24} /></button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Chat Pane */}
          <div className={cn("flex-1 flex flex-col border-r border-white/5", activeTab !== 'chat' && "hidden lg:flex")}>
            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar space-y-10" ref={scrollRef}>
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
            <div className="p-6 bg-black/20 border-t border-white/5">
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
          </div>

          {/* Workspace Pane (Strategy/Charts) */}
          <div className={cn("w-full lg:w-[450px] bg-black/40 p-8 overflow-y-auto custom-scrollbar", activeTab === 'chat' && "hidden lg:block")}>
            <AnimatePresence mode="wait">
              {activeTab === 'strategy' ? (
                <motion.div key="strategy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex items-center gap-3 mb-8">
                    <Rocket className="text-indigo-400" />
                    <h2 className="text-2xl font-black tracking-tight">{t('aiStrategy')}</h2>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={14} /> Neural Recommendation</h3>
                    <p className="text-sm text-indigo-100/80 leading-relaxed">
                      Based on your current data, focusing on **New Zealand White** breeding cycles will yield a 15% higher profit margin by next quarter.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Active Objectives</p>
                    {[
                      { title: "Optimize Feed Costs", progress: 65, color: "bg-emerald-500" },
                      { title: "Expand Cage Capacity", progress: 30, color: "bg-blue-500" },
                      { title: "Neural ID Integration", progress: 90, color: "bg-indigo-500" },
                    ].map((obj, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-bold">{obj.title}</span>
                          <span className="text-[10px] font-black">{obj.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all duration-1000", obj.color)} style={{ width: `${obj.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : activeTab === 'charts' ? (
                <motion.div key="charts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex items-center gap-3 mb-8">
                    <BarChart3 className="text-emerald-400" />
                    <h2 className="text-2xl font-black tracking-tight">{t('visualInsights')}</h2>
                  </div>
                  <div className="h-64 w-full bg-white/5 rounded-[2rem] p-6 border border-white/5">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'W1', val: 400 }, { name: 'W2', val: 300 }, { name: 'W3', val: 900 }, { name: 'W4', val: 1200 }
                      ]}>
                        <defs>
                          <linearGradient id="colorLab" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{ backgroundColor: '#020408', border: 'none', borderRadius: '1rem' }} />
                        <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={4} fill="url(#colorLab)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Efficiency</p>
                      <p className="text-2xl font-black text-emerald-400">94%</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Growth</p>
                      <p className="text-2xl font-black text-indigo-400">+12%</p>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
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
              <QrScanner onScanSuccess={(text) => { setIsScannerOpen(false); setInput(`Analyze Neural ID: ${text}`); }} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeuralLab;