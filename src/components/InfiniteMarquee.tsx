import React from 'react';
import { motion } from 'framer-motion';

const projects = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800",
];

const InfiniteMarquee = ({ reverse = false }: { reverse?: boolean }) => {
  return (
    <div className="relative flex overflow-hidden py-10 select-none">
      <div className={`flex gap-8 whitespace-nowrap ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
        {[...projects, ...projects].map((src, i) => (
          <div 
            key={i} 
            className="w-[400px] h-[250px] rounded-[2.5rem] overflow-hidden border border-white/10 glass-card group relative"
          >
            <img 
              src={src} 
              alt="Project" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" 
            />
            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteMarquee;