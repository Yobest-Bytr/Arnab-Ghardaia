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
  ArrowDownRight, Target, Layers, Heart, TrendingDown
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
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [litters, setLitters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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

  const financialData = useMemo(() => {
    const totalSales = sales.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    return [
      { name: t('sales'), value: totalSales },
      { name: t('expenses'), value: totalExpenses }
    ];
  }, [sales, expenses, t]);

  const mortalityRate = useMemo(() => {
    const dead = rabbits.filter(r => r.health_status === 'Died').length;
    const total = rabbits.length;
    return total > 0 ? Math.round((dead / total) * 100) : 0;
  }, [rabbits]);

  const breedingSuccess = useMemo(() => {
    const successful = litters.filter(l => l.status === 'Born' || l.status === 'Weaned').length;
    const total = litters.length;
    return total > 0 ? Math.round((successful / total) * 100) : 0;
  }, [litters]);

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
      
      <main className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
              <Activity size={14} className="fill-current" />
              <span>Neural Telemetry Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Neural <span className="dopamine-text">Audit.</span>
            </h1>
          </motion.div>
          
          <button onClick={handleExportPDF} disabled={loading} className="auron-button h-14 px-8 flex items-center gap-3 text-sm">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {t('downloadPDF')}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: t('salesVsExpenses'), val: `${financialData[0].value - financialData[1].value} DA`, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: t('mortalityRate'), val: `${mortalityRate}%`, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            { label: t('breedingSuccess'), val: `${breedingSuccess}%`, icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { label: 'Active Stock', val: rabbits.length, icon: Rabbit, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="pill-nav p-8 bg-white/5 border-white/10">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">{stat.val}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="pill-nav p-10 bg-white/5 border-white/10">
            <h3 className="text-xl font-black mb-10 flex items-center gap-3"><TrendingUp className="text-indigo-400" /> {t('salesVsExpenses')}</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#ffffff40' }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#020408', border: '1px solid #ffffff10', borderRadius: '1rem' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {financialData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pill-nav p-10 bg-white/5 border-white/10">
            <h3 className="text-xl font-black mb-10 flex items-center gap-3"><Activity className="text-emerald-400" /> {t('productionSummary')}</h3>
            <div className="space-y-6">
              {[
                { label: t('meat'), val: '124 kg', icon: ShoppingBag, color: 'text-indigo-400' },
                { label: t('milk'), val: '45 L', icon: Activity, color: 'text-blue-400' },
                { label: t('breedingOutput'), val: litters.length, icon: Heart, color: 'text-pink-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <item.icon size={20} className={item.color} />
                    <span className="text-sm font-bold">{item.label}</span>
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
          <h1 className="text-5xl font-black text-indigo-600 mb-10">Arnab Ghardaia Audit</h1>
          <div className="grid grid-cols-2 gap-10 mb-16">
            <div className="p-8 bg-slate-50 rounded-3xl">
              <p className="text-xs font-black text-slate-400 uppercase">Net Profit/Loss</p>
              <p className="text-4xl font-black">{financialData[0].value - financialData[1].value} DA</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-3xl">
              <p className="text-xs font-black text-slate-400 uppercase">Mortality Rate</p>
              <p className="text-4xl font-black text-rose-600">{mortalityRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;