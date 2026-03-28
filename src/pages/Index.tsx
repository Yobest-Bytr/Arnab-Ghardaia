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
              <span>The Region's #1 Rabbit Farm</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              {t('heroTitle')} <br />
              <span className="text-emerald-600">Aranib Farm</span>
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
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-400">
                <span className="text-slate-900 dark:text-white">500+</span> Happy Customers
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white dark:border-slate-900 relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1585110396050-c99b13f8c543?auto=format&fit=crop&q=80&w=1000" 
                alt="Rabbit Farm" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            
            {/* Floating Stats Card */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border border-emerald-50 dark:border-slate-800 flex items-center gap-4 z-20"
            >
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                <ShieldCheck size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Status</p>
                <p className="text-xl font-black text-emerald-600">98.4% Healthy</p>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-emerald-50 dark:border-slate-800 text-center group transition-all"
              >
                <div className={cn("w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                  <stat.icon size={32} />
                </div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{stat.val}</h3>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
              <Activity size={14} />
              <span>Advanced Management</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Why Choose Aranib Farm?</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">We combine traditional farming wisdom with modern technology to ensure the best care for your rabbits.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                title: "Real-time Tracking", 
                desc: "Monitor every rabbit's health, weight, and growth from birth to sale with our intuitive dashboard.", 
                icon: Activity,
                color: "text-emerald-600",
                bg: "bg-emerald-50"
              },
              { 
                title: "Breeding Logic", 
                desc: "Smart suggestions for breeding pairs to maintain genetic health and maximize farm productivity.", 
                icon: Rabbit,
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              { 
                title: "Financial Insights", 
                desc: "Track sales, expenses, and market trends to understand and grow your farm's profitability.", 
                icon: Leaf,
                color: "text-orange-600",
                bg: "bg-orange-50"
              },
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
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Ready to start your <br /> rabbit journey?</h2>
              <p className="text-xl text-emerald-100 font-medium mb-12 max-w-xl mx-auto">Join hundreds of successful breeders using Aranib Farm's management system today.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/signup">
                  <button className="h-16 px-10 bg-white text-emerald-600 font-black rounded-2xl hover:scale-105 transition-transform shadow-xl">
                    Get Started Free
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="h-16 px-10 bg-emerald-700 text-white font-black rounded-2xl hover:bg-emerald-800 transition-all">
                    Contact Sales
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