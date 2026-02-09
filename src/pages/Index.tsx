import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Zap, Shield, Globe, Cpu, Target, MessageSquare, Layers, ArrowRight, Play } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { grokChat } from '@/lib/puter';

const Index = () => {
  const [aiDemoText, setAiDemoText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const runDemo = async () => {
    setIsGenerating(true);
    setAiDemoText("");
    await grokChat("Suggest a high-impact productivity task for a software engineer today.", (chunk) => {
      setAiDemoText(prev => prev + chunk);
    });
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-64 pb-32 px-6 flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white/40 mb-12 uppercase tracking-widest">
            <Sparkles size={12} className="text-[#99f6ff]" />
            <span>Powered by Grok 4.1 Fast</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.9] max-w-5xl dopamine-text">
            Cognitive <br /> Intelligence.
          </h1>
          
          <p className="text-lg md:text-2xl text-white/40 mb-12 max-w-2xl leading-relaxed font-medium">
            Yobest AI anticipates your workflow, optimizes your focus, and automates the mundane.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/signup">
              <button className="auron-button flex items-center gap-3 h-16 px-10 text-xl shadow-[0_0_30px_rgba(153,246,255,0.3)]">
                Get Started Free
                <ArrowRight size={20} />
              </button>
            </Link>
            <button onClick={runDemo} className="pill-nav px-10 h-16 flex items-center gap-3 hover:bg-white/10 transition-all font-bold">
              <Play size={20} className="fill-current" />
              Watch Grok Demo
            </button>
          </div>
        </motion.div>

        {/* AI Demo Output */}
        {aiDemoText && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 max-w-2xl w-full pill-nav p-8 bg-indigo-500/5 border-indigo-500/20 text-left"
          >
            <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
              <Brain size={14} />
              <span>Grok 4.1 Suggestion</span>
            </div>
            <p className="text-gray-300 font-medium leading-relaxed italic">"{aiDemoText}"</p>
          </motion.div>
        )}

        {/* Viral Stats */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          {[
            { label: "Active Users", val: "640K+" },
            { label: "Tasks Optimized", val: "12M+" },
            { label: "Latency", val: "0.02ms" },
            { label: "AI Accuracy", val: "99.9%" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">{stat.val}</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- PROBLEM/SOLUTION --- */}
      <section className="py-40 px-6 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">The Cognitive <span className="text-[#99f6ff]">Edge</span></h2>
            <p className="text-xl text-white/40 font-medium">Why the elite 1% choose Yobest AI.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Workflow Anticipation", desc: "Grok 4.1 learns your rhythm and prepares your next task before you even think of it.", icon: Brain },
              { title: "Neural Security", desc: "Your data is encrypted at the cognitive level, ensuring total privacy in the digital void.", icon: Shield },
              { title: "Global Sync", desc: "Zero-latency synchronization across all your devices, powered by Puter's edge network.", icon: Globe }
            ].map((card, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="pill-nav p-12 flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[#99f6ff] group-hover:bg-[#99f6ff]/10 transition-all mb-10">
                  <card.icon size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                <p className="text-white/40 font-medium leading-relaxed">{card.desc}</p>
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