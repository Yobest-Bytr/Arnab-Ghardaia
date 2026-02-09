import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Zap } from 'lucide-react';

interface ShowcaseCardProps {
  title: string;
  category: string;
  image: string;
}

const ShowcaseCard = ({ title, category, image }: ShowcaseCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group relative rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl"
    >
      <div className="aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
            <Zap size={12} className="fill-current" />
            {category}
          </span>
          <ExternalLink size={18} className="text-gray-500 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-2xl font-black text-white group-hover:dopamine-text transition-all">
          {title}
        </h3>
      </div>
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/30 rounded-[2.5rem] transition-all pointer-events-none" />
    </motion.div>
  );
};

export default ShowcaseCard;