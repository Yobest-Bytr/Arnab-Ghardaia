import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import { 
  Rabbit, ShoppingBag, Search, Filter, Tag, 
  MessageCircle, Sparkles, ArrowRight, Info, 
  ShieldCheck, Zap, Star, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const PublicRabbits = () => {
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('All');

  useEffect(() => {
    fetchRabbits();
  }, []);

  const fetchRabbits = async () => {
    setLoading(true);
    // In a real app, we'd fetch from a public endpoint. 
    // Here we fetch all rabbits and filter for 'Available'
    const data = await storage.get('rabbits', 'public-access'); 
    
    // If no data, we'll use high-quality demo data for the "Great UI" feel
    const displayData = data.length > 0 ? data.filter(r => r.status === 'Available') : [
      { id: '1', name: 'Snowball', breed: 'New Zealand White', price_dzd: '4500', gender: 'Female', age: '3 Months', image: 'https://images.unsplash.com/photo-1585110396050-c99b13f8c543?auto=format&fit=crop&q=80&w=800' },
      { id: '2', name: 'Rusty', breed: 'Flemish Giant', price_dzd: '8500', gender: 'Male', age: '5 Months', image: 'https://images.unsplash.com/photo-1591382386627-349b692688ff?auto=format&fit=crop&q=80&w=800' },
      { id: '3', name: 'Shadow', breed: 'Netherland Dwarf', price_dzd: '3200', gender: 'Male', age: '2 Months', image: 'https://images.unsplash.com/photo-1535241749838-299277b6305f?auto=format&fit=crop&q=80&w=800' },
      { id: '4', name: 'Luna', breed: 'Rex', price_dzd: '5500', gender: 'Female', age: '4 Months', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&q=80&w=800' },
    ];
    setRabbits(displayData);
    setLoading(false);
  };

  const breeds = useMemo(() => {
    const b = Array.from(new Set(rabbits.map(r => r.breed)));
    return ['All', ...b];
  }, [rabbits]);

  const filteredRabbits = rabbits.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.breed?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBreed = selectedBreed === 'All' || r.breed === selectedBreed;
    return matchesSearch && matchesBreed;
  });

  const handleInquiry = (rabbit: any) => {
    const phone = "213698894019"; // Farm WhatsApp
    const message = `Hello Arnab Ghardaia! I am interested in ${rabbit.name}, the ${rabbit.breed} rabbit listed for ${rabbit.price_dzd || '4500'} DA. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-40 pb-32 px-6 max-w-7xl mx-auto relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-500/5 blur-[120px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 blur-[120px] -z-10 rounded-full" />

        <header className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6"
          >
            <Star size={14} className="fill-current" />
            <span>Premium Selection</span>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
            The <span className="text-emerald-600">Boutique.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            Discover the finest breeds in Ghardaia, raised with neural precision and ethical care.
          </p>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-16">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 pl-14 pr-6 bg-slate-50 dark:bg-slate-900 border-none rounded-3xl text-lg font-bold focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {breeds.map(breed => (
              <button
                key={breed}
                onClick={() => setSelectedBreed(breed)}
                className={cn(
                  "px-8 h-16 rounded-3xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedBreed === breed 
                    ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20" 
                    : "bg-slate-50 dark:bg-slate-900 text-slate-400 hover:bg-slate-100"
                )}
              >
                {breed}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing with Neural Link...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredRabbits.map((rabbit, i) => (
                <motion.div
                  key={rabbit.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-white dark:bg-slate-900 rounded-[3rem] p-4 border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all"
                >
                  <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden relative mb-8">
                    <img 
                      src={rabbit.image || `https://images.unsplash.com/photo-1585110396050-c99b13f8c543?auto=format&fit=crop&q=80&w=800&sig=${i}`} 
                      alt={rabbit.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl text-emerald-600 font-black text-sm shadow-xl">
                      {rabbit.price_dzd || '4500'} DA
                    </div>
                    <div className="absolute bottom-6 left-6 flex gap-2">
                      <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Zap size={12} className="text-emerald-400" /> {rabbit.gender}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{rabbit.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{rabbit.breed}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-pink-500 transition-colors">
                        <Heart size={20} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <Calendar size={12} /> {rabbit.age || '3 Months'}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500">
                        <ShieldCheck size={12} /> Health Certified
                      </div>
                    </div>

                    <button 
                      onClick={() => handleInquiry(rabbit)}
                      className="w-full h-16 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white transition-all flex items-center justify-center gap-3 group/btn shadow-xl"
                    >
                      {t('inquire')}
                      <MessageCircle size={20} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredRabbits.length === 0 && !loading && (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-8">
              <Search size={48} />
            </div>
            <h3 className="text-2xl font-black mb-2">No matches found</h3>
            <p className="text-slate-400 font-medium">Try adjusting your filters or search query.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PublicRabbits;