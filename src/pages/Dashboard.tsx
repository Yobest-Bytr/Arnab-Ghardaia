import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Filter, Search, MoreVertical, Calendar, CheckCircle2, Clock, BrainCircuit, Sparkles, TrendingUp } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, score: 88 });

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTasks(data || []);
      const total = data?.length || 0;
      const completed = data?.filter(t => t.status === 'completed').length || 0;
      setStats(prev => ({ ...prev, total, pending: total - completed, completed }));
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      showSuccess(`Task marked as ${newStatus}`);
      fetchTasks();
    } catch (error: any) {
      showError('Failed to update task');
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 mb-4 uppercase tracking-widest">
              <Sparkles size={12} className="text-[#99f6ff]" />
              <span>Workspace Active</span>
            </div>
            <h1 className="text-5xl font-medium tracking-tight dopamine-text">
              Hello, {user?.email?.split('@')[0]}
            </h1>
          </div>
          <button className="auron-button flex items-center gap-3">
            <Plus size={20} />
            New Task
          </button>
        </motion.header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {[
            { label: "Total", val: stats.total, icon: Clock },
            { label: "Pending", val: stats.pending, icon: Sparkles },
            { label: "Done", val: stats.completed, icon: CheckCircle2 },
            { label: "Score", val: `${stats.score}%`, icon: TrendingUp },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="pill-nav p-6 flex items-center justify-between group hover:bg-white/10 transition-all"
            >
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.val}</h3>
              </div>
              <stat.icon size={20} className="text-white/20 group-hover:text-[#99f6ff] transition-colors" />
            </motion.div>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-white/20 font-medium">Synchronizing neural data...</div>
          ) : tasks.length === 0 ? (
            <div className="py-32 text-center pill-nav border-dashed">
              <p className="text-white/40 font-medium">Your workspace is clear. Start building the future.</p>
            </div>
          ) : (
            tasks.map((task, i) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="pill-nav p-6 flex items-center justify-between group hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.status === 'completed' 
                        ? 'bg-[#99f6ff] border-[#99f6ff] text-[#020408]' 
                        : 'border-white/10 hover:border-[#99f6ff]'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 size={14} />}
                  </button>
                  <div>
                    <h4 className={`text-lg font-medium transition-all ${task.status === 'completed' ? 'text-white/20 line-through' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} />
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
                  <MoreVertical size={20} />
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;