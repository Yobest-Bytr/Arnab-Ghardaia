import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Plus, Rabbit, Download,
  X, Loader2, Edit2, Trash2, FileText, Table as TableIcon, Filter, QrCode, Eye, Info, Calendar, Weight, ShieldCheck, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

const Inventory = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingRabbit, setEditingRabbit] = useState<any>(null);
  const [viewingRabbit, setViewingRabbit] = useState<any>(null);
  
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
    setLoading(true);
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
      birth_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
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
    } catch (err) {
      showError("Operation failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm(isRTL ? "هل أنت متأكد من حذف هذا السجل؟" : "Are you sure you want to delete this record?")) return;
    try {
      await storage.delete('rabbits', user.id, id);
      setRabbits(prev => prev.filter(r => r.id !== id));
      showSuccess(isRTL ? "تم الحذف بنجاح" : "Deleted successfully");
    } catch (err) {
      showError("Delete failed.");
    }
  };

  const filteredRabbits = rabbits.filter(r => {
    const matchesSearch = 
      r.name?.toLowerCase().includes(search.toLowerCase()) || 
      r.breed?.toLowerCase().includes(search.toLowerCase()) ||
      r.rabbit_id?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('inventory')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('verifiedRecords')}</p>
          </div>
          <button onClick={openAddModal} className="farm-button w-full md:w-auto flex items-center justify-center gap-2 h-14 px-8">
            <Plus size={20} /> {t('addRabbit')}
          </button>
        </header>

        <div className="mb-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Neural Records...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block farm-card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('rabbitId')}</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('home')}</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('breed')}</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('status')}</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t('quickActions')}</th>
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
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setViewingRabbit(rabbit); setIsViewModalOpen(true); }} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-blue-600 transition-all" title="View Profile">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => { setEditingRabbit(rabbit); setFormData(rabbit); setIsModalOpen(true); }} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-emerald-600 transition-all" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(rabbit.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredRabbits.map((rabbit) => (
                <div key={rabbit.id} className="farm-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400">
                      {rabbit.rabbit_id}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { setViewingRabbit(rabbit); setIsViewModalOpen(true); }} className="p-2 rounded-lg bg-slate-100 text-blue-600"><Eye size={16} /></button>
                      <button onClick={() => { setEditingRabbit(rabbit); setFormData(rabbit); setIsModalOpen(true); }} className="p-2 rounded-lg bg-slate-100 text-slate-600"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(rabbit.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Rabbit size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{rabbit.name || 'Unnamed'}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{rabbit.breed}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('status')}</p>
                      <span className="text-xs font-bold text-emerald-600">{t(rabbit.status.toLowerCase())}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('weight')}</p>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{rabbit.weight || '0'} kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingRabbit && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden relative">
              <button onClick={() => setIsViewModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 dark:hover:text-white z-10"><X size={24} /></button>
              
              <div className="h-32 bg-emerald-600 relative">
                <div className="absolute -bottom-12 left-10 w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-900 p-2 shadow-xl">
                  <div className="w-full h-full rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                    <Rabbit size={48} />
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-10 px-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{viewingRabbit.name || 'Unnamed Rabbit'}</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{viewingRabbit.breed}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-100">
                      {t(viewingRabbit.status.toLowerCase())}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('rabbitId')}</p>
                    <p className="text-sm font-bold">{viewingRabbit.rabbit_id}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('gender')}</p>
                    <p className="text-sm font-bold">{t(viewingRabbit.gender.toLowerCase())}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('weight')}</p>
                    <p className="text-sm font-bold">{viewingRabbit.weight || '0'} kg</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('cage')}</p>
                    <p className="text-sm font-bold">{viewingRabbit.cage_number || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Info size={14} /> {t('notes')}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {viewingRabbit.notes || 'No additional notes recorded for this rabbit.'}
                    </p>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <QrCode size={14} /> Cage Neural Link
                    </h4>
                    <div className="aspect-square w-32 bg-white p-2 rounded-2xl border-2 border-slate-100 mx-auto md:mx-0">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${viewingRabbit.rabbit_id}`} alt="QR Code" className="w-full h-full" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">Scan to view digital health records instantly.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-2xl w-full bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={24} /></button>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">{editingRabbit ? t('edit') : t('addRabbit')}</h2>
              <form onSubmit={handleAction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('home')}</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('breed')}</label>
                    <input type="text" required value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('weight')} (kg)</label>
                    <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('birthDate')}</label>
                    <input type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
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