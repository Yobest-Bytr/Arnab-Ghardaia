import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Heart, Calendar, Plus, History, 
  AlertCircle, CheckCircle2, ArrowRight, Rabbit, Activity, X, Info, Trash2, Search, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

const Breeding = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [litters, setLitters] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    mother_name: '',
    father_name: '',
    mating_date: new Date().toISOString().split('T')[0],
    expected_birth_date: '',
    kit_count: 0,
    notes: ''
  });

  const [suggestions, setSuggestions] = useState<{ type: 'mother' | 'father', list: any[] }>({ type: 'mother', list: [] });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (formData.mating_date) {
      const matingDate = new Date(formData.mating_date);
      const expectedDate = new Date(matingDate);
      expectedDate.setDate(matingDate.getDate() + 31);
      setFormData(prev => ({ ...prev, expected_birth_date: expectedDate.toISOString().split('T')[0] }));
    }
  }, [formData.mating_date]);

  const fetchData = async () => {
    setLoading(true);
    const [litterData, rabbitData] = await Promise.all([
      storage.get('litters', user?.id || ''),
      storage.get('rabbits', user?.id || '')
    ]);
    setLitters(litterData);
    setInventory(rabbitData);
    setLoading(false);
  };

  const showInstantSuggestions = (type: 'mother' | 'father') => {
    const val = formData[type === 'mother' ? 'mother_name' : 'father_name'];
    const gender = type === 'mother' ? 'Female' : 'Male';
    
    const filtered = inventory.filter(r => 
      r.gender === gender &&
      (val === '' || r.name?.toLowerCase().includes(val.toLowerCase()) || r.rabbit_id?.toLowerCase().includes(val.toLowerCase()))
    );
    
    setSuggestions({ type, list: filtered.slice(0, 6) });
  };

  const selectSuggestion = (rabbit: any, type: 'mother' | 'father') => {
    setFormData(prev => ({ ...prev, [`${type}_name`]: rabbit.name || rabbit.rabbit_id }));
    setSuggestions({ type, list: [] });
  };

  const handleAddMating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const newMating = { ...formData, status: 'Pregnant' };
      await storage.insert('litters', user.id, newMating);
      setLitters([newMating, ...litters]);
      setIsModalOpen(false);
      showSuccess(t('recordMating'));
    } catch (err) {
      showError("Failed to record mating.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete record?")) return;
    await storage.delete('litters', user.id, id);
    setLitters(prev => prev.filter(l => l.id !== id));
    showSuccess("Deleted.");
  };

  const getDaysRemaining = (expectedDate: string) => {
    const diff = new Date(expectedDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('breeding')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage mating pairs and track pregnancy cycles.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="farm-button w-full md:w-auto flex items-center justify-center gap-2 h-14 px-8">
            <Plus size={20} />
            {t('recordMating')}
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="text-emerald-600" size={20} />
              {t('activePregnancies')}
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {litters.filter(l => l.status === 'Pregnant').map((litter, i) => {
                const daysLeft = getDaysRemaining(litter.expected_birth_date);
                const progress = Math.max(0, Math.min(100, ((31 - daysLeft) / 31) * 100));
                
                return (
                  <div key={i} className="farm-card relative overflow-hidden group">
                    <button onClick={() => handleDelete(litter.id)} className="absolute top-4 right-4 p-2 rounded-lg bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                    <div className="mb-4 flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                        {t('expectedBirth')}: {litter.expected_birth_date}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{daysLeft} {t('daysRemaining')}</span>
                    </div>
                    
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600">
                        <Heart size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{litter.mother_name} ({t('mother')})</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('father')}: {litter.father_name}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <History className="text-emerald-600" size={20} />
              {t('recentActivity')}
            </h3>
            
            <div className="space-y-4">
              {litters.map((litter, i) => (
                <div key={i} className="farm-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 font-black">
                      {litter.kit_count || '0'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{litter.mother_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{litter.mating_date}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(litter.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 100 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 100 }} 
              className="w-full h-full sm:h-auto sm:max-w-lg bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl relative flex flex-col"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h2 className="text-2xl font-black tracking-tight">{t('recordMating')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400"><X size={24} /></button>
              </div>

              <form onSubmit={handleAddMating} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mother Input with Instant Suggestions */}
                  <div className="space-y-2 relative">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('mother')}</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.mother_name} 
                      onFocus={() => showInstantSuggestions('mother')}
                      onChange={(e) => { setFormData({...formData, mother_name: e.target.value}); showInstantSuggestions('mother'); }} 
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                    />
                    {suggestions.type === 'mother' && suggestions.list.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                        {suggestions.list.map(r => (
                          <button key={r.id} type="button" onClick={() => selectSuggestion(r, 'mother')} className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center justify-between transition-colors">
                            <div className="flex items-center gap-3">
                              <Rabbit size={14} className="text-emerald-600" />
                              <span className="text-sm font-bold">{r.name || r.rabbit_id}</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Father Input with Instant Suggestions */}
                  <div className="space-y-2 relative">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('father')}</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.father_name} 
                      onFocus={() => showInstantSuggestions('father')}
                      onChange={(e) => { setFormData({...formData, father_name: e.target.value}); showInstantSuggestions('father'); }} 
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                    />
                    {suggestions.type === 'father' && suggestions.list.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                        {suggestions.list.map(r => (
                          <button key={r.id} type="button" onClick={() => selectSuggestion(r, 'father')} className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center justify-between transition-colors">
                            <div className="flex items-center gap-3">
                              <Rabbit size={14} className="text-emerald-600" />
                              <span className="text-sm font-bold">{r.name || r.rabbit_id}</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('matingDate')}</label>
                    <input type="date" required value={formData.mating_date} onChange={(e) => setFormData({...formData, mating_date: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('expectedBirth')}</label>
                    <input type="date" readOnly value={formData.expected_birth_date} className="w-full h-14 px-6 bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-bold text-emerald-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('notes')}</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 min-h-[100px]" />
                </div>
              </form>

              <div className="p-6 border-t border-slate-50 dark:border-slate-800 shrink-0">
                <button onClick={handleAddMating} className="farm-button w-full h-16 text-lg">{t('recordMating')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Breeding;