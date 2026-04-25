
import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, Activity, Database, ArrowRight, Info, Clock, X, Terminal, Shield, Globe,
  Settings as SettingsIcon, Image as ImageIcon, Trash2, Maximize2, Minimize2,
  Bot, User, Paperclip, Mic, Volume2, Share2, Download, Box, Rabbit as RabbitIcon, Baby, Heart
} from 'lucide-react';
import { storage, Rabbit, BreedingRecord, Litter, Cage, UserSettings } from '@/lib/db';
import { supabase } from '@/integrations/supabase/client';
import { QRScanner } from '@/components/QrScanner';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { grokChat } from '@/lib/puter';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';

const NeuralLab = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rabbits, breeding, litters, cages, userSettings] = await Promise.all([
          storage.getRabbits(),
          storage.getBreedingRecords(),
          storage.getLitters(),
          storage.getCages(),
          storage.getSettings()
        ]);
        
        setFarmData({ rabbits, breeding, litters, cages });
        setSettings(userSettings);

        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Neural Link Established. I am your AI Farm Assistant. I have analyzed your farm data (${rabbits.length} rabbits, ${breeding.length} breeding records, ${cages.length} cages) and I'm ready to help you optimize your rabbitry. How can I assist you today?`,
          timestamp: new Date().toISOString(),
        }]);
      } catch (err) {
        showError("Failed to establish neural link.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    
    const userMsg = { 
      id: Date.now(), 
      role: 'user', 
      content: input, 
      image: selectedImage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    setIsGenerating(true);

    try {
      const systemPrompt = `You are the Arnab Ghardaia Neural Assistant, a highly advanced AI specialized in rabbit farm management.
      You have access to the following farm data:
      - Rabbits: ${JSON.stringify(farmData.rabbits.map(r => ({ id: r.id, name: r.name, breed: r.breed, gender: r.gender, status: r.status, weight: r.weight, tagId: r.tagId })))}
      - Breeding Records: ${JSON.stringify(farmData.breeding)}
      - Litters: ${JSON.stringify(farmData.litters)}
      - Cages: ${JSON.stringify(farmData.cages)}
      
      Your goal is to provide data-driven insights, breeding recommendations, and health advice.
      Be professional, concise, and helpful. If the user provides an image, analyze it for rabbit health, breed identification, or cage conditions.

      NEURAL ACTIONS:
      You can perform actions by including a JSON block at the end of your response.
      Supported actions:
      1. Add Rabbit: {"action": "add_rabbit", "data": {"name": "...", "breed": "...", "gender": "Buck/Doe", "tagId": "..."}}
      2. Update Rabbit: {"action": "update_rabbit", "data": {"id": "...", "updates": {"weight": 5.2, "status": "Sold"}}}
      3. Record Sale: {"action": "record_sale", "data": {"customer_name": "...", "price": 5000, "rabbit_id": "..."}}
      4. Record Litter: {"action": "record_litter", "data": {"doeId": "...", "totalKits": 8, "aliveKits": 7, "deadKits": 1}}

      Example: "I've added the new rabbit for you. ```json {"action": "add_rabbit", "data": {"name": "Snowy", "breed": "Rex", "gender": "Doe", "tagId": "R-999"}} ```"
      `;

      let aiResponse = "";
      await grokChat(currentInput, {
        userId: settings?.farmName || 'default',
        image: currentImage || undefined,
        systemPrompt,
        stream: true
      }, (chunk) => {
        aiResponse += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.id === 'streaming') {
            return [...prev.slice(0, -1), { ...last, content: aiResponse }];
          } else {
            return [...prev, {
              id: 'streaming',
              role: 'assistant',
              content: aiResponse,
              timestamp: new Date().toISOString(),
              model: settings?.aiProvider || 'Neural Link'
            }];
          }
        });
      });

      // Parse for actions
      const actionMatch = aiResponse.match(/```json\s*({[\s\S]*?})\s*```/) || aiResponse.match(/({[\s\S]*?"action"[\s\S]*?})/);
      if (actionMatch) {
        try {
          const actionData = JSON.parse(actionMatch[1]);
          await handleNeuralAction(actionData);
        } catch (e) {
          console.error("Failed to parse neural action", e);
        }
      }

      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.id === 'streaming') {
          return [...prev.slice(0, -1), { ...last, id: Date.now() }];
        }
        return prev;
      });

    } catch (err) {
      showError("Neural processing failed.");
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: "I'm sorry, I encountered a cognitive error while processing your request. Please check your AI configuration in Settings.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNeuralAction = async (action: any) => {
    const { user } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) return;

    try {
      switch (action.action) {
        case 'add_rabbit':
          await storage.insert('rabbits', userId, action.data);
          showSuccess(`Neural Action: Added rabbit ${action.data.name}`);
          break;
        case 'update_rabbit':
          await storage.update('rabbits', userId, action.data.id, action.data.updates);
          showSuccess(`Neural Action: Updated rabbit`);
          break;
        case 'record_sale':
          await storage.insert('sales', userId, action.data);
          showSuccess(`Neural Action: Recorded sale to ${action.data.customer_name}`);
          break;
        case 'record_litter':
          await storage.insert('litters', userId, { ...action.data, status: 'Pregnant' });
          showSuccess(`Neural Action: Recorded new litter`);
          break;
      }
      // Refresh farm data
      const [rabbits, breeding, litters, cages] = await Promise.all([
        storage.getRabbits(),
        storage.getBreedingRecords(),
        storage.getLitters(),
        storage.getCages()
      ]);
      setFarmData({ rabbits, breeding, litters, cages });
    } catch (err) {
      showError("Neural Action failed to execute.");
    }
  };

  const handleQrScan = (decodedText: string) => {
    setIsScannerOpen(false);
    const rabbit = farmData.rabbits.find(r => r.tagId === decodedText || r.id === decodedText);
    if (rabbit) {
      setInput(`Analyze rabbit ${rabbit.name} (${rabbit.tagId})`);
      setTimeout(() => handleSend(), 100);
    } else {
      setInput(`I scanned a tag: ${decodedText}. I couldn't find this rabbit in the database.`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen bg-[#020408] text-white overflow-hidden font-sans">
      {/* Sidebar - Desktop Only */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-r border-white/10 bg-white/[0.02] backdrop-blur-xl shrink-0"
          >
            <div className="p-8 border-b border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter">Neural Lab</h2>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">v4.0 Cognitive Uplink</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">System Status</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">Online</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        className="h-full bg-indigo-500"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white/40">85%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-2">Farm Context</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Active Rabbits', val: farmData.rabbits.length, icon: RabbitIcon },
                    { label: 'Breeding Cycles', val: farmData.breeding.length, icon: Activity },
                    { label: 'Total Litters', val: farmData.litters.length, icon: Baby },
                    { label: 'Cage Capacity', val: farmData.cages.length, icon: Box },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-indigo-400 transition-colors">
                          <item.icon size={16} />
                        </div>
                        <span className="text-xs font-bold text-white/60">{item.label}</span>
                      </div>
                      <span className="text-sm font-black">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-2">Neural Shortcuts</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => setInput("Analyze my current breeding efficiency")} className="text-left p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all">
                    Breeding Efficiency
                  </button>
                  <button onClick={() => setInput("Identify potential health risks in my stock")} className="text-left p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all">
                    Health Risk Analysis
                  </button>
                  <button onClick={() => setInput("Optimize my cage allocation")} className="text-left p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all">
                    Cage Optimization
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5" onClick={() => navigate('/settings')}>
                <SettingsIcon size={18} />
                <span className="text-xs font-bold">Neural Configuration</span>
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 auron-radial pointer-events-none opacity-30" />
        
        {/* Mobile Header */}
        <div className="lg:hidden p-6 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <BrainCircuit size={20} />
            </div>
            <h1 className="text-lg font-black tracking-tighter">Neural Lab</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsScannerOpen(true)}>
            <Zap size={20} className="text-indigo-400" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 relative z-10 custom-scrollbar" ref={scrollRef}>
          {messages.map((msg, i) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-6 max-w-4xl",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl",
                msg.role === 'assistant' ? "bg-indigo-600 text-white" : "bg-white/10 text-white/60 border border-white/10"
              )}>
                {msg.role === 'assistant' ? <Bot size={24} /> : <User size={24} />}
              </div>
              <div className="space-y-2 max-w-[85%]">
                <div className={cn(
                  "p-6 rounded-[2rem] shadow-2xl border backdrop-blur-md",
                  msg.role === 'assistant' ? "bg-white/5 border-white/10" : "bg-indigo-600 border-indigo-500 text-white"
                )}>
                  {msg.image && (
                    <div className="mb-4 rounded-2xl overflow-hidden border border-white/10">
                      <img src={msg.image} alt="Uploaded context" className="w-full max-h-64 object-cover" />
                    </div>
                  )}
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className={cn(
                  "flex items-center gap-3 px-4",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.model && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{msg.model}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isGenerating && !messages.find(m => m.id === 'streaming') && (
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-2xl">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex gap-2">
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-indigo-500" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-indigo-500" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 md:p-10 bg-black/50 backdrop-blur-2xl border-t border-white/10 z-20">
          <div className="max-w-5xl mx-auto">
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 w-fit"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="pr-4">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Image Attached</p>
                  <button onClick={() => setSelectedImage(null)} className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">Remove</button>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSend} className="relative group">
              <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-[2.5rem] opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
              <div className="relative flex items-center gap-4 p-2 bg-white/5 border border-white/10 rounded-[2.5rem] focus-within:border-indigo-500/50 transition-all">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 w-12 rounded-2xl text-white/40 hover:text-indigo-400 hover:bg-white/5 shrink-0"
                >
                  <ImageIcon size={20} />
                </Button>
                
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={settings?.aiKey ? "Ask anything about your farm..." : "Enter AI Key in Settings to enable full power..."}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base font-medium py-4 resize-none max-h-32 custom-scrollbar"
                  rows={1}
                />

                <div className="flex items-center gap-2 pr-2">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsScannerOpen(true)}
                    className="h-12 w-12 rounded-2xl text-white/40 hover:text-indigo-400 hover:bg-white/5 shrink-0 hidden md:flex"
                  >
                    <Zap size={20} />
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={(!input.trim() && !selectedImage) || isGenerating}
                    className="h-12 w-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 shrink-0"
                  >
                    {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </form>
            
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <button onClick={() => setInput("Generate a summary of my farm's current health status")} className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-indigo-400 transition-colors">
                <Activity size={12} /> Health Summary
              </button>
              <button onClick={() => setInput("Which does are ready for breeding based on their history?")} className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-indigo-400 transition-colors">
                <Heart size={12} /> Breeding Advice
              </button>
              <button onClick={() => setInput("Analyze my cage occupancy and suggest optimizations")} className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-indigo-400 transition-colors">
                <Box size={12} /> Cage Analysis
              </button>
            </div>
          </div>
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
