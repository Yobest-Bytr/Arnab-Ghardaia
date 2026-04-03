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
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingRabbit, setViewingRabbit] = useState<any>(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [rabbitData, matingData] = await Promise.all([
      storage.get('rabbits', user?.id || ''),
      storage.get('mating_history', user?.id || '')
    ]);
    setRabbits(rabbitData);
    setMatingHistory(matingData);
    setLoading(false);
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
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              The <span className="dopamine-text">Stockpile.</span>
            </h1>
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
                <motion.div key={rabbit.id} className="pill-nav p-8 bg-white/5 border-white/10 hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center gap-5 mb-8">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", rabbit.gender === 'Female' ? "bg-pink-500/10 text-pink-400 border-pink-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20")}>
                      <Rabbit size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{rabbit.name}</h3>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{rabbit.rabbit_id}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-white/5">
                    <span className="text-xl font-black text-indigo-400">{rabbit.weight} kg</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setViewingRabbit(rabbit); setIsViewModalOpen(true); }} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white"><Eye size={18} /></button>
                      <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-rose-400"><Trash2 size={18} /></button>
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
    </div>
  );
};

export default Inventory;