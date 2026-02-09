import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database } from 'lucide-react';

const PrivacyPolicy = () => {
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
            <Shield size={14} />
            <span>Data Protection</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 dopamine-text">
            Privacy Policy
          </h1>
          <p className="text-white/40 font-bold">Last updated: May 2026</p>
        </motion.div>

        <div className="space-y-12">
          <section className="pill-nav p-10 bg-white/5 border-white/10">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Lock className="text-[#99f6ff]" size={24} />
              1. Neural Data Security
            </h2>
            <p className="text-white/60 leading-relaxed font-medium mb-4">
              At Yobest AI, we treat your cognitive data with the highest level of encryption. Your workspace scripts, AI history, and personal identifiers are encrypted at rest and in transit using AES-256 protocols.
            </p>
            <p className="text-white/60 leading-relaxed font-medium">
              We do not sell your neural patterns or workflow data to third-party advertisers. Your intelligence remains yours.
            </p>
          </section>

          <section className="pill-nav p-10 bg-white/5 border-white/10">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Eye className="text-[#99f6ff]" size={24} />
              2. Information Collection
            </h2>
            <p className="text-white/60 leading-relaxed font-medium mb-4">
              We collect minimal information necessary to provide our cognitive services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/40 font-medium ml-4">
              <li>Authentication credentials (Email, Password)</li>
              <li>Custom AI API keys (stored locally or in secure vaults)</li>
              <li>Workspace metadata for synchronization</li>
              <li>Usage telemetry for network optimization</li>
            </ul>
          </section>

          <section className="pill-nav p-10 bg-white/5 border-white/10">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Database className="text-[#99f6ff]" size={24} />
              3. Data Retention
            </h2>
            <p className="text-white/60 leading-relaxed font-medium">
              You have the right to purge your neural archive at any time. Upon account deletion, all associated data is scrubbed from our primary nodes within 72 hours.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;