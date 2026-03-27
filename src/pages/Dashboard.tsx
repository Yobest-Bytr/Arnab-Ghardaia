import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Rabbit, Users, Activity, TrendingUp, Plus, 
  Calendar, CheckCircle2, AlertCircle, ArrowUpRight, 
  ArrowDownRight, PieChart as PieIcon, BarChart3 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

  const fetchRabbits = async () => {
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
    setLoading(false);
  };

  const stats = [
    { label: t('totalRabbits'), val: rabbits.length, icon: Rabbit, color: "bg-emerald-500", trend: "+12%" },
    { label: t('males'), val: rabbits.filter(r => r.gender === 'Male').length, icon: Users, color: "bg-blue-500", trend: "+5%" },
    { label: t('females'), val: rabbits.filter(r => r.gender === 'Female').length, icon: Users, color: "bg-pink-500", trend: "+8%" },
    { label: "Healthy", val: rabbits.filter(r => r.health_status === 'Healthy').length, icon: CheckCircle2, color: "bg-emerald-400", trend: "98%" },
  ];

  const chartData = [
    { name: 'Jan', count: 400 },
    { name: 'Feb', count: 300 },
    { name: 'Mar', count: 600 },
    { name: 'Apr', count: 800 },
    { name: 'May', count: 700 },
    { name: 'Jun', count: 900 },
  ];

  const genderData = [
    { name: 'Males', value: rabbits.filter(r => r.gender === 'Male').length || 1 },
    { name: 'Females', value: rabbits.filter(r => r.gender === 'Female').length || 1 },
  ];

  const COLORS = ['#3b82f6', '#ec4899'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('dashboard')}</h1>
            <p className="text-slate-500 font-medium mt-1">Welcome back to your farm management portal.</p>
          </div>
          <div className="flex gap-3">
            <button className="farm-button flex items-center gap-2">
              <Plus size={20} />
              {t('addRabbit')}
            </button>
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
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <ArrowUpRight size={12} /> {stat.trend}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-4xl font-black text-slate-900">{stat.val}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 farm-card">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={20} />
                Population Growth
              </h3>
              <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-1.5 outline-none">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
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

          <div className="farm-card flex flex-col">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <PieIcon className="text-emerald-600" size={20} />
              Gender Distribution
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-8">
              {genderData.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm font-bold text-slate-600">{d.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;