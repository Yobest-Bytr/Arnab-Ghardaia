import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, Bug, Zap, ShieldCheck, Globe } from 'lucide-react';

const updates = [
  {
    version: "v1.2.0",
    date: "October 2023",
    title: "Professional Export Engine",
    description: "Launched the new PDF export system with custom branding and summary analytics.",
    type: "feature",
    changes: ["Branded PDF reports", "Summary statistics in exports", "Enhanced table formatting"]
  },
  {
    version: "v1.1.5",
    date: "September 2023",
    title: "Dynamic Dashboard",
    description: "Real-time activity feed and population growth charts are now live.",
    type: "improvement",
    changes: ["Real-time activity tracking", "Dynamic population charts", "Improved mobile responsiveness"]
  },
  {
    version: "v1.1.0",
    date: "August 2023",
    title: "Inventory CRUD",
    description: "Full control over your inventory with edit and delete capabilities.",
    type: "feature",
    changes: ["Edit rabbit records", "Delete records with confirmation", "Status tracking (Sold, Died, Available)"]
  }
];

const Changelog = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
            <Rocket size={14} />
            <span>Platform Evolution</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            What's <span className="text-emerald-600">New</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Tracking the path to the ultimate farm management experience.
          </p>
        </motion.div>

        <div className="space-y-16">
          {updates.map((update, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-12 border-l-2 border-emerald-100 dark:border-slate-800"
            >
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white dark:border-slate-950" />
              
              <div className="farm-card p-10">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 block">{update.date}</span>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{update.title}</h2>
                  </div>
                  <span className="px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {update.version}
                  </span>
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                  {update.description}
                </p>

                <div className="space-y-3">
                  {update.changes.map((change, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <Sparkles size={14} className="text-emerald-500" />
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