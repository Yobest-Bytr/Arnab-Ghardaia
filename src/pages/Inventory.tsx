import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Plus, Rabbit, Download, X, Loader2, Edit2, Trash2, 
  QrCode, Eye, Info, Calendar, Weight, ShieldCheck, Activity, TrendingUp, Camera,
  Stethoscope, Heart, Layers, Wand2, Sparkles, ChevronRight, ArrowLeft, ShoppingBag,
  Zap, ArrowUpRight, Filter, History, FileText, LayoutGrid, Scale, RefreshCw, CheckCircle2, AlertCircle, Users, Share2, Palette, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import QrScanner from '@/components/QrScanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BREEDS = ['New Zealand White', 'Flemish Giant', 'Netherland Dwarf', 'Rex', 'California', 'Angora', 'Dutch', 'Lionhead'];
const CAGE_TYPES = ['Young', 'Males Only', 'Females Only', 'Mating Pairs'];

const Inventory = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [litters, setLitters] = useState<any[]>([]);
  const [matingHistory, setMatingHistory] = useState<any[]>([]);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLitterModalOpen, setIsLitterModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Active Data States
  const [editingRabbit, setEditingRabbit] = useState<any>(null);
  const [viewingRabbit, setViewingRabbit] = useState<any>(null);
  const [splittingLitter, setSplittingLitter] = useState<any>(null);
  const [activeRabbit, setActiveRabbit] = useState<any>(null);
  
  const initialForm = {
    rabbit_id: '',
    name: '',
    breed: 'New Zealand White',
    gender: 'Female',
    color: '',
    origin: 'Farm Born',
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
    is_public: false,
    image_url: ''
  };

  const initialLitterForm = {
    mother_name: '',
    father_name: '',
    mating_date: new Date().toISOString().split('T')[0],
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
    const [rabbitData, litterData, matingData, weightData] = await Promise.all([
      storage.get('rabbits', user?.id || ''),
      storage.get('litters', user?.id || ''),
      storage.get('mating_history', user?.id || ''),
      storage.get('weight_logs', user?.id || '')
    ]);
    setRabbits(rabbitData);
    setLitters(litterData);
    setMatingHistory(matingData);
    setWeightLogs(weightData);
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
      
      if (editingRabbit) {
        if (editingRabbit.weight !== formData.weight) {
          updatedWeightHistory.push({ weight: weightVal, date: new Date().toISOString(), notes: 'Manual update' });
          // Also log to weight_logs table
          await storage.insert('weight_logs', user.id, { rabbit_id: editingRabbit.id, weight: weightVal, log_date: new Date().toISOString().split('T')[0] });
        }
        await storage.update('rabbits', user.id, editingRabbit.id, { ...formData, weight_history: updatedWeightHistory });
      } else {
        updatedWeightHistory = [{ weight: weightVal, date: new Date().toISOString(), notes: 'Initial weight' }];
        const newRabbit = await storage.insert('rabbits', user.id, { ...formData, weight_history: updatedWeightHistory });
        // Log initial weight
        await storage.insert('weight_logs', user.id, { rabbit_id: newRabbit.id, weight: weightVal, log_date: new Date().toISOString().split('T')[0] });
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
      await storage.insert('weight_logs', user.id, { rabbit_id: activeRabbit.id, weight: weightVal, log_date: new Date().toISOString().split('T')[0] });
      setIsWeightModalOpen(false);
      setQuickWeight('');
      setActiveRabbit(null);
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
      
      // Also record in mating_history if IDs are available
      const mother = rabbits.find(r => r.name === litterFormData.mother_name);
      const father = rabbits.find(r => r.name === litterFormData.father_name);
      if (mother && father) {
        await storage.insert('mating_history', user.id, {
          female_id: mother.id,
          male_id: father.id,
          mating_date: litterFormData.mating_date,
          status: litterFormData.status,
          notes: litterFormData.notes
        });
      }

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
      setSplitData({ males: 0, females: 0 });
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

  const handleQrScan = (decodedText: string) => {
    setIsScannerOpen(false);
    const rabbit = rabbits.find(r => r.rabbit_id === decodedText);
    if (rabbit) {
      setViewingRabbit(rabbit);
      setIsViewModalOpen(true);
      showSuccess(`Neural ID Found: ${rabbit.name}`);
    } else {
      showError("Neural ID not recognized in local database.");
    }
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

  const getRabbitWeightData = (rabbitId: string) => {
    return weightLogs
      .filter(log => log.rabbit_id === rabbitId)
      .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())
      .map(log => ({ date: log.log_date, weight: log.weight }));
  };

  const getMatingPartners = (rabbitId: string) => {
    return matingHistory
      .filter(m => m.female_id === rabbitId || m.male_id === rabbitId)
      .map(m => {
        const partnerId = m.female_id === rabbitId ? m.male_id : m.female_id;
        const partner = rabbits.find(r => r.id === partnerId);
        return { ...m, partner_name: partner?.name || 'Unknown' };
      });
  };

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
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search Neural ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none focus:border-indigo-500/50 transition-all w-64"
              />
            </div>
            <button onClick={() => setIsScannerOpen(true)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-xl">
              <Camera size={24} />
            </button>
            <button onClick={() => { setLitterFormData(initialLitterForm); setIsLitterModalOpen(true); }} className="auron-button h-14 px-8 flex items-center gap-3 text-sm bg-pink-600 hover:bg-pink-500">
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
            <TabsTrigger value="mating_history" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
              <Heart size={18} /> {t('matingHistory')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rabbits" className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredRabbits.map((rabbit, i) => {
                const partners = getMatingPartners(rabbit.id);
                const hasMultipleMatings = partners.length > 1;

                return (
                  <motion.div key={rabbit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative pill-nav p-8 bg-white/5 border-white/10 hover:border-indigo-500/50 transition-all overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-5">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", rabbit.gender === 'Female' ? "bg-pink-500/10 text-pink-400 border-pink-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20")}>
                          <Rabbit size={28} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black tracking-tight">{rabbit.name}</h3>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{rabbit.rabbit_id}</p>
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-xl">
                        <QRCodeSVG value={rabbit.rabbit_id} size={40} />
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

                    {hasMultipleMatings && (
                      <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                        <AlertCircle size={14} className="text-amber-400" />
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">{t('multipleMatings')}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-8">
                      <button onClick={() => { setActiveRabbit(rabbit); setQuickWeight(rabbit.weight); setIsWeightModalOpen(true); }} className="flex-1 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2">
                        <Scale size={14} /> Update Weight
                      </button>
                      <button onClick={() => { setLitterFormData({...initialLitterForm, mother_name: rabbit.name, father_name: rabbit.mating_partner}); setIsLitterModalOpen(true); }} className="flex-1 h-10 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center gap-2">
                        <Heart size={14} /> Mating
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
                );
              })}
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

          <TabsContent value="mating_history">
            <div className="pill-nav bg-white/5 border-white/10 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">{t('mother')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">{t('father')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">{t('matingDate')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {matingHistory.map((m, i) => {
                    const female = rabbits.find(r => r.id === m.female_id);
                    const male = rabbits.find(r => r.id === m.male_id);
                    return (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6 font-bold">{female?.name || 'Unknown'}</td>
                        <td className="px-8 py-6 font-bold">{male?.name || 'Unknown'}</td>
                        <td className="px-8 py-6 text-white/40">{m.mating_date}</td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase">{m.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
            <div className="max-w-lg w-full">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter">Neural <span className="text-indigo-400">Scan.</span></h2>
                  <p className="text-white/40 font-bold text-sm mt-1 uppercase tracking-widest">Align Neural ID Tag to Initialize</p>
                </div>
                <button onClick={() => setIsScannerOpen(false)} className="p-4 rounded-[1.5rem] bg-white/5 text-white/40 hover:text-white transition-all"><X size={28} /></button>
              </div>
              <QrScanner onScanSuccess={handleQrScan} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {isQrModalOpen && activeRabbit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full bg-[#020408] border border-white/10 rounded-[3rem] p-10 text-center">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tight">Neural ID Tag</h2>
                <button onClick={() => setIsQrModalOpen(false)} className="p-2 rounded-xl bg-white/5 text-white/40"><X size={20} /></button>
              </div>
              <div className="bg-white p-8 rounded-[2rem] mb-8 inline-block">
                <QRCodeSVG value={activeRabbit.rabbit_id} size={200} level="H" />
              </div>
              <h3 className="text-2xl font-black mb-1">{activeRabbit.name}</h3>
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-8">{activeRabbit.rabbit_id}</p>
              <button onClick={() => window.print()} className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <Download size={18} /> Print Neural Tag
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingRabbit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full bg-[#020408] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Rabbit size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{viewingRabbit.name}</h2>
                    <p className="text-xs font-black text-white/20 uppercase tracking-widest">{viewingRabbit.rabbit_id}</p>
                  </div>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="p-4 rounded-2xl bg-white/5 text-white/40"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
                <Tabs defaultValue="info" className="space-y-8">
                  <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
                    <TabsTrigger value="info" className="rounded-xl px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">{t('basicInfo')}</TabsTrigger>
                    <TabsTrigger value="medical" className="rounded-xl px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">{t('medical')}</TabsTrigger>
                    <TabsTrigger value="lineage" className="rounded-xl px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">{t('lineage')}</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">{t('history')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-8">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Breed</p>
                        <p className="text-lg font-bold">{viewingRabbit.breed}</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Gender</p>
                        <p className="text-lg font-bold">{viewingRabbit.gender}</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Color</p>
                        <p className="text-lg font-bold">{viewingRabbit.color || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Notes</p>
                      <p className="text-white/60 leading-relaxed">{viewingRabbit.notes || 'No additional notes.'}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="medical" className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-3 mb-4">
                          <ShieldCheck className="text-emerald-400" />
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Vaccination Status</p>
                        </div>
                        <p className="text-2xl font-black">{viewingRabbit.vaccination_status}</p>
                      </div>
                      <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                        <div className="flex items-center gap-3 mb-4">
                          <Stethoscope className="text-indigo-400" />
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Health Status</p>
                        </div>
                        <p className="text-2xl font-black">{viewingRabbit.health_status}</p>
                      </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Medical History</p>
                      <p className="text-white/60 leading-relaxed">{viewingRabbit.medical_history || 'No medical records found.'}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="lineage" className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="p-8 rounded-3xl bg-pink-500/5 border border-pink-500/10">
                        <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-4">Mother (Dam)</p>
                        <p className="text-2xl font-black">{viewingRabbit.mother_id || 'Unknown'}</p>
                      </div>
                      <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Father (Sire)</p>
                        <p className="text-2xl font-black">{viewingRabbit.father_id || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Mating Partner</p>
                      <p className="text-2xl font-black">{viewingRabbit.mating_partner || 'None Assigned'}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-8">
                    <h3 className="text-xl font-black flex items-center gap-3"><TrendingUp className="text-indigo-400" /> Weight Velocity</h3>
                    <div className="h-64 w-full bg-white/5 rounded-3xl p-6 border border-white/10">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getRabbitWeightData(viewingRabbit.id)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                          <XAxis dataKey="date" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{ backgroundColor: '#020408', border: '1px solid #ffffff10', borderRadius: '1rem' }} />
                          <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={4} dot={{ fill: '#6366f1', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Weight Update Modal */}
      <AnimatePresence>
        {isWeightModalOpen && activeRabbit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full bg-[#020408] border border-white/10 rounded-[3rem] p-10">
              <h2 className="text-2xl font-black mb-8 tracking-tight">Update Weight</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">New Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    autoFocus
                    value={quickWeight} 
                    onChange={(e) => setQuickWeight(e.target.value)} 
                    className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" 
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => { setIsWeightModalOpen(false); setActiveRabbit(null); }} className="flex-1 h-14 rounded-2xl bg-white/5 text-white/40 font-black text-xs uppercase tracking-widest">Cancel</button>
                  <button onClick={handleQuickWeightUpdate} className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest">Update</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Split Litter Modal */}
      <AnimatePresence>
        {isSplitModalOpen && splittingLitter && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-[#020408] border border-white/10 rounded-[3rem] p-10">
              <h2 className="text-3xl font-black mb-8 tracking-tight">{t('splitLitter')}</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Males to Create</label>
                  <input type="number" value={splitData.males} onChange={(e) => setSplitData({...splitData, males: parseInt(e.target.value) || 0})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Females to Create</label>
                  <input type="number" value={splitData.females} onChange={(e) => setSplitData({...splitData, females: parseInt(e.target.value) || 0})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => { setIsSplitModalOpen(false); setSplittingLitter(null); }} className="flex-1 h-14 rounded-2xl bg-white/5 text-white/40 font-black text-xs uppercase tracking-widest">Cancel</button>
                  <button onClick={handleSplitLitter} className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest">Confirm Split</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Rabbit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl w-full bg-[#020408] border border-white/10 rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">{editingRabbit ? t('edit') : t('addRabbit')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-white/5 text-white/40"><X size={24} /></button>
              </div>
              <form onSubmit={handleAction} className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Neural ID</label>
                    <input type="text" required value={formData.rabbit_id} onChange={(e) => setFormData({...formData, rabbit_id: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
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

                <div className="grid md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('genderSelection')}</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                      <option value="Female" className="bg-[#020408]">Female</option>
                      <option value="Male" className="bg-[#020408]">Male</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('weightKg')}</label>
                    <input type="number" step="0.1" required value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('birthDate')}</label>
                    <input type="date" required value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('salePrice')} (DA)</label>
                    <input type="number" value={formData.price_dzd} onChange={(e) => setFormData({...formData, price_dzd: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Color / Markings</label>
                    <div className="relative">
                      <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input type="text" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-full h-14 pl-12 pr-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" placeholder="e.g., Broken Black" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Source / Origin</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input type="text" value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} className="w-full h-14 pl-12 pr-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" placeholder="e.g., Purchased from Ghardaia" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('status')}</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                      <option value="Available" className="bg-[#020408]">Available</option>
                      <option value="Sold" className="bg-[#020408]">Sold</option>
                      <option value="Died" className="bg-[#020408]">Died</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('cageNumber')}</label>
                    <input type="text" value={formData.cage_number} onChange={(e) => setFormData({...formData, cage_number: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('cageType')}</label>
                    <select value={formData.cage_type} onChange={(e) => setFormData({...formData, cage_type: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                      {CAGE_TYPES.map(c => <option key={c} value={c} className="bg-[#020408]">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('matingPartner')}</label>
                    <input type="text" value={formData.mating_partner} onChange={(e) => setFormData({...formData, mating_partner: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('motherId')}</label>
                    <input type="text" value={formData.mother_id} onChange={(e) => setFormData({...formData, mother_id: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('fatherId')}</label>
                    <input type="text" value={formData.father_id} onChange={(e) => setFormData({...formData, father_id: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('vaccination')}</label>
                    <select value={formData.vaccination_status} onChange={(e) => setFormData({...formData, vaccination_status: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                      <option value="Not Vaccinated" className="bg-[#020408]">Not Vaccinated</option>
                      <option value="Vaccinated" className="bg-[#020408]">Vaccinated</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('healthStatus')}</label>
                    <select value={formData.health_status} onChange={(e) => setFormData({...formData, health_status: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                      <option value="Healthy" className="bg-[#020408]">Healthy</option>
                      <option value="Sick" className="bg-[#020408]">Sick</option>
                      <option value="Recovering" className="bg-[#020408]">Recovering</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('medicalNotes')}</label>
                  <textarea value={formData.medical_history} onChange={(e) => setFormData({...formData, medical_history: e.target.value})} className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl font-medium min-h-[100px] outline-none" />
                </div>

                <div className="flex items-center gap-4 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                  <input 
                    type="checkbox" 
                    id="is_public"
                    checked={formData.is_public} 
                    onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                    className="w-6 h-6 rounded-lg bg-white/5 border-white/10 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <label htmlFor="is_public" className="text-sm font-black block">{t('publishToShop')}</label>
                    <p className="text-[10px] text-white/40 font-medium">{t('publishDesc')}</p>
                  </div>
                </div>

                <button type="submit" className="auron-button w-full h-16 text-lg mt-8">{t('save')}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Litter Modal */}
      <AnimatePresence>
        {isLitterModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl w-full bg-[#020408] border border-white/10 rounded-[3rem] p-10">
              <h2 className="text-3xl font-black mb-8 tracking-tight">{t('recordMating')}</h2>
              <form onSubmit={handleLitterAction} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('mother')}</label>
                    <input type="text" required value={litterFormData.mother_name} onChange={(e) => setLitterFormData({...litterFormData, mother_name: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('father')}</label>
                    <input type="text" required value={litterFormData.father_name} onChange={(e) => setLitterFormData({...litterFormData, father_name: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('matingDate')}</label>
                    <input type="date" required value={litterFormData.mating_date} onChange={(e) => setLitterFormData({...litterFormData, mating_date: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('actualBirthDate')}</label>
                    <input type="date" value={litterFormData.actual_birth_date} onChange={(e) => setLitterFormData({...litterFormData, actual_birth_date: e.target.value, status: 'Born'})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('totalKits')}</label>
                    <input type="number" value={litterFormData.kit_count} onChange={(e) => setLitterFormData({...litterFormData, kit_count: parseInt(e.target.value) || 0})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('kitsAlive')}</label>
                    <input type="number" value={litterFormData.alive_kits} onChange={(e) => setLitterFormData({...litterFormData, alive_kits: parseInt(e.target.value) || 0})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('kitsDead')}</label>
                    <input type="number" value={litterFormData.dead_kits} onChange={(e) => setLitterFormData({...litterFormData, dead_kits: parseInt(e.target.value) || 0})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsLitterModalOpen(false)} className="flex-1 h-16 rounded-2xl bg-white/5 text-white/40 font-black text-xs uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="flex-1 auron-button h-16 text-lg">{t('recordMating')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;