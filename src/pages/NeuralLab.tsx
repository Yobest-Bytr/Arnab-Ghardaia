import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Image as ImageIcon, Trash2, Loader2, 
  FileCode, Terminal, Layers, Info, X,
  Download, Key, ChevronDown, FolderOpen, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';
import ProjectModal from '@/components/ProjectModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MODELS = [
  { id: 'yobest-ai', name: 'Yobest AI', icon: Sparkles, type: 'Free', desc: 'Unlimited Grok 3 Fast' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5', icon: Zap, type: 'Key Required', desc: 'Anthropic Sonnet' },
  { id: 'gpt-4o', name: 'GPT-4o', icon: Cpu, type: 'Key Required', desc: 'OpenAI Multimodal' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0', icon: Layers, type: 'Key Required', desc: 'Google Flash Pro' },
  { id: 'deepseek-chat', name: 'DeepSeek', icon: Terminal, type: 'Key Required', desc: 'DeepSeek V3 Chat' },
];

const NeuralLab = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchProjects = async () => {
    if (!user) return;
    const data = await storage.get('scripts', user.id);
    setProjects(data);
    if (data.length > 0 && !selectedProject) setSelectedProject(data[0]);
  };

  const handleCreateProject = async (project: { title: string; description: string }) => {
    if (!user) return;
    const newProject = {
      title: project.title,
      content: `// Project: ${project.title}\n// Objective: ${project.description}\n\n// Initialize neural link...`
    };
    const data = await storage.insert('scripts', user.id, newProject);
    setProjects([data, ...projects]);
    setSelectedProject(data);
    showSuccess(`Project "${project.title}" initialized.`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        showSuccess("Image attached to neural buffer");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAsScript = async (content: string) => {
    if (!user) return;
    const newScript = {
      title: `Lab Script ${new Date().toLocaleTimeString()}`,
      content: content
    };
    const data = await storage.insert('scripts', user.id, newScript);
    setProjects([data, ...projects]);
    setSelectedProject(data);
    showSuccess("Archived to Scripts");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedImage) || isGenerating) return;

    const userMsg = { 
      id: Date.now(), 
      role: 'user', 
      content: input, 
      image: attachedImage,
      timestamp: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImage = attachedImage;
    setAttachedImage(null);
    setIsGenerating(true);

    try {
      let responseText = "";
      const result = await grokChat(
        input || "Analyze this image", 
        { 
          modelId: selectedModel.id, 
          userId: user?.id,
          image: currentImage || undefined 
        },
        (chunk) => {
          responseText += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, content: responseText }];
            } else {
              return [...prev, { 
                id: Date.now() + 1, 
                role: 'assistant', 
                content: responseText, 
                model: selectedModel.name,
                timestamp: new Date().toISOString() 
              }];
            }
          });
        }
      );

      if (result && !responseText) {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'assistant', 
          content: result, 
          model: selectedModel.name,
          timestamp: new Date().toISOString() 
        }]);
      }
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
      
      <main className="flex-1 pt-32 pb-10 px-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 relative z-10">
        <aside className="lg:w-80 flex flex-col gap-6">
          <div className="pill-nav p-6 bg-white/5 border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                <FolderOpen size={14} /> Active Project
              </h2>
              <button 
                onClick={() => setIsProjectModalOpen(true)}
                className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all outline-none">
                <span className="font-bold text-sm truncate">
                  {selectedProject ? selectedProject.title : "Select Project"}
                </span>
                <ChevronDown size={16} className="text-white/40" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-64 max-h-64 overflow-y-auto">
                {projects.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => setSelectedProject(p)} className="cursor-pointer font-medium">
                    {p.title}
                  </DropdownMenuItem>
                ))}
                {projects.length === 0 && <DropdownMenuItem disabled>No projects found</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="pill-nav p-6 bg-white/5 border-white/10">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2">
              <Terminal size={14} /> Cognitive Models
            </h2>
            <div className="space-y-3">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left group ${
                    selectedModel.id === model.id 
                      ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <model.icon size={18} className={selectedModel.id === model.id ? 'text-white' : 'text-indigo-400'} />
                      <span className="font-bold text-sm">{model.name}</span>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                      model.type === 'Free' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {model.type}
                    </span>
                  </div>
                  <p className={`text-[10px] font-medium ${selectedModel.id === model.id ? 'text-white/70' : 'text-white/30'}`}>
                    {model.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-[600px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 mb-8 pr-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <BrainCircuit size={48} className="mb-6 text-indigo-400" />
                <h3 className="text-2xl font-black mb-2">Neural Lab Initialized</h3>
                <p className="text-sm font-medium">Select a model and project to begin research.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-6 rounded-[2.5rem] relative group ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 
                    'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 opacity-40 text-[10px] font-black uppercase tracking-widest">
                        {msg.role === 'user' ? <Zap size={12} /> : <Cpu size={12} />}
                        {msg.role === 'user' ? 'Researcher' : msg.model}
                      </div>
                      {msg.role === 'assistant' && (
                        <button onClick={() => handleSaveAsScript(msg.content)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#99f6ff] hover:text-white">
                          <FileCode size={16} />
                        </button>
                      )}
                    </div>
                    {msg.image && <img src={msg.image} className="mb-4 rounded-2xl max-h-64 w-full object-cover border border-white/10" alt="Uploaded" />}
                    <p className="font-medium leading-relaxed whitespace-pre-wrap text-sm md:text-base">{msg.content}</p>
                  </div>
                </motion.div>
              ))
            )}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] rounded-tl-none">
                  <Loader2 className="animate-spin text-indigo-400" size={20} />
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <AnimatePresence>
              {attachedImage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full mb-4 left-0 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl flex items-center gap-3">
                  <img src={attachedImage} className="w-12 h-12 rounded-lg object-cover" alt="Preview" />
                  <button onClick={() => setAttachedImage(null)} className="p-1 hover:bg-white/10 rounded-full text-rose-400"><X size={16} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSend} className="pill-nav p-2 flex items-center bg-white/5 border-white/10 focus-within:border-indigo-500/50 transition-all shadow-2xl">
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${attachedImage ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/20 hover:text-white hover:bg-white/5'}`}>
                <ImageIcon size={20} />
              </button>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the cognitive engine..." className="flex-1 bg-transparent border-none h-14 px-4 text-white placeholder:text-white/20 focus:ring-0 font-medium" />
              <button type="submit" disabled={isGenerating || (!input.trim() && !attachedImage)} className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-all disabled:opacity-50">
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </main>

      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onSave={handleCreateProject} 
      />
    </div>
  );
};

export default NeuralLab;