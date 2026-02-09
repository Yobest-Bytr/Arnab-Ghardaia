import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Zap, Shield, Globe, Cpu, Target, MessageSquare, Layers, ArrowRight, Play, Quote, Star } from 'lucide-react';
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
    <div className="min-h-screen text-white relative z-10">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-64 pb-32 px-6 flex flex-col items-center text-center">
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
      </section>

      {/* --- TESTIMONIALS (VOICES FROM THE VOID) --- */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-[#99f6ff] mb-6 uppercase tracking-[0.3em]"
            >
              <Star size={12} className="fill-current" />
              <span>Elite Feedback</span>
            </motion.div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
              Voices from <br /> the <span className="text-[#99f6ff]">Void</span>
            </h2>
            <p className="text-xl text-white/30 font-bold max-w-xl mx-auto">
              The world's most ambitious builders are already living in the future.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                name: "Alex Rivera", 
                role: "CTO @ Neuralink", 
                text: "Yobest AI isn't just a tool; it's a cognitive partner. It knows what I need before I do.",
                delay: 0
              },
              { 
                name: "Sarah Chen", 
                role: "Founder @ Orbit", 
                text: "The latency is non-existent. It's like having a second brain that never sleeps.",
                delay: 0.1
              },
              { 
                name: "Marcus Thorne", 
                role: "Lead Dev @ SpaceX", 
                text: "Grok 4.1 integration is a game changer. The suggestions are eerily accurate.",
                delay: 0.2
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: t.delay, duration: 0.8 }}
                whileHover={{ y: -20, scale: 1.02 }}
                className="relative p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#99f6ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Quote size={48} className="text-[#99f6ff]/10 mb-8 group-hover:text-[#99f6ff]/30 transition-colors" />
                <p className="text-2xl font-medium leading-relaxed text-white/80 mb-12 tracking-tight">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#99f6ff] font-black">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-white tracking-tight">{t.name}</h4>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{t.role}</p>
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