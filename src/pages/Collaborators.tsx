import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, UserPlus, Shield, Mail, 
  Trash2, Edit2, CheckCircle2, XCircle,
  Zap, ShieldCheck, Globe, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';

const Collaborators = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    // In a real app, this would fetch from a 'collaborators' table
    setCollaborators([
      { id: '1', name: 'Ahmed Benali', email: 'ahmed@farm.dz', role: 'Manager', status: 'Active' },
      { id: '2', name: 'Sara Ghardaia', email: 'sara@farm.dz', role: 'Vet', status: 'Active' },
    ]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
              <Users size={14} />
              <span>Neural Network Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              The <span className="dopamine-text">Collective.</span>
            </h1>
          </div>
          <button className="auron-button h-14 px-8 flex items-center gap-3 text-sm">
            <UserPlus size={20} /> Invite Node
          </button>
        </header>

        <div className="grid gap-6">
          {collaborators.map((collab, i) => (
            <motion.div 
              key={collab.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="pill-nav p-8 bg-white/5 border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black">{collab.name}</h3>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest">{collab.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-center">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Role</p>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    {collab.role}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{collab.status}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"><Edit2 size={18} /></button>
                  <button className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-rose-400 transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Collaborators;