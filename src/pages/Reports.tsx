
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
  ArrowDownRight, Target, Layers, Heart, TrendingDown, RefreshCw, ShoppingBag,
  Baby, User, Clock, Search, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInMonths, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const Reports = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [litters, setLitters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Advanced Filters
  const [dateRange, setDateRange] = useState<string>('all'); // all, thisMonth, lastMonth, last3Months
  const [filterBreed, setFilterBreed] = useState<string>('All');
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('All'); // All, Young, Adult

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [rabbitData, salesData, expenseData, litterData] = await Promise.all([
      storage.get('rabbits', user?.id || ''),
      storage.get('sales', user?.id || ''),
      storage.get('expenses', user?.id || ''),
      storage.get('litters', user?.id || '')
    ]);
    setRabbits(rabbitData);
    setSales(salesData);
    setExpenses(expenseData);
    setLitters(litterData);
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    await storage.processSyncQueue();
    await fetchData();
    setIsSyncing(false);
    showSuccess(t('forceSync'));
  };

  const filteredData = useMemo(() => {
    let filteredRabbits = [...rabbits];
    let filteredSales = [...sales];
    let filteredExpenses = [...expenses];
    let filteredLitters = [...litters];

    // Date Filter
    if (dateRange !== 'all') {
      const now = new Date();
      let start, end;
      if (dateRange === 'thisMonth') {
        start = startOfMonth(now);
        end = endOfMonth(now);
      } else if (dateRange === 'lastMonth') {
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
      } else if (dateRange === 'last3Months') {
        start = startOfMonth(subMonths(now, 3));
        end = endOfMonth(now);
      }

      if (start && end) {
        const interval = { start, end };
        filteredSales = filteredSales.filter(s => isWithinInterval(parseISO(s.sale_date), interval));
        filteredExpenses = filteredExpenses.filter(e => isWithinInterval(parseISO(e.date), interval));
        filteredLitters = filteredLitters.filter(l => isWithinInterval(parseISO(l.birthDate), interval));
      }
    }

    // Breed Filter
    if (filterBreed !== 'All') {
      filteredRabbits = filteredRabbits.filter(r => r.breed === filterBreed);
    }

    // Age Group Filter
    if (filterAgeGroup !== 'All') {
      filteredRabbits = filteredRabbits.filter(r => {
        const age = differenceInMonths(new Date(), parseISO(r.birthDate));
        return filterAgeGroup === 'Young' ? age < 6 : age >= 6;
      });
    }

    return { rabbits: filteredRabbits, sales: filteredSales, expenses: filteredExpenses, litters: filteredLitters };
  }, [rabbits, sales, expenses, litters, dateRange, filterBreed, filterAgeGroup]);

  const financialStats = useMemo(() => {
    const totalSales = filteredData.sales.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    const totalExpenses = filteredData.expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    return {
      revenue: totalSales,
      expenses: totalExpenses,
      profit: totalSales - totalExpenses,
      chart: [
        { name: t('sales'), value: totalSales },
        { name: t('expenses'), value: totalExpenses }
      ]
    };
  }, [filteredData, t]);

  const mortalityRate = useMemo(() => {
    const dead = filteredData.rabbits.filter(r => r.status === 'Deceased').length;
    const total = filteredData.rabbits.length;
    return total > 0 ? Math.round((dead / total) * 100) : 0;
  }, [filteredData]);

  const breedingSuccess = useMemo(() => {
    const totalKits = filteredData.litters.reduce((acc, l) => acc + (l.totalKits || 0), 0);
    const aliveKits = filteredData.litters.reduce((acc, l) => acc + (l.aliveKits || 0), 0);
    return totalKits > 0 ? Math.round((aliveKits / totalKits) * 100) : 0;
  }, [filteredData]);

  const breeds = useMemo(() => ['All', ...Array.from(new Set(rabbits.map(r => r.breed)))], [rabbits]);

  const COLORS = ['#10b981', '#ef4444'];

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    setLoading(true);
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `Arnab_Ghardaia_Neural_Audit_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      setLoading(false);
      showSuccess("Neural Audit generated.");
    });
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-6 max-w-[1400px] mx-auto relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
              <Activity size={14} className="fill-current" />
              <span>Neural Telemetry Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Neural <span className="dopamine-text">Audit.</span>
            </h1>
            <p className="text-white/40 font-medium text-lg">Advanced farm analytics and performance reporting.</p>
          </motion.div>
          
          <div className="flex flex-wrap gap-4">
            <button onClick={handleForceSync} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
              <RefreshCw size={24} className={cn(isSyncing && "animate-spin")} />
            </button>
            <button onClick={handleExportPDF} disabled={loading} className="auron-button h-14 px-8 flex items-center gap-3 text-sm">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Printer size={20} />}
              {t('downloadPDF')}
            </button>
          </div>
        </header>

        {/* Advanced Filters */}
        <Card className="bg-white/5 border-white/10 rounded-[2.5rem] mb-12 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Filter size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/40">Filters</span>
              </div>
              
              <div className="h-10 w-[1px] bg-white/10 hidden md:block" />

              <div className="flex flex-wrap gap-4 flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Time Period</label>
                  <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none focus:border-indigo-500/50">
                    <option value="all" className="bg-[#020408]">All Time</option>
                    <option value="thisMonth" className="bg-[#020408]">This Month</option>
                    <option value="lastMonth" className="bg-[#020408]">Last Month</option>
                    <option value="last3Months" className="bg-[#020408]">Last 3 Months</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Breed</label>
                  <select value={filterBreed} onChange={(e) => setFilterBreed(e.target.value)} className="h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none focus:border-indigo-500/50">
                    {breeds.map(b => <option key={b} value={b} className="bg-[#020408]">{b}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Age Group</label>
                  <select value={filterAgeGroup} onChange={(e) => setFilterAgeGroup(e.target.value)} className="h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none focus:border-indigo-500/50">
                    <option value="All" className="bg-[#020408]">All Ages</option>
                    <option value="Young" className="bg-[#020408]">Young (&lt;6m)</option>
                    <option value="Adult" className="bg-[#020408]">Adult (&gt;=6m)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => { setDateRange('all'); setFilterBreed('All'); setFilterAgeGroup('All'); }}
                className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-rose-400 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Net Profit', val: `${financialStats.profit.toLocaleString()} DA`, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Mortality Rate', val: `${mortalityRate}%`, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            { label: 'Breeding Success', val: `${breedingSuccess}%`, icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { label: 'Filtered Stock', val: filteredData.rabbits.length, icon: Rabbit, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="pill-nav p-8 bg-white/5 border-white/10 shadow-xl">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black tracking-tight">{stat.val}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          <div className="pill-nav p-10 bg-white/5 border-white/10 shadow-xl">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-3"><TrendingUp className="text-indigo-400" /> Financial Overview</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialStats.chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#ffffff40' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                    itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {financialStats.chart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pill-nav p-10 bg-white/5 border-white/10 shadow-xl">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-3"><Activity className="text-emerald-400" /> Production Summary</h3>
            <div className="space-y-6">
              {[
                { label: 'Total Sales', val: `${financialStats.revenue.toLocaleString()} DA`, icon: ShoppingBag, color: 'text-indigo-400' },
                { label: 'Total Expenses', val: `${financialStats.expenses.toLocaleString()} DA`, icon: Wallet, color: 'text-rose-400' },
                { label: 'Litter Count', val: filteredData.litters.length, icon: Baby, color: 'text-pink-400' },
                { label: 'Avg. Age (Months)', val: filteredData.rabbits.length > 0 ? Math.round(filteredData.rabbits.reduce((acc, r) => acc + differenceInMonths(new Date(), parseISO(r.birthDate)), 0) / filteredData.rabbits.length) : 0, icon: Clock, color: 'text-blue-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <item.icon size={20} className={item.color} />
                    </div>
                    <span className="text-sm font-bold text-white/60">{item.label}</span>
                  </div>
                  <span className="text-xl font-black">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* PDF Template (Hidden) */}
      <div className="hidden">
        <div ref={reportRef} className="p-16 text-slate-900 bg-white font-sans">
          <h1 className="text-5xl font-black text-indigo-600 mb-4">Arnab Ghardaia Audit</h1>
          <p className="text-slate-400 font-bold mb-10 uppercase tracking-widest">Generated on {format(new Date(), 'PPP')}</p>
          
          <div className="grid grid-cols-2 gap-10 mb-16">
            <div className="p-10 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Net Profit/Loss</p>
              <p className="text-5xl font-black text-emerald-600">{financialStats.profit.toLocaleString()} DA</p>
            </div>
            <div className="p-10 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mortality Rate</p>
              <p className="text-5xl font-black text-rose-600">{mortalityRate}%</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black border-b-4 border-indigo-600 pb-2 w-fit">Production Metrics</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Stock</p>
                <p className="text-2xl font-black">{filteredData.rabbits.length}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase">Litter Count</p>
                <p className="text-2xl font-black">{filteredData.litters.length}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase">Breeding Success</p>
                <p className="text-2xl font-black">{breedingSuccess}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
