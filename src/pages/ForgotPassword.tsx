import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (error) throw error;
      setSubmitted(true);
      showSuccess('Recovery link sent to your email.');
    } catch (error: any) {
      showError(error.message || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center px-6 pt-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-emerald-50"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-200">
              <KeyRound size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recover Access</h1>
            <p className="text-slate-500 font-medium mt-2">We'll send a recovery link to your email</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="pl-12 h-14 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <button type="submit" className="farm-button w-full h-16 text-lg mt-6 flex items-center justify-center gap-3" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Send Recovery Link
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Check Your Inbox</h3>
              <p className="text-slate-500 mb-8">If an account exists for {email}, you will receive a link shortly.</p>
              <Link to="/login" className="text-emerald-600 font-bold hover:underline">Return to Login</Link>
            </div>
          )}

          {!submitted && (
            <p className="text-center mt-8 text-slate-400 font-bold text-sm">
              Remembered your password? <Link to="/login" className="text-emerald-600 hover:underline">Log In</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;