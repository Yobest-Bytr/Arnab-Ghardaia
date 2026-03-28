import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { 
  Search, Plus, MoreVertical, Rabbit, Download,
  X, Loader2, Edit2, Trash2, Calendar, FileText, Table as TableIcon, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { exportToCSV } from '@/utils/export';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Inventory = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [rabbits, setRabbits] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRabbit, setEditingRabbit] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    breed: 'New Zealand White',
    gender: 'Female',
    health_status: 'Healthy',
    status: 'Available',
    cage_number: '',
    price: ''
  });

  useEffect(() => {
    if (user) fetchRabbits();
  }, [user]);

  const fetchRabbits = async () => {
    const data = await storage.get('rabbits', user?.id || '');
    setRabbits(data);
    setLoading(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Aranib Farm - Inventory Report", 14, 15);
    const tableData = rabbits.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      r.name,
      r.breed,
      r.gender,
      r.status,
      `$${r.price || 0}`
    ]);
    autoTable(doc, {
      head: [['Date', 'Name', 'Breed', 'Gender', 'Status', 'Price']],
      body: tableData,
      startY: 20,
    });
    doc.save(`Inventory_${new Date().getTime()}.pdf`);
    showSuccess("PDF Exported");
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (editingRabbit) {
      await storage.update('rabbits', user.id, editingRabbit.id, formData);
      setRabbits(prev => prev.map(r => r.id === editingRabbit.id ? { ...r, ...formData } : r));
      showSuccess("Rabbit updated successfully.");
    } else {
      const newRabbit = await storage.insert('rabbits', user.id, formData);
      setRabbits([newRabbit, ...rabbits]);
      showSuccess("Rabbit added to inventory.");
    }
    
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this record?")) return;
    await storage.delete('rabbits', user!.id, id);
    setRabbits(prev => prev.filter(r => r.id !== id));
    showSuccess("Record deleted.");
  };

  const openEditModal = (rabbit: any) => {
    setEditingRabbit(rabbit);
    setFormData({
      name: rabbit.name,
      breed: rabbit.breed,
      gender: rabbit.gender,
      health_status: rabbit.health_status,
      status: rabbit.status,
      cage_number: rabbit.cage_number || '',
      price: rabbit.price || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRabbit(null);
    setFormData({ name: '', breed: 'New Zealand White', gender: 'Female', health_status: 'Healthy', status: 'Available', cage_number: '', price: '' });
  };

  const filteredRabbits = rabbits.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || 
                         r.breed?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['All', 'Available', 'Sold', 'Died', 'Reserved'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('inventory')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Track population, sales, and health history.</p>
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="px-6 h-12 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all outline-none">
                <Download size={18} /> {t('export')}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-slate-900 border-emerald-50 dark:border-slate-800 rounded-xl p-2 w-48">
                <DropdownMenuItem onClick={handleExportPDF} className="flex items-center gap-2 p-3 cursor-pointer rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  <FileText size={16} className="text-rose-500" /> Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToCSV(rabbits, 'Inventory')} className="flex items-center gap-2 p-3 cursor-pointer rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  <TableIcon size={16} className="text-emerald-500" /> Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <button onClick={() => setIsModalOpen(true)} className="farm-button flex items-center gap-2">
              <Plus size={20} /> {t('addRecord')}
            </button>
          </div>
        </header>

        <div className="farm-card p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="p-6 border-b border-emerald-50 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center justify-between bg-white dark:bg-slate-900">
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

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              <Filter size={16} className="text-slate-400 shrink-0" />
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    statusFilter === status 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {status === 'All' ? t('viewAll') : t(status.toLowerCase())}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-emerald-50 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date Added</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Rabbit</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t('breed')}</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Health</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">Loading...</td></tr>
                ) : filteredRabbits.map((rabbit) => (
                  <tr key={rabbit.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">
                      {new Date(rabbit.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                          <Rabbit size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{rabbit.name || 'Unnamed'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('cage')}: {rabbit.cage_number || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">{rabbit.breed}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        rabbit.status === 'Sold' ? "bg-blue-50 text-blue-600" : 
                        rabbit.status === 'Died' ? "bg-rose-50 text-rose-600" : 
                        "bg-emerald-50 text-emerald-600"
                      )}>
                        {t(rabbit.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          rabbit.health_status === 'Healthy' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{t(rabbit.health_status.toLowerCase())}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(rabbit)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-emerald-600 transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(rabbit.id)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-lg w-full bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-emerald-50 dark:border-slate-800 relative"
            >
              <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
                {editingRabbit ? t('edit') : t('addRabbit')}
              </h2>
              
              <form onSubmit={handleAction} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('price')} ($)</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('breed')}</label>
                    <select value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option>New Zealand White</option>
                      <option>Flemish Giant</option>
                      <option>Netherland Dwarf</option>
                      <option>Rex</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option value="Available">{t('available')}</option>
                      <option value="Sold">{t('sold')}</option>
                      <option value="Died">{t('died')}</option>
                      <option value="Sick">{t('sick')}</option>
                      <option value="Reserved">{t('reserved')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('gender')}</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500">
                      <option value="Female">{t('females')}</option>
                      <option value="Male">{t('males')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('cage')}</label>
                    <input type="text" value={formData.cage_number} onChange={(e) => setFormData({...formData, cage_number: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                <button type="submit" className="farm-button w-full h-16 text-lg mt-4">
                  {editingRabbit ? t('save') : t('addRecord')}
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