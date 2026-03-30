import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, TrendingUp, Download, 
  PieChart as PieIcon, Calendar, ArrowUpRight,
  FileText, Loader2, Rabbit, ShieldCheck, Printer,
  ChevronRight, Info, Wallet, Filter, Activity,
  ArrowDownRight, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const Reports = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

  const fetchRabbits = async () => {
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
  };

  const filteredRabbits = useMemo(() => {
    return rabbits.filter(r => {
      const date = new Date(r.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  }, [rabbits, startDate, endDate]);

  const totalRevenue = useMemo(() => {
    return filteredRabbits
      .filter(r => r.status === 'Sold')
      .reduce((acc, curr) => acc + (parseFloat(curr.price_dzd) || 0), 0);
  }, [filteredRabbits]);

  const revenueData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: date.split('-').slice(1).join('/'),
      amount: filteredRabbits
        .filter(r => r.status === 'Sold' && r.created_at.startsWith(date))
        .reduce((acc, curr) => acc + (parseFloat(curr.price_dzd) || 0), 0)
    }));
  }, [filteredRabbits]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = { 'Young': 0, 'Adult': 0, 'Meat': 0 };
    filteredRabbits.forEach(r => {
      if (r.sale_category) counts[r.sale_category] = (counts[r.sale_category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: t(`category${name}`), value }));
  }, [filteredRabbits, t]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    setLoading(true);
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `Arnab_Ghardaia_Report_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      setLoading(false);
      showSuccess("Report generated successfully.");
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
              <Activity size={12} />
              Neural Telemetry Active
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('reports')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Financial & Growth Analytics Engine.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExportPDF} disabled={loading} className="farm-button flex items-center gap-3 h-14 px-8 shadow-xl shadow-emerald-500/20">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              {t('downloadPDF')}
            </button>
          </div>
        </header>

        {/* Advanced Filters */}
        <div className="farm-card mb-12">
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <Calendar size={12} /> {t('startDate')}
              </label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
              />
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <Calendar size={12} /> {t('endDate')}
              </label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
              />
            </div>
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="h-12 px-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div whileHover={{ y: -5 }} className="farm-card bg-emerald-600 text-white border-none shadow-xl shadow-emerald-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black bg-white/20 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> +12.5%
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Revenue</p>
            <h3 className="text-3xl font-black">{totalRevenue.toLocaleString()} DA</h3>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="farm-card">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                <TrendingUp size={20} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Stable
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Growth Velocity</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">+4.2%</h3>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="farm-card">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-600">
                <Rabbit size={20} />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Stock</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{filteredRabbits.filter(r => r.status === 'Available').length}</h3>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="farm-card">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                <Target size={20} />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sales Target</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">84%</h3>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 farm-card">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="text-emerald-600" size={20} />
                Revenue Velocity
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Daily DA</span>
                </div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="farm-card">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <PieIcon className="text-blue-600" size={20} />
              Sales Mix
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-6">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="farm-card p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-black">Filtered Transaction Log</h3>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase">
              {filteredRabbits.length} Records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rabbit</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredRabbits.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                          <Rabbit size={16} />
                        </div>
                        <span className="text-sm font-bold">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{t(`category${r.sale_category}`)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[9px] font-black uppercase",
                        r.status === 'Sold' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                      )}>{t((r.status || 'Available').toLowerCase())}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">{r.price_dzd || 0} DA</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filteredRabbits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                          <Filter size={32} />
                        </div>
                        <p className="text-slate-400 font-bold">No records found for this range.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Professional PDF Template (Hidden) */}
      <div className="hidden">
        <div ref={reportRef} className="p-12 text-slate-900 bg-white font-sans">
          <div className="flex justify-between items-start border-b-4 border-emerald-600 pb-8 mb-10">
            <div>
              <h1 className="text-4xl font-black text-emerald-600 mb-2">{t('appName')}</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Official Farm Audit & Telemetry</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-400 uppercase">Generated On</p>
              <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Revenue</p>
              <p className="text-3xl font-black text-emerald-600">{totalRevenue.toLocaleString()} DA</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Stock</p>
              <p className="text-3xl font-black text-slate-900">{filteredRabbits.length}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Report Range</p>
              <p className="text-sm font-bold text-slate-600">{startDate || 'Start'} - {endDate || 'End'}</p>
            </div>
          </div>

          <h3 className="text-xl font-black mb-6 border-l-4 border-emerald-600 pl-4">Transaction Summary</h3>
          <table className="w-full text-left mb-12">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-4 text-[10px] font-black uppercase">Rabbit</th>
                <th className="p-4 text-[10px] font-black uppercase">Category</th>
                <th className="p-4 text-[10px] font-black uppercase">Status</th>
                <th className="p-4 text-[10px] font-black uppercase">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRabbits.map((r, i) => (
                <tr key={i}>
                  <td className="p-4 text-sm font-bold">{r.name}</td>
                  <td className="p-4 text-xs text-slate-500">{r.sale_category}</td>
                  <td className="p-4 text-xs font-black uppercase">{r.status}</td>
                  <td className="p-4 text-sm font-black text-emerald-600">{r.price_dzd} DA</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-20 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">End of Official Transmission • Arnab Ghardaia Neural Link</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;