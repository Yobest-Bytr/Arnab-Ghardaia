import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Zap, BrainCircuit, Rocket, Shield, Globe, Cpu, Command } from 'lucide-react';
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
      <section className="relative pt-56 pb-32 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center lg:items-start"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black mb-10 uppercase tracking-[0.4em] backdrop-blur-xl shadow-inner">
                <Sparkles size={16} className="animate-pulse fill-current" />
                <span>The Future of Cognition</span>
              </div>
              
              <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-black mb-10 tracking-tighter leading-[0.75] max-w-6xl">
                {t('heroTitle').split(' ').map((word, i) => (
                  <span key={i} className={i > 1 ? "dopamine-text" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              
              <p className="text-xl md:text-3xl text-gray-400 mb-16 max-w-3xl leading-relaxed font-bold">
                {t('heroSubtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full ai-gradient ai-glow ai-glow-hover text-white px-16 py-12 text-4xl rounded-[2.5rem] border-none font-black group transition-all duration-500 hover:scale-105">
                    {t('getStarted')} <ArrowRight className={`ml-4 w-10 h-10 group-hover:translate-x-3 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- LOGO CLOUD --- */}
      <section className="py-24 relative z-10 border-y border-white/5 bg-white/[0.01] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.5em] text-gray-600 mb-16">Trusted by the world's most innovative teams</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
            {['SpaceX', 'Neuralink', 'OpenAI', 'Stripe', 'Apple'].map((logo) => (
              <span key={logo} className="text-3xl md:text-5xl font-black tracking-tighter text-white hover:text-indigo-400 cursor-default transition-colors">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* --- MOVING SITES SECTION --- */}
      <section className="py-40 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">Built with <span className="dopamine-text">Yobest</span></h2>
          <p className="text-2xl text-gray-500 font-black">Join the elite 1% of creators building the future.</p>
        </div>
        
        <div className="space-y-12">
          <InfiniteMarquee />
          <InfiniteMarquee reverse />
        </div>
      </section>

      {/* --- BENTO FEATURE GRID --- */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="bento-grid">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="col-span-1 md:col-span-2 row-span-2 p-16 rounded-[4rem] glass-card relative overflow-hidden group"
            >
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] group-hover:bg-indigo-600/30 transition-colors duration-700" />
              <div className="icon-container mb-10 w-20 h-20">
                <BrainCircuit size={40} />
              </div>
              <h3 className="text-5xl font-black mb-8 tracking-tight">Neural Architecture</h3>
              <p className="text-2xl text-gray-400 font-bold leading-relaxed">
                Our AI doesn't just process data; it understands your cognitive load and adapts your workspace in real-time.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="col-span-1 md:col-span-2 p-12 rounded-[4rem] bg-indigo-600 text-white relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                  <Rocket size={32} className="fill-white" />
                </div>
                <h3 className="text-4xl font-black mb-3 tracking-tight">Warp Speed</h3>
                <p className="text-indigo-100 font-black text-lg">0.02ms latency across all global nodes.</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="p-12 rounded-[4rem] glass-card flex flex-col justify-between group">
              <div className="icon-container group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                <Shield size={24} />
              </div>
              <h4 className="text-2xl font-black tracking-tight">Quantum Security</h4>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="p-12 rounded-[4rem] glass-card flex flex-col justify-between group">
              <div className="icon-container group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                <Globe size={24} />
              </div>
              <h4 className="text-2xl font-black tracking-tight">Global Sync</h4>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="col-span-1 md:col-span-2 p-12 rounded-[4rem] glass-card flex items-center gap-10">
              <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-inner">
                <Cpu size={48} className="text-purple-400" />
              </div>
              <div>
                <h4 className="text-3xl font-black tracking-tight">Edge Computing</h4>
                <p className="text-gray-500 font-black text-lg">Processing at the speed of thought.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8">Choose Your <span className="dopamine-text">Orbit</span></h2>
            <p className="text-2xl text-gray-500 font-black">Simple, transparent pricing for the next generation.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
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