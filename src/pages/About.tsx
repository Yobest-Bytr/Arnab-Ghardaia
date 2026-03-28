import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Users, Heart } from 'lucide-react';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            {t('aboutHero')}
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            {t('aboutDesc')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <img 
            src="https://images.unsplash.com/photo-1591382386627-349b692688ff?auto=format&fit=crop&q=80&w=800" 
            alt="Farm" 
            className="rounded-[3rem] shadow-2xl"
          />
          <div className="flex flex-col justify-center space-y-6">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('qualityCare')}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {t('qualityDesc')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Leaf, label: "Organic Feed" },
                { icon: ShieldCheck, label: "Certified Health" },
                { icon: Users, label: "Expert Staff" },
                { icon: Heart, label: "Ethical Breeding" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <item.icon className="text-emerald-600" size={18} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;