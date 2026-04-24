import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, Activity, Zap, BrainCircuit, 
  ArrowUpRight, ArrowDownRight, Target, 
  Layers, Heart, Info, Calendar, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { cn } from '@/lib/utils';

const Insights = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
    setLoading(false);
  };

  const growthData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => ({
      name: m,
      velocity: Math.floor(Math.random() * 50) + 20,
      health: Math.floor(Math.random() * 30) + 70
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
            <BrainCircuit size={14} />
            <span>Neural Telemetry Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            Neural <span className="dopamine-text">Insights.</span>
          </h1>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 pill-nav p-10 bg-white/5 border-white/10">
            <h3 className="text-xl font-black mb-10 flex items-center gap-3"><TrendingUp className="text-indigo-400" /> Growth Velocity</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#ffffff40' }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#020408', border: '1px solid #ffffff10', borderRadius: '1rem' }} />
                  <Area type="monotone" dataKey="velocity" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVel)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pill-nav p-10 bg-white/5 border-white/10">
            <h3 className="text-xl font-black mb-10 flex items-center gap-3"><Activity className="text-emerald-400" /> Health Index</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#ffffff40' }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#020408', border: '1px solid #ffffff10', borderRadius: '1rem' }} />
                  <Line type="stepAfter" dataKey="health" stroke="#10b981" strokeWidth={4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;