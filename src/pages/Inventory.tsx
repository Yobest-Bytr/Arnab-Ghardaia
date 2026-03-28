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
import { exportToCSV } from '@/utils/export';
import { QRCodeSVG } from 'qrcode.react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete') + "?")) return;
    await storage.delete('rabbits', user!.id, id);
    setRabbits(prev => prev.filter(r => r.id !== id));
    showSuccess(t('delete'));
  };

  const openEditModal = (rabbit: any) => {
    setEditingRabbit(rabbit);
    setFormData({
      rabbit_id: rabbit.rabbit_id || '',
      name: rabbit.name || '',
      breed: rabbit.breed || 'New Zealand White',
      gender: rabbit.gender || 'Female',
      health_status: rabbit.health_status || 'Healthy',
      status: rabbit.status || 'Available',
      cage_number: rabbit.cage_number || '',
      price: rabbit.price || '',
      weight: rabbit.weight || '',
      birth_date: rabbit.birth_date || '',
      notes: rabbit.notes || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRabbit(null);
  };

  const filteredRabbits = rabbits.filter(r => {
    const matchesSearch = 
      r.name?.toLowerCase().includes(search.toLowerCase()) || 
      r.breed?.toLowerCase().includes(search.toLowerCase()) ||
      r.rabbit_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['All', 'Available', 'Sold', 'Died', 'Reserved'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('inventory')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{t('featuresSubtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={openAddModal} className="farm-button flex items-center gap-2">
              <Plus size={20} /> {t('addRecord')}
            </button>
          </div>
        </header>

        <div className="farm-card p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
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

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              <Filter size={16} className="text-slate-400 shrink-0" />
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    statusFilter === status 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {status === 'All' ? t('viewAll') : t(status.toLowerCase())}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-emerald-50 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('rabbitId')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('home')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('breed')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('status')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('farmHealth')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('quickActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">Loading...</td></tr>
                ) : filteredRabbits.map((rabbit) => (
                  <tr key={rabbit.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
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
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          rabbit.health_status === 'Healthy' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{t(rabbit.health_status.toLowerCase())}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedRabbit(rabbit); setIsDetailsOpen(true); }} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-emerald-600 transition-all" title={t('viewDetails')}>
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openEditModal(rabbit)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-emerald-600 transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(rabbit.id)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 transition-all">
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
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-2xl w-full bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-emerald-50 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
                {editingRabbit ? t('edit') : t('addRabbit')}
              </h2>
              
              <form onSubmit={handleAction} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('rabbitId')}</label>
                    <input type="text" readOnly value={formData.rabbit_id} className="w-full h-14 px-6 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-bold text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('home')}</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('breed')}</label>
                    <select value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option>New Zealand White</option>
                      <option>Flemish Giant</option>
                      <option>Netherland Dwarf</option>
                      <option>Rex</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option value="Available">{t('available')}</option>
                      <option value="Sold">{t('sold')}</option>
                      <option value="Died">{t('died')}</option>
                      <option value="Sick">{t('sick')}</option>
                      <option value="Reserved">{t('reserved')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('weight')}</label>
                    <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('birthDate')}</label>
                    <input type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('notes')}</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full min-h-[100px] p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                </div>

                <button type="submit" className="farm-button w-full h-16 text-lg mt-4">
                  {editingRabbit ? t('save') : t('addRecord')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal with QR Code */}
      <AnimatePresence>
        {isDetailsOpen && selectedRabbit && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-emerald-50 dark:border-slate-800 relative text-center"
            >
              <button onClick={() => setIsDetailsOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>

              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Rabbit size={40} />
              </div>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{selectedRabbit.name}</h2>
              <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-8">{selectedRabbit.rabbit_id}</p>

              <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] mb-8 flex flex-col items-center border border-slate-100 dark:border-slate-700">
                <QRCodeSVG 
                  value={`https://aranibfarm.com/rabbit/${selectedRabbit.rabbit_id}`} 
                  size={160}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl"
                />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">{t('qrCode')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left rtl:text-right">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('breed')}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRabbit.breed}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('weight')}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRabbit.weight || '0'} kg</p>
                </div>
              </div>

              <button onClick={() => setIsDetailsOpen(false)} className="w-full h-14 mt-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm">
                {t('viewAll')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;