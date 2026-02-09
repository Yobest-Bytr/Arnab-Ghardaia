import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Rocket, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      <main className="pt-64 pb-32 px-6 max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-32"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-white/40 mb-8 uppercase tracking-widest">
            <Sparkles size={12} className="text-[#99f6ff]" />
            <span>Our Vision</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-medium mb-8 tracking-tight dopamine-text">
            The future is <br /> cognitive.
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
            Yobest AI was founded on a simple premise: that technology should adapt to humans, not the other way around. We're building the world's first cognitive operating system.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-32">
          {[
            { 
              title: "Human-Centric AI", 
              desc: "We believe AI should be an extension of human capability, enhancing our natural rhythm rather than replacing it.",
              icon: Brain 
            },
            { 
              title: "Global Infrastructure", 
              desc: "Our neural nodes are distributed across 40+ regions, ensuring zero-latency intelligence wherever you are.",
              icon: Globe 
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="pill-nav p-12 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#99f6ff] mb-8">
                <item.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-white/40 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="pill-nav p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[#99f6ff]/5 blur-3xl -z-10" />
          <Rocket size={48} className="text-[#99f6ff] mx-auto mb-8" />
          <h2 className="text-4xl font-bold mb-6">Join the Revolution</h2>
          <p className="text-white/40 font-medium mb-12 max-w-xl mx-auto">
            We're just getting started. Be part of the elite 1% building the next generation of intelligent workspaces.
          </p>
          <button className="auron-button">View Careers</button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default About;