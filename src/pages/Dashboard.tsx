import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Calendar, CheckCircle2, Clock, BrainCircuit, Sparkles, TrendingUp, Loader2, Code, MessageSquare, Save, History, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { grokChat } from '@/lib/puter';
import ScriptEditor from '@/components/ScriptEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [scripts, setScripts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'scripts' | 'history'>('tasks');
  const [editingScript, setEditingScript] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Scripts from Supabase
      const { data: scriptData } = await supabase
        .from('scripts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (scriptData) setScripts(scriptData);

      // Fetch Tasks from Supabase (assuming tasks table exists)
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (taskData) setTasks(taskData);

      const savedMsgs = localStorage.getItem(`messages_${user?.id}`);
      if (savedMsgs) setMessages(JSON.parse(savedMsgs));
    } catch (error: any) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiSuggest = async () => {
    setIsAiGenerating(true);
    try {
      const suggestion = await grokChat("Suggest a single, highly productive task for a user today. Keep it under 10 words.", { modelId: 'yobest-ai', userId: user?.id });
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user?.id,
          title: suggestion,
          status: 'pending'
        }])
        .select()
        .single();

      if (!error && data) {
        setTasks([data, ...tasks]);
        showSuccess('Grok suggested a new task.');
      }
    } catch (error) {
      showError('AI Engine failed to suggest.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleDeleteScript = async (id: number) => {
    const { error } = await supabase
      .from('scripts')
      .delete()
      .eq('id', id);

    if (!error) {
      setScripts(scripts.filter(s => s.id !== id));
      showSuccess('Script purged from cloud archive.');
    } else {
      showError("Failed to delete script.");
    }
  };

  const handleSaveScript = async (updatedScript: any) => {
    const { error } = await supabase
      .from('scripts')
      .update({ title: updatedScript.title, content: updatedScript.content })
      .eq('id', updatedScript.id);

    if (!error) {
      setScripts(scripts.map(s => s.id === updatedScript.id ? updatedScript : s));
      showSuccess('Script updated in cloud.');
    } else {
      showError("Failed to update script.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      {showConfetti && <ReactConfetti numberOfPieces={200} recycle={false} />}
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 mb-4 uppercase tracking-widest">
              <Sparkles size={12} className="text-[#99f6ff]" />
              <span>Cognitive Workspace</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter dopamine-text">
              Neural Archive
            </h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleAiSuggest}
              disabled={isAiGenerating}
              className="pill-nav px-8 h-14 flex items-center gap-3 bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-all font-bold"
            >
              {isAiGenerating ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
              AI Suggest
            </button>
          </div>
        </motion.header>

        <div className="flex gap-4 mb-12 border-b border-white/5 pb-4">
          {[
            { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
            { id: 'scripts', label: 'Scripts', icon: Code },
            { id: 'history', label: 'AI History', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-white/20 font-medium">Synchronizing neural data...</div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'tasks' && (
                <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {tasks.length === 0 ? (
                    <div className="py-32 text-center pill-nav border-dashed border-white/10">
                      <p className="text-white/40 font-medium">No active tasks. Use AI Suggest to begin.</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="pill-nav p-6 flex items-center justify-between mb-4 group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-6">
                          <div className={`w-6 h-6 rounded-full border-2 ${task.status === 'completed' ? 'bg-[#99f6ff] border-[#99f6ff]' : 'border-white/10'}`} />
                          <h4 className={`text-lg font-bold ${task.status === 'completed' ? 'text-white/20 line-through' : 'text-white'}`}>{task.title}</h4>
                        </div>
                        <Button variant="ghost" size="icon" className="text-white/20 hover:text-white"><MoreVertical size={20} /></Button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'scripts' && (
                <motion.div key="scripts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="grid md:grid-cols-2 gap-6">
                    {scripts.length === 0 ? (
                      <div className="col-span-2 py-32 text-center pill-nav border-dashed border-white/10">
                        <p className="text-white/40 font-medium">No saved scripts found.</p>
                      </div>
                    ) : (
                      scripts.map((script) => (
                        <div key={script.id} className="pill-nav p-8 bg-white/5 border-white/10 group relative">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-xl font-black">{script.title}</h4>
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
                                    <MoreVertical size={20} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-[#020408] border-white/10 text-white">
                                  <DropdownMenuItem onClick={() => setEditingScript(script)} className="flex items-center gap-2 cursor-pointer">
                                    <Edit2 size={14} /> Edit Script
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteScript(script.id)} className="flex items-center gap-2 text-rose-400 cursor-pointer">
                                    <Trash2 size={14} /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <pre className="bg-black/40 p-4 rounded-xl text-xs font-mono text-indigo-300 overflow-x-auto mb-6 max-h-40">
                            {script.content}
                          </pre>
                          <div className="flex items-center justify-between text-[10px] font-black text-white/20 uppercase tracking-widest">
                            <span>{new Date(script.created_at).toLocaleDateString()}</span>
                            <button onClick={() => setEditingScript(script)} className="hover:text-white transition-colors flex items-center gap-1">
                              <ExternalLink size={12} /> Open Editor
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="py-32 text-center pill-nav border-dashed border-white/10">
                        <p className="text-white/40 font-medium">No AI conversation history.</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="pill-nav p-6 bg-white/5 border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                              <BrainCircuit size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Grok 3 Fast</span>
                          </div>
                          <p className="text-gray-300 font-medium leading-relaxed italic">"{msg.content}"</p>
                          <div className="mt-4 text-[10px] font-black text-white/10 uppercase tracking-widest">
                            {new Date(msg.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      {editingScript && (
        <ScriptEditor 
          script={editingScript} 
          isOpen={!!editingScript} 
          onClose={() => setEditingScript(null)} 
          onSave={handleSaveScript}
        />
      )}
    </div>
  );
};

export default Dashboard;