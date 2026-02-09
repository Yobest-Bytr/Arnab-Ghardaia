import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, TrendingUp, Zap, Target, Sparkles, BarChart3, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const AIInsights = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data, error } = await supabase.from('site_stats').select('*');
    if (!error && data) {
      setStats(data);
    }
  };

  const getMetric = (name: string) => stats.find(s => s.metric_name === name)?.metric_value || '...';

  return (
    <div className="min-h-screen text-white relative z-10">
      <Navbar />
      
      <main className="pt-32 p-6 md:p-12 max-w-7xl mx-auto">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
            <BrainCircuit size={14} />
            <span>Neural Analysis Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
            Cognitive <span className="dopamine-text">Insights</span>
          </h1>
          <p className="text-xl text-white/40 font-bold">Deep-dive analysis of the global Yobest network.</p>
        </motion.header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { title: "Total Visits", val: getMetric('total_visits').toLocaleString(), icon: Eye, color: "text-amber-400" },
            { title: "Active Users", val: getMetric('active_users').toLocaleString(), icon: Users, color: "text-emerald-400" },
            { title: "Tasks Optimized", val: getMetric('tasks_optimized').toLocaleString(), icon: Zap, color: "text-indigo-400" },
            { title: "AI Accuracy", val: `${getMetric('ai_accuracy')}%`, icon: Target, color: "text-purple-400" },
          ].map((insight, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="pill-nav p-10 flex flex-col group"
            >
              <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center ${insight.color} mb-8 group-hover:scale-110 transition-transform`}>
                <insight.icon size={32} />
              </div>
              <h3 className="text-sm font-black text-white/30 uppercase tracking-widest mb-2">{insight.title}</h3>
              <p className="text-4xl font-black tracking-tighter">{insight.val}</p>
            </motion.div>
          ))}
        </div>

        {/* Productivity Chart Placeholder */}
        <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 p-12 overflow-hidden group">
          <CardHeader className="p-0 mb-12">
            <CardTitle className="text-3xl font-black flex items-center gap-3">
              <TrendingUp className="text-[#99f6ff]" size={32} />
              Network Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] w-full bg-white/[0.02] rounded-[2.5rem] flex items-end justify-around px-12 pb-12 relative overflow-hidden border border-white/5">
              {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 1.5 }}
                  className="w-12 bg-[#99f6ff]/20 rounded-t-[1rem] relative group hover:bg-[#99f6ff]/40 transition-all"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AIInsights;