import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { BrainCircuit, Send, Sparkles, Cpu, Zap, MessageSquare, Save, Trash2, Loader2, ChevronRight, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { showSuccess, showError } from '@/utils/toast';

const NeuralLab = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('grok-4.1-fast');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveAsScript = (content: string) => {
    if (!user) return;
    const savedScripts = JSON.parse(localStorage.getItem(`scripts_${user.id}`) || '[]');
    const newScript = {
      id: Date.now(),
      title: `AI Script ${new Date().toLocaleTimeString()}`,
      content: content,
      created_at: new Date().toISOString()
    };
    localStorage.setItem(`scripts_${user.id}`, JSON.stringify([newScript, ...savedScripts]));
    showSuccess("Saved to Neural Archive as Script");
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
      await grokChat(input, (chunk) => {
        responseText += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: responseText }];
          } else {
            return [...prev, { id: Date.now() + 1, role: 'assistant', content: responseText, timestamp: new Date().toISOString() }];
          }
        });
      });
    } catch (error) {
      showError("Neural link interrupted.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      <main className="flex-1 pt-32 pb-10 px-6 max-w-5xl mx-auto w-full flex flex-col relative z-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter dopamine-text">Neural Lab</h1>
            <p className="text-white/40 font-medium">Experiment with cognitive models.</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 mb-8 pr-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <BrainCircuit size={80} className="mb-6" />
              <p className="text-xl font-bold">Initialize a neural conversation...</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-6 rounded-[2rem] relative group ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 opacity-40 text-[10px] font-black uppercase tracking-widest">
                      {msg.role === 'user' ? <Zap size={12} /> : <Cpu size={12} />}
                      {msg.role === 'user' ? 'You' : 'Neural Engine'}
                    </div>
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => handleSaveAsScript(msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#99f6ff] hover:text-white"
                        title="Save as Script"
                      >
                        <FileCode size={16} />
                      </button>
                    )}
                  </div>
                  <p className="font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="relative">
          <div className="pill-nav p-2 flex items-center bg-white/5 border-white/10 focus-within:border-indigo-500/50 transition-all shadow-2xl">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the cognitive engine..."
              className="flex-1 bg-transparent border-none h-14 px-6 text-white placeholder:text-white/20 focus:ring-0 font-medium"
            />
            <button type="submit" disabled={isGenerating || !input.trim()} className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-all">
              <Send size={20} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NeuralLab;