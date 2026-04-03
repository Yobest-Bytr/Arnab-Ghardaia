import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Plus, Rabbit, Download, X, Loader2, Edit2, Trash2, 
  QrCode, Eye, Info, Calendar, Weight, ShieldCheck, Activity, TrendingUp, Camera,
  Stethoscope, Heart, Layers, Wand2, Sparkles, ChevronRight, ArrowLeft, ShoppingBag,
  Zap, ArrowUpRight, Filter, History, FileText, LayoutGrid, Scale, RefreshCw, CheckCircle2, AlertCircle, Users, Share2, Palette, MapPin, Clock
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');
  
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
  const [editingLitter, setEditingLitter] = useState<any>(null);
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
  const [weightLogDate, setWeightLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitData, setSplitData] = useState({ males: 0, females: 0 });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rabbitData, litterData, matingData, weightData] = await Promise.all([
        storage.get('rabbits', user?.id || ''),
        storage.get('litters', user?.id || ''),
        storage.get('mating_history', user?.id || ''),
        storage.get('weight_logs', user?.id || '')
      ]);
      setRabbits(rabbitData || []);
      setLitters(litterData || []);
      setMatingHistory(matingData || []);
      setWeightLogs(weightData || []);
    } finally {
      setLoading(false);
    }
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
    setIsProcessing(true);
    setProcessingText(t('waitingSaving'));
    try {
      const weightVal = parseFloat(formData.weight) || 0;
      const priceVal = parseFloat(formData.price_dzd) || 0;
      const now = new Date().toISOString();
      let updatedWeightHistory = Array.isArray(formData.weight_history) ? [...formData.weight_history] : [];
      
      const payload = {
        ...formData,
        weight: weightVal,
        price_dzd: priceVal,
        birth_date: formData.birth_date || null,
        rabbit_id: formData.rabbit_id || generateAutoId(formData.gender)
      };

      if (editingRabbit) {
        if (editingRabbit.weight !== weightVal) {
          updatedWeightHistory.push({ weight: weightVal, date: now, notes: 'Manual update' });
          await storage.insert('weight_logs', user.id, { rabbit_id: editingRabbit.id, weight: weightVal, log_date: now });
        }
        await storage.update('rabbits', user.id, editingRabbit.id, { ...payload, weight_history: updatedWeightHistory });
      } else {
        updatedWeightHistory = [{ weight: weightVal, date: now, notes: 'Initial weight' }];
        const newRabbit = await storage.insert('rabbits', user.id, { ...payload, weight_history: updatedWeightHistory });
        await storage.insert('weight_logs', user.id, { rabbit_id: newRabbit.id, weight: weightVal, log_date: now });
      }
      
      setIsModalOpen(false);
      setEditingRabbit(null);
      setFormData(initialForm);
      await fetchData();
      showSuccess(t('save'));
    } catch (err) {
      showError(t('operationFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickWeightUpdate = async () => {
    if (!user || !activeRabbit || !quickWeight) return;
    setIsProcessing(true);
    setProcessingText(t('waitingUpdatingWeight'));
    try {
      const weightVal = parseFloat(quickWeight) || 0;
      const logTimestamp = new Date(weightLogDate).toISOString();
      const updatedHistory = Array.isArray(activeRabbit.weight_history) ? [...activeRabbit.weight_history] : [];
      updatedHistory.push({ weight: weightVal, date: logTimestamp, notes: 'Quick update' });
      
      await storage.update('rabbits', user.id, activeRabbit.id, { weight: weightVal, weight_history: updatedHistory });
      await storage.insert('weight_logs', user.id, { rabbit_id: activeRabbit.id, weight: weightVal, log_date: logTimestamp });
      
      setIsWeightModalOpen(false);
      setQuickWeight('');
      setActiveRabbit(null);
      await fetchData();
      showSuccess(t('weightUpdated'));
    } catch (err) {
      showError(t('updateFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLitterAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsProcessing(true);
    setProcessingText(t('waitingSaving'));
    try {
      const payload = {
        ...litterFormData,
        kit_count: parseInt(litterFormData.kit_count.toString()) || 0,
        alive_kits: parseInt(litterFormData.alive_kits.toString()) || 0,
        dead_kits: parseInt(litterFormData.dead_kits.toString()) || 0,
        actual_birth_date: litterFormData.actual_birth_date || null
      };

      if (editingLitter) {
        await storage.update('litters', user.id, editingLitter.id, payload);
      } else {
        await storage.insert('litters', user.id, payload);
        const mother = rabbits.find(r => r.name === payload.mother_name || r.rabbit_id === payload.mother_name);
        const father = rabbits.find(r => r.name === payload.father_name || r.rabbit_id === payload.father_name);
        if (mother && father) {
          await storage.insert('mating_history', user.id, {
            female_id: mother.id,
            male_id: father.id,
            mating_date: payload.mating_date,
            status: payload.status,
            notes: payload.notes
          });
        }
      }

      setIsLitterModalOpen(false);
      setEditingLitter(null);
      setLitterFormData(initialLitterForm);
      await fetchData();
      showSuccess(t('save'));
    } catch (err) {
      showError(t('operationFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitLitter = async () => {
    if (!user || !splittingLitter) return;
    setIsProcessing(true);
    setProcessingText(t('waitingAddingKits'));
    try {
      const totalToSplit = splitData.males + splitData.females;
      if (totalToSplit > splittingLitter.alive_kits) {
        showError(t('splitExceedsKits'));
        return;
      }

      const birthDate = splittingLitter.actual_birth_date || splittingLitter.expected_birth_date || new Date().toISOString().split('T')[0];

      for (let i = 0; i < splitData.males; i++) {
        await storage.insert('rabbits', user.id, {
          ...initialForm,
          rabbit_id: generateAutoId('Male'),
          name: `${t('sonOf')} ${splittingLitter.mother_name}`,
          gender: 'Male',
          birth_date: birthDate,
          mother_id: splittingLitter.mother_name,
          father_id: splittingLitter.father_name,
          weight: 0.5,
          weight_history: [{ weight: 0.5, date: new Date().toISOString(), notes: 'Initial split weight' }]
        });
      }

      for (let i = 0; i < splitData.females; i++) {
        await storage.insert('rabbits', user.id, {
          ...initialForm,
          rabbit_id: generateAutoId('Female'),
          name: `${t('daughterOf')} ${splittingLitter.mother_name}`,
          gender: 'Female',
          birth_date: birthDate,
          mother_id: splittingLitter.mother_name,
          father_id: splittingLitter.father_name,
          weight: 0.5,
          weight_history: [{ weight: 0.5, date: new Date().toISOString(), notes: 'Initial split weight' }]
        });
      }

      await storage.update('litters', user.id, splittingLitter.id, { status: 'Weaned' });
      setIsSplitModalOpen(false);
      setSplittingLitter(null);
      setSplitData({ males: 0, females: 0 });
      await fetchData();
      showSuccess(t('addKitsToInventory'));
    } catch (err) {
      showError(t('splitFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRabbit = async (id: string) => {
    if (!user || !confirm(t('delete') + "?")) return;
    await storage.delete('rabbits', user.id, id);
    setRabbits(prev => prev.filter(r => r.id !== id));
    showSuccess(t('rabbitRemoved'));
  };

  const handleQrScan = (decodedText: string) => {
    setIsScannerOpen(false);
    const rabbit = rabbits.find(r => r.rabbit_id === decodedText);
    if (rabbit) {
      setViewingRabbit(rabbit);
      setIsViewModalOpen(true);
      showSuccess(`${t('neuralIdFound')} ${rabbit.name}`);
    } else {
      showError(t('neuralIdNotFound'));
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return t('notAvailable');
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
      .map(log => ({ 
        date: new Date(log.log_date).toLocaleDateString(), 
        weight: log.weight 
      }));
  };

  const getMatingPartners = (rabbitId: string) => {
    return matingHistory
      .filter(m => m.female_id === rabbitId || m.male_id === rabbitId)
      .map(m => {
        const partnerId = m.female_id === rabbitId ? m.male_id : m.female_id;
        const partner = rabbits.find(r => r.id === partnerId);
        return { ...m, partner_name: partner?.name || t('unknown') };
      });
  };

  const mothers = useMemo(() => rabbits.filter(r => r.gender === 'Female'), [rabbits]);
  const fathers = useMemo(() => rabbits.filter(r => r.gender === 'Male'), [rabbits]);

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(79,70,229,0.3)]" />
            <p className="text-xl font-black tracking-widest uppercase dopamine-text animate-pulse text-center px-6">{processingText || t('waitingProcessing')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-32 pb-20 px-4 md:px-6 max-w-[1600px] mx-auto relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
              <Zap size={14} className="fill-current" />
              <span>{t('neuralInventoryActive')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-4">
              The <span className="dopamine-text">{t('theStockpile')}</span>
            </h1>
          </motion.div>
          
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div className="relative group flex-1 md:flex-none">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input type="text" placeholder={t('searchNeuralId')} value={search} onChange={(e) => setSearch(e.target.value)} className="h-14 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none focus:border-indigo-500/50 transition-all w-full md:w-64" />
            </div>
            <button onClick={() => setIsScannerOpen(true)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-xl"><Camera size={24} /></button>
            <button onClick={() => { setLitterFormData(initialLitterForm); setEditingLitter(null); setIsLitterModalOpen(true); }} className="flex-1 md:flex-none auron-button h-14 px-6 md:px-8 flex items-center justify-center gap-3 text-xs md:text-sm bg-pink-600 hover:bg-pink-500"><Heart size={20} /> {t('recordMating')}</button>
            <button onClick={() => { setEditingRabbit(null); setFormData(initialForm); setIsModalOpen(true); }} className="flex-1 md:flex-none auron-button h-14 px-6 md:px-8 flex items-center justify-center gap-3 text-xs md:text-sm"><Plus size={20} /> {t('addRabbit')}</button>
          </div>
        </header>

        <Tabs defaultValue="rabbits" className="space-y-8 md:space-y-12">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 md:h-16 flex overflow-x-auto no-scrollbar">
            <TabsTrigger value="rabbits" className="flex-1 md:flex-none rounded-xl px-6 md:px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-2"><Rabbit size={18} /> {t('inventory')}</TabsTrigger>
            <TabsTrigger value="litters" className="flex-1 md:flex-none rounded-xl px-6 md:px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-2"><Users size={18} /> {t('litters')}</TabsTrigger>
            <TabsTrigger value="mating_history" className="flex-1 md:flex-none rounded-xl px-6 md:px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-2"><Heart size={18} /> {t('matingHistory')}</TabsTrigger>
          </TabsList>

          <TabsContent value="rabbits" className="space-y-8 md:space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredRabbits.map((rabbit, i) => (
                <motion.div key={rabbit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative pill-nav p-6 md:p-8 bg-white/5 border-white/10 hover:border-indigo-500/50 transition-all overflow-hidden">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="flex items-center gap-4 md:gap-5">
                      <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border", rabbit.gender === 'Female' ? "bg-pink-500/10 text-pink-400 border-pink-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20")}><Rabbit size={24} /></div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-black tracking-tight truncate max-w-[120px]">{rabbit.name}</h3>
                        <p className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{rabbit.rabbit_id}</p>
                      </div>
                    </div>
                    <div className="bg-white p-1.5 md:p-2 rounded-xl shrink-0"><QRCodeSVG value={rabbit.rabbit_id} size={32} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5"><p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{t('age')}</p><p className="text-xs md:text-sm font-bold">{calculateAge(rabbit.birth_date)}</p></div>
                    <div className="p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5"><p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{t('weightKg')}</p><p className="text-xs md:text-sm font-bold">{rabbit.weight} kg</p></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
                    <button onClick={() => { setActiveRabbit(rabbit); setQuickWeight(rabbit.weight); setWeightLogDate(new Date().toISOString().split('T')[0]); setIsWeightModalOpen(true); }} className="flex-1 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"><Scale size={14} /> {t('updateWeight')}</button>
                    <button onClick={() => { setLitterFormData({...initialLitterForm, mother_name: rabbit.name, father_name: rabbit.mating_partner}); setIsLitterModalOpen(true); }} className="flex-1 h-10 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center gap-2"><Heart size={14} /> {t('mating')}</button>
                  </div>
                  <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-white/5">
                    <span className="text-lg md:text-xl font-black text-indigo-400">{rabbit.price_dzd || '0'} DA</span>
                    <div className="flex gap-1 md:gap-2">
                      <button onClick={() => { setActiveRabbit(rabbit); setIsQrModalOpen(true); }} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-indigo-400"><QrCode size={16} /></button>
                      <button onClick={() => { setViewingRabbit(rabbit); setIsViewModalOpen(true); }} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white"><Eye size={16} /></button>
                      <button onClick={() => { setEditingRabbit(rabbit); setFormData(rabbit); setIsModalOpen(true); }} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteRabbit(rabbit.id)} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-rose-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="litters" className="space-y-8 md:space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {litters.map((litter, i) => (
                <motion.div key={litter.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pill-nav p-6 md:p-8 bg-white/5 border-white/10 group relative">
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20"><Heart size={24} /></div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingLitter(litter); setLitterFormData(litter); setIsLitterModalOpen(true); }} className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"><Edit2 size={16} /></button>
                      <span className={cn("px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest", litter.status === 'Pregnant' ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400")}>{litter.status}</span>
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black mb-1 md:mb-2 truncate">{litter.mother_name}{t('litterSuffix')}</h3>
                  <p className="text-[10px] md:text-xs font-bold text-white/40 mb-6 md:mb-8 uppercase tracking-widest truncate">{t('father')}: {litter.father_name}</p>
                  <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="text-center p-3 md:p-4 bg-black/40 rounded-2xl border border-white/5"><p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase mb-1">{t('kitsBorn')}</p><p className="text-lg md:text-xl font-black">{litter.kit_count}</p></div>
                    <div className="text-center p-3 md:p-4 bg-black/40 rounded-2xl border border-white/5"><p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase mb-1">{t('kitsAlive')}</p><p className="text-lg md:text-xl font-black text-emerald-400">{litter.alive_kits}</p></div>
                    <div className="text-center p-3 md:p-4 bg-black/40 rounded-2xl border border-white/5"><p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase mb-1">{t('kitsDead')}</p><p className="text-lg md:text-xl font-black text-rose-400">{litter.dead_kits}</p></div>
                  </div>
                  {(litter.status === 'Born' || litter.status === 'Weaned') && (
                    <button onClick={() => { setSplittingLitter(litter); setSplitData({ males: Math.floor(litter.alive_kits/2), females: Math.ceil(litter.alive_kits/2) }); setIsSplitModalOpen(true); }} className="w-full h-12 md:h-14 rounded-2xl bg-indigo-600 text-white font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"><Plus size={16} /> {t('addKitsToInventory')}</button>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>
          {/* ... rest of the tabs ... */}
        </Tabs>
      </main>
      {/* ... modals ... */}
    </div>
  );
};

export default Inventory;