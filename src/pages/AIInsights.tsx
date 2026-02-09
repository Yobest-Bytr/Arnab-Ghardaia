import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import { BrainCircuit, TrendingUp, Zap, Target, Eye, Users, Activity, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '00:00', velocity: 400, load: 240 },
  { name: '04:00', velocity: 300, load: 139 },
  { name: '08:00', velocity: 900, load: 980 },
  { name: '12:00', velocity: 1200, load: 1108 },
  { name: '16:00', velocity: 1500, load: 1400 },
  { name: '20:00', velocity: 1100, load: 1200 },
  { name: '23:59', velocity: 800, load: 700 },
];

const AIInsights = () => {
  const { user } = useAuth();
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
            <Activity size={14} />
            <span>Real-time Neural Telemetry</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
            Network <span className="dopamine-text">Intelligence</span>
          </h1>
          <p className="text-xl text-white/40 font-bold">Global performance metrics of the Yobest cognitive engine.</p>
        </motion.header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { title: "Total Visits", val: getMetric('total_visits').toLocaleString(), icon: Eye, color: "text-amber-400" },
            { title: "Active Nodes", val: getMetric('active_users').toLocaleString(), icon: Users, color: "text-emerald-400" },
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

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 pill-nav p-12 bg-white/5 border-white/10">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <TrendingUp className="text-[#99f6ff]" size={24} />
                Network Velocity
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-black uppercase text-white/40">Velocity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-[10px] font-black uppercase text-white/40">Load</span>
                </div>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    fontWeight="bold" 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020408', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="velocity" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVel)" />
                  <Area type="monotone" dataKey="load" stroke="#a855f7" strokeWidth={4} fillOpacity={1} fill="url(#colorLoad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pill-nav p-12 bg-white/5 border-white/10 flex flex-col justify-between">
            <div>
              <Globe className="text-[#99f6ff] mb-8" size={48} />
              <h3 className="text-3xl font-black tracking-tighter mb-4">Global Nodes</h3>
              <p className="text-white/40 font-medium leading-relaxed">
                Our neural infrastructure is distributed across 42 regions worldwide, ensuring sub-50ms latency for all cognitive tasks.
              </p>
            </div>
            <div className="space-y-6 mt-12">
              {[
                { region: "North America", status: "Optimal", load: "24%" },
                { region: "Europe", status: "Optimal", load: "31%" },
                { region: "Asia Pacific", status: "High Demand", load: "88%" },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-xs font-black">{r.region}</p>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{r.status}</p>
                  </div>
                  <span className="text-xl font-black">{r.load}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIInsights;