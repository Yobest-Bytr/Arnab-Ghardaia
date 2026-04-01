import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Plus, Rabbit, Download, X, Loader2, Edit2, Trash2, 
  QrCode, Eye, Info, Calendar, Weight, ShieldCheck, Activity, TrendingUp, Camera,
  Stethoscope, Heart, Layers, Wand2, Sparkles, ChevronRight, ArrowLeft, ShoppingBag,
  Zap, ArrowUpRight, Filter, History, FileText, LayoutGrid, Scale, RefreshCw, CheckCircle2, AlertCircle, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import QrScanner from '@/components/QrScanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BREEDS = ['New Zealand White', 'Flemish Giant', 'Netherland Dwarf', 'Rex', 'California', 'Angora', 'Dutch', 'Lionhead'];
const CAGE_TYPES = ['Young', 'Males Only', 'Females Only', 'Mating Pairs'];

const Inventory = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [litters, setLitters] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLitterModalOpen, setIsLitterModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [editingRabbit, setEditingRabbit] = useState<any>(null);
  const [viewingRabbit, setViewingRabbit] = useState<any>(null);
  const [splittingLitter, setSplittingLitter] = useState<any>(null);
  const [activeRabbit, setActiveRabbit] = useState<any>(null);
  
  const initialForm = {
    rabbit_id: '',
    name: '',
    breed: 'New Zealand White',
    gender: 'Female',
    health_status: 'Healthy',
    status: 'Available',
    cage_number: '',
    cage_type: 'Females Only',
    price_dzd: '',
    weight: '',
    birth_date: new Date().toISOString().split('T')[0],
    notes: '',
    mother_id: '',
    father_id: '',
    mating_partner: '',
    vaccination_status: 'Not Vaccinated',
    medical_history: '',
    weight_history: [] as any[],
    is_public: false
  };

  const initialLitterForm = {
    mother_name: '',
    father_name: '',
    mating_date: '',
    expected_birth_date: '',
    actual_birth_date: '',
    kit_count: 0,
    alive_kits: 0,
    dead_kits: 0,
    status: 'Pregnant',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [litterFormData, setLitterFormData] = useState(initialLitterForm);
  const [quickWeight, setQuickWeight] = useState('');
  const [splitData, setSplitData] = useState({ males: 0, females: 0 });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [rabbitData, litterData] = await Promise.all([
      storage.get('rabbits', user?.id || ''),
      storage.get('litters', user?.id || '')
    ]);
    setRabbits(rabbitData);
    setLitters(litterData);
    setLoading(false);
  };

  const generateAutoId = (gender: string) => {
    const prefix = gender === 'Female' ? 'F' : 'M';
    const count = rabbits.filter(r => r.gender === gender).length + 1;
    return `${prefix}-${count.toString().padStart(4, '0')}`;
  };

  useEffect(() => {
    if (!editingRabbit && !formData.rabbit_id) {
      setFormData(prev => ({ ...prev, rabbit_id: generateAutoId(prev.gender) }));
    }
  }, [formData.gender, rabbits, editingRabbit]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const weightVal = parseFloat(formData.weight);
      let updatedWeightHistory = [...(formData.weight_history || [])];
      if (editingRabbit && editingRabbit.weight !== formData.weight) {
        updatedWeightHistory.push({ weight: weightVal, date: new Date().toISOString(), notes: 'Manual update' });
      } else if (!editingRabbit && formData.weight) {
        updatedWeightHistory = [{ weight: weightVal, date: new Date().toISOString(), notes: 'Initial weight' }];
      }
      const finalData = { ...formData, weight_history: updatedWeightHistory };
      if (editingRabbit) {
        await storage.update('rabbits', user.id, editingRabbit.id, finalData);
      } else {
        await storage.insert('rabbits', user.id, finalData);
      }
      setIsModalOpen(false);
      setEditingRabbit(null);
      setFormData(initialForm);
      fetchData();
      showSuccess(t('save'));
    } catch (err) {
      showError("Operation failed.");
    }
  };

  const handleQuickWeightUpdate = async () => {
    if (!user || !activeRabbit || !quickWeight) return;
    try {
      const weightVal = parseFloat(quickWeight);
      const updatedHistory = [...(activeRabbit.weight_history || []), { weight: weightVal, date: new Date().toISOString(), notes: 'Quick update' }];
      await storage.update('rabbits', user.id, activeRabbit.id, { weight: quickWeight, weight_history: updatedHistory });
      setIsWeightModalOpen(false);
      setQuickWeight('');
      fetchData();
      showSuccess("Weight updated.");
    } catch (err) {
      showError("Update failed.");
    }
  };

  const handleLitterAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await storage.insert('litters', user.id, litterFormData);
      setIsLitterModalOpen(false);
      setLitterFormData(initialLitterForm);
      fetchData();
      showSuccess(t('recordMating'));
    } catch (err) {
      showError("Failed to record litter.");
    }
  };

  const handleSplitLitter = async () => {
    if (!user || !splittingLitter) return;
    try {
      const totalToSplit = splitData.males + splitData.females;
      if (totalToSplit > splittingLitter.alive_kits) {
        showError("Total split exceeds alive kits.");
        return;
      }

      for (let i = 0; i < splitData.males; i++) {
        await storage.insert('rabbits', user.id, {
          ...initialForm,
          rabbit_id: generateAutoId('Male'),
          name: `Son of ${splittingLitter.mother_name}`,
          gender: 'Male',
          birth_date: splittingLitter.actual_birth_date,
          mother_id: splittingLitter.mother_name,
          father_id: splittingLitter.father_name
        });
      }

      for (let i = 0; i < splitData.females; i++) {
        await storage.insert('rabbits', user.id, {
          ...initialForm,
          rabbit_id: generateAutoId('Female'),
          name: `Daughter of ${splittingLitter.mother_name}`,
          gender: 'Female',
          birth_date: splittingLitter.actual_birth_date,
          mother_id: splittingLitter.mother_name,
          father_id: splittingLitter.father_name
        });
      }

      await storage.update('litters', user.id, splittingLitter.id, { status: 'Weaned' });
      setIsSplitModalOpen(false);
      setSplittingLitter(null);
      fetchData();
      showSuccess(t('splitLitter'));
    } catch (err) {
      showError("Split failed.");
    }
  };

  const handleDeleteRabbit = async (id: string) => {
    if (!user || !confirm("Delete this rabbit?")) return;
    await storage.delete('rabbits', user.id, id);
    setRabbits(prev => prev.filter(r => r.id !== id));
    showSuccess("Rabbit removed.");
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const diff = Math.abs(new Date().getTime() - new Date(birthDate).getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    return months > 0 ? `${months} ${t('months')}` : `${days} ${t('days')}`;
  };

  const filteredRabbits = rabbits.filter(r => 
    (r.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (r.rabbit_id?.toLowerCase() || '').includes(search.toLowerCase())
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
          </motion.div>
          
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setIsScannerOpen(true)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-xl">
              <QrCode size={24} />
            </button>
            <button onClick={() => setIsLitterModalOpen(true)} className="auron-button h-14 px-8 flex items-center gap-3 text-sm bg-pink-600 hover:bg-pink-500">
              <Heart size={20} /> {t('recordMating')}
            </button>
            <button onClick={() => { setEditingRabbit(null); setFormData(initialForm); setIsModalOpen(true); }} className="auron-button h-14 px-8 flex items-center gap-3 text-sm">
              <Plus size={20} /> {t('addRabbit')}
            </button>
          </div>
        </header>

        <Tabs defaultValue="rabbits" className="space-y-12">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-16">
            <TabsTrigger value="rabbits" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
              <Rabbit size={18} /> {t('inventory')}
            </TabsTrigger>
            <TabsTrigger value="litters" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
              <Users size={18} /> {t('litters')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rabbits" className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredRabbits.map((rabbit, i) => (
                <motion.div key={rabbit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative pill-nav p-8 bg-white/5 border-white/10 hover:border-indigo-500/50 transition-all overflow-hidden">
                  <div className="flex items-center gap-5 mb-8">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", rabbit.gender === 'Female' ? "bg-pink-500/10 text-pink-400 border-pink-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20")}>
                      <Rabbit size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{rabbit.name}</h3>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{rabbit.rabbit_id}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{t('age')}</p>
                      <p className="text-sm font-bold">{calculateAge(rabbit.birth_date)}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{t('weightKg')}</p>
                      <p className="text-sm font-bold">{rabbit.weight} kg</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    <button onClick={() => { setActiveRabbit(rabbit); setQuickWeight(rabbit.weight); setIsWeightModalOpen(true); }} className="flex-1 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2">
                      <Scale size={14} /> Update Weight
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-xl font-black text-indigo-400">{rabbit.price_dzd || '0'} DA</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setActiveRabbit(rabbit); setIsQrModalOpen(true); }} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-indigo-400"><QrCode size={18} /></button>
                      <button onClick={() => { setViewingRabbit(rabbit); setIsViewModalOpen(true); }} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white"><Eye size={18} /></button>
                      <button onClick={() => { setEditingRabbit(rabbit); setFormData(rabbit); setIsModalOpen(true); }} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white"><Edit2 size={18} /></button>
                      <button onClick={() => handleDeleteRabbit(rabbit.id)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-rose-400"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="litters" className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {litters.map((litter, i) => (
                <motion.div key={litter.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pill-nav p-8 bg-white/5 border-white/10 group relative">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
                      <Heart size={28} />
                    </div>
                    <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", litter.status === 'Pregnant' ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400")}>
                      {litter.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black mb-2">{litter.mother_name}'s Litter</h3>
                  <p className="text-xs font-bold text-white/40 mb-8 uppercase tracking-widest">Partner: {litter.father_name}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-4 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-white/20 uppercase mb-1">{t('kitsBorn')}</p>
                      <p className="text-xl font-black">{litter.kit_count}</p>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-white/20 uppercase mb-1">{t('kitsAlive')}</p>
                      <p className="text-xl font-black text-emerald-400">{litter.alive_kits}</p>
                    </div>
                    <div className="text-center p-4 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-white/20 uppercase mb-1">{t('kitsDead')}</p>
                      <p className="text-xl font-black text-rose-400">{litter.dead_kits}</p>
                    </div>
                  </div>

                  {litter.status === 'Born' && (
                    <button onClick={() => { setSplittingLitter(litter); setIsSplitModalOpen(true); }} className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                      <Layers size={16} /> {t('splitLitter')}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals (Modal logic remains same as previous version but with fixed data flow) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl w-full bg-[#020408] border border-white/10 rounded-[3rem] p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">{editingRabbit ? t('edit') : t('addRabbit')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-white/5 text-white/40"><X size={24} /></button>
              </div>
              <form onSubmit={handleAction} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('rabbitName')}</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('breedSelection')}</label>
                    <select value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                      {BREEDS.map(b => <option key={b} value={b} className="bg-[#020408]">{b}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="auron-button w-full h-16 text-lg mt-8">{t('save')}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;