import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Heart, Calendar, Plus, History, 
  AlertCircle, CheckCircle2, ArrowRight, Rabbit, Activity, X
} from 'lucide-center';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

const Breeding = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [litters, setLitters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    mother_name: '',
    father_name: '',
    mating_date: new Date().toISOString().split('T')[0],
    expected_birth_date: '',
  });

  useEffect(() => {
    if (user) fetchLitters();
  }, [user]);

  const fetchLitters = async () => {
    const data = await storage.get('litters', user?.id || '');
    setLitters(data);
    setLoading(false);
  };

  const handleAddMating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const matingDate = new Date(formData.mating_date);
    const expectedDate = new Date(matingDate);
    expectedDate.setDate(matingDate.getDate() + 31); // Average rabbit pregnancy is 31 days

    const newMating = {
      ...formData,
      expected_birth_date: expectedDate.toISOString().split('T')[0],
      status: 'Pregnant',
      progress: 0
    };

    try {
      await storage.insert('litters', user.id, newMating);
      setLitters([newMating, ...litters]);
      setIsModalOpen(false);
      showSuccess(`Mating recorded for ${formData.mother_name}.`);
    } catch (err) {
      showError('Failed to record mating.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('breeding')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage mating pairs and track pregnancy cycles.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="farm-button flex items-center gap-2">
            <Plus size={20} />
            Record New Mating
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="text-emerald-600" size={20} />
              Active Pregnancies
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {litters.filter(l => l.status === 'Pregnant').map((litter, i) => (
                <div key={i} className="farm-card relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                      Expected: {litter.expected_birth_date}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600">
                      <Heart size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{litter.mother_name} (Mother)</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mated with: {litter.father_name}</p>
                    </div>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all">
                    View Details
                  </button>
                </div>
              ))}
              {litters.filter(l => l.status === 'Pregnant').length === 0 && (
                <div className="col-span-2 p-12 text-center border-2 border-dashed border-emerald-100 dark:border-slate-800 rounded-3xl">
                  <p className="text-slate-400 font-medium">No active pregnancies recorded.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <History className="text-emerald-600" size={20} />
              Recent Litters
            </h3>
            
            <div className="space-y-4">
              {litters.length === 0 ? (
                <div className="farm-card text-center py-12">
                  <Rabbit className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-medium">No litter history yet.</p>
                </div>
              ) : (
                litters.map((litter, i) => (
                  <div key={i} className="farm-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 font-black">
                        {litter.kit_count || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{litter.mother_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{litter.mating_date}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-lg w-full bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-emerald-50 dark:border-slate-800 relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Record Mating</h2>
              
              <form onSubmit={handleAddMating} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Mother Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.mother_name}
                      onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Father Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.father_name}
                      onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Mating Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.mating_date}
                    onChange={(e) => setFormData({...formData, mating_date: e.target.value})}
                    className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>

                <button type="submit" className="farm-button w-full h-16 text-lg mt-4">
                  Record Mating
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Breeding;