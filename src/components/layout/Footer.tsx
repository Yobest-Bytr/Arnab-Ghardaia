import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Rabbit, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-white pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 font-black text-3xl tracking-tighter mb-8">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                <Rabbit size={24} />
              </div>
              <span>Aranib <span className="text-emerald-600">Farm</span></span>
            </Link>
            <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs text-emerald-500 mb-8">Quick Links</h4>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><Link to="/shop" className="hover:text-emerald-500 transition-colors">{t('inventory')}</Link></li>
              <li><Link to="/about" className="hover:text-emerald-500 transition-colors">{t('about')}</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-500 transition-colors">{t('contact')}</Link></li>
              <li><Link to="/login" className="hover:text-emerald-500 transition-colors">{t('dashboard')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs text-emerald-500 mb-8">Connect</h4>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-16 border-t border-white/5 text-slate-500 text-sm font-bold">
          <p>{t('copyright')}</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">{t('privacyPolicy')}</Link>
            <Link to="/terms" className="hover:text-white transition-colors">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;