import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BarChart3, TrendingUp, Download, 
  PieChart as PieIcon, Calendar, ArrowUpRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
  const { t } = useLanguage();

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
            <button className="px-6 h-12 rounded-xl bg-white border border-emerald-100 text-emerald-700 font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all">
              <Download size={18} /> Export PDF
            </button>
            <button className="px-6 h-12 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all">
              <Download size={18} /> Export Excel
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="farm-card lg:col-span-2">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" size={20} />
              Financial Performance
            </h3>
            <div className="h-64 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold italic">
              Revenue Chart Placeholder
            </div>
          </div>

          <div className="farm-card">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <PieIcon className="text-emerald-600" size={20} />
              Sales by Breed
            </h3>
            <div className="h-64 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold italic">
              Breed Distribution Placeholder
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;