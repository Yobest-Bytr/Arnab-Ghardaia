import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Zap, Shield, Globe, Cpu, Target, MessageSquare, Layers } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      {/* Radial Background Effect */}
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-64 pb-32 px-6 flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-white/40 mb-12 uppercase tracking-widest">
            <Sparkles size={12} className="text-[#99f6ff]" />
            <span>#1 performance benchmarks</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-medium mb-8 tracking-tight leading-[1.1] max-w-4xl dopamine-text">
            The #1 AI agent <br /> for customer service
          </h1>
          
          <p className="text-lg md:text-xl text-white/40 mb-12 max-w-xl leading-relaxed font-medium">
            Streamline your business with our intuitive, <br /> scalable AI platform.
          </p>
          
          <Link to="/signup">
            <button className="auron-button flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#020408]" />
              Start free trial
            </button>
          </Link>
        </motion.div>

        {/* Bottom Icon Row */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-32 flex items-center justify-center gap-4 md:gap-8"
        >
          <div className="icon-pill"><Globe size={20} /></div>
          <div className="icon-pill"><Layers size={20} /></div>
          <div className="icon-pill"><MessageSquare size={20} /></div>
          <div className="icon-pill"><Target size={20} /></div>
          
          <div className="icon-pill-active">
            <Sparkles size={32} className="fill-current" />
          </div>
          
          <div className="icon-pill"><Brain size={20} /></div>
          <div className="icon-pill"><Shield size={20} /></div>
          <div className="icon-pill"><Cpu size={20} /></div>
          <div className="icon-pill"><Zap size={20} /></div>
        </motion.div>
      </section>

      {/* --- SUBTLE CONTENT SECTION --- */}
      <section className="py-40 px-6 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16">
          {[
            { title: "Neural Engine", desc: "Advanced cognitive processing for complex queries.", icon: Brain },
            { title: "Global Scale", desc: "Deploy across 40+ regions with zero latency.", icon: Globe },
            { title: "Quantum Security", desc: "End-to-end encryption for all AI interactions.", icon: Shield }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-[#99f6ff] group-hover:bg-white/10 transition-all mb-8">
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-white/40 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;