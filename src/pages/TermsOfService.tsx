import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Scale, Zap, AlertTriangle, Globe } from 'lucide-react';

const TermsOfService = () => {
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
            <Scale size={14} />
            <span>Legal Framework</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 dopamine-text">
            Terms of Service
          </h1>
          <p className="text-white/40 font-bold">Effective Date: May 2026</p>
        </motion.div>

        <div className="space-y-12">
          <section className="pill-nav p-10 bg-white/5 border-white/10">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Zap className="text-[#99f6ff]" size={24} />
              1. Acceptance of Terms
            </h2>
            <p className="text-white/60 leading-relaxed font-medium">
              By initializing a link with Yobest AI, you agree to be bound by these terms. Our platform is a cognitive tool designed for builders; misuse of the AI engine for malicious purposes will result in immediate node termination.
            </p>
          </section>

          <section className="pill-nav p-10 bg-white/5 border-white/10">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Globe className="text-[#99f6ff]" size={24} />
              2. User Responsibility
            </h2>
            <p className="text-white/60 leading-relaxed font-medium mb-4">
              You are responsible for the scripts and content generated within your workspace. While our AI provides suggestions, the final execution and impact of those suggestions are your sole responsibility.
            </p>
          </section>

          <section className="pill-nav p-10 bg-white/5 border-white/10">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <AlertTriangle className="text-amber-400" size={24} />
              3. Limitation of Liability
            </h2>
            <p className="text-white/60 leading-relaxed font-medium">
              Yobest AI is provided "as is." We do not guarantee that the cognitive engine will be error-free or that suggestions will always result in optimal outcomes. We are not liable for any data loss or productivity interruptions.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;