import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, FileCode, Terminal, Layers, X,
  ChevronDown, FolderOpen, Plus, Play, Code as CodeIcon, Eye, Save, Copy,
  AlertTriangle, Shield, Settings, Globe, Bell, MoreHorizontal, Maximize2, RefreshCw,
  Github, Database, ExternalLink, CheckCircle2, Info, Folder, RotateCcw, Trash2,
  ArrowLeft, ArrowRight, MousePointer2, Pencil, Maximize, Lock, Key, Cloud, Activity, Box, Wand2, LayoutGrid,
  ChevronLeft, RotateCcw as RestartIcon, Rocket, Share2, CheckCircle, Package, Lightbulb, Wand, Search,
  MessageSquare, Mic, History, BarChart, Smartphone, Tablet, Monitor, Download, Wifi, WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';
import ProjectModal from '@/components/ProjectModal';
import FileExplorer from '@/components/FileExplorer';
import SystemMessages from '@/components/SystemMessages';
import { ChatMessage } from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { cn } from "@/lib/utils";
import { downloadProject } from '@/utils/download';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const MODELS = [
  { id: 'auto', name: 'Auto', icon: Wand2, desc: 'Automatic Model Selection' },
  { id: 'yobest-ai', name: 'Yobest AI 4.1', icon: Sparkles, desc: 'Native Cognitive Engine' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5', icon: Zap, desc: 'Anthropic Sonnet' },
  { id: 'gpt-4o', name: 'GPT-4o', icon: Cpu, desc: 'OpenAI Multimodal' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0', icon: Layers, desc: 'Google Flash Pro' },
];

const NeuralLab = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [hasKey, setHasKey] = useState(true);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectScripts, setProjectScripts] = useState<any[]>([]);
  const [selectedScript, setSelectedScript] = useState<any>(null);
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [aiTab, setAiTab] = useState<'chat' | 'packages' | 'insights'>('chat');
  const [mainMode, setMainMode] = useState<'dashboard' | 'workspace'>('dashboard');
  const [editorContent, setEditorContent] = useState('');
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // Farm Data Snapshot
  const [farmSnapshot, setFarmSnapshot] = useState<any>({ rabbits: [], sales: [], litters: [] });

  const scrollRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchFarmSnapshot();
      addLog('info', 'Neural Lab initialized. Neural link established.');
    }
  }, [user]);

  const fetchFarmSnapshot = async () => {
    if (!user) return;
    const [rabbits, sales, litters] = await Promise.all([
      storage.get('rabbits', user.id),
      storage.get('sales', user.id),
      storage.get('litters', user.id)
    ]);
    setFarmSnapshot({ rabbits, sales, litters });
  };

  const addLog = (type: 'info' | 'warn' | 'error', text: string) => {
    setSystemLogs(prev => [{ type, text, timestamp: new Date().toISOString() }, ...prev].slice(0, 100));
  };

  const fetchProjects = async () => {
    if (!user) return;
    const data = await storage.get('projects', user.id);
    setProjects(data);
  };

  const fetchScripts = async (projectId: string) => {
    if (!user) return;
    const data = await storage.get('scripts', user.id);
    const filtered = data.filter((s: any) => s.project_id === projectId);
    setProjectScripts(filtered);
    if (filtered.length > 0) {
      const entry = filtered.find((s: any) => s.path === 'src/App.tsx') || filtered[0];
      setSelectedScript(entry);
    }
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
      const systemPrompt = `You are the Yobest AI Neural Architect. You have access to the user's farm data.
      
      NEURAL SNAPSHOT:
      - Rabbits: ${farmSnapshot.rabbits.length} total
      - Sales: ${farmSnapshot.sales.length} total
      - Litters: ${farmSnapshot.litters.length} total
      
      You can suggest actions using this format: [ACTION: ADD_RABBIT {"name": "...", "breed": "..."}]
      Current Inventory: ${JSON.stringify(farmSnapshot.rabbits.slice(0, 5))}
      
      Help the user manage their farm, analyze data, or build their workspace.`;

      await grokChat(input, { 
        modelId: selectedModel.id, 
        userId: user?.id, 
        stream: true,
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
            model: selectedModel.name, 
            timestamp: new Date().toISOString(),
            thought: "Analyzing farm snapshot and neural context..."
          }];
        });
      });
    } finally {
      setIsGenerating(false);
      fetchFarmSnapshot(); // Refresh snapshot after potential actions
    }
  };

  return (
    <div className="h-screen bg-[#020408] text-white relative overflow-hidden flex flex-col">
      <Navbar />
      
      <div className="mt-24 px-6 h-16 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-xl relative z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            <button onClick={() => setMainMode('dashboard')} className={cn("flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all", mainMode === 'dashboard' ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white")}>
              <LayoutGrid size={14} /> Dashboard
            </button>
            <button onClick={() => selectedProject && setMainMode('workspace')} disabled={!selectedProject} className={cn("flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all", mainMode === 'workspace' ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white disabled:opacity-30")}>
              <CodeIcon size={14} /> Workspace
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full relative z-10 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {mainMode === 'dashboard' ? (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 p-12 overflow-y-auto custom-scrollbar">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h1 className="text-5xl font-black tracking-tighter dopamine-text">Project Dashboard</h1>
                    <p className="text-white/40 font-medium mt-2">Select a project to enter the neural workspace.</p>
                  </div>
                  <button onClick={() => setIsProjectModalOpen(true)} className="auron-button h-14 px-8 flex items-center gap-3"><Plus size={20} /> New Project</button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project) => (
                    <button key={project.id} onClick={() => { setSelectedProject(project); fetchScripts(project.id); setMainMode('workspace'); }} className="pill-nav p-8 bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all text-left group">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform"><FolderOpen size={24} /></div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-2xl font-black mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                      <p className="text-sm text-white/40 font-medium line-clamp-2 mb-8">{project.description || 'Neural workspace initialized.'}</p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">Enter Workspace <ArrowRight size={12} /></div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={15} minSize={10} className="hidden md:block">
                  <FileExplorer files={projectScripts} onFileSelect={setSelectedScript} onFileCreate={() => {}} onFileDelete={() => {}} selectedFileId={selectedScript?.id} />
                </ResizablePanel>
                <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors hidden md:block" />
                <ResizablePanel defaultSize={85}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={70}>
                      <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={60}>
                          <div className="h-full flex flex-col bg-[#010204]">
                            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
                              <AnimatePresence mode="wait">
                                {activeTab === 'preview' && (
                                  <motion.div 
                                    key="preview" 
                                    initial={{ opacity: 0, scale: 0.95 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 0.95 }} 
                                    className={cn(
                                      "bg-white shadow-2xl transition-all duration-500 overflow-hidden",
                                      viewportSize === 'mobile' ? "w-[375px] h-[667px] rounded-[3rem] border-[8px] border-black" :
                                      viewportSize === 'tablet' ? "w-[768px] h-[1024px] rounded-[2rem] border-[8px] border-black" :
                                      "w-full h-full"
                                    )}
                                  >
                                    <iframe ref={previewRef} title="Live Preview" className="w-full h-full border-none" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </ResizablePanel>
                        <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors" />
                        <ResizablePanel defaultSize={40}>
                          <div className="h-full flex flex-col bg-[#0a0a0a] border-l border-white/5">
                            <div className="flex-1 overflow-hidden flex flex-col p-6">
                              <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                {messages.map((msg) => <ChatMessage key={msg.id} {...msg} />)}
                              </div>
                              <div className="mt-4">
                                <ChatInput value={input} onChange={setInput} onSubmit={handleSend} isGenerating={isGenerating} selectedModelId={selectedModel.id} onModelChange={setSelectedModel} onBuild={() => {}} onFileAttach={() => {}} />
                              </div>
                            </div>
                          </div>
                        </ResizablePanel>
                      </ResizablePanelGroup>
                    </ResizablePanel>
                    <ResizableHandle className="h-1 bg-white/5 hover:bg-indigo-500/30 transition-colors" />
                    <ResizablePanel defaultSize={30}>
                      <SystemMessages messages={systemLogs} isOpen={isConsoleOpen} onToggle={() => setIsConsoleOpen(!isConsoleOpen)} />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={() => {}} />
    </div>
  );
};

export default NeuralLab;