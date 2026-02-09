import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Zap, Target, Eye, Users, Play, Quote, Star, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { grokChat } from '@/lib/puter';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t, isRTL } = useLanguage();
  const [aiDemoText, setAiDemoText] = useState("");
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('site_stats').select('*');
      if (data) setStats(data);
    };
    fetchStats();
  }, []);

  const getMetric = (name: string) => stats.find(s => s.metric_name === name)?.metric_value || '...';

  const runDemo = async () => {
    setAiDemoText("");
    await grokChat("Suggest a high-impact productivity task for a software engineer today.", (chunk) => {
      setAiDemoText(prev => prev + chunk);
    });
  };

  return (
    <div className="min-h-screen text-white relative z-10">
      <Navbar />
      
      <section className="relative pt-64 pb-32 px-6 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white/40 mb-12 uppercase tracking-widest">
            <Sparkles size={12} className="text-[#99f6ff]" />
            <span>Powered by Yobest Ai 4.1 Fast</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.9] max-w-5xl dopamine-text">{t('heroTitle')}</h1>
          <p className="text-lg md:text-2xl text-white/40 mb-12 max-w-2xl leading-relaxed font-medium">{t('heroSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/signup"><button className="auron-button flex items-center gap-3 h-16 px-10 text-xl">{t('getStarted')}<ArrowRight size={20} /></button></Link>
            <button onClick={runDemo} className="pill-nav px-10 h-16 flex items-center gap-3 font-bold"><Play size={20} className="fill-current" />{t('watchStory')}</button>
          </div>
        </motion.div>

        {aiDemoText && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 max-w-2xl w-full pill-nav p-8 bg-indigo-500/5 border-indigo-500/20 text-left">
            <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4"><Brain size={14} /><span>Grok 4.1 Suggestion</span></div>
            <p className="text-gray-300 font-medium leading-relaxed italic">"{aiDemoText}"</p>
          </motion.div>
        )}
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Global Visits", val: getMetric('total_visits'), icon: Eye },
            { label: "Active Builders", val: getMetric('active_users'), icon: Users },
            { label: "Tasks Optimized", val: getMetric('tasks_optimized'), icon: Zap },
            { label: "AI Accuracy", val: `${getMetric('ai_accuracy')}%`, icon: Target },
          ].map((stat, i) => (
            <div key={i} className="pill-nav p-8 text-center group hover:bg-white/10 transition-all">
              <stat.icon size={24} className="text-[#99f6ff] mx-auto mb-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-3xl font-black tracking-tighter mb-1">{stat.val.toLocaleString()}</h3>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;