import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play, Star } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Hero3D from '@/components/Hero3D';
import MouseTrail from '@/components/MouseTrail';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const Index = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      <MouseTrail />
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-32 px-6">
        {/* Nebula Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black mb-8 uppercase tracking-[0.25em]">
                <Sparkles size={14} />
                <span>{t('heroTitle')}</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
                {t('heroTitle').split(' ').map((word, i) => (
                  <span key={i} className={i > 2 ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              
              <p className="text-xl text-gray-400 mb-12 max-w-xl leading-relaxed font-medium">
                {t('heroSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-8 text-xl rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.4)] border-none font-black group">
                    {t('getStarted')} <ArrowRight className={`ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 py-8 text-xl rounded-2xl border-white/10 bg-white/5 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                  <Play size={20} className="fill-white" />
                  {t('watchStory')}
                </Button>
              </div>

              <div className="mt-16 flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-gray-950 bg-gray-800 overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-bold text-gray-400">
                  <span className="text-white font-black">640,000+</span> {t('usersJoined')}
                </div>
              </div>
            </motion.div>

            <div className="relative hidden lg:block">
              <Hero3D />
            </div>
          </div>
        </div>
      </section>

      {/* --- SPACE FEATURES --- */}
      <section className="py-32 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-20 tracking-tighter">Explore the <span className="text-indigo-400">Cosmos</span> of Productivity.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Neural Sync", desc: "Connect your thoughts directly to your workspace." },
              { title: "Zero Gravity", desc: "Experience a UI that feels weightless and fast." },
              { title: "Star Insights", desc: "AI-driven analytics from across your digital universe." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-12 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all"
              >
                <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 mx-auto">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                <p className="text-gray-400 font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;