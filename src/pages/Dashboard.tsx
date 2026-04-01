import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Rabbit, Users, Activity, TrendingUp, Plus, 
  Calendar, CheckCircle2, AlertCircle, ArrowUpRight, 
  Clock, ShieldCheck, Heart, FileText, Zap, Box, LayoutGrid, Info, BrainCircuit, Globe, Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [rabbitData, salesData, expenseData] = await Promise.all([
      storage.get('rabbits', user?.id || ''),
      storage.get('sales', user?.id || ''),
      storage.get('expenses', user?.id || '')
    ]);
    setRabbits(rabbitData);
    setSales(salesData);
    setExpenses(expenseData);
    setLoading(false);
  };

  const financials = useMemo(() => {
    const totalRevenue = sales.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    return { revenue: totalRevenue, expenses: totalExpenses, profit: totalRevenue - totalExpenses };
  }, [sales, expenses]);

  const healthScore = useMemo(() => {
    if (rabbits.length === 0) return 100;
    const healthy = rabbits.filter(r => r.health_status === 'Healthy').length;
    return Math.round((healthy / rabbits.length) * 100);
  }, [rabbits]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      const monthName = months[monthIdx];
      const count = rabbits.filter(r => {
        const date = new Date(r.created_at);
        return date.getMonth() <= monthIdx || date.getFullYear() < new Date().getFullYear();
      }).length;
      
      last6Months.push({ name: monthName, count: count || 0 });
    }
    return last6Months;
  }, [rabbits]);

  const stats = [
    { label: t('totalRabbits'), val: rabbits.length, icon: Rabbit, color: "bg-emerald-500" },
    { label: "Net Profit", val: `${financials.profit.toLocaleString()} DA`, icon: Wallet, color: "bg-indigo-500" },
    { label: "Revenue", val: `${financials.revenue.toLocaleString()} DA`, icon: TrendingUp, color: "bg-blue-500" },
    { label: t('healthy'), val: rabbits.filter(r => r.health_status === 'Healthy').length, icon: ShieldCheck, color: "bg-emerald-400" },
  ];

  const cageMap = useMemo(() => {
    const cages = Array.from({ length: 24 }, (_, i) => ({
      id: (i + 1).toString(),
      rabbit: rabbits.find(r => r.cage_number === (i + 1).toString())
    }));
    return cages;
  }, [rabbits]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
              <BrainCircuit size={14} />
              Neural Command Active
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('dashboard')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Welcome back to your farm management portal.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/insights">
              <button className="h-14 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all flex items-center gap-2">
                <TrendingUp size={18} /> Telemetry
              </button>
            </Link>
            <Link to="/inventory">
              <button className="farm-button flex items-center gap-2 h-14 px-8">
                <Plus size={20} />
                {t('addRabbit')}
              </button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-1 farm-card bg-indigo-600 text-white border-none shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Neural Health Score</p>
              <h3 className="text-5xl font-black mb-4">{healthScore}%</h3>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-6">
                <motion.div initial={{ width: 0 }} animate={{ width: `${healthScore}%` }} className="h-full bg-white" />
              </div>
              <p className="text-xs font-medium opacity-80 leading-relaxed">Your farm is operating at optimal cognitive capacity.</p>
            </div>
          </motion.div>

          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="farm-card">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg mb-4", stat.color)}>
                  <stat.icon size={20} />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-2xl font-black text-slate-900 dark:text-white truncate">{stat.val}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="farm-card">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="text-emerald-600" size={20} />
                  {t('populationGrowth')}
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 6 Months</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="farm-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutGrid className="text-blue-600" size={20} />
                    {t('cageMap')}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('cageMapDesc')}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">Empty</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {cageMap.map((cage) => (
                  <div 
                    key={cage.id}
                    className={cn(
                      "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all group relative",
                      cage.rabbit 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50 shadow-sm" 
                        : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 border-dashed"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-black uppercase",
                      cage.rabbit ? "text-emerald-600" : "text-slate-300"
                    )}>{cage.id}</span>
                    {cage.rabbit ? (
                      <>
                        <Rabbit size={16} className="text-emerald-600" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-emerald-600/90 rounded-2xl flex items-center justify-center transition-opacity cursor-pointer">
                          <span className="text-[8px] font-black text-white uppercase text-center px-1">{cage.rabbit.name}</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-800" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="farm-card">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                <Globe className="text-indigo-600" size={20} />
                Network Status
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold">Cloud Sync</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">Optimal</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold">Neural Engine</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">Active</span>
                </div>
                <Link to="/collaborators" className="block w-full pt-4">
                  <button className="w-full py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                    <Users size={16} /> View Collaborators
                  </button>
                </Link>
              </div>
            </div>

            <div className="farm-card bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-none shadow-xl shadow-emerald-500/20">
              <Zap className="mb-4" size={32} />
              <h3 className="text-xl font-black mb-2">Pro Tip</h3>
              <p className="text-sm text-emerald-50 font-medium leading-relaxed">
                Regularly update rabbit weights to get more accurate growth velocity insights in your reports.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;