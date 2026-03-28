import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Filter, Plus, MoreVertical, 
  Rabbit, ChevronLeft, ChevronRight, Download,
  Activity, ShieldCheck, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

const Inventory = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    breed: 'New Zealand White',
    gender: 'Female',
    health_status: 'Healthy',
    status: 'Available',
    cage_number: ''
  });

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

  const fetchRabbits = async () => {
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
    setLoading(false);
  };

  const handleAddRabbit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const newRabbit = await storage.insert('rabbits', user.id, formData);
      setRabbits([newRabbit, ...rabbits]);
      setIsModalOpen(false);
      setFormData({ name: '', breed: 'New Zealand White', gender: 'Female', health_status: 'Healthy', status: 'Available', cage_number: '' });
      showSuccess(`${formData.name || 'Rabbit'} added to inventory.`);
    } catch (err) {
      showError('Failed to add rabbit.');
    }
  };

  const filteredRabbits = rabbits.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) || 
    r.breed?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('inventory')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your complete rabbit stock and history.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 h-12 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all">
              <Download size={18} /> Export
            </button>
            <button onClick={() => setIsModalOpen(true)} className="farm-button flex items-center gap-2">
              <Plus size={20} />
              {t('addRabbit')}
            </button>
          </div>
        </header>

        <div className="farm-card p-0 overflow-hidden">
          <div className="p-6 border-b border-emerald-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-emerald-50 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('name')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('breed')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('gender')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('health')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('status')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">Loading inventory...</td></tr>
                ) : filteredRabbits.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">No rabbits found.</td></tr>
                ) : (
                  filteredRabbits.map((rabbit) => (
                    <tr key={rabbit.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                            <Rabbit size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{rabbit.name || 'Unnamed'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cage: {rabbit.cage_number || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">{rabbit.breed}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          rabbit.gender === 'Male' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "bg-pink-50 dark:bg-pink-900/20 text-pink-600"
                        )}>
                          {rabbit.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            rabbit.health_status === 'Healthy' ? "bg-emerald-500" : "bg-rose-500"
                          )} />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{rabbit.health_status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          {rabbit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Rabbit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-lg w-full bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-emerald-50 dark:border-slate-800 relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Add New Rabbit</h2>
              
              <form onSubmit={handleAddRabbit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Rabbit Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                    placeholder="e.g. Snowball"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Breed</label>
                    <select 
                      value={formData.breed}
                      onChange={(e) => setFormData({...formData, breed: e.target.value})}
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>New Zealand White</option>
                      <option>Flemish Giant</option>
                      <option>Netherland Dwarf</option>
                      <option>Rex</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Cage Number</label>
                  <input 
                    type="text" 
                    value={formData.cage_number}
                    onChange={(e) => setFormData({...formData, cage_number: e.target.value})}
                    className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" 
                    placeholder="e.g. A-12"
                  />
                </div>

                <button type="submit" className="farm-button w-full h-16 text-lg mt-4">
                  Add to Inventory
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;