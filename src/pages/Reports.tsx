import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, TrendingUp, Download, 
  PieChart as PieIcon, Calendar, ArrowUpRight,
  FileText, Loader2, Rabbit, ShieldCheck, Printer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { showSuccess, showError } from '@/utils/toast';

const Reports = () => {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = () => {
    if (language === 'ar') {
      showError("PDF Export for Arabic is currently optimized via 'Print to PDF' for better font support.");
      handlePrint();
      return;
    }

    setLoading(true);
    try {
      const doc = new jsPDF();
      
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text(t('appName').toUpperCase(), 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(t('performanceMetrics'), 105, 30, { align: 'center' });

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(14);
      doc.text(t('executiveSummary'), 14, 55);
      
      doc.setFontSize(10);
      doc.text(`${t('totalStock')}: ${rabbits.length}`, 14, 65);
      doc.text(`${t('available')}: ${rabbits.filter(r => r.status === 'Available').length}`, 14, 72);
      doc.text(`${t('reportDate')}: ${new Date().toLocaleString()}`, 14, 79);

      const tableData = rabbits.map(r => [
        r.rabbit_id || 'N/A',
        r.name || 'N/A',
        r.breed,
        t(r.gender.toLowerCase()),
        t(r.status.toLowerCase()),
        `$${r.price || 0}`
      ]);

      autoTable(doc, {
        startY: 90,
        head: [[t('rabbitId'), t('home'), t('breed'), t('gender'), t('status'), t('price')]],
        body: tableData,
        headStyles: { fillColor: [16, 185, 129] },
        styles: { font: 'helvetica' }
      });

      doc.save(`Arnab_Ghardaia_Report_${new Date().getTime()}.pdf`);
      showSuccess(t('save'));
    } catch (err) {
      showError("Failed to generate PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto print:pt-0">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 print:mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('reports')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('performanceMetrics')}</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <button 
              onClick={handlePrint}
              className="px-6 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black flex items-center gap-3 hover:bg-slate-50 transition-all"
            >
              <Printer size={20} />
              {isRTL ? 'طباعة' : 'Print'}
            </button>
            <button 
              onClick={generatePDF}
              disabled={loading}
              className="px-8 h-14 rounded-2xl bg-emerald-600 text-white font-black flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
              {t('downloadPDF')}
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="farm-card lg:col-span-2 print:shadow-none print:border-slate-200">
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
          </div>

          <div className="farm-card print:shadow-none print:border-slate-200">
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
          </div>
        </div>

        <div className="mt-12 farm-card p-0 overflow-hidden print:shadow-none print:border-slate-200">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{t('transactionLog')}</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 print:hidden">
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