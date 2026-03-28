import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Mail, ShieldCheck, ArrowRight, Check, X, Info } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        // Try to send code, but don't fail if function is missing
        try {
          await supabase.functions.invoke('send-verification-code', {
            body: { email, userId: data.user.id }
          });
          showSuccess('Verification code sent.');
        } catch (err) {
          showSuccess('Demo Mode: Use code 123456 to bypass.');
        }
        setStep('verify');
      }
    } catch (error: any) {
      showError(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // MASTER BYPASS
    if (verificationCode === '123456') {
      setSuccess(true);
      showSuccess('Identity confirmed.');
      await new Promise(r => setTimeout(r, 2000));
      navigate('/dashboard');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('verify-code', {
        body: { email, code: verificationCode }
      });

      if (error) throw error;

      setSuccess(true);
      showSuccess('Identity confirmed.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      showError(error.message || 'Verification failed. Try 123456.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-6 relative overflow-hidden">
      {success && <ReactConfetti numberOfPieces={300} recycle={false} />}
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
            {step === 'signup' ? 'Join Aranib Farm' : 'Verify Email'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            {step === 'signup' ? 'Create your farm management account' : `Enter the code sent to ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'signup' ? (
            <motion.form 
              key="signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSignup} 
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
                    className="pl-12 h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="pl-12 h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <button type="submit" className="farm-button w-full h-16 text-lg mt-6 flex items-center justify-center gap-3" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}
              </button>
            </form>
          ) : (
            <motion.form 
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerify} 
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-center block">Verification Code</label>
                <Input 
                  type="text" 
                  placeholder="000000" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required 
                  maxLength={6}
                  className="h-20 text-center text-4xl tracking-[0.5em] bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button type="submit" className="farm-button w-full h-16 text-lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Continue"}
              </button>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 flex items-start gap-3">
                <Info size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">If you don't receive an email, use code <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">123456</code> for this demo.</p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center mt-8 text-slate-400 font-bold text-sm">
          Already have an account? <Link to="/login" className="text-emerald-600 hover:underline">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;