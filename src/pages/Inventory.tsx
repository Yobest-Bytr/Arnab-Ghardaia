import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Plus, Rabbit, Download, X, Loader2, Edit2, Trash2, 
  QrCode, Eye, Info, Calendar, Weight, ShieldCheck, Activity, TrendingUp, Camera,
  Stethoscope, Heart, Layers, Wand2, Sparkles, ChevronRight, ArrowLeft, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { grokChat } from '@/lib/puter';

const BREEDS = ['New Zealand White', 'Flemish Giant', 'Netherland Dwarf', 'Rex', 'California', 'Angora', 'Dutch', 'Lionhead'];

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
  const [isGenerating, setIsGenerating] = useState(false);
  
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
  const [suggestions, setSuggestions] = useState<{ field: string, list: any[] }>({ field: '', list: [] });

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

  useEffect(() => {
    let scanner: any = null;
    if (isScannerOpen) {
      const timer = setTimeout(() => {
        const element = document.getElementById("reader");
        if (element) {
          scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
          scanner.render((decodedText: string) => {
            setSearch(decodedText);
            setIsScannerOpen(false);
            scanner.clear();
          }, (err: any) => {});
        }
      }, 100);
      return () => {
        clearTimeout(timer);
        if (scanner) scanner.clear();
      };
    }
  }, [isScannerOpen]);

  const fetchRabbits = async () => {
    setLoading(true);
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
    setLoading(false);
  };

  const showInstantSuggestions = (field: string) => {
    let list: any[] = [];
    const val = formData[field as keyof typeof formData] as string;

    if (field === 'breed') {
      list = BREEDS.filter(b => b.toLowerCase().includes(val.toLowerCase()));
      if (list.length === 0 && val.length > 0) list = [val]; // Allow custom breed
    } else if (field === 'cage_number') {
      const existingCages = Array.from(new Set(rabbits.map(r => r.cage_number).filter(Boolean)));
      list = existingCages.filter(c => c.includes(val));
    } else if (field === 'mother_id' || field === 'father_id') {
      const gender = field === 'mother_id' ? 'Female' : 'Male';
      list = rabbits.filter(r => 
        r.gender === gender && 
        (val === '' || r.name?.toLowerCase().includes(val.toLowerCase()) || r.rabbit_id?.toLowerCase().includes(val.toLowerCase()))
      );
    }
    
    setSuggestions({ field, list: list.slice(0, 6) });
  };

  const selectSuggestion = (val: any, field: string) => {
    const finalVal = typeof val === 'object' ? (val.name || val.rabbit_id) : val;
    setFormData(prev => ({ ...prev, [field]: finalVal }));
    setSuggestions({ field: '', list: [] });
  };

  const handleNeuralSuggest = async (field: 'notes' | 'medical_history') => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const prompt = `You are a professional rabbit farm veterinarian. Write a concise, factual ${field.replace('_', ' ')} for a rabbit.
      DETAILS:
      Name: ${formData.name || 'Unnamed'}
      Breed: ${formData.breed}
      Health: ${formData.health_status}
      Weight: ${formData.weight}kg
      
      RULES:
      1. DO NOT use placeholders like "[To be provided]" or "[Name]".
      2. Use the actual data provided above.
      3. Keep it under 3 sentences.
      4. Be professional and clinical.`;
      
      const response = await grokChat(prompt, { userId: user.id, stream: false });
      setFormData(prev => ({ ...prev, [field]: response }));
      showSuccess("Neural suggestion applied.");
    } catch (err) {
      showError("Neural link failed.");
    } finally {
      setIsGenerating(false);
    }
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

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const currentWeight = parseFloat(formData.weight) || 0;
    const weightEntry = { 
      date: new Date().toLocaleDateString(), 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      weight: currentWeight 
    };
    const updatedHistory = editingRabbit ? [...(editingRabbit.weight_history || []), weightEntry].slice(-20) : [weightEntry];
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
                  <button onClick={() => { setViewingRabbit(rabbit); setIsViewModalOpen(true); }} className="p-2 rounded-lg bg-slate-50 text-blue-600 hover:bg-blue-50 transition-colors"><Eye size={16} /></button>
                  <button onClick={() => { setEditingRabbit(rabbit); setFormData(rabbit); setIsModalOpen(true); }} className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => { if(confirm('Delete?')) storage.delete('rabbits', user?.id || '', rabbit.id).then(fetchRabbits); }} className="p-2 rounded-lg bg-slate-50 text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button>
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-600">{rabbit.price_dzd || '0'} DA</span>
                  {rabbit.is_public && <ShoppingBag size={14} className="text-blue-500" title="Listed in Boutique" />}
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                  getStatusColor(rabbit.status)
                )}>{t(rabbit.status.toLowerCase())}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden relative">
              <button onClick={() => setIsScannerOpen(false)} className="absolute top-6 right-6 z-10 p-2 bg-black/10 rounded-full text-black"><X size={24} /></button>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-black mb-2">Scan Cage QR</h3>
                <p className="text-slate-400 font-medium mb-8">Point your camera at the cage label.</p>
                <div id="reader" className="w-full rounded-2xl overflow-hidden border-4 border-emerald-500" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* View Rabbit Modal - Full Profile */}
      <AnimatePresence>
        {isViewModalOpen && viewingRabbit && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="w-full h-full sm:h-auto sm:max-w-4xl bg-white dark:bg-slate-900 sm:rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-emerald-600 -z-10" />
              <div className="p-6 flex items-center justify-between">
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"><ArrowLeft size={24} /></button>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingRabbit(viewingRabbit); setFormData(viewingRabbit); setIsViewModalOpen(false); setIsModalOpen(true); }} className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"><Edit2 size={20} /></button>
                  <button onClick={() => setIsViewModalOpen(false)} className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"><X size={24} /></button>
                </div>
              </div>

              <div className="px-8 pb-10 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white shadow-2xl border-4 border-white flex items-center justify-center text-emerald-600 shrink-0 relative">
                    <Rabbit size={64} />
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white p-2 rounded-xl shadow-lg">
                      <QRCodeSVG value={viewingRabbit.rabbit_id} size={48} />
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-black tracking-tight">{viewingRabbit.name}</h2>
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusColor(viewingRabbit.status))}>
                        {t(viewingRabbit.status.toLowerCase())}
                      </span>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">{viewingRabbit.breed} • {viewingRabbit.rabbit_id}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="farm-card bg-slate-50 dark:bg-slate-800/50 border-none">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Weight size={20} /></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Weight</p>
                    </div>
                    <p className="text-3xl font-black">{viewingRabbit.weight} kg</p>
                  </div>
                  <div className="farm-card bg-slate-50 dark:bg-slate-800/50 border-none">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Calendar size={20} /></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</p>
                    </div>
                    <p className="text-3xl font-black">{calculateAge(viewingRabbit.birth_date)}</p>
                  </div>
                  <div className="farm-card bg-slate-50 dark:bg-slate-800/50 border-none">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center"><Heart size={20} /></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</p>
                    </div>
                    <p className="text-3xl font-black">{viewingRabbit.gender}</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2"><TrendingUp className="text-emerald-600" size={20} /> Weight Velocity</h3>
                      <div className="h-48 w-full bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-4">
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
                            <Tooltip 
                              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                            />
                            <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Layers className="text-blue-600" size={20} /> {t('lineage')}</h3>
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center"><Heart size={14} /></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{t('mother')}</span>
                          </div>
                          <span className="text-sm font-black">{viewingRabbit.mother_id || 'Unknown'}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Heart size={14} /></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{t('father')}</span>
                          </div>
                          <span className="text-sm font-black">{viewingRabbit.father_id || 'Unknown'}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Stethoscope className="text-rose-500" size={20} /> Health Report</h3>
                      <div className="farm-card border-2 border-slate-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vaccination Status</span>
                          <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase", viewingRabbit.vaccination_status === 'Vaccinated' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400')}>
                            {viewingRabbit.vaccination_status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-2 uppercase text-[10px] tracking-widest">Medical History</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                          {viewingRabbit.medical_history || 'No medical incidents recorded.'}
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Info className="text-amber-500" size={20} /> {t('notes')}</h3>
                      <div className="p-6 rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                        <p className="text-sm text-amber-800 dark:text-amber-400 font-medium leading-relaxed italic">
                          "{viewingRabbit.notes || 'No additional notes.'}"
                        </p>
                      </div>
                    </section>
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
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 100 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 100 }} 
              className="w-full h-full sm:h-auto sm:max-w-2xl bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl relative flex flex-col"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h2 className="text-2xl font-black tracking-tight">{editingRabbit ? t('edit') : t('addRabbit')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400"><X size={24} /></button>
              </div>

              <form onSubmit={handleAction} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Breed</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.breed} 
                      onFocus={() => showInstantSuggestions('breed')}
                      onChange={(e) => { setFormData({...formData, breed: e.target.value}); showInstantSuggestions('breed'); }} 
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                    />
                    {suggestions.field === 'breed' && suggestions.list.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                        {suggestions.list.map(b => (
                          <button key={b} type="button" onClick={() => selectSuggestion(b, 'breed')} className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-bold transition-colors flex items-center justify-between">
                            {b} <ChevronRight size={14} className="text-slate-300" />
                          </button>
                        ))}
                      </div>
                    )}
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
                  <div className="space-y-2 relative">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('cageNumber')}</label>
                    <input 
                      type="text" 
                      value={formData.cage_number} 
                      onFocus={() => showInstantSuggestions('cage_number')}
                      onChange={(e) => { setFormData({...formData, cage_number: e.target.value}); showInstantSuggestions('cage_number'); }} 
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                    />
                    {suggestions.field === 'cage_number' && suggestions.list.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                        {suggestions.list.map(c => (
                          <button key={c} type="button" onClick={() => selectSuggestion(c, 'cage_number')} className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-bold transition-colors flex items-center justify-between">
                            Cage {c} <ChevronRight size={14} className="text-slate-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="text-blue-600" size={20} />
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{t('publishToShop')}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('publishDesc')}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, is_public: !formData.is_public})}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-colors",
                        formData.is_public ? "bg-emerald-500" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        formData.is_public ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                  {formData.is_public && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('salePrice')} (DA)</label>
                      <input type="number" required value={formData.price_dzd} onChange={(e) => setFormData({...formData, price_dzd: e.target.value})} className="w-full h-12 px-6 bg-white dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('mother')}</label>
                    <input 
                      type="text" 
                      value={formData.mother_id} 
                      onFocus={() => showInstantSuggestions('mother_id')}
                      onChange={(e) => { setFormData({...formData, mother_id: e.target.value}); showInstantSuggestions('mother_id'); }} 
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                    />
                    {suggestions.field === 'mother_id' && suggestions.list.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                        {suggestions.list.map(r => (
                          <button key={r.id} type="button" onClick={() => selectSuggestion(r, 'mother_id')} className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-bold transition-colors flex items-center justify-between">
                            {r.name || r.rabbit_id} <ChevronRight size={14} className="text-slate-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('father')}</label>
                    <input 
                      type="text" 
                      value={formData.father_id} 
                      onFocus={() => showInstantSuggestions('father_id')}
                      onChange={(e) => { setFormData({...formData, father_id: e.target.value}); showInstantSuggestions('father_id'); }} 
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                    />
                    {suggestions.field === 'father_id' && suggestions.list.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                        {suggestions.list.map(r => (
                          <button key={r.id} type="button" onClick={() => selectSuggestion(r, 'father_id')} className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-bold transition-colors flex items-center justify-between">
                            {r.name || r.rabbit_id} <ChevronRight size={14} className="text-slate-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('medicalHistory')}</label>
                    <button type="button" onClick={() => handleNeuralSuggest('medical_history')} disabled={isGenerating} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors">
                      {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} Neural Suggest
                    </button>
                  </div>
                  <textarea value={formData.medical_history} onChange={(e) => setFormData({...formData, medical_history: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 min-h-[100px]" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('notes')}</label>
                    <button type="button" onClick={() => handleNeuralSuggest('notes')} disabled={isGenerating} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors">
                      {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Neural Suggest
                    </button>
                  </div>
                  <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 min-h-[100px]" />
                </div>
              </form>

              <div className="p-6 border-t border-slate-50 dark:border-slate-800 shrink-0">
                <button onClick={handleAction} className="farm-button w-full h-16 text-lg">{t('save')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;