import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play, Quote, Star, Zap, Globe, Shield } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import SpaceBackground from '@/components/SpaceBackground';
import MouseTrail from '@/components/MouseTrail';
import ShowcaseCard from '@/components/ShowcaseCard';
import PricingCard from '@/components/PricingCard';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const Index = () => {
  const { t, isRTL } = useLanguage();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white relative">
      <MouseTrail />
      <SpaceBackground />
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-32 px-6 min-h-screen flex items-center">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[180px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[180px] rounded-full animate-pulse" />
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SHOWCASE SECTION --- */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">{t('showcaseTitle')}</h2>
              <p className="text-xl text-gray-500 font-bold">Built with the power of Yobest AI.</p>
            </div>
            <Button variant="link" className="text-indigo-400 font-black text-lg p-0 h-auto hover:text-indigo-300">
              View All Projects <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-10"
          >
            <ShowcaseCard 
              title="Project Nebula" 
              category="SaaS Platform" 
              image="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800" 
            />
            <ShowcaseCard 
              title="Quantum Tasker" 
              category="Productivity App" 
              image="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800" 
            />
            <ShowcaseCard 
              title="Nova CRM" 
              category="Enterprise Tool" 
              image="https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800" 
            />
          </motion.div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">{t('pricingTitle')}</h2>
            <p className="text-xl text-gray-500 font-bold">Simple, transparent pricing for every stage of your journey.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <PricingCard 
              name="Stardust" 
              price="$0" 
              features={["3 AI Projects", "Basic Insights", "Community Support", "1GB Storage"]} 
            />
            <PricingCard 
              name="Supernova" 
              price="$29" 
              isPopular 
              features={["Unlimited Projects", "Advanced AI Engine", "Priority Support", "100GB Storage", "Custom Domains"]} 
            />
            <PricingCard 
              name="Galactic" 
              price="$99" 
              features={["Enterprise Security", "Dedicated AI Node", "24/7 Concierge", "Unlimited Storage", "API Access"]} 
            />
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-32 px-6 relative z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600/5 blur-[200px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">{t('testimonialsTitle')}</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            {[
              { name: "Alex Rivera", role: "Founder @ Nova", text: "Yobest AI didn't just change my workflow, it changed how I think about productivity. It's like having a second brain in the cloud." },
              { name: "Sarah Chen", role: "Lead Designer", text: "The interface is breathtaking. It's the first tool that actually feels like it was built for the future." }
            ].map((t, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="p-12 rounded-[3.5rem] bg-white/5 border border-white/10 backdrop-blur-xl relative"
              >
                <Quote className="absolute top-10 right-10 text-indigo-500/20 w-20 h-20" />
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-indigo-400 text-indigo-400" />)}
                </div>
                <p className="text-2xl font-bold text-white mb-10 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-black text-xl">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-white">{t.name}</h4>
                    <p className="text-gray-500 font-bold text-sm">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;