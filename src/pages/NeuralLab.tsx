import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { 
  BrainCircuit, Send, Sparkles, Cpu, Zap, 
  Image as ImageIcon, Loader2, 
  FileCode, Terminal, Layers, X,
  ChevronDown, FolderOpen, Plus, Play, Code as CodeIcon, Eye, Save, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { storage } from '@/lib/storage';
import { showSuccess, showError } from '@/utils/toast';
import ProjectModal from '@/components/ProjectModal';
import CodeFrame from '@/components/CodeFrame';
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
  const [activeEditorTab, setActiveEditorTab] = useState('code');
  const [editorContent, setEditorContent] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

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

  useEffect(() => {
    if (selectedProject) {
      setEditorContent(selectedProject.content);
    }
  }, [selectedProject]);

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
      content: `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #020408; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n    h1 { color: #99f6ff; text-shadow: 0 0 20px rgba(153,246,255,0.5); }\n  </style>\n</head>\n<body>\n  <h1>${project.title} Initialized</h1>\n</body>\n</html>`
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

  const handleAddCodeToProject = (code: string) => {
    setEditorContent(prev => prev + "\n\n" + code);
    showSuccess("Code added to editor");
  };

  const handleApplyAll = (messageContent: string) => {
    const codeBlocks = messageContent.match(/```[\s\S]*?```/g);
    if (codeBlocks) {
      const allCode = codeBlocks.map(block => {
        const match = block.match(/```(\w+)?\n?([\s\S]*?)```/);
        return match?.[2] || '';
      }).join('\n\n');
      setEditorContent(prev => prev + "\n\n" + allCode);
      showSuccess("All code blocks applied to editor");
    }
  };

  const handleSaveProject = async () => {
    if (!user || !selectedProject) return;
    await storage.update('scripts', user.id, selectedProject.id, { content: editorContent });
    setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, content: editorContent } : p));
    showSuccess("Project saved to neural archive");
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

  const renderMessageContent = (msg: any) => {
    const parts = msg.content.split(/(```[\s\S]*?```)/g);
    const hasCode = msg.content.includes('```');
    
    return (
      <div className="space-y-4">
        {parts.map((part: string, index: number) => {
          if (part.startsWith('```')) {
            const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
            const language = match?.[1] || 'javascript';
            const code = match?.[2] || '';
            return (
              <CodeFrame 
                key={index} 
                code={code} 
                language={language} 
                onAdd={handleAddCodeToProject} 
              />
            );
          }
          return <p key={index} className="font-medium leading-relaxed whitespace-pre-wrap text-sm md:text-base">{part}</p>;
        })}
        {hasCode && msg.role === 'assistant' && (
          <button 
            onClick={() => handleApplyAll(msg.content)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#99f6ff]/10 text-[#99f6ff] hover:bg-[#99f6ff] hover:text-[#020408] text-[10px] font-black uppercase tracking-widest transition-all mt-4"
          >
            <Plus size={14} />
            Apply All Code
          </button>
        )}
      </div>
    );
  };

  const updatePreview = () => {
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(editorContent);
        doc.close();
      }
    }
  };

  useEffect(() => {
    if (activeEditorTab === 'preview') {
      updatePreview();
    }
  }, [activeEditorTab, editorContent]);

  return (
    <div className="h-screen bg-[#020408] text-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      <main className="flex-1 pt-24 w-full relative z-10 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Side: AI Chat & Models */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col p-6 gap-6 border-r border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <BrainCircuit size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest">Neural Lab</h2>
                    <p className="text-[10px] text-white/30 font-bold">Cognitive Research Engine</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="pill-nav py-2 px-4 flex items-center gap-2 text-xs font-bold outline-none hover:bg-white/10 transition-all">
                    <selectedModel.icon size={14} className="text-indigo-400" />
                    {selectedModel.name}
                    <ChevronDown size={12} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-64">
                    {MODELS.map((model) => (
                      <DropdownMenuItem key={model.id} onClick={() => setSelectedModel(model)} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                        <div className="flex items-center gap-2 w-full">
                          <model.icon size={14} className="text-indigo-400" />
                          <span className="font-bold text-xs">{model.name}</span>
                          <span className="ml-auto text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5">{model.type}</span>
                        </div>
                        <p className="text-[10px] text-white/30">{model.desc}</p>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <Sparkles size={48} className="mb-6 text-indigo-400 animate-pulse" />
                    <h3 className="text-xl font-black mb-2">Awaiting Neural Input</h3>
                    <p className="text-xs font-medium max-w-xs">Ask the cognitive engine to generate code, analyze images, or build your next project.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] p-6 rounded-[2rem] relative group ${
                        msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 
                        'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                      }`}>
                        <div className="flex items-center gap-2 opacity-40 text-[10px] font-black uppercase tracking-widest mb-3">
                          {msg.role === 'user' ? <Zap size={12} /> : <Cpu size={12} />}
                          {msg.role === 'user' ? 'Researcher' : msg.model}
                        </div>
                        {msg.image && <img src={msg.image} className="mb-4 rounded-xl max-h-48 w-full object-cover border border-white/10" alt="Uploaded" />}
                        {renderMessageContent(msg)}
                      </div>
                    </motion.div>
                  ))
                )}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] rounded-tl-none">
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
                  <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${attachedImage ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/20 hover:text-white hover:bg-white/5'}`}>
                    <ImageIcon size={20} />
                  </button>
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the cognitive engine..." className="flex-1 bg-transparent border-none h-12 px-4 text-white placeholder:text-white/20 focus:ring-0 font-medium text-sm" />
                  <button type="submit" disabled={isGenerating || (!input.trim() && !attachedImage)} className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 transition-all disabled:opacity-50">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-white/5 hover:bg-indigo-500/30 transition-colors" />

          {/* Right Side: Editor & Preview */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full flex flex-col bg-[#010204]">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white transition-all outline-none">
                      <FolderOpen size={16} className="text-indigo-400" />
                      {selectedProject ? selectedProject.title : "Select Project"}
                      <ChevronDown size={14} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#020408] border-white/10 text-white w-64">
                      {projects.map((p) => (
                        <DropdownMenuItem key={p.id} onClick={() => setSelectedProject(p)} className="cursor-pointer font-medium">
                          {p.title}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem onClick={() => setIsProjectModalOpen(true)} className="text-indigo-400 font-bold">
                        <Plus size={14} className="mr-2" /> New Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={handleSaveProject} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all" title="Save Project">
                    <Save size={18} />
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(editorContent); showSuccess("Project copied"); }} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all" title="Copy All">
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <Tabs value={activeEditorTab} onValueChange={setActiveEditorTab} className="flex-1 flex flex-col">
                <div className="px-4 bg-white/5 flex items-center justify-between">
                  <TabsList className="bg-transparent border-none h-12 p-0">
                    <TabsTrigger value="code" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent text-xs font-black uppercase tracking-widest h-full px-6">
                      <CodeIcon size={14} className="mr-2" /> Code Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#99f6ff] data-[state=active]:bg-transparent text-xs font-black uppercase tracking-widest h-full px-6">
                      <Eye size={14} className="mr-2" /> Live Preview
                    </TabsTrigger>
                  </TabsList>
                  
                  {activeEditorTab === 'preview' && (
                    <button onClick={updatePreview} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#99f6ff] hover:text-white transition-all">
                      <Play size={12} className="fill-current" /> Refresh Preview
                    </button>
                  )}
                </div>

                <TabsContent value="code" className="flex-1 m-0 p-0 relative">
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="w-full h-full bg-transparent p-8 font-mono text-sm text-indigo-300 outline-none resize-none custom-scrollbar leading-relaxed"
                    spellCheck={false}
                    placeholder="// Write your neural scripts here..."
                  />
                  <div className="absolute bottom-4 right-4 p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/20">
                    {editorContent.length} characters
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 m-0 p-0 bg-white">
                  <iframe
                    ref={previewRef}
                    title="Live Preview"
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </TabsContent>
              </Tabs>
            </div>
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