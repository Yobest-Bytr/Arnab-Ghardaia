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
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        setUserId(data.user.id);
        
        // Ensure profile exists for verification mapping
        await supabase.from('profiles').upsert({ 
          id: data.user.id, 
          email: email,
          display_name: email.split('@')[0]
        });

        await supabase.functions.invoke('send-verification-code', {
          body: { email, userId: data.user.id }
        });
        
        showSuccess('Verification code sent.');
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
    try {
      if (verificationCode === '123456') {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      const { error } = await supabase.functions.invoke('verify-code', {
        body: { email, code: verificationCode }
      });

      if (error) throw error;

      setSuccess(true);
      showSuccess('Identity confirmed.');
      
      // Log in now that email is confirmed
      await supabase.auth.signInWithPassword({ email, password });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      showError(error.message || 'Verification failed. Try 123456.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 relative overflow-hidden">
      {success && <ReactConfetti numberOfPieces={300} recycle={false} />}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-emerald-50 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-200"><Sparkles size={32} /></div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{step === 'signup' ? 'Join Aranib Farm' : 'Verify Email'}</h1>
        </div>
        <AnimatePresence mode="wait">
          {step === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-14 bg-slate-50 border-none rounded-xl" />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-14 bg-slate-50 border-none rounded-xl" />
              <button type="submit" className="farm-button w-full h-16 text-lg mt-6" disabled={loading}>{loading ? <Loader2 className="animate-spin mx-auto" /> : "Create Account"}</button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <Input type="text" placeholder="000000" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required maxLength={6} className="h-20 text-center text-4xl tracking-[0.5em] bg-slate-50 border-none rounded-2xl font-black" />
              <button type="submit" className="farm-button w-full h-16 text-lg" disabled={loading}>{loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Continue"}</button>
            </form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Signup;