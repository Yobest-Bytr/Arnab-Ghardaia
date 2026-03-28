import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Rabbit, Users, Activity, TrendingUp, Plus, 
  Calendar, CheckCircle2, AlertCircle, ArrowUpRight, 
  ArrowDownRight, PieChart as PieIcon, BarChart3, Clock
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
    if (user) {
      fetchData();
    }
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

  // Calculate real population growth data
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

  // Generate real activity feed
  const recentActivity = useMemo(() => {
    const activities = [];
    
    // Add recent rabbits
    rabbits.slice(0, 3).forEach(r => {
      activities.push({
        type: 'addition',
        title: isRTL ? `تمت إضافة ${r.name}` : `Added ${r.name}`,
        desc: `${r.breed} - Cage ${r.cage_number || 'N/A'}`,
        time: new Date(r.created_at).toLocaleDateString(),
        icon: Rabbit,
        color: 'text-emerald-500',
        timestamp: new Date(r.created_at).getTime()
      });
    });

    // Add recent matings
    litters.slice(0, 2).forEach(l => {
      activities.push({
        type: 'mating',
        title: isRTL ? 'تسجيل تزاوج جديد' : 'New Mating Recorded',
        desc: `${l.mother_name} & ${l.father_name}`,
        time: new Date(l.created_at).toLocaleDateString(),
        icon: Activity,
        color: 'text-pink-500',
        timestamp: new Date(l.created_at).getTime()
      });
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [rabbits, litters, isRTL]);

  const stats = [
    { label: t('totalRabbits'), val: rabbits.length, icon: Rabbit, color: "bg-emerald-500", trend: "+12%" },
    { label: t('males'), val: rabbits.filter(r => r.gender === 'Male').length, icon: Users, color: "bg-blue-500", trend: "+5%" },
    { label: t('females'), val: rabbits.filter(r => r.gender === 'Female').length, icon: Users, color: "bg-pink-500", trend: "+8%" },
    { label: "Healthy", val: rabbits.filter(r => r.health_status === 'Healthy').length, icon: CheckCircle2, color: "bg-emerald-400", trend: "98%" },
  ];

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="farm-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg flex items-center gap-1">
                  <ArrowUpRight size={12} /> {stat.trend}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-4xl font-black text-slate-900 dark:text-white">{stat.val}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 farm-card">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={20} />
                Population Growth
              </h3>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="farm-card">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <Clock className="text-emerald-600" size={20} />
              Recent Activity
            </h3>
            <div className="space-y-6">
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
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
              )) : (
                <div className="text-center py-8 text-slate-400 font-medium italic">
                  No recent activity.
                </div>
              )}
            </div>
            <Link to="/inventory" className="block w-full mt-8">
              <button className="w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all">
                View All Activity
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;