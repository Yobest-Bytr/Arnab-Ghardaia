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
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, score: 85 });

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
      const pending = total - completed;
      
      setStats(prev => ({ ...prev, total, pending, completed }));
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="md:ml-[280px] pt-16 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <motion.header 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
          >
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user?.email?.split('@')[0]}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Your AI assistant has prepared your daily briefing.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-2xl border-indigo-100 dark:border-gray-800 font-bold h-12 px-6">
                <Sparkles className="mr-2 h-4 w-4 text-indigo-500" /> AI Suggest
              </Button>
              <Button className="ai-gradient hover:opacity-90 rounded-2xl px-8 h-12 font-bold shadow-lg ai-glow border-none">
                <Plus className="mr-2 h-5 w-5" /> New Task
              </Button>
            </div>
          </motion.header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Tasks", val: stats.total, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
              { label: "Pending", val: stats.pending, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { label: "Completed", val: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { label: "AI Score", val: `${stats.score}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-none shadow-sm rounded-[2rem] bg-white dark:bg-gray-900 overflow-hidden group hover:shadow-xl transition-all duration-500">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black dark:text-white">{stat.val}</h3>
                      </div>
                      <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                        <stat.icon size={28} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Task List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="border-b border-gray-50 dark:border-gray-800 flex flex-row items-center justify-between py-6 px-8">
                <CardTitle className="text-xl font-black dark:text-white flex items-center gap-2">
                  <BrainCircuit className="text-indigo-600" size={24} />
                  Active Workspace
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Filter tasks..." 
                      className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-48"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Filter size={20} className="text-gray-400" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-20 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-500 font-bold">AI is fetching your data...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="p-20 text-center">
                    <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="text-indigo-600" size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Your workspace is clear</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto font-medium">Ready to start something new? Let AI help you create your first task.</p>
                    <Button className="ai-gradient rounded-2xl px-10 h-12 font-bold shadow-lg border-none">Create First Task</Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    <AnimatePresence>
                      {tasks.map((task, i) => (
                        <motion.div 
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-6 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group"
                        >
                          <div className="flex items-center gap-6">
                            <motion.button 
                              whileTap={{ scale: 0.8 }}
                              onClick={() => toggleTaskStatus(task.id, task.status)}
                              className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                                task.status === 'completed' 
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
                                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400'
                              }`}
                            >
                              {task.status === 'completed' && <CheckCircle2 size={18} />}
                            </motion.button>
                            <div>
                              <h4 className={`text-lg font-bold transition-all ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-4 mt-1.5">
                                <span className="flex items-center text-xs font-bold text-gray-400">
                                  <Calendar size={14} className="mr-1.5" />
                                  {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}
                                </span>
                                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                                  task.status === 'completed' 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                }`}>
                                  {task.status}
                                </span>
                                {task.ai_suggested && (
                                  <span className="flex items-center gap-1 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                                    <Sparkles size={10} /> AI Suggested
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white dark:hover:bg-gray-800 shadow-sm">
                              <MoreVertical size={20} className="text-gray-400" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;