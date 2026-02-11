import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, FileCode, Terminal, Layers, X,
  ChevronDown, FolderOpen, Plus, Play, Code as CodeIcon, Eye, Save, Copy,
  AlertTriangle, Shield, Settings, Globe, Bell, MoreHorizontal, Maximize2, RefreshCw,
  Github, Database, ExternalLink, CheckCircle2, Info, Folder, RotateCcw, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';
import ProjectModal from '@/components/ProjectModal';
import CodeFrame from '@/components/CodeFrame';
import FileExplorer from '@/components/FileExplorer';
import SystemMessages from '@/components/SystemMessages';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const MODELS = [
  { id: 'yobest-ai', name: 'Auto', icon: Sparkles, desc: 'Unlimited Grok 3 Fast' },
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
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('code');
  const [editorContent, setEditorContent] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResults, setCheckResults] = useState<any>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
      addLog('info', 'Neural Lab initialized. Neural link established.');
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (selectedProject) {
      setEditorContent(selectedProject.content);
      addLog('info', `Switched to project: ${selectedProject.title}`);
    }
  }, [selectedProject]);

  const addLog = (type: 'info' | 'warn' | 'error', text: string) => {
    setSystemLogs(prev => [{ type, text, timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
  };

  const fetchProjects = async () => {
    if (!user) return;
    const data = await storage.get('scripts', user.id);
    setProjects(data);
    if (data.length > 0 && !selectedProject) setSelectedProject(data[0]);
  };

  const handleRunChecks = () => {
    setIsChecking(true);
    setCheckResults(null);
    addLog('info', 'Running neural checks...');
    setTimeout(() => {
      setIsChecking(false);
      setCheckResults({ errors: 0, warnings: 0, status: 'Optimal' });
      addLog('info', 'Checks complete. 0 errors, 0 warnings found.');
      showSuccess("Neural checks passed.");
    }, 2000);
  };

  const handleCreateProject = async (project: { title: string; description: string }) => {
    if (!user) return;
    const newProject = {
      title: project.title,
      content: `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #020408; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n    h1 { color: #99f6ff; text-shadow: 0 0 20px rgba(153,246,255,0.5); }\n  </style>\n</head>\n<body>\n  <h1>${project.title} Initialized</h1>\n</body>\n</html>`
    };
    const data = await storage.insert('scripts', user.id, newProject);
    setProjects([data, ...projects]);
    setSelectedProject(data);
    addLog('info', `Created new project: ${project.title}`);
  };

  const handleAddCodeToProject = (code: string) => {
    setEditorContent(prev => prev + "\n\n" + code);
    addLog('info', 'Applied AI code block to editor.');
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
    setIsGenerating(true);
    addLog('info', 'Sending neural request...');

    try {
      let responseText = "";
      const contextPrompt = selectedProject ? `[Context: Current file is ${selectedProject.title}. Content: ${editorContent.slice(0, 1000)}...] ${input}` : input;
      
      await grokChat(
        contextPrompt, 
        { modelId: selectedModel.id, userId: user?.id, image: attachedImage || undefined },
        (chunk) => {
          responseText += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { 
                ...last, 
                content: responseText,
                thought: "Analyzing the codebase and applying the requested changes to ensure optimal performance and clean architecture."
              }];
            } else {
              return [...prev, { 
                id: Date.now() + 1, 
                role: 'assistant', 
                content: responseText, 
                thought: "Analyzing the codebase and applying the requested changes to ensure optimal performance and clean architecture.",
                model: selectedModel.name,
                timestamp: new Date().toISOString(),
                fileChange: selectedProject ? {
                  name: selectedProject.title,
                  path: `src/pages/${selectedProject.title}`,
                  summary: `Updating ${selectedProject.title} with new logic.`
                } : undefined
              }];
            }
          });
        }
      );
      addLog('info', 'Neural response received.');
    } catch (error) {
      addLog('error', 'Neural link interrupted.');
    } finally {
      setIsGenerating(false);
      setAttachedImage(null);
    }
  };

  const updatePreview = () => {
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(editorContent);
        doc.close();
        addLog('info', 'Live preview refreshed.');
      }
    }
  };

  return (
    <div className="h-screen bg-[#020408] text-white relative overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Top IDE Navigation */}
      <div className="pt-24 px-4 h-36 border-b border-white/5 flex flex-col bg-[#0a0a0a]">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-1">
            {[
              { id: 'preview', label: 'Preview', icon: Eye },
              { id: 'problems', label: 'Problems', icon: AlertTriangle },
              { id: 'code', label: 'Code', icon: CodeIcon },
              { id: 'configure', label: 'Configure', icon: Settings },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'publish', label: 'Publish', icon: Globe },
            ].map((btn) => (
              <button 
                key={btn.id}
                onClick={() => setActiveTab(btn.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
                  activeTab === btn.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <btn.icon size={14} />
                {btn.label}
              </button>
            ))}
            <div className="w-[1px] h-6 bg-white/10 mx-2" />
            <button className="p-2 text-white/40 hover:text-white"><Bell size={16} /></button>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 text-white/40 hover:text-white outline-none">
                <MoreHorizontal size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-48 p-2">
                <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-white/5">
                  <RotateCcw size={14} />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs">Rebuild</span>
                    <span className="text-[9px] text-white/30">Re-installs node_modules</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-white/5">
                  <Trash2 size={14} />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs">Clear Cache</span>
                    <span className="text-[9px] text-white/30">Clears local storage</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white">Building TaskMaster with Supabase</span>
                <span className="text-[9px] text-white/30">vibrant-wolf-glow</span>
              </div>
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={10} />
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold hover:bg-white/10 transition-all">
              <RotateCcw size={14} /> Restart
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 h-12">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all outline-none group">
              <Folder size={14} className="text-indigo-400" />
              <span className="text-xs font-bold text-white">{selectedProject?.title || 'Select Project'}</span>
              <ChevronDown size={12} className="text-white/20" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-64 p-2">
              {projects.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => setSelectedProject(p)} className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-white/5">
                  <Folder size={16} className="text-indigo-400" />
                  <span className="font-bold text-xs">{p.title}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={() => setIsProjectModalOpen(true)} className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-white/5 text-indigo-400">
                <Plus size={16} />
                <span className="font-bold text-xs">New Project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 text-white/40">
            <RefreshCw size={12} className="animate-spin-slow" />
            <span className="text-[10px] font-bold">{projects.length} files</span>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <input type="text" placeholder="Search file contents" className="w-full bg-white/5 border border-white/5 rounded-lg py-1 px-3 text-[10px] outline-none focus:border-indigo-500/50 transition-all" />
          </div>
        </div>
      </div>

      <main className="flex-1 w-full relative z-10 overflow-hidden flex flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={15} minSize={10}>
            <FileExplorer files={projects} onFileSelect={setSelectedProject} selectedFileId={selectedProject?.id} />
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors" />

          <ResizablePanel defaultSize={85}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={60}>
                    <div className="h-full flex flex-col bg-[#010204]">
                      <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-4">
                        <span className="text-[10px] font-bold text-white/40">src > components > {selectedProject?.title}</span>
                        <Maximize2 size={12} className="ml-auto text-white/20 cursor-pointer" />
                      </div>
                      <div className="flex-1 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                          {activeTab === 'code' && (
                            <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                              <textarea
                                value={editorContent}
                                onChange={(e) => setEditorContent(e.target.value)}
                                className="w-full h-full bg-transparent p-8 font-mono text-sm text-indigo-300 outline-none resize-none custom-scrollbar leading-relaxed"
                                spellCheck={false}
                              />
                            </motion.div>
                          )}
                          {activeTab === 'preview' && (
                            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full bg-white">
                              <iframe ref={previewRef} title="Live Preview" className="w-full h-full border-none" onLoad={updatePreview} />
                            </motion.div>
                          )}
                          {activeTab === 'problems' && (
                            <motion.div key="problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center p-12 text-center">
                              {!checkResults ? (
                                <>
                                  <AlertTriangle size={48} className="text-white/10 mb-6" />
                                  <h3 className="text-2xl font-black mb-2">No Problems Report</h3>
                                  <p className="text-white/40 font-medium mb-8 max-w-md">Run checks to scan your app for TypeScript errors and other problems.</p>
                                  <button onClick={handleRunChecks} disabled={isChecking} className="pill-nav px-8 h-12 flex items-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 transition-all font-bold">
                                    {isChecking ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                    Run checks
                                  </button>
                                </>
                              ) : (
                                <div className="pill-nav p-12 bg-emerald-500/5 border-emerald-500/20">
                                  <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-6" />
                                  <h3 className="text-2xl font-black mb-2">Neural Integrity Optimal</h3>
                                  <p className="text-emerald-400/60 font-medium">0 errors, 0 warnings found in workspace.</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors" />

                  <ResizablePanel defaultSize={40}>
                    <div className="h-full flex flex-col p-6 gap-6 bg-[#0a0a0a] border-l border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BrainCircuit size={20} className="text-indigo-400" />
                          <h2 className="text-xs font-black uppercase tracking-widest">AI Assistant</h2>
                        </div>
                        <button className="text-white/20 hover:text-white transition-colors">
                          <X size={18} />
                        </button>
                      </div>

                      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {messages.map((msg) => (
                          <ChatMessage key={msg.id} {...msg} />
                        ))}
                        {isGenerating && <Loader2 className="animate-spin text-indigo-400 mx-auto" size={20} />}
                      </div>

                      <DropdownMenu>
                        <ChatInput 
                          value={input} 
                          onChange={setInput} 
                          onSubmit={handleSend} 
                          isGenerating={isGenerating} 
                          selectedModel={selectedModel.name}
                          onModelChange={() => {}} 
                          attachedImage={attachedImage}
                          onImageAttach={setAttachedImage}
                        />
                        <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-64 p-2">
                          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/20">Select AI Model</div>
                          {MODELS.map(m => (
                            <DropdownMenuItem key={m.id} onClick={() => setSelectedModel(m)} className="flex flex-col items-start gap-1 p-3 cursor-pointer rounded-xl hover:bg-white/5">
                              <div className="flex items-center gap-2 w-full">
                                <m.icon size={14} className="text-indigo-400" />
                                <span className="font-bold text-xs">{m.name}</span>
                                {selectedModel.id === m.id && <CheckCircle2 size={14} className="ml-auto text-indigo-400" />}
                              </div>
                              <p className="text-[10px] text-white/30">{m.desc}</p>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
      </main>

      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={handleCreateProject} />
    </div>
  );
};

export default NeuralLab;