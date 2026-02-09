import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Users, Zap, Shield, Globe, Activity, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import AvatarDecoration from '@/components/AvatarDecoration';

const collaborators = [
  { name: "Alex Rivera", role: "Neural Architect", status: "online", load: "12%", effect: "cyber-glitch" },
  { name: "Sarah Chen", role: "Cognitive Designer", status: "idle", load: "45%", effect: "fairy-sprites" },
  { name: "Marcus Thorne", role: "Systems Engineer", status: "dnd", load: "89%", effect: "tech-hud" },
  { name: "Elena Vance", role: "AI Researcher", status: "online", load: "5%", effect: "mystic-aura" },
  { name: "David Kim", role: "Data Scientist", status: "offline", load: "0%", effect: "none" },
];

const Collaborators = () => {
  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-6xl mx-auto relative z-10">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
            <Users size={14} />
            <span>Network Nodes Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
            Neural <span className="dopamine-text">Collaborators</span>
          </h1>
          <p className="text-xl text-white/40 font-bold">Connect with other builders in the Yobest ecosystem.</p>
        </motion.header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collaborators.map((collab, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="pill-nav p-8 bg-white/5 border-white/10 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
                <Activity size={48} />
              </div>
              
              <div className="flex items-center gap-6 mb-8">
                <AvatarDecoration 
                  fallbackText={collab.name} 
                  effect={collab.effect} 
                  size="lg" 
                  status={collab.status as any}
                />
                <div>
                  <h3 className="text-xl font-black tracking-tight">{collab.name}</h3>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{collab.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Cognitive Load</p>
                  <p className="text-2xl font-black">{collab.load}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                  <p className={`text-xs font-black uppercase ${
                    collab.status === 'online' ? 'text-emerald-400' : 
                    collab.status === 'idle' ? 'text-amber-400' : 'text-white/20'
                  }`}>{collab.status}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={14} /> Message
                </button>
                <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                  <Zap size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Collaborators;