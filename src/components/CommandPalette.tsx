import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Rabbit, LayoutDashboard, ShoppingBag, Info, Phone, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (query.length > 1 && user) {
      searchInventory();
    } else {
      setResults([]);
    }
  }, [query, user]);

  const searchInventory = async () => {
    const rabbits = await storage.get('rabbits', user?.id || '');
    const filtered = rabbits.filter((r: any) => 
      r.name?.toLowerCase().includes(query.toLowerCase()) || 
      r.rabbit_id?.toLowerCase().includes(query.toLowerCase()) ||
      r.breed?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered.slice(0, 5));
  };

  const navigateTo = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4">
              <Search className="text-emerald-600" size={24} />
              <input 
                autoFocus
                placeholder={t('quickSearch')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300"
              />
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {query.length === 0 ? (
                <div className="space-y-2">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation</p>
                  {[
                    { label: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
                    { label: t('inventory'), path: '/inventory', icon: ShoppingBag },
                    { label: t('breeding'), path: '/breeding', icon: Heart },
                    { label: t('reports'), path: '/reports', icon: FileText },
                  ].map(item => (
                    <button key={item.path} onClick={() => navigateTo(item.path)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-white transition-all">
                        <item.icon size={20} />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Results</p>
                  {results.map(r => (
                    <button key={r.id} onClick={() => navigateTo('/inventory')} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Rabbit size={20} />
                      </div>
                      <div className="text-left rtl:text-right">
                        <p className="font-bold text-slate-900 dark:text-white">{r.name || r.rabbit_id}</p>
                        <p className="text-xs text-slate-400 font-medium">{r.breed}</p>
                      </div>
                    </button>
                  ))}
                  {results.length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-slate-400 font-bold">{t('noMatches')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Command size={12} /> Enter to select</span>
                <span className="flex items-center gap-1">Esc to close</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-[10px] font-black text-emerald-600">
                Neural Search v1.0
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;