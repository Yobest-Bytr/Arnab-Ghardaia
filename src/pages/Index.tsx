import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play, Zap, BrainCircuit, Rocket, Shield, Globe, Cpu } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import SpaceBackground from '@/components/SpaceBackground';
import MouseTrail from '@/components/MouseTrail';
import InfiniteMarquee from '@/components/InfiniteMarquee';
import PricingCard from '@/components/PricingCard';
import Footer from '@/components/layout/Footer';
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
      <section className="relative pt-48 pb-32 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center lg:items-start"
            >
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-8 uppercase tracking-[0.3em] backdrop-blur-xl">
                <Sparkles size={14} className="animate-pulse" />
                <span>The Future of Cognition</span>
              </div>
              
              <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black mb-8 tracking-tighter leading-[0.8] max-w-5xl">
                {t('heroTitle').split(' ').map((word, i) => (
                  <span key={i} className={i > 1 ? "dopamine-text" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              
              <p className="text-xl md:text-3xl text-gray-400 mb-12 max-w-3xl leading-relaxed font-medium">
                {t('heroSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full ai-gradient hover:opacity-90 text-white px-16 py-10 text-3xl rounded-[2rem] shadow-[0_0_60px_rgba(79,70,229,0.4)] border-none font-black group transition-all duration-500 hover:scale-105">
                    {t('getStarted')} <ArrowRight className={`ml-3 w-8 h-8 group-hover:translate-x-2 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- MOVING SITES SECTION --- */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">Built with <span className="dopamine-text">Yobest</span></h2>
          <p className="text-xl text-gray-500 font-bold">Join the elite 1% of creators building the future.</p>
        </div>
        
        <div className="space-y-8">
          <InfiniteMarquee />
          <InfiniteMarquee reverse />
        </div>
      </section>

      {/* --- BENTO FEATURE GRID --- */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="bento-grid">
            {/* Large Feature */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="col-span-1 md:col-span-2 row-span-2 p-12 rounded-[3.5rem] glass-card relative overflow-hidden group"
            >
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] group-hover:bg-indigo-600/30 transition-colors" />
              <BrainCircuit size={64} className="text-indigo-400 mb-8" />
              <h3 className="text-4xl font-black mb-6">Neural Architecture</h3>
              <p className="text-xl text-gray-400 font-medium leading-relaxed">
                Our AI doesn't just process data; it understands your cognitive load and adapts your workspace in real-time.
              </p>
            </motion.div>

            {/* Medium Feature */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="col-span-1 md:col-span-2 p-10 rounded-[3.5rem] bg-indigo-600 text-white relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="relative z-10">
                <Rocket size={40} className="mb-6" />
                <h3 className="text-3xl font-black mb-2">Warp Speed</h3>
                <p className="text-indigo-100 font-bold">0.02ms latency across all global nodes.</p>
              </div>
            </motion.div>

            {/* Small Features */}
            <motion.div whileHover={{ scale: 1.02 }} className="p-10 rounded-[3.5rem] glass-card flex flex-col justify-between">
              <Shield size={32} className="text-emerald-400" />
              <h4 className="text-xl font-black">Quantum Security</h4>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="p-10 rounded-[3.5rem] glass-card flex flex-col justify-between">
              <Globe size={32} className="text-blue-400" />
              <h4 className="text-xl font-black">Global Sync</h4>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="col-span-1 md:col-span-2 p-10 rounded-[3.5rem] glass-card flex items-center gap-8">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center">
                <Cpu size={40} className="text-purple-400" />
              </div>
              <div>
                <h4 className="text-2xl font-black">Edge Computing</h4>
                <p className="text-gray-500 font-bold">Processing at the speed of thought.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">{t('pricingTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <PricingCard name="Stardust" price="$0" features={["3 AI Projects", "Basic Insights", "1GB Storage"]} />
            <PricingCard name="Supernova" price="$29" isPopular features={["Unlimited Projects", "Advanced AI Engine", "100GB Storage", "Custom Domains"]} />
            <PricingCard name="Galactic" price="$99" features={["Enterprise Security", "Dedicated AI Node", "Unlimited Storage", "API Access"]} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;