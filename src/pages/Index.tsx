import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Rabbit, ArrowRight, CheckCircle, Users, Activity, Leaf, Phone, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

const Index = () => {
  const { t, isRTL } = useLanguage();

  const stats = [
    { label: t('totalRabbits'), val: "1,240", icon: Rabbit, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: t('males'), val: "450", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t('females'), val: "790", icon: Users, color: "text-pink-600", bg: "bg-pink-50" },
    { label: t('newBorns'), val: "124", icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 dark:bg-emerald-900/5 -z-10 rounded-bl-[10rem] hidden lg:block" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
              <Star size={16} className="fill-current" />
              <span>{t('appName')}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              <span className="text-emerald-600">{t('heroTitle')}</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <button className="farm-button flex items-center gap-2 h-16 px-10 text-lg shadow-xl shadow-emerald-500/30">
                  {t('goDashboard')}
                  <ArrowRight size={20} className={cn(isRTL && "rotate-180")} />
                </button>
              </Link>
              <Link to="/shop">
                <button className="px-10 h-16 rounded-2xl border-2 border-emerald-100 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 font-black hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all">
                  {t('viewRabbits')}
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white dark:border-slate-900 relative z-10 group">
              <img 
                src="https://fieldandstream.com/wp-content/uploads/2024/06/BGHA45BMURB4HK43PODKL2UICQ.jpg" 
                alt="Rabbit Farm" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
              <Activity size={14} />
              <span>{t('dashboard')}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">{t('featuresTitle')}</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">{t('featuresSubtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: t('feature1Title'), desc: t('feature1Desc'), icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
              { title: t('feature2Title'), desc: t('feature2Desc'), icon: Rabbit, color: "text-blue-600", bg: "bg-blue-50" },
              { title: t('feature3Title'), desc: t('feature3Desc'), icon: Leaf, color: "text-orange-600", bg: "bg-orange-50" },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-10 rounded-[3rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group"
              >
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform", feature.bg, feature.color)}>
                  <feature.icon size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-emerald-600 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-500/20">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">{t('ctaTitle')}</h2>
              <p className="text-xl text-emerald-100 font-medium mb-12 max-w-xl mx-auto">{t('ctaSubtitle')}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/signup">
                  <button className="h-16 px-10 bg-white text-emerald-600 font-black rounded-2xl hover:scale-105 transition-transform shadow-xl">
                    {t('getStartedFree')}
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="h-16 px-10 bg-emerald-700 text-white font-black rounded-2xl hover:bg-emerald-800 transition-all">
                    {t('contactSales')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;