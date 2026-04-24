import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import { 
  CheckCircle2, Circle, Clock, Plus, Trash2, 
  AlertCircle, Calendar, Zap, BrainCircuit, Filter,
  ChevronRight, X, Loader2, Bell, ShieldCheck, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

const CATEGORIES = ['Feeding', 'Cleaning', 'Medical', 'Breeding', 'Maintenance'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const Tasks = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Feeding',
    priority: 'Medium',
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
    completed: false
  });

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    const data = await storage.get('tasks', user?.id || '');
    setTasks(data);
    setLoading(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await storage.insert('tasks', user.id, formData);
      setIsModalOpen(false);
      setFormData({ title: '', category: 'Feeding', priority: 'Medium', due_date: new Date().toISOString().split('T')[0], notes: '', completed: false });
      fetchTasks();
      showSuccess("Task initialized in neural queue.");
    } catch (err) {
      showError("Failed to sync task.");
    }
  };

  const toggleTask = async (task: any) => {
    if (!user) return;
    const updated = { ...task, completed: !task.completed };
    await storage.update('tasks', user.id, task.id, updated);
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    showSuccess(updated.completed ? "Task optimized." : "Task restored.");
  };

  const deleteTask = async (id: string) => {
    if (!user || !confirm("Terminate this task?")) return;
    await storage.delete('tasks', user.id, id);
    setTasks(prev => prev.filter(t => t.id !== id));
    showSuccess("Task purged.");
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const critical = tasks.filter(t => t.priority === 'Critical' && !t.completed).length;
    return { total, completed, critical, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
      const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
      const matchesStatus = filterStatus === 'All' ||
                           (filterStatus === 'Completed' ? t.completed : !t.completed);
      return matchesCategory && matchesPriority && matchesStatus;
    });
  }, [tasks, filterCategory, filterPriority, filterStatus]);

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
              <BrainCircuit size={14} />
              <span>Neural Schedule Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              The <span className="dopamine-text">Queue.</span>
            </h1>
          </motion.div>
          
          <button onClick={() => setIsModalOpen(true)} className="auron-button h-14 px-8 flex items-center gap-3 text-sm">
            <Plus size={20} /> Initialize Task
          </button>
        </header>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none appearance-none focus:border-indigo-500/50"
            >
              <option value="All" className="bg-[#020408]">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#020408]">{c}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none rotate-90" />
          </div>
          <div className="relative">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none appearance-none focus:border-indigo-500/50"
            >
              <option value="All" className="bg-[#020408]">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p} className="bg-[#020408]">{p}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none rotate-90" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none appearance-none focus:border-indigo-500/50"
            >
              <option value="All" className="bg-[#020408]">All Status</option>
              <option value="Pending" className="bg-[#020408]">Pending</option>
              <option value="Completed" className="bg-[#020408]">Completed</option>
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none rotate-90" />
          </div>
          <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl px-6">
            <Filter className="h-4 w-4 text-indigo-400 mr-2" />
            <span className="text-xs font-black uppercase tracking-widest text-white/40">{filteredTasks.length} Results</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="pill-nav p-10 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Efficiency Rating</p>
            <h3 className="text-5xl font-black mb-4">{stats.percent}%</h3>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${stats.percent}%` }} className="h-full bg-white" />
            </div>
          </div>
          <div className="pill-nav p-10 bg-white/5 border-white/10">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Pending Nodes</p>
            <h3 className="text-4xl font-black">{stats.total - stats.completed}</h3>
          </div>
          <div className="pill-nav p-10 bg-rose-500/10 border-rose-500/20">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Critical Alerts</p>
            <h3 className="text-4xl font-black text-rose-400">{stats.critical}</h3>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1).map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "pill-nav p-6 flex items-center justify-between gap-6 group transition-all",
                task.completed ? "opacity-40 grayscale" : "hover:border-indigo-500/50"
              )}
            >
              <div className="flex items-center gap-6 flex-1">
                <button onClick={() => toggleTask(task)} className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  task.completed ? "bg-emerald-500 text-white" : "bg-white/5 text-white/20 hover:text-indigo-400 hover:bg-white/10"
                )}>
                  {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                <div>
                  <h3 className={cn("text-lg font-black tracking-tight", task.completed && "line-through")}>{task.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{task.category}</span>
                    <span className="text-white/10">•</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      task.priority === 'Critical' ? "text-rose-400" : "text-white/20"
                    )}>{task.priority} Priority</span>
                    <span className="text-white/10">•</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1">
                      <Clock size={10} /> {task.due_date}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-3 rounded-xl bg-white/5 text-white/20 hover:text-rose-400 transition-all">
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full bg-[#020408] border border-white/10 rounded-[3rem] p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">Initialize Task</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-white/5 text-white/40"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Objective</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" placeholder="e.g., Neural Vaccination Cycle" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#020408]">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Priority</label>
                    <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                      {PRIORITIES.map(p => <option key={p} value={p} className="bg-[#020408]">{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Due Date</label>
                  <input type="date" required value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                </div>
                <button type="submit" className="auron-button w-full h-16 text-lg mt-4">Sync to Queue</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;