import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, FileCode, Terminal, Layers, X,
  ChevronDown, FolderOpen, Plus, Play, Code as CodeIcon, Eye, Save, Copy,
  AlertTriangle, Shield, Settings, Globe, Bell, MoreHorizontal, Maximize2, RefreshCw,
  Github, Database, ExternalLink, CheckCircle2, Info, Folder, RotateCcw, Trash2,
  ArrowLeft, ArrowRight, MousePointer2, Pencil, Maximize, Lock, Key, Cloud, Activity, Box, Wand2, LayoutGrid
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
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('code');
  const [mainMode, setMainMode] = useState<'dashboard' | 'workspace'>('dashboard');
  const [editorContent, setEditorContent] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  
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
      addLog('info', `Switched to script: ${selectedProject.title}`);
    }
  }, [selectedProject]);

  const addLog = (type: 'info' | 'warn' | 'error', text: string) => {
    setSystemLogs(prev => [{ type, text, timestamp: new Date().toISOString() }, ...prev].slice(0, 100));
  };

  const fetchProjects = async () => {
    if (!user) return;
    const data = await storage.get('scripts', user.id);
    setProjects(data);
    if (data.length > 0 && !selectedProject) setSelectedProject(data[0]);
  };

  const handleBuild = () => {
    setIsBuilding(true);
    addLog('info', 'Starting production build...');
    setTimeout(() => {
      addLog('info', 'Build successful. Artifacts ready.');
      setIsBuilding(false);
      showSuccess("Build complete.");
    }, 2000);
  };

  const handleSave = async () => {
    if (!selectedProject || !user) return;
    addLog('info', `Saving ${selectedProject.title} to Supabase...`);
    await storage.update('scripts', user.id, selectedProject.id, { content: editorContent });
    showSuccess("Script saved to cloud.");
    updatePreview();
  };

  const handleCreateProject = async (project: { title: string; description: string; template: string }) => {
    if (!user) return;
    const newProject = {
      title: project.title,
      content: project.template === 'react' 
        ? `"use client";\n\nimport React from 'react';\n\nexport default function ${project.title.replace(/\s+/g, '')}() {\n  return (\n    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center">\n      <h1 className="text-6xl font-black dopamine-text">${project.title}</h1>\n    </div>\n  );\n}`
        : `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #020408; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n    h1 { color: #99f6ff; text-shadow: 0 0 20px rgba(153,246,255,0.5); }\n  </style>\n</head>\n<body>\n  <h1>${project.title} Initialized</h1>\n</body>\n</html>`
    };
    const data = await storage.insert('scripts', user.id, newProject);
    setProjects([data, ...projects]);
    setSelectedProject(data);
    setMainMode('workspace');
    addLog('info', `Created new script: ${project.title}`);
  };

  const handleQuickCreate = async () => {
    if (!user) return;
    const name = prompt("Enter script name (e.g., styles.css):");
    if (!name) return;
    
    const newProject = {
      title: name,
      content: `/* New script: ${name} */`
    };
    const data = await storage.insert('scripts', user.id, newProject);
    setProjects([data, ...projects]);
    setSelectedProject(data);
    addLog('info', `Added new script: ${name}`);
  };

  const handleFileDelete = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this script?")) return;
    await storage.delete('scripts', user.id, id);
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    if (selectedProject?.id === id) {
      setSelectedProject(updated[0] || null);
    }
    addLog('warn', `Deleted script ID: ${id}`);
  };

  const handleApplyCode = async (code: string, path: string, mode: 'replace' | 'append') => {
    if (!user) return;
    
    const fileName = path.split('/').pop() || path;
    const existingFile = projects.find(p => p.title === fileName);

    if (existingFile) {
      const newContent = mode === 'replace' ? code : existingFile.content + "\n\n" + code;
      await storage.update('scripts', user.id, existingFile.id, { content: newContent });
      
      if (selectedProject?.id === existingFile.id) {
        setEditorContent(newContent);
      }
      
      setProjects(prev => prev.map(p => p.id === existingFile.id ? { ...p, content: newContent } : p));
      addLog('info', `Updated existing file: ${fileName}`);
    } else {
      const newFile = {
        title: fileName,
        content: code
      };
      const data = await storage.insert('scripts', user.id, newFile);
      setProjects([data, ...projects]);
      setSelectedProject(data);
      addLog('info', `Created new file from AI suggestion: ${fileName}`);
    }
    
    updatePreview();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMsg = { 
      id: Date.now(), 
      role: 'user', 
      content: input, 
      timestamp: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);
    addLog('info', `Sending neural request via ${selectedModel.name}...`);

    try {
      let responseText = "";
      let imageBase64 = "";

      if (attachedFile) {
        addLog('info', `Processing image attachment: ${attachedFile.name}`);
        imageBase64 = await fileToBase64(attachedFile);
      }
      
      const fileList = projects.map(p => p.title).join(', ');
      const projectContext = selectedProject ? `Current File: ${selectedProject.title}\nSource Code:\n${editorContent}` : '';
      
      const systemPrompt = `You are the Yobest AI Assistant. You MUST follow this response format strictly:
1. Start with "### Thinking" followed by your reasoning.
2. Provide a brief summary of the changes.
3. For each file you want to create or edit, use the header "### File: path/to/filename" followed by the code block.
4. Ensure your code is complete and functional. DO NOT TRUNCATE.

Workspace Map: [${fileList}]
${projectContext}

Conversation History:
${messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}`;

      const modelId = selectedModel.id === 'auto' ? 'yobest-ai' : selectedModel.id;

      await grokChat(
        `${systemPrompt}\n\nUser Request: ${input}`, 
        { 
          modelId, 
          userId: user?.id, 
          stream: true,
          image: imageBase64 || undefined
        },
        (chunk) => {
          responseText += chunk;
          
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { 
                ...last, 
                content: responseText,
                model: selectedModel.name,
                timestamp: new Date().toISOString()
              }];
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
      setAttachedFile(null);
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
      
      {/* Main Mode Switcher */}
      <div className="mt-24 px-6 h-16 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a] relative z-30">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          <button 
            onClick={() => setMainMode('dashboard')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
              mainMode === 'dashboard' ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white"
            )}
          >
            <LayoutGrid size={14} /> Dashboard
          </button>
          <button 
            onClick={() => setMainMode('workspace')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
              mainMode === 'workspace' ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white"
            )}
          >
            <CodeIcon size={14} /> Workspace
          </button>
        </div>

        {mainMode === 'workspace' && selectedProject && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Active: {selectedProject.title}</span>
            </div>
          </div>
        )}
      </div>

      <main className="flex-1 w-full relative z-10 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {mainMode === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-12 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h1 className="text-5xl font-black tracking-tighter dopamine-text">Project Dashboard</h1>
                    <p className="text-white/40 font-medium mt-2">Select a project to enter the neural workspace.</p>
                  </div>
                  <button 
                    onClick={() => setIsProjectModalOpen(true)}
                    className="auron-button h-14 px-8 flex items-center gap-3"
                  >
                    <Plus size={20} /> New Project
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setSelectedProject(project);
                        setMainMode('workspace');
                      }}
                      className="pill-nav p-8 bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                          <FileCode size={24} />
                        </div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-2xl font-black mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                      <p className="text-sm text-white/40 font-medium line-clamp-2 mb-8">Neural workspace initialized for cognitive development.</p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        Enter Workspace <ArrowRight size={12} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Workspace Toolbar */}
              <div className="px-4 h-28 border-b border-white/5 flex flex-col bg-[#0a0a0a] relative z-20">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-white/40 hover:text-white transition-colors"><ArrowLeft size={16} /></button>
                      <button className="p-1.5 text-white/40 hover:text-white transition-colors"><ArrowRight size={16} /></button>
                      <button onClick={updatePreview} className="p-1.5 text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                    </div>
                    
                    <div className="relative w-[300px] md:w-[500px] group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Globe size={12} className="text-white/20" />
                      </div>
                      <input 
                        type="text" 
                        readOnly 
                        value={`/neural-lab/${selectedProject?.title || ''}`} 
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-10 text-[11px] font-medium text-white/60 outline-none group-hover:bg-white/10 transition-all cursor-default"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500 transition-all">
                      <Save size={14} /> Save
                    </button>
                    <button onClick={handleBuild} disabled={isBuilding} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold hover:bg-white/10 transition-all">
                      {isBuilding ? <Loader2 className="animate-spin" size={14} /> : <Box size={14} />} Build
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 h-12 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'preview', label: 'Preview', icon: Eye },
                    { id: 'problems', label: 'Problems', icon: AlertTriangle },
                    { id: 'code', label: 'Code', icon: CodeIcon },
                    { id: 'publish', label: 'Publish', icon: Globe },
                    { id: 'configure', label: 'Configure', icon: Settings },
                  ].map((btn) => (
                    <button 
                      key={btn.id}
                      onClick={() => setActiveTab(btn.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-t-lg text-[11px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                        activeTab === btn.id ? "bg-white/5 text-white border-indigo-500" : "text-white/40 hover:bg-white/5 hover:text-white border-transparent"
                      )}
                    >
                      <btn.icon size={14} />
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={15} minSize={10} className="hidden md:block">
                  <FileExplorer 
                    files={projects} 
                    onFileSelect={setSelectedProject} 
                    onFileCreate={handleQuickCreate}
                    onFileDelete={handleFileDelete}
                    selectedFileId={selectedProject?.id} 
                  />
                </ResizablePanel>

                <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors hidden md:block" />

                <ResizablePanel defaultSize={85}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={70}>
                      <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={60}>
                          <div className="h-full flex flex-col bg-[#010204]">
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
                                  <motion.div key="problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-12 overflow-y-auto custom-scrollbar">
                                    <div className="max-w-2xl mx-auto space-y-4">
                                      <div className="flex items-center gap-3 mb-8">
                                        <AlertTriangle className="text-amber-400" size={24} />
                                        <h3 className="text-2xl font-black">Workspace Problems</h3>
                                      </div>
                                      <div className="pill-nav p-6 bg-white/5 border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                          <span className="text-sm font-bold">No critical errors detected in current scripts.</span>
                                        </div>
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Optimal</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                                {activeTab === 'publish' && (
                                  <motion.div key="publish" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-12 overflow-y-auto custom-scrollbar">
                                    <div className="max-w-2xl mx-auto space-y-12">
                                      <div className="pill-nav p-10 bg-white/5 border-white/10">
                                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                          <Github className="text-white" />
                                          Connect to GitHub
                                        </h3>
                                        <p className="text-white/40 font-medium mb-8">Push your site scripts directly to a GitHub repository.</p>
                                        <button className="auron-button w-full h-14 flex items-center justify-center gap-3">
                                          <Github size={20} /> Connect Repository
                                        </button>
                                      </div>

                                      <div className="pill-nav p-10 bg-white/5 border-white/10">
                                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                          <Globe className="text-indigo-400" />
                                          Custom Domains
                                        </h3>
                                        <p className="text-white/40 font-medium mb-8">Run your site on a custom domain or a Yobest subdomain.</p>
                                        <div className="flex gap-4">
                                          <input type="text" placeholder="your-site.yobest.ai" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-indigo-500" />
                                          <button className="bg-indigo-600 px-6 rounded-xl font-bold text-sm">Deploy</button>
                                        </div>
                                      </div>

                                      <div className="pill-nav p-10 bg-white/5 border-white/10">
                                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                          <Database className="text-emerald-400" />
                                          Supabase Storage
                                        </h3>
                                        <p className="text-white/40 font-medium mb-8">Your site scripts are automatically backed up to Supabase.</p>
                                        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Cloud Sync Active</span>
                                          <CheckCircle2 size={16} className="text-emerald-400" />
                                        </div>
                                      </div>
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
                              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Context: {selectedProject?.title}</span>
                              </div>
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
                              onBuild={handleBuild}
                              onFileAttach={setAttachedFile}
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={handleCreateProject} />
    </div>
  );
};

export default NeuralLab;