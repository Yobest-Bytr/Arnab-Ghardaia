import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import { 
  Wallet, Plus, Calendar, Tag, DollarSign, TrendingUp, 
  PieChart as PieIcon, X, Loader2, Trash2, ShoppingBag,
  CheckCircle2, Wand2, Sparkles, ChevronRight, MessageSquare, BrainCircuit, RefreshCw, Filter, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const CATEGORIES = ['Food', 'Water', 'Medicine', 'Equipment', 'Losses', 'Other'];

const Expenses = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('all');

  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await storage.get('expenses', user?.id || '');
      setExpenses(data || []);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    await storage.processSyncQueue();
    await fetchExpenses();
    setIsSyncing(false);
    showSuccess(t('forceSync'));
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await storage.insert('expenses', user.id, { ...formData, amount: parseFloat(formData.amount) });
      setIsModalOpen(false);
      setFormData({ category: 'Food', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
      fetchExpenses();
      showSuccess(t('save'));
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this expense?")) return;
    try {
      await storage.delete('expenses', user.id, id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      showSuccess("Expense removed.");
    } catch (err) {
      showError(err);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesCategory = filterCategory === 'All' || e.category === filterCategory;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const now = new Date();
        let start, end;
        if (dateRange === 'thisMonth') {
          start = startOfMonth(now);
          end = endOfMonth(now);
        } else if (dateRange === 'lastMonth') {
          start = startOfMonth(subMonths(now, 1));
          end = endOfMonth(subMonths(now, 1));
        }
        if (start && end) {
          matchesDate = isWithinInterval(parseISO(e.date), { start, end });
        }
      }

      return matchesCategory && matchesDate;
    });
  }, [expenses, filterCategory, dateRange]);

  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const categories: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + (parseFloat(e.amount) || 0);
    });
    return { total, categories };
  }, [filteredExpenses]);

  const chartData = Object.entries(stats.categories).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight">{t('expenses')}</h1>
            <p className="text-white/40 font-medium mt-1">Track your farm's operational costs.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleForceSync} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
              <RefreshCw size={24} className={cn(isSyncing && "animate-spin")} />
            </button>
            <button onClick={() => setIsModalOpen(true)} className="auron-button flex items-center gap-2 h-14 px-8">
              <Plus size={20} /> {t('addRecord')}
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="relative">
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none appearance-none focus:border-emerald-500/50"
            >
              <option value="All" className="bg-[#020408]">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#020408]">{c}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
          </div>
          <div className="relative">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none appearance-none focus:border-emerald-500/50"
            >
              <option value="all" className="bg-[#020408]">All Time</option>
              <option value="thisMonth" className="bg-[#020408]">This Month</option>
              <option value="lastMonth" className="bg-[#020408]">Last Month</option>
            </select>
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
          </div>
          <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl px-6">
            <Filter className="h-4 w-4 text-rose-400 mr-2" />
            <span className="text-xs font-black uppercase tracking-widest text-white/40">{filteredExpenses.length} Results</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="pill-nav p-10 bg-white/5 border-white/10">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Total Expenses</p>
            <h3 className="text-4xl font-black text-rose-400">{stats.total.toLocaleString()} DA</h3>
          </div>
          <div className="md:col-span-2 pill-nav p-10 bg-white/5 border-white/10 flex items-center justify-between">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full ml-10">
              {chartData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-black uppercase text-white/40">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pill-nav bg-white/5 border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">{t('expenseCategory')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">{t('amount')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExpenses.map((expense, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6 font-bold">{expense.category}</td>
                  <td className="px-8 py-6 font-black text-rose-400">{expense.amount} DA</td>
                  <td className="px-8 py-6 text-white/40">{expense.date}</td>
                  <td className="px-8 py-6">
                    <button onClick={() => handleDelete(expense.id)} className="text-white/20 hover:text-rose-400 transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="p-20 text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-white/10" />
              <p className="text-white/40 font-bold">No expenses match your filters.</p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full bg-[#020408] border border-white/10 rounded-[3rem] p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">{t('addRecord')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleRecordExpense} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('expenseCategory')}</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none appearance-none">
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#020408]">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('amount')} (DA)</label>
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Date</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none" />
                </div>
                <button type="submit" className="auron-button w-full h-16 text-lg mt-4">{t('save')}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;