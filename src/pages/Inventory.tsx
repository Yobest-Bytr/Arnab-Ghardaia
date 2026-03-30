import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Plus, Rabbit, Download, X, Loader2, Edit2, Trash2, 
  QrCode, Eye, Info, Calendar, Weight, ShieldCheck, Activity, TrendingUp, Camera,
  Stethoscope, Heart, Layers, Wand2, Sparkles, ChevronRight, ArrowLeft, ShoppingBag,
  Zap, ArrowUpRight, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

const BREEDS = ['New Zealand White', 'Flemish Giant', 'Netherland Dwarf', 'Rex', 'California', 'Angora', 'Dutch', 'Lionhead'];

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
    mother_id: '',
    father_id: '',
    vaccination_status: 'Not Vaccinated',
    medical_history: '',
    weight_history: [] as any[],
    is_public: false
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

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
    const months = Math.floor(diffDays / 30);
    return months > 0 ? `${months} ${t('months')}` : `${diffDays} ${t('days')}`;
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
        const newRabbit = await storage.insert('rabbits', user.id, { 
          ...formData, 
          rabbit_id: `RAB-${Math.floor(1000 + Math.random() * 9000)}` 
        });
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

  const filteredRabbits = rabbits.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.rabbit_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-[1600px] mx-auto relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
              <Zap size={14} className="fill-current" />
              <span>Neural Inventory Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              The <span className="dopamine-text">Stockpile.</span>
            </h1>
            <p className="text-xl text-white/40 font-bold max-w-2xl">Manage your high-performance rabbit breeds with neural precision.</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap gap-4">
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-[2rem] text-lg font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            <button onClick={() => { setEditingRabbit(null); setFormData(initialForm); setIsModalOpen(true); }} className="auron-button h-16 px-10 flex items-center gap-3 text-lg">
              <Plus size={24} /> {t('addRabbit')}
            </button>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredRabbits.map((rabbit, i) => (
              <motion.div 
                key={rabbit.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="group relative pill-nav p-8 bg-white/5 border-white/10 hover:border-indigo-500/50 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                  <Rabbit size={120} />
                </div>

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <Rabbit size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight group-hover:text-indigo-400 transition-colors">{rabbit.name || 'Unnamed'}</h3>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{rabbit.rabbit_id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setViewingRabbit(rabbit); setIsViewModalOpen(true); }} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><Eye size={18} /></button>
                    <button onClick={() => { setEditingRabbit(rabbit); setFormData(rabbit); setIsModalOpen(true); }} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><Edit2 size={18} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{t('age')}</p>
                    <p className="text-sm font-bold">{calculateAge(rabbit.birth_date)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{t('cageNumber')}</p>
                    <p className="text-sm font-bold">#{rabbit.cage_number || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-indigo-400">{rabbit.price_dzd || '0'} DA</span>
                    {rabbit.is_public && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live in Boutique" />}
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    rabbit.status === 'Available' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/40 border-white/10"
                  )}>{t(rabbit.status.toLowerCase())}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Add/Edit Modal - Enhanced for PC Scaling */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="max-w-4xl w-full bg-[#020408] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1 ai-gradient" />
              <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <Sparkles className="text-indigo-400" />
                  {editingRabbit ? t('edit') : t('addRabbit')}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleAction} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Rabbit Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold focus:border-indigo-500 transition-all outline-none" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Breed Selection</label>
                    <select value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold focus:border-indigo-500 transition-all outline-none appearance-none">
                      {BREEDS.map(b => <option key={b} value={b} className="bg-[#020408]">{b}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Gender</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold focus:border-indigo-500 transition-all outline-none appearance-none">
                      <option value="Female" className="bg-[#020408]">Female</option>
                      <option value="Male" className="bg-[#020408]">Male</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Birth Date</label>
                    <input type="date" required value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold focus:border-indigo-500 transition-all outline-none" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Weight (kg)</label>
                    <input type="number" step="0.1" required value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold focus:border-indigo-500 transition-all outline-none" />
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><ShoppingBag size={24} /></div>
                      <div>
                        <p className="text-lg font-black">{t('publishToShop')}</p>
                        <p className="text-xs text-white/40 font-medium">{t('publishDesc')}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, is_public: !formData.is_public})}
                      className={cn(
                        "w-16 h-8 rounded-full relative transition-all duration-500",
                        formData.is_public ? "bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500",
                        formData.is_public ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                  {formData.is_public && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('salePrice')} (DA)</label>
                      <input type="number" required value={formData.price_dzd} onChange={(e) => setFormData({...formData, price_dzd: e.target.value})} className="w-full h-16 px-6 bg-black/40 border border-white/10 rounded-2xl font-black text-2xl text-indigo-400 focus:border-indigo-500 transition-all outline-none" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('notes')}</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full p-8 bg-white/5 border border-white/10 rounded-[2rem] font-medium focus:border-indigo-500 transition-all outline-none min-h-[150px]" />
                </div>
              </form>

              <div className="p-8 border-t border-white/5 shrink-0 bg-black/20">
                <button onClick={handleAction} className="auron-button w-full h-16 text-xl">{t('save')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;