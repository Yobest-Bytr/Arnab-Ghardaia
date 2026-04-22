
import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, Activity, Database, ArrowRight, Info, Clock, X, Terminal, Shield, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, Rabbit, BreedingRecord, Litter } from '@/lib/storage';
import { QRScanner } from '@/components/QrScanner';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NeuralLab = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [farmData, setFarmData] = useState<{rabbits: Rabbit[], breeding: BreedingRecord[], litters: Litter[]}>({
    rabbits: [],
    breeding: [],
    litters: []
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rabbits = storage.getRabbits();
    const breeding = storage.getBreedingRecords();
    const litters = storage.getLitters();
    setFarmData({ rabbits, breeding, litters });

    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Neural Link Established. I am your AI Farm Assistant. I have analyzed your farm data and I'm ready to help you optimize your rabbitry. How can I assist you today?",
      timestamp: new Date().toISOString(),
    }]);
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
    const currentInput = input;
    setInput('');
    setIsGenerating(true);

    // Simulate AI response based on farm data
    setTimeout(() => {
      let response = "I've analyzed your request. ";
      
      if (currentInput.toLowerCase().includes('status') || currentInput.toLowerCase().includes('summary')) {
        response += `You currently have ${farmData.rabbits.length} rabbits in your inventory. There are ${farmData.breeding.filter(r => r.status !== 'Weaned' && r.status !== 'Failed').length} active breeding cycles.`;
      } else if (currentInput.toLowerCase().includes('breeding') || currentInput.toLowerCase().includes('litter')) {
        const activeDoes = farmData.rabbits.filter(r => r.gender === 'Doe' && r.status === 'Active').length;
        response += `Based on your ${activeDoes} active does, I recommend scheduling 2 more matings this week to maintain optimal production flow.`;
      } else {
        response += "I'm monitoring the farm's vital signs. Everything looks optimal for the current season. Do you have specific questions about a rabbit or a breeding record?";
      }

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 1500);
  };

  const handleQrScan = (decodedText: string) => {
    setIsScannerOpen(false);
    const rabbit = farmData.rabbits.find(r => r.tagId === decodedText || r.id === decodedText);
    if (rabbit) {
      setInput(`Tell me about rabbit ${rabbit.name} (${rabbit.tagId})`);
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
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Engine Online</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => setIsScannerOpen(true)}>
          <Zap className="h-4 w-4" />
          Quick Scan
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={cn(
            "flex gap-4 max-w-3xl",
            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              msg.role === 'assistant' ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
            )}>
              {msg.role === 'assistant' ? <BrainCircuit size={20} /> : <Activity size={20} />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl shadow-sm border",
              msg.role === 'assistant' ? "bg-white border-slate-100" : "bg-primary text-white border-primary"
            )}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={cn(
                "text-[10px] mt-2",
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
            placeholder="Ask anything about your farm..."
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
        <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-bold">
          Powered by Hop Farm Neural Engine v4.1
        </p>
      </div>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <QRScanner onScan={handleQrScan} onClose={() => setIsScannerOpen(false)} />
      )}
    </div>
  );
};

export default NeuralLab;
