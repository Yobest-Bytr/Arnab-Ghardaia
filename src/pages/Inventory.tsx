import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Plus, Rabbit, Download,
  X, Loader2, Edit2, Trash2, FileText, Table as TableIcon, Filter, QrCode, Eye, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { QRCodeSVG } from 'qrcode.react';

const Inventory = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRabbit, setSelectedRabbit] = useState<any>(null);
  const [editingRabbit, setEditingRabbit] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    rabbit_id: '',
    name: '',
    breed: 'New Zealand White',
    gender: 'Female',
    health_status: 'Healthy',
    status: 'Available',
    cage_number: '',
    price: '',
    weight: '',
    birth_date: '',
    notes: ''
  });

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

  const fetchRabbits = async () => {
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingRabbit(null);
    setFormData({
      rabbit_id: `RB-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      breed: 'New Zealand White',
      gender: 'Female',
      health_status: 'Healthy',
      status: 'Available',
      cage_number: '',
      price: '',
      weight: '',
      birth_date: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (editingRabbit) {
      await storage.update('rabbits', user.id, editingRabbit.id, formData);
      setRabbits(prev => prev.map(r => r.id === editingRabbit.id ? { ...r, ...formData } : r));
      showSuccess(t('save'));
    } else {
      const newRabbit = await storage.insert('rabbits', user.id, formData);
      setRabbits([newRabbit, ...rabbits]);
      showSuccess(t('addRabbit'));
    }
    
    setIsModalOpen(false);
  };

  const filteredRabbits = rabbits.filter(r => {
    const matchesSearch = 
      r.name?.toLowerCase().includes(search.toLowerCase()) || 
      r.breed?.toLowerCase().includes(search.toLowerCase()) ||
      r.rabbit_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('inventory')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('verifiedRecords')}</p>
          </div>
          <button onClick={openAddModal} className="farm-button flex items-center gap-2">
            <Plus size={20} /> {t('addRabbit')}
          </button>
        </header>

        <div className="farm-card p-0 overflow-hidden">
          <div className="p-6 border-b border-emerald-50 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center justify-between bg-white dark:bg-slate-900">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('rabbitId')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('home')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('breed')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('status')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('quickActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 dark:divide-slate-800">
                {filteredRabbits.map((rabbit) => (
                  <tr key={rabbit.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400">
                        {rabbit.rabbit_id || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                          <Rabbit size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{rabbit.name || 'Unnamed'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('cage')}: {rabbit.cage_number || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">{rabbit.breed}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        rabbit.status === 'Sold' ? "bg-blue-50 text-blue-600" : 
                        rabbit.status === 'Died' ? "bg-rose-50 text-rose-600" : 
                        "bg-emerald-50 text-emerald-600"
                      )}>
                        {t(rabbit.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedRabbit(rabbit); setIsDetailsOpen(true); }} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-emerald-600 transition-all">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setEditingRabbit(rabbit); setFormData(rabbit); setIsModalOpen(true); }} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-emerald-600 transition-all">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-2xl w-full bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={24} /></button>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">{editingRabbit ? t('edit') : t('addRabbit')}</h2>
              <form onSubmit={handleAction} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('home')}</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('breed')}</label>
                    <input type="text" required value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('gender')}</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option value="Male">{t('male')}</option>
                      <option value="Female">{t('female')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option value="Available">{t('available')}</option>
                      <option value="Sold">{t('sold')}</option>
                      <option value="Died">{t('died')}</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="farm-button w-full h-16 text-lg mt-4">{t('save')}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;