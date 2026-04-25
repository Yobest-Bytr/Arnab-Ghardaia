import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import Navbar from '@/components/layout/Navbar';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setSuccess(true);
      showSuccess('Account created successfully! Redirecting...');
      
      // Wait for confetti
      await new Promise(r => setTimeout(r, 2000));
      navigate('/dashboard');
    } catch (error: any) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-6 relative overflow-hidden">
      {success && <ReactConfetti numberOfPieces={300} recycle={false} />}
      <Navbar />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-emerald-50 dark:border-slate-800 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-200">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Join Aranib Farm
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            Create your farm management account
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full pl-12 h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full pl-12 h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <button type="submit" className="farm-button w-full h-16 text-lg mt-6 flex items-center justify-center gap-3" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 font-bold text-sm">
          Already have an account? <Link to="/login" className="text-emerald-600 hover:underline">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;