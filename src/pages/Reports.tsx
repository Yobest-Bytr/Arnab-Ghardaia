import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, TrendingUp, Download, 
  PieChart as PieIcon, Calendar, ArrowUpRight,
  FileText, Loader2, Rabbit, ShieldCheck, Printer,
  ChevronRight, Info, Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { showSuccess, showError } from '@/utils/toast';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const Reports = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

  const fetchRabbits = async () => {
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
  };

  const totalRevenue = useMemo(() => {
    return rabbits
      .filter(r => r.status === 'Sold')
      .reduce((acc, curr) => acc + (parseFloat(curr.price_dzd) || 0), 0);
  }, [rabbits]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = { 'Young': 0, 'Adult': 0, 'Meat': 0 };
    rabbits.forEach(r => {
      if (r.sale_category) counts[r.sale_category] = (counts[r.sale_category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: t(`category${name}`), value }));
  }, [rabbits, t]);

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
    html2pdf().set(opt).from(element).save().then(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('reports')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Financial & Growth Telemetry.</p>
          </div>
          <button onClick={handleExportPDF} disabled={loading} className="farm-button flex items-center gap-3 h-14 px-8">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {t('downloadPDF')}
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="farm-card bg-emerald-600 text-white border-none shadow-emerald-200">
            <Wallet className="mb-4 opacity-60" size={32} />
            <p className="text-xs font-black uppercase tracking-widest opacity-80">Total Revenue (DZD)</p>
            <h3 className="text-4xl font-black">{totalRevenue.toLocaleString()} DA</h3>
          </div>
          <div className="farm-card">
            <TrendingUp className="mb-4 text-blue-600" size={32} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Avg. Weight Gain</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">+12%</h3>
          </div>
          <div className="farm-card">
            <Rabbit className="mb-4 text-pink-600" size={32} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Active Stock</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{rabbits.filter(r => r.status === 'Available').length}</h3>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="farm-card">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2"><BarChart3 className="text-emerald-600" /> Sales Categorization</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="farm-card p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800">
              <h3 className="text-xl font-black">Recent Sales</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Rabbit</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {rabbits.filter(r => r.status === 'Sold').slice(0, 5).map((r, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 text-sm font-bold">{r.name}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{t(`category${r.sale_category}`)}</td>
                      <td className="px-6 py-4 text-sm font-black text-emerald-600">{r.price_dzd} DA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden PDF Template */}
      <div className="hidden">
        <div ref={reportRef} className="p-10 text-slate-900">
          <h1 className="text-3xl font-black text-emerald-600 mb-2">{t('appName')}</h1>
          <p className="text-sm font-bold text-slate-400 mb-10 uppercase tracking-widest">Official Farm Audit • {new Date().toLocaleDateString()}</p>
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Revenue</p>
              <p className="text-2xl font-black">{totalRevenue} DA</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Stock</p>
              <p className="text-2xl font-black">{rabbits.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;