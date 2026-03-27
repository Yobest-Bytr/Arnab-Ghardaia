import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Rabbit, ArrowRight, CheckCircle, Users, Activity, Leaf, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

const Index = () => {
  const { t, isRTL } = useLanguage();

  const stats = [
    { label: t('totalRabbits'), val: "1,240", icon: Rabbit, color: "text-emerald-600" },
    { label: t('males'), val: "450", icon: Users, color: "text-blue-600" },
    { label: t('females'), val: "790", icon: Users, color: "text-pink-600" },
    { label: t('newBorns'), val: "124", icon: Activity, color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 -z-10 rounded-bl-[10rem] hidden lg:block" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
              <Leaf size={16} />
              <span>{t('heroTitle')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-slate-900">
              {t('heroTitle')} <br />
              <span className="text-emerald-600">Aranib Farm</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <button className="farm-button flex items-center gap-2 h-14 px-8 text-lg">
                  {t('goDashboard')}
                  <ArrowRight size={20} className="rtl-flip" />
                </button>
              </Link>
              <Link to="/shop">
                <button className="px-8 h-14 rounded-xl border-2 border-emerald-100 text-emerald-700 font-bold hover:bg-emerald-50 transition-all">
                  {t('viewRabbits')}
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1585110396050-c99b13f8c543?auto=format&fit=crop&q=80&w=1000" 
                alt="Rabbit Farm" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-emerald-50 flex items-center gap-4 animate-bounce-slow">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Health Status</p>
                <p className="text-lg font-black text-emerald-600">98.4% Healthy</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="farm-card text-center"
              >
                <div className={cn("w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.val}</h3>
                <p className="text-sm font-bold text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Why Choose Aranib Farm?</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">We combine traditional farming wisdom with modern technology to ensure the best care for your rabbits.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "Real-time Tracking", desc: "Monitor every rabbit's health, weight, and growth from birth to sale.", icon: Activity },
              { title: "Breeding Logic", desc: "Smart suggestions for breeding pairs to maintain genetic health and productivity.", icon: Rabbit },
              { title: "Financial Insights", desc: "Track sales and expenses to understand your farm's profitability.", icon: Leaf },
            ].map((feature, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;