import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Rabbit, Users, Activity, TrendingUp, Plus, 
  Calendar, CheckCircle2, AlertCircle, ArrowUpRight, 
  Clock, ShieldCheck, Heart, FileText, Zap, Box, LayoutGrid, Info
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
  const [litters, setLitters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [rabbitData, litterData] = await Promise.all([
      storage.get('rabbits', user?.id || ''),
      storage.get('litters', user?.id || '')
    ]);
    setRabbits(rabbitData);
    setLitters(litterData);
    setLoading(false);
  };

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

  const recentActivity = useMemo(() => {
    const activities = [];
    rabbits.slice(0, 3).forEach(r => {
      activities.push({
        title: isRTL ? `تمت إضافة ${r.name}` : `Added ${r.name}`,
        desc: `${r.breed}`,
        time: new Date(r.created_at).toLocaleDateString(),
        icon: Rabbit,
        color: 'text-emerald-500',
        timestamp: new Date(r.created_at).getTime()
      });
    });
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [rabbits, isRTL]);

  const stats = [
    { label: t('totalRabbits'), val: rabbits.length, icon: Rabbit, color: "bg-emerald-500" },
    { label: t('males'), val: rabbits.filter(r => r.gender === 'Male').length, icon: Users, color: "bg-blue-500" },
    { label: t('females'), val: rabbits.filter(r => r.gender === 'Female').length, icon: Users, color: "bg-pink-500" },
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
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('dashboard')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Welcome back to your farm management portal.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/inventory">
              <button className="farm-button flex items-center gap-2">
                <Plus size={20} />
                {t('addRabbit')}
              </button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="farm-card">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4", stat.color)}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white">{stat.val}</p>
            </motion.div>
          ))}
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

            {/* Visual Cage Map */}
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
                <Clock className="text-emerald-600" size={20} />
                {t('recentActivity')}
              </h3>
              <div className="space-y-6">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={cn("w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0", activity.color)}>
                      <activity.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{activity.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{activity.desc}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/inventory" className="block w-full mt-8">
                <button className="w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all">
                  {t('viewAll')}
                </button>
              </Link>
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