import React, { useState, useEffect } from 'react';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add Title
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Slate 900
    const title = isRTL ? "سجل معاملات مزرعة الأرانب" : "Aranib Farm Transaction Log";
    doc.text(title, 105, 20, { align: 'center' });

    // Add Summary Cards (Right side style)
    const totalValue = rabbits.reduce((acc, r) => acc + (Number(r.price) || 0), 0);
    const soldCount = rabbits.filter(r => r.status === 'Sold').length;
    const availableCount = rabbits.filter(r => r.status === 'Available').length;

    // Summary Box
    doc.setDrawColor(241, 245, 249); // Slate 100
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(140, 35, 60, 60, 5, 5, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(isRTL ? "إجمالي القيمة" : "Total Value", 190, 45, { align: 'right' });
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text(`$${totalValue.toLocaleString()}`, 190, 52, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(isRTL ? "تم بيعه" : "Sold Count", 190, 65, { align: 'right' });
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246); // Blue 500
    doc.text(`${soldCount}`, 190, 72, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(isRTL ? "متاح حاليا" : "Available", 190, 85, { align: 'right' });
    doc.setFontSize(14);
    doc.setTextColor(245, 158, 11); // Amber 500
    doc.text(`${availableCount}`, 190, 92, { align: 'right' });

    // Table Data
    const tableData = rabbits.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      r.breed,
      r.name || 'N/A',
      r.status,
      `$${r.price || 0}`
    ]);

    autoTable(doc, {
      startY: 105,
      head: [[
        isRTL ? "التاريخ" : "Date",
        isRTL ? "السلالة" : "Breed",
        isRTL ? "الاسم" : "Name",
        isRTL ? "الحالة" : "Status",
        isRTL ? "السعر" : "Price"
      ]],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 5 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`Aranib_Farm_Report_${new Date().getTime()}.pdf`);
    setLoading(false);
    showSuccess("Report downloaded successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('reports')}</h1>
            <p className="text-slate-500 font-medium mt-1">Detailed analytics and exportable farm data.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={generatePDF}
              disabled={loading}
              className="px-6 h-12 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              {isRTL ? "تحميل التقرير PDF" : "Download PDF Report"}
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="farm-card lg:col-span-2">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" size={20} />
              {isRTL ? "أداء المزرعة" : "Farm Performance"}
            </h3>
            <div className="h-80 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-300 font-bold italic border-2 border-dashed border-slate-200">
              <BarChart3 size={48} className="mb-4 opacity-20" />
              <p>{isRTL ? "سيتم عرض الرسوم البيانية هنا" : "Interactive charts will appear here"}</p>
            </div>
          </div>

          <div className="farm-card">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <PieIcon className="text-emerald-600" size={20} />
              {isRTL ? "توزيع السلالات" : "Breed Distribution"}
            </h3>
            <div className="h-80 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-300 font-bold italic border-2 border-dashed border-slate-200">
              <PieIcon size={48} className="mb-4 opacity-20" />
              <p>{isRTL ? "تحليل السلالات" : "Breed Analysis"}</p>
            </div>
          </div>
        </div>

        {/* Preview Table (Similar to image) */}
        <div className="mt-12 farm-card p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-white">
            <h3 className="text-lg font-black text-slate-900">{isRTL ? "سجل المعاملات الأخير" : "Recent Transaction Log"}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? "التاريخ" : "Date"}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? "السلالة" : "Breed"}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? "الاسم" : "Name"}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{isRTL ? "السعر" : "Price"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rabbits.slice(0, 10).map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{r.breed}</td>
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
                {rabbits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                      {isRTL ? "لا توجد بيانات متاحة حالياً" : "No transaction data available yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;