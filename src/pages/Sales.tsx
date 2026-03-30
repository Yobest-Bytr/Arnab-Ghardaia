import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  ShoppingBag, Plus, Calendar, User, Tag, 
  DollarSign, TrendingUp, PieChart as PieIcon, 
  ArrowUpRight, X, Loader2, Trash2, Rabbit,
  CheckCircle2, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Sales = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [sales, setSales] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    rabbit_id: '',
    customer_name: '',
    price: '',
    sale_date: new Date().toISOString().split('T')[0],
    category: 'Adult',
    notes: ''
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [salesData, rabbitData] = await Promise.all([
      storage.get('sales', user?.id || ''),
      storage.get('rabbits', user?.id || '')
    ]);
    setSales(salesData);
    setInventory(rabbitData.filter(r => r.status !== 'Sold'));
    setLoading(false);
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const saleRecord = { 
        ...formData, 
        price: parseFloat(formData.price),
        created_at: new Date().toISOString() 
      };
      
      await storage.insert('sales', user.id, saleRecord);
      
      // If a specific rabbit was selected, mark it as sold in inventory
      if (formData.rabbit_id) {
        await storage.update('rabbits', user.id, formData.rabbit_id, { status: 'Sold' });
      }

      setSales([saleRecord, ...sales]);
      setIsModalOpen(false);
      setFormData({ rabbit_id: '', customer_name: '', price: '', sale_date: new Date().toISOString().split('T')[0], category: 'Adult', notes: '' });
      showSuccess(t('recordSale'));
      fetchData();
    } catch (err) {
      showError("Failed to record sale.");
    }
  };

  const stats = useMemo(() => {
    const total = sales.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const categories: Record<string, number> = { 'Young': 0, 'Meat': 0, 'Adult': 0 };
    sales.forEach(s => {
      if (categories[s.category] !== undefined) categories[s.category]++;
    });
    
    const bestSelling = Object.entries(categories).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    return { total, categories, bestSelling };
  }, [sales]);

  const chartData = Object.entries(stats.categories).map(([name, value]) => ({
    name: name === 'Young' ? t('kit') : name === 'Meat' ? t('meatRabbit') : t('largeRabbit'),
    value
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('sales')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Track revenue and analyze market demand.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="farm-button flex items-center gap-2 h-14 px-8">
            <Plus size={20} /> {t('recordSale')}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="farm-card bg-emerald-600 text-white border-none shadow-xl shadow-emerald-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet size={20} />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{t('totalSales')}</p>
            <h3 className="text-3xl font-black">{stats.total.toLocaleString()} DA</h3>
          </div>

          <div className="farm-card">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('bestSelling')}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.bestSelling === 'Young' ? t('kit') : stats.bestSelling === 'Meat' ? t('meatRabbit') : t('largeRabbit')}
            </h3>
          </div>

          <div className="farm-card">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                <Tag size={20} />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transactions</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{sales.length}</h3>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 farm-card p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {sales.map((sale, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{sale.customer_name || 'Guest'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-500">
                          {sale.category === 'Young' ? t('kit') : sale.category === 'Meat' ? t('meatRabbit') : t('largeRabbit')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-emerald-600">{sale.price} DA</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">{sale.sale_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="farm-card">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <PieIcon className="text-blue-600" size={20} />
              {t('revenueByCategory')}
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-6">
              {chartData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-lg w-full bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400"><X size={24} /></button>
              <h2 className="text-3xl font-black mb-8 tracking-tight">{t('recordSale')}</h2>
              <form onSubmit={handleRecordSale} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('customerName')}</label>
                  <input type="text" required value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('rabbitType')}</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option value="Young">{t('kit')}</option>
                      <option value="Meat">{t('meatRabbit')}</option>
                      <option value="Adult">{t('largeRabbit')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('salePrice')} (DA)</label>
                    <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('saleDate')}</label>
                  <input type="date" required value={formData.sale_date} onChange={(e) => setFormData({...formData, sale_date: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Select Rabbit (Optional)</label>
                  <select value={formData.rabbit_id} onChange={(e) => setFormData({...formData, rabbit_id: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                    <option value="">Manual Entry</option>
                    {inventory.map(r => (
                      <option key={r.id} value={r.id}>{r.name || r.rabbit_id} ({r.breed})</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="farm-button w-full h-16 text-lg mt-4">{t('recordSale')}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sales;