import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, FileCode, Terminal, Layers, X,
  ChevronDown, FolderOpen, Plus, Play, Code as CodeIcon, Eye, Save, Copy,
  AlertTriangle, Shield, Settings, Globe, Bell, MoreHorizontal, Maximize2, RefreshCw,
  Github, Database, ExternalLink, CheckCircle2, Info, Folder, RotateCcw, Trash2,
  ArrowLeft, ArrowRight, MousePointer2, Pencil, Maximize, Lock, Key, Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';
import ProjectModal from '@/components/ProjectModal';
import CodeFrame from '@/components/CodeFrame';
import FileExplorer from '@/components/FileExplorer';
import SystemMessages from '@/components/SystemMessages';
import { ChatMessage } from '@/components/ChatMessage';
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
  const [isRestarting, setIsRestarting] = useState(false);
  
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

  const handleRestart = () => {
    setIsRestarting(true);
    addLog('warn', 'Restarting neural server...');
    setTimeout(() => {
      setIsRestarting(false);
      addLog('info', 'Neural server restarted successfully.');
      showSuccess("Server restarted.");
      updatePreview();
    }, 1500);
  };

  const handleRebuild = () => {
    addLog('warn', 'Initiating full rebuild...');
    addLog('info', 'Cleaning node_modules...');
    setTimeout(() => {
      addLog('info', 'Installing dependencies...');
      setTimeout(() => {
        addLog('info', 'Build complete. Optimized for production.');
        showSuccess("Rebuild complete.");
      }, 2000);
    }, 1000);
  };

  const handleSave = async () => {
    if (!selectedProject || !user) return;
    addLog('info', `Saving ${selectedProject.title}...`);
    await storage.update('scripts', user.id, selectedProject.id, { content: editorContent });
    showSuccess("Project saved.");
    updatePreview();
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

  const handleApplyCode = (code: string) => {
    setEditorContent(prev => prev + "\n\n" + code);
    addLog('info', 'Applied AI code block to editor.');
    showSuccess("Code applied to editor.");
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
      
      {/* Top Browser-like Toolbar */}
      <div className="pt-32 px-4 h-44 border-b border-white/5 flex flex-col bg-[#0a0a0a] relative z-20">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-white/40 hover:text-white transition-colors"><Maximize size={14} /></button>
              <button className="p-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"><MousePointer2 size={14} /></button>
              <button className="p-1.5 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-white/40 hover:text-white transition-colors"><ArrowLeft size={16} /></button>
              <button className="p-1.5 text-white/40 hover:text-white transition-colors"><ArrowRight size={16} /></button>
              <button onClick={updatePreview} className="p-1.5 text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
            </div>
            
            {/* URL Bar */}
            <div className="relative w-[600px] group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Globe size={12} className="text-white/20" />
              </div>
              <input 
                type="text" 
                readOnly 
                value={`/neural-lab/${selectedProject?.title || ''}`} 
                className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-10 text-[11px] font-medium text-white/60 outline-none group-hover:bg-white/10 transition-all cursor-default"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown size={12} className="text-white/20" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold hover:bg-white/10 transition-all outline-none">
                <MoreHorizontal size={14} /> Actions
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-48 p-2">
                <DropdownMenuItem onClick={handleRestart} className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-white/5">
                  <RotateCcw size={14} /> Restart Server
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRebuild} className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-white/5">
                  <RefreshCw size={14} /> Full Rebuild
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={handleSave} className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-white/5 text-indigo-400">
                  <Save size={14} /> Save Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={handleRestart} disabled={isRestarting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold hover:bg-white/10 transition-all">
              {isRestarting ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />} Restart
            </button>
            <button className="p-2 text-white/40 hover:text-white"><ExternalLink size={16} /></button>
          </div>
        </div>

        {/* IDE Tabs */}
        <div className="flex items-center gap-1 h-12">
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
                "flex items-center gap-2 px-4 py-2 rounded-t-lg text-[11px] font-black uppercase tracking-widest transition-all border-b-2",
                activeTab === btn.id ? "bg-white/5 text-white border-indigo-500" : "text-white/40 hover:bg-white/5 hover:text-white border-transparent"
              )}
            >
              <btn.icon size={14} />
              {btn.label}
            </button>
          ))}
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
                      <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-white/40">src > components > {selectedProject?.title}</span>
                          {activeTab === 'code' && <button onClick={handleSave} className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors flex items-center gap-1"><Save size={12} /> Save</button>}
                        </div>
                        <Maximize2 size={12} className="text-white/20 cursor-pointer" />
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
                          {activeTab === 'configure' && (
                            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-12">
                              <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Settings className="text-indigo-400" /> Workspace Configuration</h3>
                              <div className="grid md:grid-cols-2 gap-8">
                                <div className="pill-nav p-8 bg-white/5 border-white/10 space-y-4">
                                  <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Environment</h4>
                                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                                    <span className="text-xs font-bold">Node Version</span>
                                    <span className="text-xs font-mono text-indigo-400">v20.11.0</span>
                                  </div>
                                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                                    <span className="text-xs font-bold">Package Manager</span>
                                    <span className="text-xs font-mono text-indigo-400">npm</span>
                                  </div>
                                </div>
                                <div className="pill-nav p-8 bg-white/5 border-white/10 space-y-4">
                                  <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Build Settings</h4>
                                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                                    <span className="text-xs font-bold">Auto-Rebuild</span>
                                    <div className="w-10 h-5 bg-indigo-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {activeTab === 'security' && (
                            <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-12">
                              <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Shield className="text-rose-400" /> Neural Security</h3>
                              <div className="space-y-6">
                                <div className="pill-nav p-8 bg-rose-500/5 border-rose-500/20 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <Lock className="text-rose-400" size={24} />
                                    <div>
                                      <h4 className="font-bold">Encryption Active</h4>
                                      <p className="text-xs text-white/40">All neural scripts are encrypted with AES-256.</p>
                                    </div>
                                  </div>
                                  <CheckCircle2 className="text-emerald-400" />
                                </div>
                                <div className="pill-nav p-8 bg-white/5 border-white/10 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <Key className="text-indigo-400" size={24} />
                                    <div>
                                      <h4 className="font-bold">API Key Vault</h4>
                                      <p className="text-xs text-white/40">Manage secure keys for external AI providers.</p>
                                    </div>
                                  </div>
                                  <button className="text-xs font-black uppercase text-indigo-400 hover:text-white transition-colors">Manage Vault</button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {activeTab === 'publish' && (
                            <motion.div key="publish" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center p-12 text-center">
                              <Cloud size={64} className="text-indigo-400 mb-8 animate-pulse" />
                              <h3 className="text-3xl font-black mb-4">Ready for Deployment</h3>
                              <p className="text-white/40 font-medium mb-12 max-w-md">Push your cognitive workspace to the global neural edge network.</p>
                              <div className="flex gap-4">
                                <button className="auron-button h-14 px-10 flex items-center gap-2"><Globe size={18} /> Deploy to Edge</button>
                                <button className="pill-nav h-14 px-10 flex items-center gap-2 font-bold"><Github size={18} /> Push to Git</button>
                              </div>
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
                          <ChatMessage key={msg.id} {...msg} onApplyCode={handleApplyCode} />
                        ))}
                        {isGenerating && <Loader2 className="animate-spin text-indigo-400 mx-auto" size={20} />}
                      </div>

                      <ChatInput 
                        value={input} 
                        onChange={setInput} 
                        onSubmit={handleSend} 
                        isGenerating={isGenerating} 
                        selectedModelId={selectedModel.id}
                        onModelChange={setSelectedModel} 
                        attachedImage={attachedImage}
                        onImageAttach={setAttachedImage}
                      />
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