import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ShowcaseCard from '@/components/ShowcaseCard';
import InfiniteMarquee from '@/components/InfiniteMarquee';
import { motion } from 'framer-motion';
import { Rocket, Star, ExternalLink } from 'lucide-react';

const projects = [
  { title: "Neural Dashboard", category: "Interface", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" },
  { title: "Cognitive CRM", category: "Automation", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" },
  { title: "Orbit Analytics", category: "Data", image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&q=80&w=800" },
  { title: "Void Editor", category: "Development", image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800" },
  { title: "Aura Design", category: "Creative", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800" },
  { title: "Pulse Network", category: "Infrastructure", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800" },
];

const Showcase = () => {
  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      <main className="pt-40 pb-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6 mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.3em]"
          >
            <Star size={14} className="fill-current" />
            <span>Galactic Projects</span>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 dopamine-text">
            Built in the <br /> <span className="text-[#99f6ff]">Void.</span>
          </h1>
          <p className="text-xl text-white/40 font-bold max-w-2xl mx-auto">
            Explore the most ambitious applications built on the Yobest cognitive engine.
          </p>
        </div>

        <div className="mb-32">
          <InfiniteMarquee />
          <InfiniteMarquee reverse />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <ShowcaseCard key={i} {...project} />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-4xl mx-auto mt-40 px-6 text-center"
        >
          <div className="pill-nav p-16 bg-indigo-600/10 border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 blur-3xl -z-10" />
            <Rocket size={48} className="text-[#99f6ff] mx-auto mb-8" />
            <h2 className="text-4xl font-black mb-6">Ready to build?</h2>
            <p className="text-white/40 font-bold mb-12">
              Join 10,000+ developers building the future of intelligent software.
            </p>
            <button className="auron-button">Start Building Now</button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Showcase;