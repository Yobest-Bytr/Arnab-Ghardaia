"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Heart, Calendar, Plus, History, 
  AlertCircle, CheckCircle2, ArrowRight, Rabbit, Activity, X, Info, Trash2, Search, ChevronRight, TrendingUp
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
    try {
      const [litterData, rabbitData] = await Promise.all([
        storage.get('litters', user?.id || ''),
        storage.get('rabbits', user?.id || '')
      ]);
      setLitters(litterData || []);
      setInventory(rabbitData || []);
    } finally {
      setLoading(false);
    }
  };

  const successRate = useMemo(() => {
    if (litters.length === 0) return 0;
    const successful = litters.filter(l => l.kit_count > 0 || l.status === 'Born' || l.status === 'Weaned').length;
    return Math.round((successful / litters.length) * 100);
  }, [litters]);

  const showInstantSuggestions = (type: 'mother' | 'father', val: string) => {
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
      setIsModalOpen(false);
      setFormData({ mother_name: '', father_name: '', mating_date: new Date().toISOString().split('T')[0], expected_birth_date: '', kit_count: 0, notes: '' });
      await fetchData();
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
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{t('breeding')}</h1>
            <p className="text-white/40 font-medium mt-1">Manage mating pairs and track pregnancy cycles.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 shadow-sm">
              <TrendingUp className="text-emerald-400" size={20} />
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{t('successRate')}</p>
                <p className="text-lg font-black text-emerald-400">{successRate}%</p>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="auron-button flex items-center justify-center gap-2 h-14 px-8">
              <Plus size={20} />
              {t('recordMating')}
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Activity className="text-emerald-400" size={20} />
              {t('activePregnancies')}
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {litters.filter(l => l.status === 'Pregnant').map((litter, i) => {
                const daysLeft = getDaysRemaining(litter.expected_birth_date);
                const progress = Math.max(0, Math.min(100, ((31 - daysLeft) / 31) * 100));
                
                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pill-nav p-8 relative overflow-hidden group bg-white/5 border-white/10"
                  >
                    <button onClick={() => handleDelete(litter.id)} className="absolute top-4 right-4 p-2 rounded-lg bg-rose-500/10 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                    <div className="mb-4 flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                        {t('expectedBirth')}: {litter.expected_birth_date}
                      </span>
                      <span className="text-[10px] font-black text-white/20 uppercase">{daysLeft} {t('daysRemaining')}</span>
                    </div>
                    
                    <div className="w-full h-2 bg-white/5 rounded-full mb-6 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20">
                        <Heart size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black">{litter.mother_name} ({t('mother')})</p>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{t('father')}: {litter.father_name}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {litters.filter(l => l.status === 'Pregnant').length === 0 && (
                <div className="col-span-2 py-20 text-center pill-nav bg-white/5 border-white/10 border-dashed">
                  <p className="text-white/20 font-bold">No active pregnancies detected.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <History className="text-indigo-400" size={20} />
              {t('recentActivity')}
            </h3>
            
            <div className="space-y-4">
              {litters.slice(0, 8).map((litter, i) => (
                <div key={i} className="pill-nav p-4 bg-white/5 border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black">
                      {litter.kit_count || '0'}
                    </div>
                    <div>
                      <p className="text-sm font-black">{litter.mother_name}</p>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{litter.mating_date}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(litter.id)} className="text-white/10 hover:text-rose-400 transition-colors">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, y: 100 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 100 }} 
              className="w-full max-w-lg bg-[#020408] border border-white/10 rounded-[3rem] shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                <h2 className="text-3xl font-black tracking-tighter">{t('recordMating')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleAddMating} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <label className="text-xs font-black text-white/30 uppercase tracking-widest ml-2">{t('mother')}</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.mother_name ?? ''} 
                      onFocus={() => showInstantSuggestions('mother', formData.mother_name)}
                      onChange={(e) => { setFormData({...formData, mother_name: e.target.value}); showInstantSuggestions('mother', e.target.value); }} 
                      className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none focus:border-indigo-500/50" 
                    />
                    {suggestions.type === 'mother' && suggestions.list.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {suggestions.list.map(r => (
                          <button key={r.id} type="button" onClick={() => selectSuggestion(r, 'mother')} className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between transition-colors">
                            <div className="flex items-center gap-3">
                              <Rabbit size={14} className="text-emerald-400" />
                              <span className="text-sm font-bold">{r.name || r.rabbit_id}</span>
                            </div>
                            <ChevronRight size={14} className="text-white/20" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-xs font-black text-white/30 uppercase tracking-widest ml-2">{t('father')}</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.father_name ?? ''} 
                      onFocus={() => showInstantSuggestions('father', formData.father_name)}
                      onChange={(e) => { setFormData({...formData, father_name: e.target.value}); showInstantSuggestions('father', e.target.value); }} 
                      className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none focus:border-indigo-500/50" 
                    />
                    {suggestions.type === 'father' && suggestions.list.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {suggestions.list.map(r => (
                          <button key={r.id} type="button" onClick={() => selectSuggestion(r, 'father')} className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between transition-colors">
                            <div className="flex items-center gap-3">
                              <Rabbit size={14} className="text-emerald-400" />
                              <span className="text-sm font-bold">{r.name || r.rabbit_id}</span>
                            </div>
                            <ChevronRight size={14} className="text-white/20" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-white/30 uppercase tracking-widest ml-2">{t('matingDate')}</label>
                    <input type="date" required value={formData.mating_date ?? ''} onChange={(e) => setFormData({...formData, mating_date: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-white/30 uppercase tracking-widest ml-2">{t('expectedBirth')}</label>
                    <input type="date" readOnly value={formData.expected_birth_date ?? ''} className="w-full h-14 px-6 bg-white/10 border border-white/10 rounded-2xl font-black text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-white/30 uppercase tracking-widest ml-2">{t('notes')}</label>
                  <textarea value={formData.notes ?? ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none min-h-[100px]" />
                </div>
                
                <button type="submit" className="auron-button w-full h-16 text-lg mt-4">{t('recordMating')}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Breeding;