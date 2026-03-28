import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import { Rabbit, ShoppingBag, Search, Filter, Tag, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PublicRabbits = () => {
  const { t } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRabbits();
  }, []);

  const fetchRabbits = async () => {
    // Fetch public rabbits (mocking public access via storage)
    const data = await storage.get('rabbits', 'public'); 
    setRabbits(data.length > 0 ? data : [
      { id: '1', name: 'Snowball', breed: 'New Zealand White', price: 150, gender: 'Female' },
      { id: '2', name: 'Rusty', breed: 'Flemish Giant', price: 250, gender: 'Male' },
      { id: '3', name: 'Shadow', breed: 'Netherland Dwarf', price: 180, gender: 'Male' },
    ]);
    setLoading(false);
  };

  const handleInquiry = (rabbit: any) => {
    const phone = "966500000000"; // Farm WhatsApp
    const message = `Hello Aranib Farm! I am interested in ${rabbit.name}, the ${rabbit.breed} rabbit listed for $${rabbit.price || '150'}. Is it still available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{t('viewRabbits')}</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">Find your perfect companion or breeding stock.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="hidden lg:block space-y-8">
            <div className="farm-card">
              <h3 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Filter by Breed</h3>
              <div className="space-y-3">
                {['New Zealand', 'Flemish Giant', 'Netherland Dwarf', 'Rex'].map(breed => (
                  <label key={breed} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded border-2 border-emerald-100 dark:border-slate-800 group-hover:border-emerald-500 transition-colors" />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{breed}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="lg:col-span-3 grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {rabbits.map((rabbit, i) => (
              <motion.div
                key={rabbit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="farm-card group"
              >
                <div className="aspect-square rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 mb-6 overflow-hidden relative">
                  <img 
                    src={`https://images.unsplash.com/photo-1585110396050-c99b13f8c543?auto=format&fit=crop&q=80&w=400&sig=${i}`} 
                    alt={rabbit.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-emerald-600 font-black text-xs shadow-sm">
                    ${rabbit.price || '150'}
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{rabbit.name}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{rabbit.breed}</p>
                </div>
                <button 
                  onClick={() => handleInquiry(rabbit)}
                  className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  {t('inquire')}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicRabbits;