import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

const PricingCard = ({ name, price, features, isPopular }: PricingCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`relative p-12 rounded-[3.5rem] border ${isPopular ? 'border-indigo-500 bg-indigo-500/5 ai-glow' : 'border-white/10 bg-white/5'} backdrop-blur-2xl transition-all duration-500`}
    >
      {isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 ai-gradient rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl">
          <Sparkles size={12} className="fill-white" /> Most Popular
        </div>
      )}
      <h3 className="text-2xl font-black mb-2 tracking-tight">{name}</h3>
      <div className="flex items-baseline gap-1 mb-10">
        <span className="text-6xl font-black tracking-tighter">{price}</span>
        <span className="text-gray-500 font-black text-lg">/mo</span>
      </div>
      <ul className="space-y-5 mb-12">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-4 text-gray-400 font-bold text-sm">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Check size={14} strokeWidth={3} />
            </div>
            {f}
          </li>
        ))}
      </ul>
      <Button className={`w-full h-16 rounded-2xl font-black text-xl transition-all duration-500 ${isPopular ? 'ai-gradient ai-glow-hover border-none' : 'bg-white/10 hover:bg-white/20 border-none'}`}>
        Get Started
      </Button>
    </motion.div>
  );
};

export default PricingCard;