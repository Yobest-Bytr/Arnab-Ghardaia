import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import SpaceBackground from '@/components/SpaceBackground';
import MouseTrail from '@/components/MouseTrail';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const Index = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white relative">
      <MouseTrail />
      <SpaceBackground />
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-32 px-6 min-h-screen flex items-center">
        {/* Nebula Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[180px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[180px] rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center lg:items-start"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black mb-8 uppercase tracking-[0.25em] backdrop-blur-md">
                <Sparkles size={14} className="animate-pulse" />
                <span>{t('heroTitle')}</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.85] max-w-4xl">
                {t('heroTitle').split(' ').map((word, i) => (
                  <span key={i} className={i > 1 ? "dopamine-text" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-medium">
                {t('heroSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-8 text-2xl rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.4)] border-none font-black group transition-all duration-500 hover:scale-105">
                    {t('getStarted')} <ArrowRight className={`ml-2 w-7 h-7 group-hover:translate-x-2 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-12 py-8 text-2xl rounded-2xl border-white/10 bg-white/5 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-md">
                  <Play size={24} className="fill-white" />
                  {t('watchStory')}
                </Button>
              </div>

              <div className="mt-20 flex flex-col sm:flex-row items-center gap-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="w-14 h-14 rounded-full border-4 border-gray-950 bg-gray-800 overflow-hidden shadow-xl"
                    >
                      <img src={`https://i.pravatar.cc/150?u=user${i}`} alt="User" />
                    </motion.div>
                  ))}
                </div>
                <div className="text-lg font-bold text-gray-400">
                  <span className="text-white font-black">640,000+</span> {t('usersJoined')}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SPACE FEATURES --- */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">Explore the <span className="dopamine-text">Cosmos</span></h2>
            <p className="text-xl text-gray-400 font-medium">Productivity tools from another dimension.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Neural Sync", desc: "Connect your thoughts directly to your workspace with zero latency.", icon: Sparkles },
              { title: "Zero Gravity", desc: "Experience a UI that feels weightless, fast, and perfectly optimized.", icon: ArrowRight },
              { title: "Star Insights", desc: "AI-driven analytics that reveal patterns across your digital universe.", icon: Sparkles }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -15, scale: 1.02 }}
                className="p-12 bg-white/5 border border-white/10 rounded-[3.5rem] hover:bg-white/10 transition-all backdrop-blur-xl group relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-colors" />
                <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center text-indigo-400 mb-10 group-hover:rotate-12 transition-transform">
                  <feature.icon size={40} />
                </div>
                <h3 className="text-3xl font-black mb-6">{feature.title}</h3>
                <p className="text-xl text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;