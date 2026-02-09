import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, Bug, Zap } from 'lucide-react';

const updates = [
  {
    version: "v2.4.0",
    date: "May 15, 2026",
    title: "Neural Lab Integration",
    description: "Launched the Neural Lab for advanced AI experimentation and custom model switching.",
    type: "feature",
    changes: ["Added Grok 4.1 Fast support", "Implemented custom API key vault", "New real-time telemetry charts"]
  },
  {
    version: "v2.3.5",
    date: "May 02, 2026",
    title: "Workspace Persistence",
    description: "Enhanced the Neural Archive to support persistent script storage and AI history.",
    type: "improvement",
    changes: ["Auto-save for AI conversations", "Script repository UI overhaul", "Improved latency in Asia-Pacific nodes"]
  },
  {
    version: "v2.2.0",
    date: "April 20, 2026",
    title: "Auron Design System",
    description: "Complete visual overhaul with the new Auron design language.",
    type: "feature",
    changes: ["New pill-nav components", "Dopamine-text gradients", "Interactive space backgrounds"]
  }
];

const Changelog = () => {
  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
            <Rocket size={14} />
            <span>Platform Evolution</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 dopamine-text">
            Changelog
          </h1>
          <p className="text-xl text-white/40 font-bold">Tracking the path to superintelligence.</p>
        </motion.div>

        <div className="space-y-16">
          {updates.map((update, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-12 border-l border-white/10"
            >
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-[#020408]" />
              
              <div className="pill-nav p-10 bg-white/5 border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">{update.date}</span>
                    <h2 className="text-3xl font-black tracking-tight">{update.title}</h2>
                  </div>
                  <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                    {update.version}
                  </span>
                </div>
                
                <p className="text-white/60 font-medium mb-8 leading-relaxed">
                  {update.description}
                </p>

                <div className="space-y-3">
                  {update.changes.map((change, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-bold text-white/40">
                      <Sparkles size={14} className="text-[#99f6ff]" />
                      {change}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Changelog;