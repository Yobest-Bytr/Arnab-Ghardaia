import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, Activity, Database, ArrowRight, Info, Clock, X,
  Layout, BarChart3, FileText, Palette, Target, Rocket, MessageSquare,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Wand2, Layers, Box, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { ChatMessage } from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import QrScanner from '@/components/QrScanner';
import { cn } from "@/lib/utils";
import { showSuccess, showError } from '@/utils/toast';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";

const NeuralLab = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [farmSnapshot, setFarmSnapshot] = useState<any>({ rabbits: [], sales: [], litters: [], expenses: [] });
  const [workspaceState, setWorkspaceState] = useState<any>({
    chart: null,
    plan: null,
    style: { color: '#6366f1', bg: '#020408' },
    lastAction: null
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchFarmSnapshot();
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: language === 'ar' 
          ? "تم تفعيل المختبر العصبي. أنا مهندسك المعماري الآن. يمكنني تنفيذ الأوامر مباشرة، إنشاء الرسوم البيانية، وتغيير واجهة المستخدم."
          : "Neural Lab Activated. I am your Architect now. I can execute commands directly, generate live charts, and modify the UI.",
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

  const handleSend = async (e: React.FormEvent | string, image?: string) => {
    const prompt = typeof e === 'string' ? e : input;
    if (!prompt.trim() && !image) return;
    
    const userMsg = { id: Date.now(), role: 'user', content: prompt || "Analyze this image.", timestamp: new Date().toISOString(), image };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      let responseText = "";
      const revenue = farmSnapshot.sales.reduce((a:any,b:any)=>a+(parseFloat(b.price)||0),0);
      const costs = farmSnapshot.expenses.reduce((a:any,b:any)=>a+(parseFloat(b.amount)||0),0);
      const profit = revenue - costs;

      const systemPrompt = `You are the Yobest AI Neural Architect.
      
      COMMANDS (Use these tags to update the Workspace or execute actions):
      - <<<CHART: {"type": "bar|area", "title": "...", "data": [{"label": "...", "value": 10}]}>>>
      - <<<PLAN: Step 1\\nStep 2>>>
      - <<<STYLE: {"color": "#hex", "bg": "#hex"}>>>
      - <<<ADD_RABBIT: {"name": "...", "breed": "...", "cage_number": "...", "gender": "Male|Female", "health_status": "Healthy|Sick"}>>>
      
      FARM DATA:
      - Rabbits: ${farmSnapshot.rabbits.length}
      - Revenue: ${revenue} DA
      - Costs/Losses: ${costs} DA
      - Net Profit: ${profit} DA
      
      Respond in ${language === 'ar' ? 'Arabic' : 'English'}. When you execute an action like ADD_RABBIT, confirm it to the user.`;

      await grokChat(prompt || "Analyze this image.", { 
        modelId: 'yobest-ai', 
        userId: user?.id, 
        stream: true,
        image,
        systemPrompt
      }, async (chunk) => {
        responseText += chunk;
        
        const chartMatch = responseText.match(/<<<CHART:\s*([\s\S]*?)>>>/);
        const planMatch = responseText.match(/<<<PLAN:\s*([\s\S]*?)>>>/);
        const styleMatch = responseText.match(/<<<STYLE:\s*([\s\S]*?)>>>/);
        const addRabbitMatch = responseText.match(/<<<ADD_RABBIT:\s*([\s\S]*?)>>>/);

        if (chartMatch) try { setWorkspaceState((prev:any) => ({ ...prev, chart: JSON.parse(chartMatch[1].trim()) })); } catch(e) {}
        if (planMatch) setWorkspaceState((prev:any) => ({ ...prev, plan: planMatch[1].split('\n').filter(l => l.trim()) }));
        if (styleMatch) try { setWorkspaceState((prev:any) => ({ ...prev, style: JSON.parse(styleMatch[1].trim()) })); } catch(e) {}
        
        if (addRabbitMatch && !workspaceState.lastAction) {
          try {
            const rabbitData = JSON.parse(addRabbitMatch[1].trim());
            await storage.insert('rabbits', user!.id, {
              ...rabbitData,
              rabbit_id: `RAB-${Math.floor(1000 + Math.random() * 9000)}`
            });
            setWorkspaceState((prev:any) => ({ ...prev, lastAction: 'ADD_RABBIT' }));
            showSuccess(t('addRabbit'));
            fetchFarmSnapshot();
          } catch(e) {}
        }

        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') return [...prev.slice(0, -1), { ...last, content: responseText }];
          return [...prev, { 
            id: Date.now() + 1, 
            role: 'assistant', 
            content: responseText, 
            model: 'Yobest AI 4.1', 
            timestamp: new Date().toISOString(),
            thought: "Architecting neural response..."
          }];
        });
      });
    } finally {
      setIsGenerating(false);
      setWorkspaceState((prev:any) => ({ ...prev, lastAction: null }));
    }
  };

  const quickActions = [
    { label: "Add Rabbit", prompt: "Add a new New Zealand White rabbit named 'Snowy' in cage 12. It is a healthy female.", icon: Plus },
    { label: "Analyze Profits", prompt: "Analyze my farm profits and show me a chart of revenue vs costs.", icon: BarChart3 },
    { label: "Expansion Plan", prompt: "Give me a 4-step plan to expand my rabbit farm cages.", icon: Rocket },
  ];

  return (
    <div className="h-screen bg-[#020408] text-white relative overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-1 mt-20 w-full relative z-10 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-3xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-tight uppercase">{t('neuralArchitect')}</h2>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Active Session</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar space-y-12" ref={scrollRef}>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} {...msg} />
              ))}
              {isGenerating && (
                <div className="flex gap-6 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20" />
                  <div className="space-y-3 flex-1">
                    <div className="h-4 w-3/4 bg-white/5 rounded-full" />
                    <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-white/5 space-y-6 bg-black/40">
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {quickActions.map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(action.prompt)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all whitespace-nowrap group"
                  >
                    <action.icon size={14} className="group-hover:scale-110 transition-transform" /> {action.label}
                  </button>
                ))}
              </div>
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
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-white/5 hover:bg-indigo-500/50 transition-colors w-2" />

          {/* Workspace Panel */}
          <ResizablePanel defaultSize={60} minSize={30} className="bg-[#020408] relative overflow-hidden">
            <div className="absolute inset-0 auron-radial opacity-40 pointer-events-none" />
            
            <div className="h-full overflow-y-auto p-12 custom-scrollbar relative z-10">
              <div className="max-w-5xl mx-auto space-y-16">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 border border-white/10">
                      <Layout size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter">{t('workspace')}</h2>
                      <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mt-1">{t('livePreview')}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: workspaceState.style.color }} />
                      {workspaceState.style.color}
                    </div>
                  </div>
                </header>

                <AnimatePresence mode="wait">
                  {workspaceState.chart ? (
                    <motion.div 
                      key="chart"
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="p-12 rounded-[4rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl"
                    >
                      <ChatMessage role="assistant" content={`<<<CHART: ${JSON.stringify(workspaceState.chart)}>>>`} timestamp={new Date().toISOString()} />
                    </motion.div>
                  ) : (
                    <div className="h-80 rounded-[4rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/10 group hover:border-indigo-500/20 transition-colors">
                      <BarChart3 size={64} className="mb-6 group-hover:scale-110 transition-transform duration-700" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">No Active Visualization</p>
                    </div>
                  )}

                  {workspaceState.plan && (
                    <motion.div 
                      key="plan"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <ChatMessage role="assistant" content={`<<<PLAN: ${workspaceState.plan.join('\n')}>>>`} timestamp={new Date().toISOString()} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-indigo-500/30 transition-all">
                    <h4 className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <Palette size={14} /> {t('neuralStyle')}
                    </h4>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] border-2 border-white/10 shadow-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: workspaceState.style.color }} />
                      <div className="w-16 h-16 rounded-[1.5rem] border-2 border-white/10 shadow-xl group-hover:scale-110 transition-transform delay-75" style={{ backgroundColor: workspaceState.style.bg }} />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 p-10 rounded-[3rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                          <Sparkles size={24} />
                        </div>
                        <h4 className="text-2xl font-black tracking-tight">{t('aiActionExecuted')}</h4>
                      </div>
                      <p className="text-sm font-medium opacity-80 leading-relaxed max-w-md">
                        The Neural Architect is synchronized with your farm data. Ask for financial analysis, growth projections, or execute actions like adding rabbits directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-8">
            <div className="max-w-xl w-full">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                    <Layers size={24} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">Neural Scan</h2>
                </div>
                <button onClick={() => setIsScannerOpen(false)} className="p-4 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all"><X size={28} /></button>
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