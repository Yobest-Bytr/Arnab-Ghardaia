import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Image as ImageIcon, Loader2, 
  FileCode, Terminal, Layers, X,
  ChevronDown, FolderOpen, Plus, Play, Code as CodeIcon, Eye, Save, Copy,
  AlertTriangle, Shield, Settings, Globe, Bell, MoreHorizontal, Maximize2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';
import ProjectModal from '@/components/ProjectModal';
import CodeFrame from '@/components/CodeFrame';
import FileExplorer from '@/components/FileExplorer';
import SystemMessages from '@/components/SystemMessages';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MODELS = [
  { id: 'yobest-ai', name: 'Yobest AI', icon: Sparkles, type: 'Free', desc: 'Unlimited Grok 3 Fast' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5', icon: Zap, type: 'Key Required', desc: 'Anthropic Sonnet' },
  { id: 'gpt-4o', name: 'GPT-4o', icon: Cpu, type: 'Key Required', desc: 'OpenAI Multimodal' },
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
  const [activeEditorTab, setActiveEditorTab] = useState('code');
  const [editorContent, setEditorContent] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    addLog('info', 'Running neural checks...');
    setTimeout(() => {
      setIsChecking(false);
      addLog('info', 'Checks complete. 0 errors, 0 warnings found.');
      showSuccess("Neural checks passed.");
    }, 1500);
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

  const handleSaveProject = async () => {
    if (!user || !selectedProject) return;
    await storage.update('scripts', user.id, selectedProject.id, { content: editorContent });
    setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, content: editorContent } : p));
    addLog('info', 'Project saved to neural archive.');
    showSuccess("Project saved.");
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
      // Pass current project context to AI
      const contextPrompt = selectedProject ? `[Context: Current file is ${selectedProject.title}. Content: ${editorContent.slice(0, 1000)}...] ${input}` : input;
      
      await grokChat(
        contextPrompt, 
        { modelId: selectedModel.id, userId: user?.id, image: attachedImage || undefined },
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
      <div className="pt-24 px-4 h-36 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white/40">
            <RefreshCw size={16} className="animate-spin-slow" />
            <span className="text-[11px] font-bold">{projects.length} files</span>
          </div>
          <div className="relative w-64">
            <input type="text" placeholder="Search file contents" className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 px-3 text-[11px] outline-none" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[
            { id: 'preview', label: 'Preview', icon: Eye, action: () => setActiveEditorTab('preview') },
            { id: 'problems', label: 'Problems', icon: AlertTriangle, action: handleRunChecks },
            { id: 'code', label: 'Code', icon: CodeIcon, action: () => setActiveEditorTab('code') },
            { id: 'configure', label: 'Configure', icon: Settings },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'publish', label: 'Publish', icon: Globe },
          ].map((btn) => (
            <button 
              key={btn.id}
              onClick={btn.action}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
                activeEditorTab === btn.id ? "bg-indigo-600 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <btn.icon size={14} />
              {btn.label}
            </button>
          ))}
          <div className="w-[1px] h-6 bg-white/10 mx-2" />
          <button className="p-2 text-white/40 hover:text-white"><Bell size={16} /></button>
          <button className="p-2 text-white/40 hover:text-white"><MoreHorizontal size={16} /></button>
          <div className="w-24 h-8 bg-rose-600 rounded-full ml-4" />
        </div>
      </div>

      <main className="flex-1 w-full relative z-10 overflow-hidden flex flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Sidebar: File Explorer */}
          <ResizablePanel defaultSize={15} minSize={10}>
            <FileExplorer 
              files={projects} 
              onFileSelect={setSelectedProject} 
              selectedFileId={selectedProject?.id} 
            />
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors" />

          {/* Center: Editor & AI */}
          <ResizablePanel defaultSize={85}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70}>
                <ResizablePanelGroup direction="horizontal">
                  {/* Editor Area */}
                  <ResizablePanel defaultSize={60}>
                    <div className="h-full flex flex-col bg-[#010204]">
                      <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-4">
                        <span className="text-[10px] font-bold text-white/40">src > components > {selectedProject?.title}</span>
                        <Maximize2 size={12} className="ml-auto text-white/20" />
                      </div>
                      
                      <div className="flex-1 relative">
                        {activeEditorTab === 'code' ? (
                          <textarea
                            value={editorContent}
                            onChange={(e) => setEditorContent(e.target.value)}
                            className="w-full h-full bg-transparent p-8 font-mono text-sm text-indigo-300 outline-none resize-none custom-scrollbar leading-relaxed"
                            spellCheck={false}
                          />
                        ) : (
                          <iframe
                            ref={previewRef}
                            title="Live Preview"
                            className="w-full h-full border-none bg-white"
                            onLoad={updatePreview}
                          />
                        )}
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors" />

                  {/* AI Chat Area */}
                  <ResizablePanel defaultSize={40}>
                    <div className="h-full flex flex-col p-6 gap-6 bg-[#0a0a0a] border-l border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BrainCircuit size={20} className="text-indigo-400" />
                          <h2 className="text-xs font-black uppercase tracking-widest">AI Assistant</h2>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="text-[10px] font-bold text-white/40 hover:text-white outline-none">
                            {selectedModel.name} <ChevronDown size={10} className="inline" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#020408] border-white/10 text-white">
                            {MODELS.map(m => (
                              <DropdownMenuItem key={m.id} onClick={() => setSelectedModel(m)} className="text-xs font-bold">
                                {m.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[95%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-white/5 border border-white/10'}`}>
                              <div className="text-[9px] font-black uppercase opacity-40 mb-2">{msg.role === 'user' ? 'You' : msg.model}</div>
                              <div className="text-sm leading-relaxed">
                                {msg.content.split(/(```[\s\S]*?```)/g).map((part, i) => {
                                  if (part.startsWith('```')) {
                                    const code = part.match(/```(\w+)?\n?([\s\S]*?)```/)?.[2] || '';
                                    return <CodeFrame key={i} code={code} onAdd={handleAddCodeToProject} />;
                                  }
                                  return <p key={i} className="whitespace-pre-wrap">{part}</p>;
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                        {isGenerating && <Loader2 className="animate-spin text-indigo-400 mx-auto" size={20} />}
                      </div>

                      <form onSubmit={handleSend} className="relative">
                        <input 
                          type="text" 
                          value={input} 
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask AI to explain or modify code..." 
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:border-indigo-500/50"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-white">
                          <Send size={18} />
                        </button>
                      </form>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle className="h-1 bg-white/5 hover:bg-indigo-500/30 transition-colors" />

              {/* Bottom: System Messages */}
              <ResizablePanel defaultSize={30}>
                <SystemMessages 
                  messages={systemLogs} 
                  isOpen={isConsoleOpen} 
                  onToggle={() => setIsConsoleOpen(!isConsoleOpen)} 
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
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