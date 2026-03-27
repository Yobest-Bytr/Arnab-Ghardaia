import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Heart, Calendar, Plus, History, 
  AlertCircle, CheckCircle2, ArrowRight, Rabbit, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Breeding = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [litters, setLitters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchLitters();
  }, [user]);

  const fetchLitters = async () => {
    const data = await storage.get('litters', user?.id || '');
    setLitters(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('breeding')}</h1>
            <p className="text-slate-500 font-medium mt-1">Manage mating pairs and track pregnancy cycles.</p>
          </div>
          <button className="farm-button flex items-center gap-2">
            <Plus size={20} />
            Record New Mating
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Pregnancies */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Activity className="text-emerald-600" size={20} />
              Active Pregnancies
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="farm-card relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                      Day 24/31
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600">
                      <Heart size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Bella (Mother)</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mated with: Max</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Expected Birth</span>
                      <span className="text-slate-900">Oct 24, 2023</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[75%]" />
                    </div>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Breeding History */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
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
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black">
                        {litter.kit_count}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Litter #{litter.id.slice(0,4)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{litter.actual_birth_date}</p>
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
    </div>
  );
};

export default Breeding;