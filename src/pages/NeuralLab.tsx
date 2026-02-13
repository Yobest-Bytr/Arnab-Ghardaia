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
  ChevronLeft, RotateCcw as RestartIcon, Rocket, Share2, CheckCircle, Package, Lightbulb, Wand, Search,
  MessageSquare, Mic, History, BarChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat, validateKey } from '@/lib/puter';
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/resizable";

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
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/profile', label: 'Profile' },
];

const NeuralLab = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [hasKey, setHasKey] = useState(true);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  
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
  const [isBuilding, setIsBuilding] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  
  // Package Management
  const [installedPackages, setInstalledPackages] = useState<string[]>(['react', 'react-dom', 'lucide-react', 'framer-motion']);
  const [packageSearch, setPackageSearch] = useState('');

  // Problems State
  const [problems, setProblems] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
      addLog('info', 'Neural Lab initialized. Neural link established.');
    }
  }, [user]);

  useEffect(() => {
    checkModelKey(selectedModel.id);
  }, [selectedModel, user]);

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

  const checkModelKey = (modelId: string) => {
    if (!user || modelId === 'yobest-ai' || modelId === 'auto') {
      setHasKey(true);
      return;
    }
    const savedKeys = JSON.parse(localStorage.getItem(`ai_keys_${user.id}`) || '{}');
    const key = modelId.includes('gpt') ? savedKeys.openai :
                modelId.includes('gemini') ? savedKeys.gemini :
                modelId.includes('claude') ? savedKeys.anthropic :
                savedKeys.grok;
    
    setHasKey(!!key);
    if (!key) {
      addLog('warn', `Missing API key for ${modelId}. Please configure in Settings.`);
    }
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
    addLog('info', `Saving ${selectedScript.title} locally...`);
    await storage.update('scripts', user.id, selectedScript.id, { content: editorContent });
    showSuccess("Script saved locally.");
    updatePreview();
  };

  const handleSyncCloud = async () => {
    if (!user) return;
    addLog('info', 'Attempting cloud synchronization...');
    const result = await storage.syncToCloud('projects', user.id);
    await storage.syncToCloud('scripts', user.id);
    
    if (result.success) {
      showSuccess(result.message);
    } else {
      showError(result.message);
    }
  };

  const handleInstallPackage = (pkg: string) => {
    if (installedPackages.includes(pkg)) {
      showError(`${pkg} is already installed.`);
      return;
    }
    addLog('info', `Installing package: ${pkg}...`);
    setInstalledPackages(prev => [...prev, pkg]);
    showSuccess(`Package ${pkg} installed successfully.`);
    updatePreview();
  };

  const handleRunChecks = () => {
    setIsScanning(true);
    setProblems([]);
    addLog('info', 'Starting neural diagnostic scan...');
    
    setTimeout(() => {
      const newProblems: any[] = [];
      
      projectScripts.forEach(script => {
        if (script.content.length < 10) {
          newProblems.push({ type: 'warn', file: script.title, message: 'File is unusually small. Possible missing logic.' });
        }
        if (script.title.endsWith('.tsx') && !script.content.includes('import React')) {
          newProblems.push({ type: 'error', file: script.title, message: 'Missing React import in TSX file.' });
        }
        if (script.content.includes('TODO')) {
          newProblems.push({ type: 'info', file: script.title, message: 'Unresolved TODO found.' });
        }
      });

      setProblems(newProblems);
      setIsScanning(false);
      addLog('info', `Scan complete. Found ${newProblems.length} issues.`);
      if (newProblems.length > 0) {
        showError(`Found ${newProblems.length} problems in your project.`);
      } else {
        showSuccess("No problems found. Project is healthy.");
      }
    }, 1500);
  };

  const handlePublish = () => {
    addLog('info', 'Preparing deployment to Yobest Edge...');
    showSuccess("Project published to: " + selectedProject.title.toLowerCase().replace(/\s+/g, '-') + ".yobest.ai");
  };

  const handleGithubSync = () => {
    addLog('info', 'Connecting to GitHub repository...');
    showSuccess("Scripts synced with GitHub.");
  };

  const handleCreateProject = async (project: { title: string; description: string; template: string }) => {
    if (!user) return;
    const newProject = await storage.insert('projects', user.id, {
      title: project.title,
      description: project.description,
      template: project.template
    });

    const boilerplate = [
      {
        title: 'index.html',
        project_id: newProject.id,
        content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${project.title}</title>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="bg-slate-950 text-white">\n    <div id="root"></div>\n  </body>\n</html>`
      },
      {
        title: 'App.tsx',
        project_id: newProject.id,
        content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="p-20 text-center">\n      <h1 className="text-6xl font-black mb-4">${project.title}</h1>\n      <p className="text-xl opacity-50">${project.description}</p>\n    </div>\n  );\n}`
      }
    ];

    for (const script of boilerplate) {
      await storage.insert('scripts', user.id, script);
    }

    await fetchProjects();
    setSelectedProject(newProject);
    await fetchScripts(newProject.id);
    setMainMode('workspace');
  };

  const handleQuickCreate = async () => {
    if (!user || !selectedProject) return;
    const name = prompt("Enter script name:");
    if (!name) return;
    const data = await storage.insert('scripts', user.id, { title: name, project_id: selectedProject.id, content: '' });
    setProjectScripts([data, ...projectScripts]);
    setSelectedScript(data);
  };

  const handleFileDelete = async (id: string) => {
    if (!user || !confirm("Delete script?")) return;
    await storage.delete('scripts', user.id, id);
    const updated = projectScripts.filter(p => p.id !== id);
    setProjectScripts(updated);
    if (selectedScript?.id === id) setSelectedScript(updated[0] || null);
  };

  const handleApplyCode = async (code: string, path: string, mode: 'replace' | 'append') => {
    if (!user || !selectedProject) return;
    const fileName = path.split('/').pop() || path;
    const existingFile = projectScripts.find(p => p.title === fileName);

    if (existingFile) {
      const newContent = mode === 'replace' ? code : existingFile.content + "\n\n" + code;
      await storage.update('scripts', user.id, existingFile.id, { content: newContent });
      if (selectedScript?.id === existingFile.id) setEditorContent(newContent);
      setProjectScripts(prev => prev.map(p => p.id === existingFile.id ? { ...p, content: newContent } : p));
    } else {
      const data = await storage.insert('scripts', user.id, { title: fileName, project_id: selectedProject.id, content: code });
      setProjectScripts([data, ...projectScripts]);
      setSelectedScript(data);
    }
    updatePreview();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    if (!hasKey) {
      showError(`Please configure your API key for ${selectedModel.name} in Settings.`);
      return;
    }
    const userMsg = { id: Date.now(), role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      let responseText = "";
      await grokChat(input, { 
        modelId: selectedModel.id, 
        userId: user?.id, 
        stream: true,
        systemPrompt: `You are the Yobest AI Neural Assistant. You are helping the user build a project called "${selectedProject?.title}". The current active file is "${selectedScript?.title}". Always provide high-quality, production-ready code.`
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
            thought: "Analyzing project context and generating neural response..."
          }];
        });
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePreview = () => {
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        const indexHtml = projectScripts.find(s => s.title === 'index.html')?.content || '<h1>No index.html</h1>';
        const appTsx = projectScripts.find(s => s.title === 'App.tsx')?.content || '';
        
        const finalHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://cdn.tailwindcss.com"></script>
              ${installedPackages.map(pkg => `<script src="https://esm.sh/${pkg}"></script>`).join('\n')}
              <style>body { margin: 0; background: #020408; color: white; font-family: sans-serif; }</style>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/babel">
                ${appTsx.replace(/import.*from.*;/g, '')}
                
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(<App />);
              </script>
            </body>
          </html>
        `;
        
        doc.write(finalHtml);
        doc.close();
        addLog('info', 'Live preview updated with Babel transpilation.');
      }
    }
  };

  return (
    <div className="h-screen bg-[#020408] text-white relative overflow-hidden flex flex-col">
      <Navbar />
      
      <div className="mt-24 px-6 h-16 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a] relative z-30">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          <button onClick={() => setMainMode('dashboard')} className={cn("flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all", mainMode === 'dashboard' ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white")}>
            <LayoutGrid size={14} /> Dashboard
          </button>
          <button onClick={() => selectedProject && setMainMode('workspace')} disabled={!selectedProject} className={cn("flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all", mainMode === 'workspace' ? "bg-indigo-600 text-white" : "text-white/40 hover:text-white disabled:opacity-30")}>
            <CodeIcon size={14} /> Workspace
          </button>
        </div>

        {mainMode === 'workspace' && (
          <div className="flex items-center gap-3">
            <button onClick={handleSyncCloud} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              <Cloud size={14} /> Sync Cloud
            </button>
            <button onClick={handleGithubSync} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              <Github size={14} /> Sync GitHub
            </button>
            <button onClick={handlePublish} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
              <Rocket size={14} /> Publish Site
            </button>
          </div>
        )}
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
                  <FileExplorer files={projectScripts} onFileSelect={setSelectedScript} onFileCreate={handleQuickCreate} onFileDelete={handleFileDelete} selectedFileId={selectedScript?.id} />
                </ResizablePanel>
                <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors hidden md:block" />
                <ResizablePanel defaultSize={85}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={70}>
                      <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={60}>
                          <div className="h-full flex flex-col bg-[#010204]">
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
                                      <DropdownMenuItem key={route.path} onClick={() => setCurrentPath(route.path)} className="flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-white/5">
                                        <span className="font-bold text-xs">{route.label}</span>
                                        <span className="text-[10px] text-white/20 font-mono">{route.path}</span>
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={updatePreview} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-all"><RestartIcon size={14} /> Restart</button>
                                <button className="p-1.5 text-white/40 hover:text-white transition-colors"><Maximize2 size={14} /></button>
                              </div>
                            </div>
                            <div className="flex-1 relative overflow-hidden">
                              <AnimatePresence mode="wait">
                                {activeTab === 'code' && (
                                  <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                    <textarea value={editorContent} onChange={(e) => setEditorContent(e.target.value)} className="w-full h-full bg-transparent p-8 font-mono text-sm text-indigo-300 outline-none resize-none custom-scrollbar leading-relaxed" spellCheck={false} />
                                  </motion.div>
                                )}
                                {activeTab === 'preview' && (
                                  <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full bg-white">
                                    <iframe ref={previewRef} title="Live Preview" className="w-full h-full border-none" onLoad={updatePreview} />
                                  </motion.div>
                                )}
                                {activeTab === 'problems' && (
                                  <motion.div key="problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-12 bg-[#0a0a0a]">
                                    <div className="max-w-3xl mx-auto">
                                      <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black flex items-center gap-3"><AlertTriangle className="text-amber-400" /> Problems Report</h3>
                                        <button onClick={handleRunChecks} disabled={isScanning} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
                                          {isScanning ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />} Run Checks
                                        </button>
                                      </div>
                                      <div className="space-y-4">
                                        {problems.length === 0 ? (
                                          <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                            <CheckCircle className="text-emerald-500 mx-auto mb-4" size={48} />
                                            <p className="text-white/40 font-medium">No problems detected. Run a scan to verify your project.</p>
                                          </div>
                                        ) : (
                                          problems.map((p, i) => (
                                            <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4">
                                              <div className={cn("mt-1", p.type === 'error' ? 'text-rose-400' : p.type === 'warn' ? 'text-amber-400' : 'text-indigo-400')}>
                                                {p.type === 'error' ? <X size={18} /> : <AlertTriangle size={18} />}
                                              </div>
                                              <div>
                                                <p className="text-sm font-bold text-white">{p.message}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">{p.file}</p>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="h-10 bg-[#0a0a0a] border-t border-white/5 flex items-center px-4 gap-1">
                              {[
                                { id: 'preview', label: 'Preview', icon: Eye },
                                { id: 'code', label: 'Code', icon: CodeIcon },
                                { id: 'problems', label: 'Problems', icon: AlertTriangle },
                              ].map((tab) => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 px-4 h-full text-[10px] font-black uppercase tracking-widest transition-all border-t-2", activeTab === tab.id ? "bg-white/5 text-white border-indigo-500" : "text-white/20 hover:text-white border-transparent")}>
                                  <tab.icon size={12} /> {tab.label} {tab.id === 'problems' && problems.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-[8px] text-white">{problems.length}</span>}
                                </button>
                              ))}
                            </div>
                          </div>
                        </ResizablePanel>
                        <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors" />
                        <ResizablePanel defaultSize={40}>
                          <div className="h-full flex flex-col bg-[#0a0a0a] border-l border-white/5">
                            {/* AI Assistant Header Tabs */}
                            <div className="flex items-center border-b border-white/5 bg-black/20">
                              <button onClick={() => setAiTab('chat')} className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2", aiTab === 'chat' ? "text-indigo-400 border-indigo-500 bg-white/5" : "text-white/20 border-transparent hover:text-white/40")}>
                                <MessageSquare size={14} /> Chat
                              </button>
                              <button onClick={() => setAiTab('packages')} className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2", aiTab === 'packages' ? "text-indigo-400 border-indigo-500 bg-white/5" : "text-white/20 border-transparent hover:text-white/40")}>
                                <Package size={14} /> Packages
                              </button>
                              <button onClick={() => setAiTab('insights')} className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2", aiTab === 'insights' ? "text-indigo-400 border-indigo-500 bg-white/5" : "text-white/20 border-transparent hover:text-white/40")}>
                                <Lightbulb size={14} /> Insights
                              </button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col p-6">
                              <AnimatePresence mode="wait">
                                {aiTab === 'chat' && (
                                  <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                                    <div className="flex items-center justify-between mb-4 px-2 py-1.5 bg-white/5 rounded-xl border border-white/5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Neural Context: {selectedScript?.title || 'Global'}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-white/20">
                                          <History size={10} /> 10/10 Memory
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-400">
                                          <BarChart size={10} /> 1.2s Latency
                                        </div>
                                      </div>
                                    </div>
                                    <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                      {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20">
                                            <BrainCircuit size={32} />
                                          </div>
                                          <h3 className="text-xl font-black mb-2">Neural Assistant</h3>
                                          <p className="text-sm text-white/40 font-medium mb-8">Ask me to build components, fix bugs, or install packages.</p>
                                          <div className="grid grid-cols-2 gap-3 w-full">
                                            {[
                                              { label: 'Refactor', icon: RefreshCw },
                                              { label: 'Secure', icon: Shield },
                                              { label: 'Debug', icon: AlertTriangle },
                                              { label: 'Document', icon: FileCode }
                                            ].map(preset => (
                                              <button key={preset.label} onClick={() => setInput(`Please ${preset.label.toLowerCase()} the current script.`)} className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold hover:bg-white/10 transition-all text-left flex items-center gap-2">
                                                <preset.icon size={12} className="text-indigo-400" /> {preset.label}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {messages.map((msg) => <ChatMessage key={msg.id} {...msg} onApplyCode={handleApplyCode} />)}
                                      {isGenerating && (
                                        <div className="flex gap-3 animate-pulse">
                                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 shrink-0" />
                                          <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-white/5 rounded w-3/4" />
                                            <div className="h-4 bg-white/5 rounded w-1/2" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="mt-4 flex flex-col gap-3">
                                      {!hasKey && (
                                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                                          <div className="flex items-center gap-2 text-[10px] font-bold text-rose-400">
                                            <AlertTriangle size={14} />
                                            <span>Key Required for {selectedModel.name}</span>
                                          </div>
                                          <a href="/profile" className="text-[10px] font-black uppercase tracking-widest text-white hover:underline">Configure</a>
                                        </div>
                                      )}
                                      <div className="flex gap-2">
                                        <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                                          <Mic size={16} />
                                        </button>
                                        <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                                          <History size={16} />
                                        </button>
                                      </div>
                                      <ChatInput value={input} onChange={setInput} onSubmit={handleSend} isGenerating={isGenerating} selectedModelId={selectedModel.id} onModelChange={setSelectedModel} onBuild={handleBuild} onFileAttach={setAttachedFile} />
                                    </div>
                                  </motion.div>
                                )}

                                {aiTab === 'packages' && (
                                  <motion.div key="packages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                                    <div className="relative mb-6">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                      <input 
                                        type="text" 
                                        placeholder="Search npm packages..." 
                                        value={packageSearch}
                                        onChange={(e) => setPackageSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleInstallPackage(packageSearch)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500/50 transition-all"
                                      />
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Installed Modules</h4>
                                      {installedPackages.map(pkg => (
                                        <div key={pkg} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                              <Box size={16} />
                                            </div>
                                            <div>
                                              <p className="text-sm font-bold">{pkg}</p>
                                              <p className="text-[9px] text-white/20 font-mono">latest</p>
                                            </div>
                                          </div>
                                          <button onClick={() => setInstalledPackages(prev => prev.filter(p => p !== pkg))} className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-rose-400 transition-all">
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}

                                {aiTab === 'insights' && (
                                  <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                                    <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
                                      <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem]">
                                        <div className="flex items-center gap-3 mb-4">
                                          <Sparkles className="text-indigo-400" size={20} />
                                          <h3 className="text-lg font-black">Neural Optimization</h3>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed mb-6">I've analyzed your current script and found 3 potential improvements.</p>
                                        <div className="space-y-3">
                                          {[
                                            { title: 'Memoize Callbacks', desc: 'Use useCallback for event handlers to prevent re-renders.' },
                                            { title: 'Extract Constants', desc: 'Move static configuration outside the component body.' },
                                            { title: 'Add Error Boundary', desc: 'Wrap the main view to handle runtime exceptions.' }
                                          ].map((insight, i) => (
                                            <div key={i} className="p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group">
                                              <div className="flex items-center justify-between mb-1">
                                                <p className="text-xs font-black text-indigo-400">{insight.title}</p>
                                                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                                              </div>
                                              <p className="text-[11px] text-white/40 font-medium">{insight.desc}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
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
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={handleCreateProject} />
    </div>
  );
};

export default NeuralLab;