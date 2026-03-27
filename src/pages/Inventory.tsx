import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Filter, Plus, MoreVertical, 
  Rabbit, ChevronLeft, ChevronRight, Download,
  Activity, ShieldCheck, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Inventory = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

  const fetchRabbits = async () => {
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
    setLoading(false);
  };

  const filteredRabbits = rabbits.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.breed?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('inventory')}</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your complete rabbit stock and history.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 h-12 rounded-xl bg-white border border-emerald-100 text-emerald-700 font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all">
              <Download size={18} /> Export
            </button>
            <button className="farm-button flex items-center gap-2">
              <Plus size={20} />
              {t('addRabbit')}
            </button>
          </div>
        </header>

        <div className="farm-card p-0 overflow-hidden">
          {/* Table Header / Filters */}
          <div className="p-6 border-b border-emerald-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none h-12 px-6 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                <Filter size={18} /> {t('filter')}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-50/50 border-b border-emerald-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('name')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('breed')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('gender')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('age')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('health')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('status')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium">Loading inventory...</td></tr>
                ) : filteredRabbits.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium">No rabbits found.</td></tr>
                ) : (
                  filteredRabbits.map((rabbit) => (
                    <tr key={rabbit.id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Rabbit size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{rabbit.name || 'Unnamed'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cage: {rabbit.cage_number || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{rabbit.breed}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          rabbit.gender === 'Male' ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
                        )}>
                          {rabbit.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">4 Months</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            rabbit.health_status === 'Healthy' ? "bg-emerald-500" : "bg-rose-500"
                          )} />
                          <span className="text-sm font-bold text-slate-600">{rabbit.health_status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                          {rabbit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-emerald-600 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 bg-slate-50/50 border-t border-emerald-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400">Showing 1 to {filteredRabbits.length} of {rabbits.length} entries</p>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white border border-emerald-100 text-slate-400 hover:text-emerald-600 disabled:opacity-50"><ChevronLeft size={18} className="rtl-flip" /></button>
              <button className="p-2 rounded-lg bg-white border border-emerald-100 text-slate-400 hover:text-emerald-600 disabled:opacity-50"><ChevronRight size={18} className="rtl-flip" /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;