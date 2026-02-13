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
  MessageSquare, Mic, History, BarChart, Smartphone, Tablet, Monitor, Download
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
import { downloadProject } from '@/utils/download';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // Cloud Setup State
  const [cloudStatus, setCloudStatus] = useState<'checking' | 'ready' | 'missing'>('checking');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Package Management
  const [installedPackages, setInstalledPackages] = useState<string[]>(['react', 'react-dom', 'lucide-react', 'framer-motion']);
  const [packageSearch, setPackageSearch] = useState('');

  // Problems State
  const [problems, setProblems] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
      checkCloudTables();
      addLog('info', 'Neural Lab initialized. Neural link established.');
    }

    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data.type === 'neural-log') {
        addLog(event.data.level, event.data.message);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [user]);

  const checkCloudTables = async () => {
    setCloudStatus('checking');
    try {
      const { status } = await supabase.from('projects').select('id', { count: 'exact', head: true }).limit(1);
      if (status === 404) {
        setCloudStatus('missing');
      } else {
        setCloudStatus('ready');
      }
    } catch {
      setCloudStatus('missing');
    }
  };

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
      addLog('info', `Switched to script: ${selectedScript.path || selectedScript.title}`);
    }
  }, [selectedScript]);

  // Debounced Preview Update
  useEffect(() => {
    if (selectedProject && projectScripts.length > 0) {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(() => {
        updatePreview();
      }, 800);
    }
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, [projectScripts, selectedProject]);

  // Derive routes from project scripts
  const dynamicRoutes = projectScripts
    .filter(s => s.path?.startsWith('src/pages/'))
    .map(s => {
      const name = s.title.replace(/\.(tsx|jsx|ts|js)$/, '');
      const path = name === 'Index' ? '/' : `/${name.toLowerCase()}`;
      return { path, label: name };
    });

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
    if (filtered.length > 0) {
      const entry = filtered.find((s: any) => s.path === 'src/App.tsx') || filtered[0];
      setSelectedScript(entry);
    }
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
    addLog('info', `Saving ${selectedScript.path || selectedScript.title} locally...`);
    await storage.update('scripts', user.id, selectedScript.id, { content: editorContent });
    showSuccess("Script saved locally.");
  };

  const handleDownload = async () => {
    if (!selectedProject || projectScripts.length === 0) return;
    addLog('info', 'Bundling project for download...');
    try {
      await downloadProject(selectedProject, projectScripts);
      showSuccess("Project downloaded successfully.");
    } catch (err) {
      showError("Failed to bundle project.");
    }
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
  };

  const handleRunChecks = () => {
    setIsScanning(true);
    setProblems([]);
    addLog('info', 'Starting neural diagnostic scan...');
    
    setTimeout(() => {
      const newProblems: any[] = [];
      
      projectScripts.forEach(script => {
        if (script.content.length < 10) {
          newProblems.push({ type: 'warn', file: script.path || script.title, message: 'File is unusually small. Possible missing logic.' });
        }
        if (script.title.endsWith('.tsx') && !script.content.includes('import React')) {
          newProblems.push({ type: 'error', file: script.path || script.title, message: 'Missing React import in TSX file.' });
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
        path: 'index.html',
        content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${project.title}</title>\n    <script src="https://js.puter.com/v2/"></script>\n    <script src="https://cdn.tailwindcss.com/3.4.1"></script>\n    <script>\n      tailwind.config = {\n        theme: {\n          extend: {\n            colors: {\n              primary: '#99f6ff',\n              background: '#020408',\n            }\n          }\n        }\n      }\n    </script>\n  </head>\n  <body class="bg-[#020408] text-white">\n    <div id="root"></div>\n  </body>\n</html>`
      },
      {
        title: 'App.tsx',
        project_id: newProject.id,
        path: 'src/App.tsx',
        content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">\n      <div className="w-24 h-24 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 mb-8 border border-indigo-500/20 animate-pulse">\n        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>\n      </div>\n      <h1 className="text-6xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">${project.title}</h1>\n      <p className="text-xl text-white/40 max-w-md font-medium">${project.description}</p>\n      <button className="mt-12 px-8 py-3 bg-[#99f6ff] text-[#020408] font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(153,246,255,0.3)]">\n        Initialize Neural Link\n      </button>\n    </div>\n  );\n}`
      },
      {
        title: 'main.tsx',
        project_id: newProject.id,
        path: 'src/main.tsx',
        content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')).render(<App />);`
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
    const name = prompt("Enter script path (e.g., src/components/Button.tsx):");
    if (!name) return;
    const title = name.split('/').pop() || name;
    const data = await storage.insert('scripts', user.id, { title, path: name, project_id: selectedProject.id, content: '' });
    setProjectScripts(prev => [data, ...prev]);
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
    const existingFile = projectScripts.find(p => p.path === path);

    if (existingFile) {
      const newContent = mode === 'replace' ? code : existingFile.content + "\n\n" + code;
      await storage.update('scripts', user.id, existingFile.id, { content: newContent });
      if (selectedScript?.id === existingFile.id) setEditorContent(newContent);
      setProjectScripts(prev => prev.map(p => p.id === existingFile.id ? { ...p, content: newContent } : p));
    } else {
      const data = await storage.insert('scripts', user.id, { title: fileName, path, project_id: selectedProject.id, content: code });
      setProjectScripts(prev => [data, ...prev]);
      setSelectedScript(data);
    }
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
        systemPrompt: `You are the Yobest AI Neural Architect. You are building "${selectedProject?.title}".
        
        CRITICAL COGNITIVE RULES:
        1. TECH STACK: You are strictly using VITE + REACT + TAILWIND.
        2. NO CONFIG FILES: Do NOT generate package.json, vite.config.ts, tsconfig.json, or .gitkeep. These are handled by the platform.
        3. FOLDER STRUCTURE: 
           - Pages MUST go in 'src/pages/'
           - Components MUST go in 'src/components/'
           - Entry point is 'src/App.tsx'
        4. NEURAL PRE-SCAN: Before suggesting any code, analyze the entire project structure.
        5. VIRTUAL LINKING: Ensure all files you create are correctly imported by other files.
        6. COMPLETE SOLUTIONS: Never provide partial code. If you add a component, update the parent file to use it.
        
        FORMAT:
        ### Thinking
        [Detailed architectural plan]
        
        ### File: src/pages/MyPage.tsx
        \`\`\`typescript
        [Production-ready code]
        \`\`\``
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
            thought: "Performing neural pre-scan of project architecture..."
          }];
        });
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePreview = useCallback(() => {
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        previewRef.current.src = 'about:blank';
        
        setTimeout(() => {
          const freshDoc = previewRef.current?.contentDocument;
          if (!freshDoc) return;
          
          freshDoc.open();
          
          // Virtual Module Registry
          const moduleRegistry = projectScripts
            .filter(s => s.path?.endsWith('.tsx') || s.path?.endsWith('.jsx') || s.path?.endsWith('.js'))
            .map(s => {
              const isMainApp = s.path === 'src/App.tsx' || s.path === 'App.tsx';
              let content = s.content
                .replace(/import\s+.*?from\s+['"](.*?)['"];?/g, (match, p1) => {
                  const fileName = p1.split('/').pop().replace(/\.(tsx|jsx|ts|js)$/, '');
                  return `const ${fileName} = window.NeuralRegistry['${p1}'] || window.NeuralRegistry['${fileName}'];`;
                })
                .replace(/export\s+default\s+/g, 'module.exports = ')
                .replace(/export\s+const\s+(\w+)/g, 'module.exports.$1 = ')
                .replace(/export\s+function\s+(\w+)/g, 'module.exports.$1 = function $1');
              
              return `
                window.NeuralRegistry['${s.path}'] = (function() {
                  const module = { exports: {} };
                  const exports = module.exports;
                  ${content}
                  return module.exports;
                })();
                if ('${isMainApp}' === 'true') window.App = window.NeuralRegistry['${s.path}'];
              `;
            }).join('\n');

          const cssToInject = projectScripts
            .filter(s => s.path?.endsWith('.css'))
            .map(s => `<style data-path="${s.path}">${s.content}</style>`)
            .join('\n');

          const indexHtml = projectScripts.find(s => s.path === 'index.html')?.content || `
            <!DOCTYPE html>
            <html>
              <head>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/react-router-dom@6.21.3/dist/umd/react-router-dom.production.min.js"></script>
                <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
                <script src="https://unpkg.com/lucide@0.263.1/dist/umd/lucide.min.js"></script>
                <script src="https://cdn.tailwindcss.com/3.4.1"></script>
              </head>
              <body><div id="root"></div></body>
            </html>
          `;
          
          const finalHtml = indexHtml.replace('<head>', `
            <head>
            <script>
              window.NeuralRegistry = {};
              
              // Puter Protection: Prevent re-registration of custom elements
              if (!window.customElements.originalDefine) {
                window.customElements.originalDefine = window.customElements.define;
                window.customElements.define = function(name, constructor, options) {
                  if (!window.customElements.get(name)) {
                    window.customElements.originalDefine(name, constructor, options);
                  } else {
                    console.warn('Skipping re-definition of ' + name);
                  }
                };
              }

              // Suppress React DevTools and Tailwind warnings
              const originalConsoleWarn = console.warn;
              console.warn = (...args) => {
                if (args[0] && typeof args[0] === 'string' && (
                  args[0].includes('react-devtools') || 
                  args[0].includes('cdn.tailwindcss.com')
                )) return;
                originalConsoleWarn(...args);
              };
              
              // Puter Protection: Handle 401s silently
              if (typeof puter !== 'undefined' && puter.ui) {
                try { puter.ui.whoami().catch(() => {}); } catch(e) {}
              }
            </script>
            ${cssToInject}
          `).replace('</body>', `
            <script type="text/babel">
              const sendToParent = (level, args) => {
                window.parent.postMessage({
                  type: 'neural-log',
                  level,
                  message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
                }, '*');
              };

              console.log = (...args) => sendToParent('info', args);
              console.warn = (...args) => { 
                if (args[0] && typeof args[0] === 'string' && args[0].includes('cdn.tailwindcss.com')) return;
                sendToParent('warn', args); 
              };
              console.error = (...args) => sendToParent('error', args);

              try {
                window.framerMotion = window.Motion;
                window.lucide = window.lucide;
                window.ReactRouterDOM = window.ReactRouterDOM;
                ${moduleRegistry}
                if (window.App) {
                  const root = ReactDOM.createRoot(document.getElementById('root'));
                  root.render(<window.App />);
                }
              } catch (err) {
                console.error("Preview Error: " + err.message + "\\nStack: " + err.stack);
              }
            </script>
            </body>
          `);
          
          freshDoc.write(finalHtml);
          freshDoc.close();
        }, 100);
      }
    }
  }, [projectScripts]);

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
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              <Download size={14} /> Download Project
            </button>
            <button onClick={handleSyncCloud} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              <Cloud size={14} /> Sync Cloud
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
                  <div className="flex items-center gap-4">
                    {cloudStatus === 'missing' && (
                      <button onClick={() => setIsSetupModalOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500/20 text-rose-400 text-sm font-bold border border-rose-500/20 hover:bg-rose-500/30 transition-all">
                        <AlertTriangle size={16} /> Setup Cloud Storage
                      </button>
                    )}
                    <button onClick={() => setIsProjectModalOpen(true)} className="auron-button h-14 px-8 flex items-center gap-3"><Plus size={20} /> New Project</button>
                  </div>
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
                                <button onClick={() => setViewportSize('mobile')} className={cn("p-1.5 transition-colors", viewportSize === 'mobile' ? "text-indigo-400" : "text-white/40 hover:text-white")}><Smartphone size={16} /></button>
                                <button onClick={() => setViewportSize('tablet')} className={cn("p-1.5 transition-colors", viewportSize === 'tablet' ? "text-indigo-400" : "text-white/40 hover:text-white")}><Tablet size={16} /></button>
                                <button onClick={() => setViewportSize('desktop')} className={cn("p-1.5 transition-colors", viewportSize === 'desktop' ? "text-indigo-400" : "text-white/40 hover:text-white")}><Monitor size={16} /></button>
                                <div className="w-[1px] h-4 bg-white/10 mx-1" />
                                <button onClick={updatePreview} className="p-1.5 text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                              </div>
                              <div className="flex-1 relative group">
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-4 text-[11px] font-medium text-white/60 flex items-center justify-between outline-none hover:bg-black/60 transition-all">
                                    <span className="truncate">{currentPath}</span>
                                    <ChevronDown size={12} />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-[400px] p-2 z-[110]">
                                    {dynamicRoutes.length > 0 ? dynamicRoutes.map(route => (
                                      <DropdownMenuItem key={route.path} onClick={() => setCurrentPath(route.path)} className="flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-white/5">
                                        <span className="font-bold text-xs">{route.label}</span>
                                        <span className="text-[10px] text-white/20 font-mono">{route.path}</span>
                                      </DropdownMenuItem>
                                    )) : (
                                      <div className="p-4 text-center text-[10px] text-white/20 font-black uppercase tracking-widest">No routes detected</div>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={updatePreview} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-all"><RestartIcon size={14} /> Restart</button>
                                <button className="p-1.5 text-white/40 hover:text-white transition-colors"><Maximize2 size={14} /></button>
                              </div>
                            </div>
                            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
                              <AnimatePresence mode="wait">
                                {activeTab === 'code' && (
                                  <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                                    <textarea value={editorContent} onChange={(e) => setEditorContent(e.target.value)} className="w-full h-full bg-transparent p-8 font-mono text-sm text-indigo-300 outline-none resize-none custom-scrollbar leading-relaxed" spellCheck={false} />
                                  </motion.div>
                                )}
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
                                {activeTab === 'problems' && (
                                  <motion.div key="problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full p-12 bg-[#0a0a0a]">
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
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Neural Context: {selectedScript?.path || 'Global'}</span>
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
                                              <button key={preset.label} onClick={() => setInput(`Please \${preset.label.toLowerCase()} the current script.`)} className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold hover:bg-white/10 transition-all text-left flex items-center gap-2">
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
      
      <Dialog open={isSetupModalOpen} onOpenChange={setIsSetupModalOpen}>
        <DialogContent className="bg-[#020408] border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Database className="text-indigo-400" />
              Setup Supabase Tables
            </DialogTitle>
            <DialogDescription className="text-white/40 font-medium">
              Your Supabase tables are missing. Follow these steps to enable cloud storage.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <ol className="list-decimal pl-6 space-y-6 text-sm font-medium text-white/60">
              <li>
                Go to your Supabase dashboard: 
                <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline ml-2 inline-flex items-center gap-1">
                  supabase.com/dashboard <ExternalLink size={12} />
                </a>
              </li>
              <li>Select your project (URL: <code className="text-indigo-300">kyzjxatlcfypghkianon.supabase.co</code>)</li>
              <li>
                Open the <span className="text-white font-bold">SQL Editor</span> and run the following script:
                <div className="mt-4 bg-black/40 p-6 rounded-2xl border border-white/5 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                  <pre>{`CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  template text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE scripts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  path text,
  content text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own scripts" ON scripts
  FOR ALL USING (auth.uid() = user_id);`}</pre>
                </div>
              </li>
              <li>Reload this page after the tables are created.</li>
            </ol>
          </div>
          
          <div className="flex justify-end mt-6">
            <button onClick={() => setIsSetupModalOpen(false)} className="auron-button h-12 px-8">I've Created the Tables</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NeuralLab;