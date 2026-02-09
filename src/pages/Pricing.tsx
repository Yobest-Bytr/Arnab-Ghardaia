import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingCard from '@/components/PricingCard';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Globe } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Explorer",
      price: "$0",
      features: ["Grok 4.1 Fast Access", "5 Neural Scripts", "Basic Analytics", "Community Support"],
      isPopular: false
    },
    {
      name: "Architect",
      price: "$29",
      features: ["Unlimited Grok Access", "Unlimited Scripts", "Advanced Telemetry", "Priority Node Access", "Custom Avatar Decorations"],
      isPopular: true
    },
    {
      name: "Galactic",
      price: "$99",
      features: ["Multi-Model Switching", "API Access", "Dedicated Neural Node", "White-label Insights", "24/7 Human-AI Support"],
      isPopular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      <main className="pt-40 pb-32 px-6 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.3em]">
            <Zap size={14} className="fill-current" />
            <span>Choose Your Orbit</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 dopamine-text">
            Scale Your <br /> Intelligence.
          </h1>
          <p className="text-xl text-white/40 font-bold max-w-2xl mx-auto">
            Transparent pricing for builders at every stage of the cognitive revolution.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-32">
          {plans.map((plan, i) => (
            <PricingCard key={i} {...plan} />
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-12 py-20 border-t border-white/5">
          {[
            { icon: Shield, title: "Secure Vault", desc: "Your API keys and scripts are encrypted with military-grade AES-256." },
            { icon: Globe, title: "Global Edge", desc: "Zero-latency execution across our 42 global neural nodes." },
            { icon: Sparkles, title: "AI Native", desc: "Built from the ground up to leverage the latest LLM breakthroughs." }
          ].map((feature, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-[#99f6ff] mx-auto mb-6">
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-black mb-3">{feature.title}</h3>
              <p className="text-white/40 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;