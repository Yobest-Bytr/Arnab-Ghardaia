
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import { 
  ShoppingBag, Plus, Calendar, User, Tag, 
  DollarSign, TrendingUp, PieChart as PieIcon, 
  ArrowUpRight, X, Loader2, Trash2, Rabbit,
  CheckCircle2, Wallet, Wand2, Sparkles, ChevronRight, MessageSquare, BrainCircuit,
  Beef, Leaf, Package, Search, Zap, ChevronDown, Filter, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { grokChat } from '@/lib/puter';
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { safeParseISO } from '@/utils/date';

const Sales = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [sales, setSales] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAskingAi, setIsAskingAi] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('all');
  const [searchCustomer, setSearchCustomer] = useState<string>('');

  const [formData, setFormData] = useState({
    rabbit_id: '',
    customer_name: '',
    price: '',
    sale_date: new Date().toISOString().split('T')[0],
    category: 'Natural', // Natural, Meat, Breeding, Other
    notes: ''
  });

  const [suggestions, setSuggestions] = useState<{ field: string, list: any[] }>({ field: '', list: [] });

  useEffect(() => {
    if (user) {
      fetchData();
      getBreedAdvice();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesData, rabbitData] = await Promise.all([
        storage.get('sales', user?.id || ''),
        storage.get('rabbits', user?.id || '')
      ]);
      setSales(salesData || []);
      setInventory((rabbitData || []).filter(r => r.status !== 'Sold'));
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const getBreedAdvice = async () => {
    if (!user) return;
    setIsAskingAi(true);
    try {
      const breeds = Array.from(new Set(inventory.map(r => r.breed)));
      if (breeds.length === 0) {
        setAiAdvice("Add some rabbits to your inventory to get market advice.");
        return;
      }
      const prompt = `Analyze this rabbit inventory: ${breeds.join(', ')}. 
      Which breeds are currently best for selling in the Ghardaia market? 
      Provide a concise, professional recommendation based on breed characteristics and market demand. 
      Keep it under 4 sentences.`;
      
      const response = await grokChat(prompt, { userId: user.id, stream: false });
      setAiAdvice(response);
    } catch (err) {
      setAiAdvice("Neural link busy. Try again later.");
    } finally {
      setIsAskingAi(false);
    }
  };

  const showInstantSuggestions = (field: string, val: string) => {
    let list: any[] = [];

    if (field === 'customer_name') {
      const customers = Array.from(new Set(sales.map(s => s.customer_name).filter(Boolean)));
      list = customers.filter(c => c.toLowerCase().includes(val.toLowerCase()));
      if (list.length === 0 && val === '') list = customers;
    } else if (field === 'rabbit_id') {
      list = inventory.filter(r => 
        val === '' || r.name?.toLowerCase().includes(val.toLowerCase()) || r.tagId?.toLowerCase().includes(val.toLowerCase())
      );
    }
    
    setSuggestions({ field, list: list.slice(0, 6) });
  };

  const selectSuggestion = (val: any, field: string) => {
    if (field === 'rabbit_id') {
      setFormData(prev => ({ 
        ...prev, 
        rabbit_id: val.id, 
        price: val.price?.toString() || prev.price,
        category: 'Natural'
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: val }));
    }
    setSuggestions({ field: '', list: [] });
  };

  const handleNeuralSuggest = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const prompt = `Write a professional sales note for a rabbit transaction:
      Customer: ${formData.customer_name}
      Category: ${formData.category}
      Price: ${formData.price} DA
      Date: ${formData.sale_date}
      Keep it professional and include a thank you message.`;
      
      const response = await grokChat(prompt, { userId: user.id, stream: false });
      setFormData(prev => ({ ...prev, notes: response }));
      showSuccess("Neural suggestion applied.");
    } catch (err) {
      showError(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const saleRecord = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        created_at: new Date().toISOString()
      };
      
      await storage.insert('sales', user.id, saleRecord);
      
      if (formData.rabbit_id) {
        await storage.update('rabbits', user.id, formData.rabbit_id, { status: 'Sold' });
      }

      setIsModalOpen(false);
      setFormData({ rabbit_id: '', customer_name: '', price: '', sale_date: new Date().toISOString().split('T')[0], category: 'Natural', notes: '' });
      await fetchData();
      showSuccess(t('recordSale'));
    } catch (err) {
      showError(err);
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
      const matchesCustomer = s.customer_name?.toLowerCase().includes(searchCustomer.toLowerCase());
      
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
          matchesDate = isWithinInterval(safeParseISO(s.sale_date), { start, end });
        }
      }

      return matchesCategory && matchesCustomer && matchesDate;
    });
  }, [sales, filterCategory, searchCustomer, dateRange]);

  const stats = useMemo(() => {
    const total = filteredSales.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    const categories: Record<string, number> = { 'Natural': 0, 'Meat': 0, 'Breeding': 0, 'Other': 0 };
    filteredSales.forEach(s => {
      if (categories[s.category] !== undefined) categories[s.category]++;
      else categories['Other']++;
    });
    
    const bestSelling = Object.entries(categories).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    return { total, categories, bestSelling };
  }, [filteredSales]);

  const chartData = Object.entries(stats.categories).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Meat': return <Beef className="h-4 w-4" />;
      case 'Natural': return <Leaf className="h-4 w-4" />;
      case 'Breeding': return <Zap className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter flex items-center gap-4">
              <ShoppingBag className="h-12 w-12 text-emerald-500" />
              {t('sales')}
            </h1>
            <p className="text-white/40 font-medium mt-2 text-lg">Track revenue and analyze market demand with neural precision.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="auron-button flex items-center gap-3 h-16 px-10 text-lg">
            <Plus size={24} /> {t('recordSale')}
          </button>
        </header>

        {/* AI Breed Advisor */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-10 rounded-[3.5rem] bg-indigo-600 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 rounded-[2rem] bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <BrainCircuit size={48} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-black mb-3 flex items-center gap-3">
                Neural Market Advisor
                <Sparkles size={24} className="text-indigo-300 animate-pulse" />
              </h3>
              <p className="text-indigo-50 text-lg font-medium leading-relaxed">
                {isAskingAi ? "Analyzing market trends and inventory..." : aiAdvice}
              </p>
            </div>
            <button onClick={getBreedAdvice} className="px-10 h-16 rounded-2xl bg-white text-indigo-600 font-black text-sm hover:scale-105 transition-all shadow-xl shrink-0">
              Refresh Advice
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
            <input 
              placeholder="Search customer..." 
              className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500/50"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
            />
          </div>
          <div className="relative">
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold outline-none appearance-none focus:border-emerald-500/50"
            >
              <option value="All" className="bg-[#020408]">All Categories</option>
              <option value="Natural" className="bg-[#020408]">Natural</option>
              <option value="Meat" className="bg-[#020408]">Meat</option>
              <option value="Breeding" className="bg-[#020408]">Breeding</option>
              <option value="Other" className="bg-[#020408]">Other</option>
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
            <Filter className="h-4 w-4 text-emerald-500 mr-2" />
            <span className="text-xs font-black uppercase tracking-widest text-white/40">{filteredSales.length} Results</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="pill-nav p-10 bg-emerald-600 text-white border-none shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet size={80} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">{t('totalSales')}</p>
            <h3 className="text-5xl font-black tracking-tighter">{stats.total.toLocaleString()} DA</h3>
          </div>

          <div className="pill-nav p-10 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <TrendingUp size={28} />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">{t('bestSelling')}</p>
            <h3 className="text-3xl font-black tracking-tight">
              {stats.bestSelling}
            </h3>
          </div>

          <div className="pill-nav p-10 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Tag size={28} />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Transactions</p>
            <h3 className="text-3xl font-black tracking-tight">{filteredSales.length}</h3>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 pill-nav p-0 overflow-hidden bg-white/5 border-white/10 shadow-xl">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-2xl font-black tracking-tight">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest">Price</th>
                    <th className="px-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSales.map((sale, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 font-black text-xs">
                            {sale.customer_name?.charAt(0) || 'G'}
                          </div>
                          <p className="text-sm font-bold group-hover:text-emerald-400 transition-colors">{sale.customer_name || 'Guest'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 w-fit">
                          <span className="text-white/40">{getCategoryIcon(sale.category)}</span>
                          <span className="text-xs font-black uppercase tracking-widest text-white/60">
                            {sale.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-lg font-black text-emerald-400">{sale.price.toLocaleString()} DA</span>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-white/20">{sale.sale_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSales.length === 0 && (
                <div className="p-20 text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-white/10" />
                  <p className="text-white/40 font-bold">No transactions match your filters.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pill-nav p-10 bg-white/5 border-white/10 shadow-xl">
            <h3 className="text-2xl font-black mb-10 flex items-center gap-3">
              <PieIcon className="text-blue-400" size={24} />
              {t('revenueByCategory')}
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '1.5rem', padding: '1rem' }}
                    itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-10">
              {chartData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-black text-white/60 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-lg font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/90 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="max-w-2xl w-full bg-[#0a0a0a] border border-white/10 p-12 rounded-[4rem] shadow-[0_0_100px_rgba(16,185,129,0.1)] relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"><X size={28} /></button>
              <h2 className="text-4xl font-black mb-10 tracking-tighter flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Plus size={28} />
                </div>
                {t('recordSale')}
              </h2>
              <form onSubmit={handleRecordSale} className="space-y-8">
                <div className="space-y-3 relative">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">{t('customerName')}</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                    <input 
                      type="text" 
                      required 
                      value={formData.customer_name ?? ''} 
                      onFocus={() => showInstantSuggestions('customer_name', formData.customer_name)}
                      onChange={(e) => { setFormData({...formData, customer_name: e.target.value}); showInstantSuggestions('customer_name', e.target.value); }} 
                      className="w-full h-16 pl-16 pr-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all" 
                    />
                  </div>
                  {suggestions.field === 'customer_name' && suggestions.list.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                      {suggestions.list.map(c => (
                        <button key={c} type="button" onClick={() => selectSuggestion(c, 'customer_name')} className="w-full px-6 py-4 text-left hover:bg-white/5 text-sm font-bold transition-colors flex items-center justify-between">
                          {c} <ChevronRight size={16} className="text-white/20" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Product Type</label>
                    <div className="relative">
                      <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                      <select value={formData.category ?? 'Natural'} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full h-16 pl-16 pr-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold outline-none appearance-none focus:border-emerald-500/50">
                        <option value="Natural" className="bg-[#0a0a0a]">Natural Rabbit</option>
                        <option value="Meat" className="bg-[#0a0a0a]">Meat / Slaughter</option>
                        <option value="Breeding" className="bg-[#0a0a0a]">Breeding Stock</option>
                        <option value="Other" className="bg-[#0a0a0a]">Other Product</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={20} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">{t('salePrice')} (DA)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                      <input type="number" required value={formData.price ?? ''} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full h-16 pl-16 pr-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold outline-none focus:border-emerald-500/50" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">{t('saleDate')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                    <input type="date" required value={formData.sale_date ?? ''} onChange={(e) => setFormData({...formData, sale_date: e.target.value})} className="w-full h-16 pl-16 pr-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold outline-none focus:border-emerald-500/50" />
                  </div>
                </div>

                <div className="space-y-3 relative">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Select Rabbit (Optional)</label>
                  <div className="relative">
                    <Rabbit className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search inventory by name or tag..."
                      onFocus={() => showInstantSuggestions('rabbit_id', '')}
                      onChange={(e) => showInstantSuggestions('rabbit_id', e.target.value)}
                      className="w-full h-16 pl-16 pr-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-bold outline-none focus:border-emerald-500/50" 
                    />
                  </div>
                  {suggestions.field === 'rabbit_id' && suggestions.list.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                      {suggestions.list.map(r => (
                        <button key={r.id} type="button" onClick={() => selectSuggestion(r, 'rabbit_id')} className="w-full px-6 py-4 text-left hover:bg-white/5 text-sm font-bold transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <Rabbit size={20} />
                            </div>
                            <div>
                              <p>{r.name || 'Unnamed'}</p>
                              <p className="text-[10px] text-white/20 uppercase tracking-widest">{r.tagId}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-white/20" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{t('notes')}</label>
                    <button type="button" onClick={handleNeuralSuggest} disabled={isGenerating} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Neural Suggest
                    </button>
                  </div>
                  <textarea 
                    value={formData.notes ?? ''} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                    className="w-full p-8 bg-white/5 border border-white/10 rounded-[2rem] font-bold outline-none min-h-[150px] focus:border-emerald-500/50 transition-all" 
                    placeholder="Add transaction details or use Neural Suggest..."
                  />
                </div>

                <button type="submit" className="auron-button w-full h-20 text-xl font-black mt-6 shadow-2xl shadow-emerald-500/20">
                  {t('recordSale')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sales;
