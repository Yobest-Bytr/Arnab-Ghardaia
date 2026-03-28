import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, TrendingUp, Download, 
  PieChart as PieIcon, Calendar, ArrowUpRight,
  FileText, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { showSuccess } from '@/utils/toast';

const Reports = () => {
  const { t, isRTL } = useLanguage();
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

  const breedData = useMemo(() => {
    const counts: Record<string, number> = {};
    rabbits.forEach(r => {
      counts[r.breed] = (counts[r.breed] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [rabbits]);

  const performanceData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      name: month,
      added: rabbits.filter(r => new Date(r.created_at).getMonth() === i).length
    }));
  }, [rabbits]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(isRTL ? "تقرير مزرعة الأرانب" : "Aranib Farm Report", 105, 20, { align: 'center' });
    
    const tableData = rabbits.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      r.breed,
      r.name || 'N/A',
      r.status,
      `$${r.price || 0}`
    ]);

    autoTable(doc, {
      startY: 30,
      head: [[isRTL ? "التاريخ" : "Date", isRTL ? "السلالة" : "Breed", isRTL ? "الاسم" : "Name", isRTL ? "الحالة" : "Status", isRTL ? "السعر" : "Price"]],
      body: tableData,
    });

    doc.save(`Report_${new Date().getTime()}.pdf`);
    setLoading(false);
    showSuccess("Report downloaded.");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('reports')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Detailed analytics and exportable farm data.</p>
          </div>
          <button 
            onClick={generatePDF}
            disabled={loading}
            className="px-6 h-12 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            {isRTL ? "تحميل التقرير PDF" : "Download PDF Report"}
          </button>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="farm-card lg:col-span-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" size={20} />
              {isRTL ? "أداء المزرعة" : "Farm Performance"}
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="added" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="farm-card">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <PieIcon className="text-emerald-600" size={20} />
              {isRTL ? "توزيع السلالات" : "Breed Distribution"}
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

        <div className="mt-12 farm-card p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{isRTL ? "سجل المعاملات الأخير" : "Recent Transaction Log"}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? "التاريخ" : "Date"}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? "السلالة" : "Breed"}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? "الاسم" : "Name"}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? "السعر" : "Price"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {rabbits.slice(0, 10).map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{r.breed}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{r.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        r.status === 'Sold' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {r.status}
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