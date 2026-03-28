import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database } from 'lucide-react';

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
            <Shield size={14} />
            <span>{t('privacyPolicy')}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            {t('privacyPolicy')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Last updated: May 2026</p>
        </motion.div>

        <div className="space-y-12">
          <section className="farm-card p-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Lock className="text-emerald-600" size={24} />
              1. {t('dataSecurity')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4">
              {t('dataSecurityDesc')}
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              We do not sell your farm data or personal identifiers to third-party advertisers. Your information remains yours.
            </p>
          </section>

          <section className="farm-card p-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Eye className="text-emerald-600" size={24} />
              2. Information Collection
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4">
              We collect minimal information necessary to provide our farm management services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-500 dark:text-slate-400 font-medium ml-4">
              <li>Authentication credentials (Email, Password)</li>
              <li>Farm inventory data (Rabbit names, breeds, health status)</li>
              <li>Breeding history and litter records</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;