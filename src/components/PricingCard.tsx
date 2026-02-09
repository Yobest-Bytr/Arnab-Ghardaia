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
      whileHover={{ scale: 1.02 }}
      className={`relative p-10 rounded-[3rem] border ${isPopular ? 'border-indigo-500 bg-indigo-500/5 ai-glow' : 'border-white/10 bg-white/5'} backdrop-blur-2xl`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={12} /> Most Popular
        </div>
      )}
      <h3 className="text-xl font-black mb-2">{name}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-5xl font-black tracking-tighter">{price}</span>
        <span className="text-gray-500 font-bold">/mo</span>
      </div>
      <ul className="space-y-4 mb-10">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-gray-400 font-medium">
            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Check size={12} />
            </div>
            {f}
          </li>
        ))}
      </ul>
      <Button className={`w-full h-14 rounded-2xl font-black text-lg ${isPopular ? 'ai-gradient border-none' : 'bg-white/10 hover:bg-white/20 border-none'}`}>
        Get Started
      </Button>
    </motion.div>
  );
};

export default PricingCard;