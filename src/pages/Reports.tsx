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
  ArrowDownRight, Target, Layers, Heart
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
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [rabbitData, salesData] = await Promise.all([
      storage.get('rabbits', user?.id || ''),
      storage.get('sales', user?.id || '')
    ]);
    setRabbits(rabbitData);
    setSales(salesData);
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
    return sales.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
  }, [sales]);

  const breedData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRabbits.forEach(r => {
      counts[r.breed] = (counts[r.breed] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredRabbits]);

  const healthData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRabbits.forEach(r => {
      counts[r.health_status] = (counts[r.health_status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredRabbits]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
            <p className="text-lg text-white/40 font-bold max-w-2xl">Comprehensive farm performance metrics and financial intelligence.</p>
          </motion.div>
          
          <button onClick={handleExportPDF} disabled={loading} className="auron-button h-14 px-8 flex items-center gap-3 text-sm">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {t('downloadPDF')}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Revenue', val: `${totalRevenue.toLocaleString()} DA`, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Active Stock', val: filteredRabbits.length, icon: Rabbit, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Healthy Rate', val: `${Math.round((filteredRabbits.filter(r => r.health_status === 'Healthy').length / filteredRabbits.length) * 100 || 0)}%`, icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Breeds', val: breedData.length, icon: Layers, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
            <h3 className="text-xl font-black mb-10 flex items-center gap-3"><Layers className="text-indigo-400" /> Breed Distribution</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breedData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#ffffff40' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020408', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pill-nav p-10 bg-white/5 border-white/10">
            <h3 className="text-xl font-black mb-10 flex items-center gap-3"><ShieldCheck className="text-emerald-400" /> Health Status</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {healthData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              {healthData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-black uppercase text-white/40">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* PDF Template (Hidden) */}
      <div className="hidden">
        <div ref={reportRef} className="p-16 text-slate-900 bg-white font-sans">
          <div className="flex justify-between items-start border-b-8 border-indigo-600 pb-10 mb-12">
            <div>
              <h1 className="text-5xl font-black text-indigo-600 mb-2">Arnab Ghardaia</h1>
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Neural Farm Audit & Intelligence</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-400 uppercase">Audit Timestamp</p>
              <p className="text-lg font-bold">{new Date().toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-10 mb-16">
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Revenue</p>
              <p className="text-4xl font-black text-indigo-600">{totalRevenue.toLocaleString()} DA</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Active Stock</p>
              <p className="text-4xl font-black text-slate-900">{filteredRabbits.length}</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Healthy Rate</p>
              <p className="text-4xl font-black text-emerald-600">
                {Math.round((filteredRabbits.filter(r => r.health_status === 'Healthy').length / filteredRabbits.length) * 100 || 0)}%
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-black mb-8 border-l-8 border-indigo-600 pl-6">Stock Inventory Log</h3>
          <table className="w-full text-left mb-16">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-5 text-[10px] font-black uppercase">ID</th>
                <th className="p-5 text-[10px] font-black uppercase">Name</th>
                <th className="p-5 text-[10px] font-black uppercase">Breed</th>
                <th className="p-5 text-[10px] font-black uppercase">Status</th>
                <th className="p-5 text-[10px] font-black uppercase">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRabbits.map((r, i) => (
                <tr key={i}>
                  <td className="p-5 text-xs font-black text-indigo-600">{r.rabbit_id}</td>
                  <td className="p-5 text-sm font-bold">{r.name}</td>
                  <td className="p-5 text-xs text-slate-500">{r.breed}</td>
                  <td className="p-5 text-xs font-black uppercase">{r.health_status}</td>
                  <td className="p-5 text-sm font-black">{r.weight} kg</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-32 pt-10 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">End of Neural Transmission • Arnab Ghardaia Intelligence</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;