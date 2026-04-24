import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, CheckCircle2, Circle, Printer, Search, X, Loader2, Rabbit } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const QrManager = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

  const fetchRabbits = async () => {
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleGeneratePdf = () => {
    if (selectedIds.length === 0) {
      showError("Select at least one rabbit.");
      return;
    }
    setLoading(true);
    const element = document.getElementById('qr-print-area');
    
    const opt = {
      margin: 10,
      filename: `Arnab_Ghardaia_QR_Tags_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setLoading(false);
      showSuccess("PDF Generated Successfully.");
    });
  };

  const filteredRabbits = rabbits.filter(r => 
    (r.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (r.rabbit_id?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-black tracking-tighter">{t('qrManagerTitle')}</h1>
            <p className="text-white/40 font-medium mt-1">{t('qrManagerDesc')}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setSelectedIds(rabbits.map(r => r.id))}
              className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              {t('selectAll')}
            </button>
            <button 
              onClick={handleGeneratePdf}
              disabled={loading || selectedIds.length === 0}
              className="auron-button h-14 px-8 flex items-center gap-3 text-sm"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Printer size={20} />}
              {t('generatePdf')} ({selectedIds.length})
            </button>
          </div>
        </header>

        <div className="mb-10 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="Search rabbits..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-3xl font-bold outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredRabbits.map((rabbit) => (
            <motion.div 
              key={rabbit.id}
              whileHover={{ y: -5 }}
              onClick={() => toggleSelect(rabbit.id)}
              className={cn(
                "p-6 rounded-[2rem] border-2 transition-all cursor-pointer text-center relative",
                selectedIds.includes(rabbit.id) ? "bg-indigo-600/20 border-indigo-500 shadow-xl" : "bg-white/5 border-white/10"
              )}
            >
              <div className="absolute top-4 right-4">
                {selectedIds.includes(rabbit.id) ? <CheckCircle2 className="text-indigo-400" size={20} /> : <Circle className="text-white/10" size={20} />}
              </div>
              <div className="bg-white p-4 rounded-2xl mb-4 inline-block">
                <QRCodeSVG value={rabbit.rabbit_id} size={80} />
              </div>
              <h3 className="text-sm font-black truncate">{rabbit.name}</h3>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{rabbit.rabbit_id}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Hidden Print Area */}
      <div className="hidden">
        <div id="qr-print-area" className="p-10 bg-white text-black grid grid-cols-3 gap-10">
          {rabbits.filter(r => selectedIds.includes(r.id)).map(rabbit => (
            <div key={rabbit.id} className="border-2 border-dashed border-gray-300 p-6 text-center rounded-xl">
              <div className="mb-4 inline-block">
                <QRCodeSVG value={rabbit.rabbit_id} size={120} />
              </div>
              <h3 className="text-lg font-bold">{rabbit.name}</h3>
              <p className="text-xs text-gray-500 font-mono">{rabbit.rabbit_id}</p>
              <p className="text-[10px] mt-2 text-gray-400">Arnab Ghardaia Neural ID</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QrManager;