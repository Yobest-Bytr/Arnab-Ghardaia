import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Loader2, FileCode, Terminal, Layers, X,
  ChevronDown, FolderOpen, Plus, Play, Code as CodeIcon, Eye, Save, Copy,
  AlertTriangle, Shield, Settings, Globe, Bell, MoreHorizontal, Maximize2, RefreshCw,
  Github, Database, ExternalLink, CheckCircle2, Info, Folder, RotateCcw, Trash2,
  ArrowLeft, ArrowRight, MousePointer2, Pencil, Maximize, Lock, Key, Cloud, Activity, Box, Wand2, LayoutGrid,
  ChevronLeft, RotateCcw as RestartIcon
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

const ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/login', label: 'Login' },
  { path: '/signup', label: 'Signup' },
  { path: '/forgot-password', label: 'Forgot password' },
  { path: '/privacy', label: 'Privacy' },
  { path: '/terms', label: 'Terms' },
  { path: '/changelog', label: 'Changelog' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/showcase', label: 'Showcase' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/profile', label: 'Profile' },
  { path: '/ai-insights', label: 'Ai insights' },
  { path: '/shared', label: 'Shared' },
  { path: '/neural-lab', label: 'Neural lab' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/archive', label: 'Archive' },
  { path: '/settings', label: 'Settings' },
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
  const [projectScripts, setProjectScripts] = useState<any[]>([]);
  const [selectedScript, setSelectedScript] = useState<any>(null);
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [mainMode, setMainMode] = useState<'dashboard' | 'workspace'>('dashboard');
  const [editorContent, setEditorContent] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  
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
    if (selectedScript) {
      setEditorContent(selectedScript.content);
      addLog('info', `Switched to script: ${selectedScript.title}`);
    }
  }, [selectedScript]);

  const addLog = (type: 'info' | 'warn' | 'error', text: string) => {
    setSystemLogs(prev => [{ type, text, timestamp: new Date().toISOString() }, ...prev].slice(0, 100));
  };

  const fetchProjects = async () => {
    if (!user) return;
    // Fetch projects from a dedicated projects table
    const data = await storage.get('projects', user.id);
    setProjects(data);
  };

  const fetchScripts = async (projectId: string) => {
    if (!user) return;
    const data = await storage.get('scripts', user.id);
    // Filter scripts by project_id (simulated here)
    const filtered = data.filter((s: any) => s.project_id === projectId);
    setProjectScripts(filtered);
    if (filtered.length > 0) setSelectedScript(filtered[0]);
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
    if (!selectedScript || !user) return;
    addLog('info', `Saving ${selectedScript.title} to Supabase...`);
    await storage.update('scripts', user.id, selectedScript.id, { content: editorContent });
    showSuccess("Script saved to cloud.");
    updatePreview();
  };

  const handleCreateProject = async (project: { title: string; description: string; template: string }) => {
    if (!user) return;
    
    addLog('info', `Initializing project: ${project.title}`);
    
    // 1. Create the project entry
    const newProject = await storage.insert('projects', user.id, {
      title: project.title,
      description: project.description,
      template: project.template
    });

    // 2. Create boilerplate scripts for this project
    const boilerplate = [
      {
        title: 'index.html',
        project_id: newProject.id,
        content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${project.title} - Yobest AI</title>\n    <script src="https://js.puter.com/v2/"></script>\n  </head>\n\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>`
      },
      {
        title: 'App.tsx',
        project_id: newProject.id,
        content: `"use client";\n\nimport React from 'react';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-[#020408] text-white flex flex-col items-center justify-center p-8">\n      <h1 className="text-7xl font-black dopamine-text mb-4">${project.title}</h1>\n      <p className="text-xl text-white/40 font-medium">${project.description}</p>\n    </div>\n  );\n}`
      }
    ];

    for (const script of boilerplate) {
      await storage.insert('scripts', user.id, script);
    }

    await fetchProjects();
    setSelectedProject(newProject);
    await fetchScripts(newProject.id);
    setMainMode('workspace');
    showSuccess("Project workspace initialized.");
  };

  const handleQuickCreate = async () => {
    if (!user || !selectedProject) return;
    const name = prompt("Enter script name (e.g., styles.css):");
    if (!name) return;
    
    const newScript = {
      title: name,
      project_id: selectedProject.id,
      content: `/* New script: ${name} */`
    };
    const data = await storage.insert('scripts', user.id, newScript);
    setProjectScripts([data, ...projectScripts]);
    setSelectedScript(data);
    addLog('info', `Added new script: ${name}`);
  };

  const handleFileDelete = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this script?")) return;
    await storage.delete('scripts', user.id, id);
    const updated = projectScripts.filter(p => p.id !== id);
    setProjectScripts(updated);
    if (selectedScript?.id === id) {
      setSelectedScript(updated[0] || null);
    }
    addLog('warn', `Deleted script ID: ${id}`);
  };

  const handleApplyCode = async (code: string, path: string, mode: 'replace' | 'append') => {
    if (!user || !selectedProject) return;
    
    const fileName = path.split('/').pop() || path;
    const existingFile = projectScripts.find(p => p.title === fileName);

    if (existingFile) {
      const newContent = mode === 'replace' ? code : existingFile.content + "\n\n" + code;
      await storage.update('scripts', user.id, existingFile.id, { content: newContent });
      
      if (selectedScript?.id === existingFile.id) {
        setEditorContent(newContent);
      }
      
      setProjectScripts(prev => prev.map(p => p.id === existingFile.id ? { ...p, content: newContent } : p));
      addLog('info', `Updated existing file: ${fileName}`);
    } else {
      const newFile = {
        title: fileName,
        project_id: selectedProject.id,
        content: code
      };
      const data = await storage.insert('scripts', user.id, newFile);
      setProjectScripts([data, ...projectScripts]);
      setSelectedScript(data);
      addLog('info', `Created new file from AI suggestion: ${fileName}`);
    }
    
    updatePreview();
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
      const fileList = projectScripts.map(p => p.title).join(', ');
      const scriptContext = selectedScript ? `Current File: ${selectedScript.title}\nSource Code:\n${editorContent}` : '';
      
      const systemPrompt = `You are the Yobest AI Assistant, a world-class full-stack engineer. 
You MUST follow this response format strictly:
1. Start with "### Thinking" followed by your reasoning.
2. Provide a brief summary of the changes.
3. For each file you want to create or edit, use the header "### File: path/to/filename" followed by the code block.
4. Use TypeScript (.ts, .tsx) for all logic and components.
5. Ensure your code is complete, functional, and follows modern React/Vite/Tailwind patterns.
6. DO NOT TRUNCATE CODE. Provide the full file content every time.

Workspace Map: [${fileList}]
Project: ${selectedProject?.title}
${scriptContext}`;

      await grokChat(
        `${systemPrompt}\n\nUser Request: ${input}`, 
        { 
          modelId: selectedModel.id === 'auto' ? 'yobest-ai' : selectedModel.id, 
          userId: user?.id, 
          stream: true 
        },
        (chunk) => {
          responseText += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, content: responseText }];
            } else {
              return [...prev, { id: Date.now() + 1, role: 'assistant', content: responseText, model: selectedModel.name, timestamp: new Date().toISOString() }];
            }
          });
        }
      );
      addLog('info', 'Neural response received.');
    } catch (error) {
      addLog('error', 'Neural link interrupted.');
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePreview = () => {
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        const indexHtml = projectScripts.find(s => s.title === 'index.html')?.content || '<h1>No index.html found</h1>';
        doc.write(indexHtml);
        doc.close();
        addLog('info', `Live preview refreshed for path: ${currentPath}`);
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
            onClick={() => selectedProject && setMainMode('workspace')}
            disabled={!selectedProject}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
              mainMode === 'workspace' ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white disabled:opacity-30"
            )}
          >
            <CodeIcon size={14} /> Workspace
          </button>
        </div>

        {mainMode === 'workspace' && selectedProject && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Project: {selectedProject.title}</span>
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
                        fetchScripts(project.id);
                        setMainMode('workspace');
                      }}
                      className="pill-nav p-8 bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                          <FolderOpen size={24} />
                        </div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-2xl font-black mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                      <p className="text-sm text-white/40 font-medium line-clamp-2 mb-8">{project.description || 'Neural workspace initialized for cognitive development.'}</p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        Enter Workspace <ArrowRight size={12} />
                      </div>
                    </button>
                  ))}
                  {projects.length === 0 && (
                    <div className="col-span-full py-32 text-center pill-nav border-dashed border-white/10">
                      <p className="text-white/40 font-medium">No projects found. Create your first project to begin.</p>
                    </div>
                  )}
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
              <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={15} minSize={10} className="hidden md:block">
                  <FileExplorer 
                    files={projectScripts} 
                    onFileSelect={setSelectedScript} 
                    onFileCreate={handleQuickCreate}
                    onFileDelete={handleFileDelete}
                    selectedFileId={selectedScript?.id} 
                  />
                </ResizablePanel>

                <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors hidden md:block" />

                <ResizablePanel defaultSize={85}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={70}>
                      <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={60}>
                          <div className="h-full flex flex-col bg-[#010204]">
                            {/* Browser Header UI */}
                            <div className="h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center px-4 gap-4 shrink-0">
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 text-white/40 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                                <button className="p-1.5 text-white/40 hover:text-white transition-colors rotate-180"><ChevronLeft size={16} /></button>
                                <button onClick={updatePreview} className="p-1.5 text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                              </div>
                              
                              <div className="flex-1 relative group">
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-4 text-[11px] font-medium text-white/60 flex items-center justify-between outline-none hover:bg-black/60 transition-all">
                                    <span className="truncate">{currentPath}</span>
                                    <ChevronDown size={12} />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-[400px] p-2 z-[110]">
                                    {ROUTES.map(route => (
                                      <DropdownMenuItem 
                                        key={route.path} 
                                        onClick={() => setCurrentPath(route.path)}
                                        className="flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-white/5"
                                      >
                                        <span className="font-bold text-xs">{route.label}</span>
                                        <span className="text-[10px] text-white/20 font-mono">{route.path}</span>
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="flex items-center gap-2">
                                <button onClick={updatePreview} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-all">
                                  <RestartIcon size={14} /> Restart
                                </button>
                                <button className="p-1.5 text-white/40 hover:text-white transition-colors"><Maximize2 size={14} /></button>
                              </div>
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
                              </AnimatePresence>
                            </div>

                            {/* Bottom Tab Bar */}
                            <div className="h-10 bg-[#0a0a0a] border-t border-white/5 flex items-center px-4 gap-1">
                              {[
                                { id: 'preview', label: 'Preview', icon: Eye },
                                { id: 'code', label: 'Code', icon: CodeIcon },
                                { id: 'problems', label: 'Problems', icon: AlertTriangle },
                              ].map((tab) => (
                                <button 
                                  key={tab.id}
                                  onClick={() => setActiveTab(tab.id)}
                                  className={cn(
                                    "flex items-center gap-2 px-4 h-full text-[10px] font-black uppercase tracking-widest transition-all border-t-2",
                                    activeTab === tab.id ? "bg-white/5 text-white border-indigo-500" : "text-white/20 hover:text-white border-transparent"
                                  )}
                                >
                                  <tab.icon size={12} /> {tab.label}
                                </button>
                              ))}
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