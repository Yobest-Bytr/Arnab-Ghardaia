import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, TrendingUp, Download, 
  PieChart as PieIcon, Calendar, ArrowUpRight,
  FileText, Loader2, Rabbit, ShieldCheck, Printer,
  ChevronRight, Info
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
  const { t, isRTL, language } = useLanguage();
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

  const statusData = useMemo(() => {
    const counts: Record<string, number> = { 'Available': 0, 'Sold': 0, 'Died': 0 };
    rabbits.forEach(r => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: t(name.toLowerCase()), 
      value 
    }));
  }, [rabbits, t]);

  const breedData = useMemo(() => {
    const counts: Record<string, number> = {};
    rabbits.forEach(r => {
      counts[r.breed] = (counts[r.breed] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [rabbits]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
  const STATUS_COLORS = { 'Available': '#10b981', 'Sold': '#3b82f6', 'Died': '#ef4444' };

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    setLoading(true);

    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `Arnab_Ghardaia_Report_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setLoading(false);
      showSuccess(t('save'));
    }).catch((err: any) => {
      console.error(err);
      setLoading(false);
      showError("Export failed. Please try again.");
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('reports')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('performanceMetrics')}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportPDF}
              disabled={loading}
              className="px-8 h-14 rounded-2xl bg-emerald-600 text-white font-black flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              {t('downloadPDF')}
            </button>
          </div>
        </header>

        {/* Hidden Report Template for PDF Generation */}
        <div className="hidden">
          <div ref={reportRef} className={isRTL ? 'font-cairo' : 'font-inter'} style={{ padding: '40px', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid #10b981', paddingBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#10b981', margin: 0 }}>{t('appName')}</h1>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{t('performanceMetrics')}</p>
              </div>
              <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>{t('reportDate')}</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>{t('executiveSummary')}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t('totalStock')}</p>
                  <p style={{ fontSize: '24px', fontWeight: '900' }}>{rabbits.length}</p>
                </div>
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t('available')}</p>
                  <p style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{rabbits.filter(r => r.status === 'Available').length}</p>
                </div>
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{t('healthy')}</p>
                  <p style={{ fontSize: '24px', fontWeight: '900', color: '#3b82f6' }}>{rabbits.filter(r => r.health_status === 'Healthy').length}</p>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>{t('transactionLog')}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '12px', textAlign: isRTL ? 'right' : 'left', fontSize: '10px', fontWeight: '900', color: '#64748b' }}>{t('rabbitId')}</th>
                  <th style={{ padding: '12px', textAlign: isRTL ? 'right' : 'left', fontSize: '10px', fontWeight: '900', color: '#64748b' }}>{t('home')}</th>
                  <th style={{ padding: '12px', textAlign: isRTL ? 'right' : 'left', fontSize: '10px', fontWeight: '900', color: '#64748b' }}>{t('breed')}</th>
                  <th style={{ padding: '12px', textAlign: isRTL ? 'right' : 'left', fontSize: '10px', fontWeight: '900', color: '#64748b' }}>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {rabbits.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '12px', fontWeight: 'bold' }}>{r.rabbit_id}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>{r.name}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>{r.breed}</td>
                    <td style={{ padding: '12px', fontSize: '12px', fontWeight: 'bold' }}>{t(r.status.toLowerCase())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="farm-card lg:col-span-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <BarChart3 className="text-emerald-600" size={20} />
              {t('statusBreakdown')}
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="farm-card">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <PieIcon className="text-emerald-600" size={20} />
              {t('breedDistribution')}
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {breedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 farm-card p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{t('transactionLog')}</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              {t('verifiedRecords')}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('rabbitId')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('breed')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('home')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('status')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('price')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {rabbits.slice(0, 20).map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">{r.rabbit_id || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{r.breed}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{r.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        r.status === 'Sold' ? 'bg-blue-50 text-blue-600' : 
                        r.status === 'Died' ? 'bg-rose-50 text-rose-600' : 
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {t(r.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">${r.price || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;