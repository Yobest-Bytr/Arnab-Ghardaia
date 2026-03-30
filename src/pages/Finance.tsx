import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Wallet, Plus, Trash2, TrendingDown, TrendingUp, 
  DollarSign, PieChart as PieIcon, Calendar, Tag, 
  ArrowDownRight, ArrowUpRight, Loader2, X, ShoppingBag, Utensils, Stethoscope, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Finance = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [expenseData, salesData] = await Promise.all([
      storage.get('expenses', user?.id || ''),
      storage.get('sales', user?.id || '')
    ]);
    setExpenses(expenseData);
    setSales(salesData);
    setLoading(false);
  };

  const totals = useMemo(() => {
    const revenue = sales.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    const costs = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    return { revenue, costs, profit: revenue - costs };
  }, [sales, expenses]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = { 'Food': 0, 'Medicine': 0, 'Equipment': 0, 'Other': 0 };
    expenses.forEach(e => {
      if (cats[e.category] !== undefined) cats[e.category] += parseFloat(e.amount) || 0;
    });
    return Object.entries(cats).map(([name, value]) => ({ name: t(name.toLowerCase()), value }));
  }, [expenses, t]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const newExpense = await storage.insert('expenses', user.id, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setExpenses([newExpense, ...expenses]);
      setIsModalOpen(false);
      setFormData({ category: 'Food', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
      showSuccess(t('addExpense'));
    } catch (err) {
      showError("Failed to add expense.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this expense?")) return;
    await storage.delete('expenses', user.id, id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    showSuccess("Expense removed.");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Track your costs, losses, and net profitability.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="farm-button flex items-center gap-2 h-14 px-8">
            <Plus size={20} /> {t('addExpense')}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="farm-card bg-emerald-600 text-white border-none shadow-xl shadow-emerald-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><TrendingUp size={20} /></div>
              <ArrowUpRight size={20} className="opacity-50" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{t('totalRevenue')}</p>
            <h3 className="text-3xl font-black">{totals.revenue.toLocaleString()} DA</h3>
          </div>

          <div className="farm-card bg-rose-600 text-white border-none shadow-xl shadow-rose-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><TrendingDown size={20} /></div>
              <ArrowDownRight size={20} className="opacity-50" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{t('totalExpenses')}</p>
            <h3 className="text-3xl font-black">{totals.costs.toLocaleString()} DA</h3>
          </div>

          <div className="farm-card bg-indigo-600 text-white border-none shadow-xl shadow-indigo-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Wallet size={20} /></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{t('netProfit')}</p>
            <h3 className="text-3xl font-black">{totals.profit.toLocaleString()} DA</h3>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 farm-card p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black">Expense Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('expenseCategory')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('amount')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {expenses.map((exp, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            {exp.category === 'Food' ? <Utensils size={14} /> : exp.category === 'Medicine' ? <Stethoscope size={14} /> : <Settings size={14} />}
                          </div>
                          <span className="text-sm font-bold">{t(exp.category.toLowerCase())}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-rose-500">-{exp.amount} DA</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">{exp.date}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDelete(exp.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="farm-card">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <PieIcon className="text-blue-600" size={20} />
              Expense Distribution
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-6">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-black">{item.value} DA</span>
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
              <h2 className="text-3xl font-black mb-8 tracking-tight">{t('addExpense')}</h2>
              <form onSubmit={handleAddExpense} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('expenseCategory')}</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                    <option value="Food">{t('food')}</option>
                    <option value="Medicine">{t('medicine')}</option>
                    <option value="Equipment">{t('equipment')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('amount')} (DA)</label>
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Date</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                </div>
                <button type="submit" className="farm-button w-full h-16 text-lg mt-4">{t('addExpense')}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Finance;