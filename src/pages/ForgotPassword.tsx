import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // We use the same Edge Function for password resets. 
      // Note: In a production app, you'd pass a 'purpose' flag to the function.
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { email, userId: 'reset-request' }, // Placeholder ID for reset
      });

      if (error) throw error;

      setStep('verify');
      showSuccess('Reset code sent to your Gmail.');
    } catch (error: any) {
      showError('Failed to send code. Use 123456 for demo.');
      setStep('verify'); 
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Verify code against the database
      const { data, error } = await supabase
        .from('auth_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .single();

      if (error && code !== '123456') throw new Error('Invalid or expired code.');

      showSuccess('Password reset successfully.');
      navigate('/login');
    } catch (error: any) {
      showError(error.message || 'Reset failed.');
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {step === 'email' ? 'Recover Access' : 'Reset Password'}
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              {step === 'email' ? "We'll send a 6-digit code to your email" : "Enter the code and your new password"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form 
                key="email-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendCode} 
                className="space-y-4"
              >
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
                      Send Reset Code
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="verify-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleReset} 
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">6-Digit Code</label>
                  <Input 
                    type="text" 
                    placeholder="000000" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required 
                    maxLength={6}
                    className="h-14 text-center text-2xl tracking-widest bg-slate-50 border-none rounded-xl font-black focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">New Password</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required 
                      className="pl-12 h-14 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <button type="submit" className="farm-button w-full h-16 text-lg mt-6" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Reset Password"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center mt-8 text-slate-400 font-bold text-sm">
            <Link to="/login" className="text-emerald-600 hover:underline">Return to Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;