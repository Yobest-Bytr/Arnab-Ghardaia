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

const Inventory = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [matingHistory, setMatingHistory] = useState<any[]>([]);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingRabbit, setViewingRabbit] = useState<any>(null);

  const [formData, setFormData] = useState({
    rabbit_id: '',
    name: '',
    breed: 'New Zealand White',
    gender: 'Female',
    birth_date: '',
    weight: '',
    status: 'Available',
    health_status: 'Healthy',
    cage_number: '',
    notes: ''
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [rabbitData, matingData, weightData] = await Promise.all([
      storage.get('rabbits', user?.id || ''),
      storage.get('mating_history', user?.id || ''),
      storage.get('weight_logs', user?.id || '')
    ]);
    setRabbits(rabbitData);
    setMatingHistory(matingData);
    setWeightLogs(weightData);
    setLoading(false);
  };

  const handleAddRabbit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const newRabbit = await storage.insert('rabbits', user.id, {
        ...formData,
        weight: parseFloat(formData.weight)
      });
      
      // Log initial weight
      await storage.insert('weight_logs', user.id, {
        rabbit_id: newRabbit.id,
        weight: parseFloat(formData.weight),
        log_date: new Date().toISOString().split('T')[0]
      });

      setRabbits([newRabbit, ...rabbits]);
      setIsModalOpen(false);
      showSuccess(t('addRabbit'));
      fetchData();
    } catch (err) {
      showError("Failed to add rabbit.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this rabbit?")) return;
    await storage.delete('rabbits', user.id, id);
    setRabbits(prev => prev.filter(r => r.id !== id));
    showSuccess("Rabbit removed.");
  };

  const filteredRabbits = rabbits.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.rabbit_id?.toLowerCase().includes(search.toLowerCase())
  );

  const getRabbitWeightData = (rabbitId: string) => {
    return weightLogs
      .filter(log => log.rabbit_id === rabbitId)
      .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())
      .map(log => ({ date: log.log_date, weight: log.weight }));
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-[1600px] mx-auto relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              The <span className="dopamine-text">Stockpile.</span>
            </h1>
            <p className="text-white/40 font-medium mt-1 text-lg">Manage your inventory with neural precision.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input 
                type="text" 
                placeholder="Search Neural ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none focus:border-indigo-500/50 transition-all w-64"
              />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="auron-button h-14 px-8 flex items-center gap-3 text-sm">
              <Plus size={20} /> {t('addRabbit')}
            </button>
          </div>
        </header>

        <Tabs defaultValue="rabbits" className="space-y-12">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-16">
            <TabsTrigger value="rabbits" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-xs tracking-widest">{t('inventory')}</TabsTrigger>
            <TabsTrigger value="mating" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-xs tracking-widest">{t('matingHistory')}</TabsTrigger>
          </TabsList>

          <TabsContent value="rabbits">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredRabbits.map((rabbit) => (
                <motion.div 
                  key={rabbit.id}
                  whileHover={{ y: -5 }}
                  className="pill-nav p-8 bg-white/5 border-white/10 hover:border-indigo-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border",
                        rabbit.gender === 'Female' ? "bg-pink-500/10 text-pink-400 border-pink-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      )}>
                        <Rabbit size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tight">{rabbit.name}</h3>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{rabbit.rabbit_id}</p>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-xl">
                      <QRCodeSVG value={rabbit.rabbit_id} size={40} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{t('breed')}</p>
                      <p className="text-xs font-bold truncate">{rabbit.breed}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{t('weightKg')}</p>
                      <p className="text-xs font-bold">{rabbit.weight} kg</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        rabbit.health_status === 'Healthy' ? "bg-emerald-500" : "bg-rose-500"
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{rabbit.health_status}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setViewingRabbit(rabbit); setIsViewModalOpen(true); }}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(rabbit.id)}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-rose-400 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mating">
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
                  {matingHistory.map((m, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6 font-bold">{m.female_id}</td>
                      <td className="px-8 py-6 font-bold">{m.male_id}</td>
                      <td className="px-8 py-6 text-white/40">{m.mating_date}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase">{m.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Rabbit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-[#020408] border border-white/10 rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">{t('addRabbit')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddRabbit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Neural ID</label>
                    <input type="text" required value={formData.rabbit_id} onChange={(e) => setFormData({...formData, rabbit_id: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" placeholder="e.g., AG-001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('name')}</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('breed')}</label>
                    <select value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                      {BREEDS.map(b => <option key={b} value={b} className="bg-[#020408]">{b}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('gender')}</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                      <option value="Female" className="bg-[#020408]">Female</option>
                      <option value="Male" className="bg-[#020408]">Male</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('weightKg')}</label>
                    <input type="number" step="0.01" required value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('birthDate')}</label>
                    <input type="date" required value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <button type="submit" className="auron-button w-full h-16 text-lg mt-4">{t('save')}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Rabbit Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingRabbit && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl w-full bg-[#020408] border border-white/10 rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                    <Rabbit size={40} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter">{viewingRabbit.name}</h2>
                    <p className="text-white/40 font-bold uppercase tracking-widest">{viewingRabbit.rabbit_id}</p>
                  </div>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="pill-nav p-8 bg-white/5 border-white/10">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3"><TrendingUp className="text-indigo-400" /> {t('weightEvolution')}</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getRabbitWeightData(viewingRabbit.id)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                          <XAxis dataKey="date" hide />
                          <YAxis hide />
                          <Tooltip contentStyle={{ backgroundColor: '#020408', border: '1px solid #ffffff10', borderRadius: '1rem' }} />
                          <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={4} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="pill-nav p-8 bg-white/5 border-white/10">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3"><History className="text-emerald-400" /> {t('matingHistory')}</h3>
                    <div className="space-y-4">
                      {matingHistory.filter(m => m.female_id === viewingRabbit.id || m.male_id === viewingRabbit.id).map((m, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold">{m.mating_date}</p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Partner: {m.female_id === viewingRabbit.id ? m.male_id : m.female_id}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase">{m.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="pill-nav p-8 bg-white/5 border-white/10">
                    <h3 className="text-xl font-black mb-6">{t('details')}</h3>
                    <div className="space-y-4">
                      {[
                        { label: t('breed'), val: viewingRabbit.breed },
                        { label: t('gender'), val: viewingRabbit.gender },
                        { label: t('birthDate'), val: viewingRabbit.birth_date },
                        { label: t('cageNumber'), val: viewingRabbit.cage_number || 'N/A' },
                        { label: t('healthStatus'), val: viewingRabbit.health_status },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-none">
                          <span className="text-xs font-black text-white/20 uppercase tracking-widest">{item.label}</span>
                          <span className="text-sm font-bold">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pill-nav p-8 bg-white flex items-center justify-center">
                    <QRCodeSVG value={viewingRabbit.rabbit_id} size={150} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;