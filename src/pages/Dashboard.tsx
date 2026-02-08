import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Filter, Search, MoreVertical, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

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
      
      setStats({ total, pending, completed });
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
      fetchTasks(); // Refresh stats
    } catch (error: any) {
      showError('Failed to update task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="md:ml-[250px] pt-[60px] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.email?.split('@')[0]}!</h1>
              <p className="text-gray-500">Here's what's happening with your tasks today.</p>
            </div>
            <Button className="bg-[#2563EB] hover:bg-blue-700 rounded-xl px-6">
              <Plus className="mr-2 h-4 w-4" /> Add New Task
            </Button>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.pending}</h3>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-2xl bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.completed}</h3>
                  </div>
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task List */}
          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg font-bold">Recent Tasks</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Search size={18} className="text-gray-400" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Filter size={18} className="text-gray-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ListTodo className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No tasks yet</h3>
                  <p className="text-gray-500 mb-6">Get started by creating your first task.</p>
                  <Button variant="outline" className="rounded-xl">Create Task</Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleTaskStatus(task.id, task.status)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.status === 'completed' 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          {task.status === 'completed' && <CheckCircle2 size={14} />}
                        </button>
                        <div>
                          <h4 className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center text-xs text-gray-400">
                              <Calendar size={12} className="mr-1" />
                              {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <MoreVertical size={18} className="text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const ListTodo = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 16 2 2 4-4" />
    <path d="m3 6 2 2 4-4" />
    <path d="M13 6h8" />
    <path d="M13 12h8" />
    <path d="M13 18h8" />
  </svg>
);

export default Dashboard;