
import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, Activity, Database, ArrowRight, Info, Clock, X, Terminal, Shield, Globe,
  Settings as SettingsIcon
} from 'lucide-react';
import { storage, Rabbit, BreedingRecord, Litter, Cage, UserSettings } from '@/lib/storage';
import { QRScanner } from '@/components/QrScanner';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const NeuralLab = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [farmData, setFarmData] = useState<{
    rabbits: Rabbit[], 
    breeding: BreedingRecord[], 
    litters: Litter[],
    cages: Cage[]
  }>({
    rabbits: [],
    breeding: [],
    litters: [],
    cages: []
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const rabbits = await storage.getRabbits();
      const breeding = await storage.getBreedingRecords();
      const litters = await storage.getLitters();
      const cages = await storage.getCages();
      const userSettings = await storage.getSettings();
      
      setFarmData({ rabbits, breeding, litters, cages });
      setSettings(userSettings);

      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Neural Link Established. I am your AI Farm Assistant. I have analyzed your farm data (${rabbits.length} rabbits, ${breeding.length} breeding records, ${cages.length} cages) and I'm ready to help you optimize your rabbitry. How can I assist you today?`,
        timestamp: new Date().toISOString(),
      }]);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { 
      id: Date.now(), 
      role: 'user', 
      content: input, 
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input.toLowerCase();
    setInput('');
    setIsGenerating(true);

    // Simulate AI response based on farm data
    setTimeout(() => {
      let response = "";
      
      if (currentInput.includes('status') || currentInput.includes('summary')) {
        const activeDoes = farmData.rabbits.filter(r => r.gender === 'Doe' && r.status === 'Active').length;
        const activeBucks = farmData.rabbits.filter(r => r.gender === 'Buck' && r.status === 'Active').length;
        response = `Your farm is currently operating with ${activeDoes} active does and ${activeBucks} active bucks. You have ${farmData.cages.filter(c => c.status === 'Empty').length} empty cages available for expansion.`;
      } else if (currentInput.includes('breeding') || currentInput.includes('litter')) {
        const pendingPalpations = farmData.breeding.filter(r => r.status === 'Mated').length;
        const totalKits = farmData.litters.reduce((s, l) => s + (l.totalKits || 0), 0);
        const aliveKits = farmData.litters.reduce((s, l) => s + (l.aliveKits || 0), 0);
        const survivalRate = totalKits > 0 ? (aliveKits / totalKits) * 100 : 0;
        
        response = `I've detected ${pendingPalpations} pending palpations. Based on your historical survival rate of ${survivalRate.toFixed(1)}%, I project a stock increase of approximately ${Math.round(pendingPalpations * 6 * 0.8)} kits in the next 30 days.`;
      } else if (currentInput.includes('weight') || currentInput.includes('growth')) {
        const avgWeight = farmData.rabbits.length > 0 
          ? (farmData.rabbits.reduce((s, r) => s + r.weight, 0) / farmData.rabbits.length).toFixed(2) 
          : 0;
        response = `The average weight across your stock is ${avgWeight} kg. I recommend checking the feed conversion ratio for rabbits in Section B, as their growth curve is slightly below the breed standard.`;
      } else if (currentInput.includes('cage') || currentInput.includes('space')) {
        const occupancy = farmData.cages.length > 0 
          ? ((farmData.cages.filter(c => c.status === 'Occupied').length / farmData.cages.length) * 100).toFixed(1)
          : 0;
        response = `Your current cage occupancy is at ${occupancy}%. You have ${farmData.cages.filter(c => c.status === 'Maintenance').length} cages under maintenance. I suggest prioritizing the repair of G-01 to accommodate the upcoming weaning batch.`;
      } else {
        response = "I'm monitoring the farm's vital signs. Everything looks optimal for the current season. I can help you with breeding projections, weight analysis, or cage management. What would you like to focus on?";
      }

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        model: settings?.aiProvider ? settings.aiProvider.toUpperCase() : 'Neural Link'
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 1500);
  };

  const handleQrScan = (decodedText: string) => {
    setIsScannerOpen(false);
    const rabbit = farmData.rabbits.find(r => r.tagId === decodedText || r.id === decodedText);
    if (rabbit) {
      setInput(`Analyze rabbit ${rabbit.name} (${rabbit.tagId})`);
      // Auto-send
      setTimeout(() => handleSend(), 100);
    } else {
      setInput(`I scanned a tag: ${decodedText}. I couldn't find this rabbit in the database.`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-slate-50">
      {/* Header */}
      <div className="p-6 bg-white border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Neural Lab</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Engine Online ({settings?.aiProvider || 'Neural Link'})</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full gap-2 hidden md:flex" onClick={() => navigate('/settings')}>
            <SettingsIcon className="h-4 w-4" />
            AI Config
          </Button>
          <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => setIsScannerOpen(true)}>
            <Zap className="h-4 w-4" />
            Quick Scan
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={cn(
            "flex gap-4 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300",
            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
              msg.role === 'assistant' ? "bg-primary text-white" : "bg-white text-slate-600 border"
            )}>
              {msg.role === 'assistant' ? <BrainCircuit size={20} /> : <Activity size={20} />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl shadow-sm border",
              msg.role === 'assistant' ? "bg-white border-slate-100" : "bg-primary text-white border-primary"
            )}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={cn(
                "text-[10px] mt-2 font-bold uppercase tracking-widest",
                msg.role === 'assistant' ? "text-muted-foreground" : "text-white/60"
              )}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-white border-t">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={settings?.aiKey ? "Ask anything about your farm..." : "Enter AI Key in Settings to enable full power..."}
            className="w-full pl-6 pr-16 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl h-10 w-10"
            disabled={!input.trim() || isGenerating}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={() => setInput("Farm status summary")} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Status</button>
          <button onClick={() => setInput("Breeding projections")} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Breeding</button>
          <button onClick={() => setInput("Cage occupancy analysis")} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Cages</button>
        </div>
      </div>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <QRScanner onScan={handleQrScan} onClose={() => setIsScannerOpen(false)} />
      )}
    </div>
  );
};

export default NeuralLab;
