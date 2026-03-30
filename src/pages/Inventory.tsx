import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { Search, Plus, Rabbit, Download, X, Loader2, Edit2, Trash2, QrCode, Eye, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { QRCodeSVG } from 'qrcode.react';

const Inventory = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRabbit, setSelectedRabbit] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    cage_number: '',
    breed: '',
    birth_date: '',
    health_status: 'Healthy',
    gender: 'Female'
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

  const handleAddRabbit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const newRabbit = await storage.insert('rabbits', user.id, { 
        ...formData, 
        rabbit_id: `RAB-${Math.floor(1000 + Math.random() * 9000)}` 
      });
      setRabbits([newRabbit, ...rabbits]);
      setIsModalOpen(false);
      setFormData({ name: '', cage_number: '', breed: '', birth_date: '', health_status: 'Healthy', gender: 'Female' });
      showSuccess(t('addRabbit'));
    } catch (err) {
      showError("Failed to add rabbit.");
    }
  };

  const handleUpdateRabbit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRabbit) return;
    
    try {
      await storage.update('rabbits', user.id, selectedRabbit.id, formData);
      setRabbits(rabbits.map(r => r.id === selectedRabbit.id ? { ...r, ...formData } : r));
      setIsEditModalOpen(false);
      showSuccess(t('updateSuccess'));
    } catch (err) {
      showError("Failed to update rabbit.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm(t('deleteConfirm'))) return;
    await storage.delete('rabbits', user.id, id);
    setRabbits(prev => prev.filter(r => r.id !== id));
    showSuccess(t('deleteSuccess'));
  };

  const openEdit = (rabbit: any) => {
    setSelectedRabbit(rabbit);
    setFormData({
      name: rabbit.name || '',
      cage_number: rabbit.cage_number || '',
      breed: rabbit.breed || '',
      birth_date: rabbit.birth_date || '',
      health_status: rabbit.health_status || 'Healthy',
      gender: rabbit.gender || 'Female'
    });
    setIsEditModalOpen(true);
  };

  const openView = (rabbit: any) => {
    setSelectedRabbit(rabbit);
    setIsViewModalOpen(true);
  };

  const filteredRabbits = rabbits.filter(r => 
    (r.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (r.rabbit_id?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('inventory')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your high-performance rabbit breeds.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 pl-12 pr-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="farm-button flex items-center gap-2 h-14 px-8">
              <Plus size={20} />
              {t('addRabbit')}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRabbits.map((rabbit, i) => (
              <motion.div 
                key={rabbit.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="farm-card group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                      <Rabbit size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{rabbit.name || t('unnamed')}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rabbit.rabbit_id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(rabbit)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(rabbit.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('cageNumber')}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">#{rabbit.cage_number || t('notAvailable')}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('healthStatus')}</p>
                    <p className="text-sm font-bold text-emerald-600">{t(rabbit.health_status?.toLowerCase() || 'healthy')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400">{rabbit.breed}</span>
                  <button 
                    onClick={() => openView(rabbit)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <Eye size={14} /> {t('view')}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="w-full max-w-lg bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl relative"
            >
              <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} className="absolute top-6 right-6 text-slate-400"><X size={24} /></button>
              <h2 className="text-3xl font-black mb-8 tracking-tight">{isEditModalOpen ? t('editRabbit') : t('addRabbit')}</h2>
              <form onSubmit={isEditModalOpen ? handleUpdateRabbit : handleAddRabbit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('rabbitName')}</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('cageNumber')}</label>
                    <input type="text" required value={formData.cage_number} onChange={(e) => setFormData({...formData, cage_number: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('breed')}</label>
                  <input type="text" required value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('gender')}</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option value="Female">{t('female')}</option>
                      <option value="Male">{t('male')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('healthStatus')}</label>
                    <select value={formData.health_status} onChange={(e) => setFormData({...formData, health_status: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option value="Healthy">{t('healthy')}</option>
                      <option value="Sick">{t('sick')}</option>
                      <option value="Quarantine">{t('quarantine')}</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="farm-button w-full h-16 text-lg mt-4">
                  {isEditModalOpen ? t('save') : t('addRabbit')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedRabbit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="w-full max-w-2xl bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
              <button onClick={() => setIsViewModalOpen(false)} className="absolute top-6 right-6 text-slate-400"><X size={24} /></button>
              
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                      <Rabbit size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{selectedRabbit.name || t('unnamed')}</h2>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{selectedRabbit.rabbit_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: t('breed'), val: selectedRabbit.breed },
                      { label: t('cageNumber'), val: `#${selectedRabbit.cage_number}` },
                      { label: t('gender'), val: t(selectedRabbit.gender.toLowerCase()) },
                      { label: t('healthStatus'), val: t(selectedRabbit.health_status.toLowerCase()) },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-48 flex flex-col items-center justify-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <QRCodeSVG value={selectedRabbit.rabbit_id} size={120} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('qrCode')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;