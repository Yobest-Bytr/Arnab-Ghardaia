import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Scale, Zap, AlertTriangle, Globe } from 'lucide-react';

const TermsOfService = () => {
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
            <Scale size={14} />
            <span>{t('termsOfService')}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            {t('termsOfService')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Effective Date: May 2026</p>
        </motion.div>

        <div className="space-y-12">
          <section className="farm-card p-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Zap className="text-emerald-600" size={24} />
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              By using Aranib Farm, you agree to be bound by these terms. Our platform is a management tool designed for rabbit breeders.
            </p>
          </section>

          <section className="farm-card p-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Globe className="text-emerald-600" size={24} />
              2. {t('userResponsibility')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4">
              {t('userResponsibilityDesc')}
            </p>
          </section>

          <section className="farm-card p-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" size={24} />
              3. Limitation of Liability
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Aranib Farm is provided "as is." We do not guarantee that the management system will be error-free or that suggestions will always result in optimal outcomes.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;