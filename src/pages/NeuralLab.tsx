import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, Activity, Database, ArrowRight, Info, Clock, X,
  Layout, BarChart3, FileText, Palette, Target, Rocket, MessageSquare,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { ChatMessage } from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import QrScanner from '@/components/QrScanner';
import { cn } from "@/lib/utils";
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
    style: { color: '#6366f1', bg: '#020408' }
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchFarmSnapshot();
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: language === 'ar' 
          ? "تم تفعيل المختبر العصبي. أنا مهندسك المعماري الآن. يمكنني إنشاء الرسوم البيانية، تخطيط المشاريع، وتغيير واجهة المستخدم بناءً على أوامرك."
          : "Neural Lab Activated. I am your Architect now. I can generate live charts, project plans, and modify the UI based on your commands.",
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
      
      COMMANDS (Use these tags to update the Workspace):
      - <<<CHART: {"type": "bar|area", "title": "...", "data": [{"label": "...", "value": 10}]}>>>
      - <<<PLAN: Step 1\\nStep 2>>>
      - <<<STYLE: {"color": "#hex", "bg": "#hex"}>>>
      
      FARM DATA:
      - Rabbits: ${farmSnapshot.rabbits.length}
      - Revenue: ${revenue} DA
      - Costs/Losses: ${costs} DA
      - Net Profit: ${profit} DA
      
      Respond in ${language === 'ar' ? 'Arabic' : 'English'}. When you provide a chart or plan, it will appear in the workspace to the right.`;

      await grokChat(prompt || "Analyze this image.", { 
        modelId: 'yobest-ai', 
        userId: user?.id, 
        stream: true,
        image,
        systemPrompt
      }, (chunk) => {
        responseText += chunk;
        
        const chartMatch = responseText.match(/<<<CHART:\s*([\s\S]*?)>>>/);
        const planMatch = responseText.match(/<<<PLAN:\s*([\s\S]*?)>>>/);
        const styleMatch = responseText.match(/<<<STYLE:\s*([\s\S]*?)>>>/);

        if (chartMatch) try { setWorkspaceState((prev:any) => ({ ...prev, chart: JSON.parse(chartMatch[1].trim()) })); } catch(e) {}
        if (planMatch) setWorkspaceState((prev:any) => ({ ...prev, plan: planMatch[1].split('\n').filter(l => l.trim()) }));
        if (styleMatch) try { setWorkspaceState((prev:any) => ({ ...prev, style: JSON.parse(styleMatch[1].trim()) })); } catch(e) {}

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
      fetchFarmSnapshot(); 
    }
  };

  const quickActions = [
    { label: "Analyze Profits", prompt: "Analyze my farm profits and show me a chart of revenue vs costs.", icon: BarChart3 },
    { label: "Expansion Plan", prompt: "Give me a 4-step plan to expand my rabbit farm cages.", icon: Rocket },
    { label: "Neural Theme", prompt: "Change the workspace style to a deep emerald theme.", icon: Palette },
  ];

  return (
    <div className="h-screen bg-[#020408] text-white relative overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-1 mt-20 w-full relative z-10 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col border-r border-white/5 bg-black/20">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8" ref={scrollRef}>
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
            
            <div className="p-6 border-t border-white/5 space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {quickActions.map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(action.prompt)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
                  >
                    <action.icon size={12} /> {action.label}
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

          <ResizableHandle withHandle className="bg-white/5 hover:bg-indigo-500/50 transition-colors w-1.5" />

          {/* Workspace Panel */}
          <ResizablePanel defaultSize={60} minSize={30} className="bg-[#020408] relative overflow-hidden">
            <div className="absolute inset-0 auron-radial opacity-30 pointer-events-none" />
            
            <div className="h-full overflow-y-auto p-10 custom-scrollbar relative z-10">
              <div className="max-w-4xl mx-auto space-y-12">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                      <Layout size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Neural Workspace</h2>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Live Architect Preview</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      {workspaceState.style.color}
                    </div>
                  </div>
                </header>

                <AnimatePresence mode="wait">
                  {workspaceState.chart ? (
                    <motion.div 
                      key="chart"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-8 rounded-[3rem] bg-white/5 border border-white/10"
                    >
                      <ChatMessage role="assistant" content={`<<<CHART: ${JSON.stringify(workspaceState.chart)}>>>`} timestamp={new Date().toISOString()} />
                    </motion.div>
                  ) : (
                    <div className="h-64 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/10">
                      <BarChart3 size={48} className="mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">No Active Visualization</p>
                    </div>
                  )}

                  {workspaceState.plan && (
                    <motion.div 
                      key="plan"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <ChatMessage role="assistant" content={`<<<PLAN: ${workspaceState.plan.join('\n')}>>>`} timestamp={new Date().toISOString()} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Neural Style</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl border border-white/10" style={{ backgroundColor: workspaceState.style.color }} />
                      <div className="w-12 h-12 rounded-2xl border border-white/10" style={{ backgroundColor: workspaceState.style.bg }} />
                    </div>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white">
                    <Sparkles className="mb-4" />
                    <h4 className="text-lg font-black mb-2">AI Ready</h4>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">Tell the AI to "Create a chart of my sales" or "Plan a new cage expansion".</p>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
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