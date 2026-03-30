import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Plus, Rabbit, Download, X, Loader2, Edit2, Trash2, 
  QrCode, Eye, Info, Calendar, Weight, ShieldCheck, Activity, TrendingUp, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Html5QrcodeScanner } from 'html5-qrcode';
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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingRabbit, setEditingRabbit] = useState<any>(null);
  const [viewingRabbit, setViewingRabbit] = useState<any>(null);
  
  const initialForm = {
    rabbit_id: '',
    name: '',
    breed: 'New Zealand White',
    gender: 'Female',
    health_status: 'Healthy',
    status: 'Available',
    sale_category: 'Adult',
    cage_number: '',
    price_dzd: '',
    weight: '',
    birth_date: new Date().toISOString().split('T')[0],
    notes: '',
    weight_history: [] as any[]
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

  useEffect(() => {
    if (isScannerOpen) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((decodedText) => {
        setSearch(decodedText);
        setIsScannerOpen(false);
        scanner.clear();
      }, (err) => {});
      return () => scanner.clear();
    }
  }, [isScannerOpen]);

  const fetchRabbits = async () => {
    setLoading(true);
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
    setLoading(false);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (isNaN(diffDays)) return 'N/A';
    
    const months = Math.floor(diffDays / 30);
    return months > 0 ? `${months} ${t('months')}` : `${diffDays} ${t('days')}`;
  };

  const handleDownloadQR = (rabbitId: string) => {
    const canvas = document.querySelector('img[alt="QR"]') as HTMLImageElement;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.src;
      link.download = `QR_${rabbitId}.png`;
      link.click();
      showSuccess("QR Code downloaded.");
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const currentWeight = parseFloat(formData.weight) || 0;
    const weightEntry = { date: new Date().toISOString().split('T')[0], weight: currentWeight };
    
    const updatedHistory = editingRabbit 
      ? [...(editingRabbit.weight_history || []), weightEntry].slice(-10)
      : [weightEntry];

    const finalData = { ...formData, weight_history: updatedHistory };
    
    try {
      if (editingRabbit) {
        await storage.update('rabbits', user.id, editingRabbit.id, finalData);
        setRabbits(prev => prev.map(r => r.id === editingRabbit.id ? { ...r, ...finalData } : r));
        showSuccess(t('save'));
      } else {
        const newRabbit = await storage.insert('rabbits', user.id, { ...finalData, rabbit_id: `RAB-${Math.floor(1000 + Math.random() * 9000)}` });
        setRabbits([newRabbit, ...rabbits]);
        showSuccess(t('addRabbit'));
      }
      setIsModalOpen(false);
      setEditingRabbit(null);
      setFormData(initialForm);
    } catch (err) {
      showError("Operation failed.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-emerald-50 text-emerald-600';
      case 'sold': return 'bg-blue-50 text-blue-600';
      case 'died': return 'bg-slate-100 text-slate-600';
      case 'sick': return 'bg-rose-50 text-rose-600';
      case 'quarantined': return 'bg-amber-50 text-amber-600';
      case 'recovering': return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const filteredRabbits = rabbits.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.rabbit_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('inventory')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Smart Cage & Weight Tracking Active.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsScannerOpen(true)} className="px-6 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2 font-bold shadow-sm hover:bg-slate-50 transition-all">
              <Camera size={20} className="text-emerald-600" /> {t('scanQr')}
            </button>
            <button onClick={() => { setEditingRabbit(null); setFormData(initialForm); setIsModalOpen(true); }} className="farm-button flex items-center gap-2 h-14 px-8">
              <Plus size={20} /> {t('addRabbit')}
            </button>
          </div>
        </header>

        <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
          />
        </div>

        {isScannerOpen && (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6">
            <button onClick={() => setIsScannerOpen(false)} className="absolute top-10 right-10 text-white"><X size={32} /></button>
            <div id="reader" className="w-full max-w-md bg-white rounded-3xl overflow-hidden" />
            <p className="text-white mt-8 font-bold">{t('cameraAccess')}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRabbits.map((rabbit) => (
            <motion.div key={rabbit.id} layout className="farm-card group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                    <Rabbit size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">{rabbit.name || 'Unnamed'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rabbit.rabbit_id}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setViewingRabbit(rabbit); setIsViewModalOpen(true); }} className="p-2 rounded-lg bg-slate-50 text-blue-600"><Eye size={16} /></button>
                  <button onClick={() => { setEditingRabbit(rabbit); setFormData(rabbit); setIsModalOpen(true); }} className="p-2 rounded-lg bg-slate-50 text-slate-600"><Edit2 size={16} /></button>
                  <button onClick={() => { if(confirm('Delete?')) storage.delete('rabbits', user?.id || '', rabbit.id).then(fetchRabbits); }} className="p-2 rounded-lg bg-slate-50 text-rose-600"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t('age')}</p>
                  <p className="text-xs font-bold">{calculateAge(rabbit.birth_date)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t('cageNumber')}</p>
                  <p className="text-xs font-bold">#{rabbit.cage_number || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                <span className="text-sm font-black text-emerald-600">{rabbit.price_dzd || '0'} DA</span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                  getStatusColor(rabbit.status)
                )}>{t(rabbit.status.toLowerCase())}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingRabbit && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsViewModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 z-10"><X size={24} /></button>
              
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Rabbit size={48} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{viewingRabbit.name}</h2>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{viewingRabbit.breed} • {calculateAge(viewingRabbit.birth_date)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownloadQR(viewingRabbit.rabbit_id)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all"
                  >
                    <Download size={16} /> {t('downloadQr')}
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <h3 className="text-xl font-black flex items-center gap-2"><TrendingUp className="text-emerald-600" /> {t('weightHistory')}</h3>
                    <div className="h-64 w-full bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] p-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={viewingRabbit.weight_history || []}>
                          <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                          <XAxis dataKey="date" hide />
                          <YAxis hide />
                          <Tooltip />
                          <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-2"><QrCode className="text-emerald-600" /> Cage Neural Link</h3>
                    <div className="aspect-square w-48 bg-white p-4 rounded-3xl border-2 border-slate-50 mx-auto lg:mx-0">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${viewingRabbit.rabbit_id}`} alt="QR" className="w-full h-full" />
                    </div>
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">
                        Scan this code at the cage to instantly open this rabbit's medical and growth records.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-2xl w-full bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400"><X size={24} /></button>
              <h2 className="text-3xl font-black mb-8 tracking-tight">{editingRabbit ? t('edit') : t('addRabbit')}</h2>
              <form onSubmit={handleAction} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Breed</label>
                    <input type="text" required value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Gender</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Birth Date</label>
                    <input type="date" required value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Weight (kg)</label>
                    <input type="number" step="0.1" required value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('cageNumber')}</label>
                    <input type="text" value={formData.cage_number} onChange={(e) => setFormData({...formData, cage_number: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('salePrice')} (DA)</label>
                    <input type="number" value={formData.price_dzd} onChange={(e) => setFormData({...formData, price_dzd: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option value="Available">{t('available')}</option>
                      <option value="Sold">{t('sold')}</option>
                      <option value="Died">{t('died')}</option>
                      <option value="Sick">{t('sick')}</option>
                      <option value="Quarantined">{t('quarantined')}</option>
                      <option value="Recovering">{t('recovering')}</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Sale Category</label>
                  <select value={formData.sale_category} onChange={(e) => setFormData({...formData, sale_category: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                    <option value="Young">{t('categoryYoung')}</option>
                    <option value="Adult">{t('categoryAdult')}</option>
                    <option value="Meat">{t('categoryMeat')}</option>
                  </select>
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