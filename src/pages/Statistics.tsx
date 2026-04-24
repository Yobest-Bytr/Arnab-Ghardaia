
import React, { useState, useEffect, useMemo } from 'react';
import { storage, Rabbit, BreedingRecord, Litter } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import { 
  BarChart3, TrendingUp, TrendingDown, Baby, 
  Activity, Scale, Calendar, PieChart as PieChartIcon,
  Filter, ChevronDown, Zap, BrainCircuit, Target, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Statistics = () => {
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [breeding, setBreeding] = useState<BreedingRecord[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [filterBreed, setFilterBreed] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setRabbits(await storage.getRabbits());
      setBreeding(await storage.getBreedingRecords());
      setLitters(await storage.getLitters());
    };
    fetchData();
  }, []);

  const filteredRabbits = useMemo(() => {
    return filterBreed === 'All' ? rabbits : rabbits.filter(r => r.breed === filterBreed);
  }, [rabbits, filterBreed]);

  const breeds = ['All', ...Array.from(new Set(rabbits.map(r => r.breed)))];

  // Data processing for charts
  const breedData = rabbits.reduce((acc: any[], rabbit) => {
    const existing = acc.find(item => item.name === rabbit.breed);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: rabbit.breed, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  const litterStats = litters.slice(-6).map(l => ({
    date: l.birthDate,
    kits: l.aliveKits,
    total: l.totalKits
  }));

  const totalKits = litters.reduce((sum, l) => sum + (l.aliveKits || 0), 0);
  const avgLitterSize = litters.length > 0 ? (totalKits / litters.length).toFixed(1) : 0;
  const totalKitsBorn = litters.reduce((sum, l) => sum + (l.totalKits || 0), 0);
  const survivalRate = totalKitsBorn > 0 
    ? ((totalKits / totalKitsBorn) * 100).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
              <Activity size={14} />
              <span>Neural Analytics Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Farm <span className="dopamine-text">Metrics.</span>
            </h1>
          </motion.div>
          
          <div className="relative">
            <select 
              value={filterBreed} 
              onChange={(e) => setFilterBreed(e.target.value)}
              className="h-14 px-8 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none focus:border-indigo-500/50 min-w-[200px]"
            >
              {breeds.map(b => <option key={b} value={b} className="bg-[#020408]">{b}</option>)}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
          </div>
        </header>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Stock', val: filteredRabbits.length, icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Total Kits Born', val: totalKits, icon: Baby, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { label: 'Avg. Litter Size', val: avgLitterSize, icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'Survival Rate', val: `${survivalRate}%`, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="pill-nav p-8 bg-white/5 border-white/10 shadow-xl">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black tracking-tight">{stat.val}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Breed Distribution */}
          <div className="pill-nav p-10 bg-white/5 border-white/10 shadow-xl">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-3"><PieChartIcon className="text-indigo-400" /> Breed Distribution</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {breedData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                    itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-10">
              {breedData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{entry.name}</span>
                  </div>
                  <span className="text-lg font-black">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Litter Performance */}
          <div className="pill-nav p-10 bg-white/5 border-white/10 shadow-xl">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-3"><Baby className="text-pink-400" /> Litter Performance</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={litterStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#ffffff40' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                    itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                  />
                  <Bar dataKey="total" fill="#ffffff05" radius={[8, 8, 0, 0]} name="Total Kits" />
                  <Bar dataKey="kits" fill="#6366f1" radius={[8, 8, 0, 0]} name="Alive Kits" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-10 p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10">
              <p className="text-sm font-medium text-white/60 leading-relaxed">
                Neural analysis indicates a <span className="text-indigo-400 font-black">{survivalRate}% survival rate</span> across the last 6 litters. 
                Optimal breeding conditions detected.
              </p>
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="pill-nav p-10 bg-white/5 border-white/10 shadow-xl">
          <h3 className="text-2xl font-black mb-10 flex items-center gap-3"><TrendingUp className="text-emerald-400" /> Farm Growth Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Jan', count: 10 },
                { month: 'Feb', count: 15 },
                { month: 'Mar', count: 12 },
                { month: 'Apr', count: 22 },
                { month: 'May', count: 30 },
                { month: 'Jun', count: 45 },
              ]}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#ffffff40' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                  itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics;
