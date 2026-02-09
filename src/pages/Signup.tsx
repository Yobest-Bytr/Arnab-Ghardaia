import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Users, Brain, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { grokChat } from '@/lib/puter';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [success, setSuccess] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState('');
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
        try {
          // Attempt to call the Edge Function
          const { error: funcError } = await supabase.functions.invoke('send-verification-code', {
            body: { email, userId: data.user.id },
          });
          
          if (funcError) throw funcError;
          showSuccess('Verification code sent to your email.');
        } catch (fErr) {
          console.warn("Edge Function not reachable. Ensure it is deployed.", fErr);
          showError('Verification service offline. Please ensure the Edge Function is deployed.');
          // For development/demo purposes, we'll let them see the verify screen
        }
        setStep('verify');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('auth_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('code', verificationCode)
        .eq('purpose', 'email_verification')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) throw new Error('Invalid or expired verification code.');

      setSuccess(true);
      showSuccess('Email verified successfully.');
      
      const msg = await grokChat(`Write a 1-sentence welcome message for a new user named ${email.split('@')[0]} who just joined Yobest AI.`);
      setWelcomeMsg(msg);

      setTimeout(() => navigate('/dashboard'), 4000);
    } catch (error: any) {
      showError(error.message || 'Verification failed. Check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center px-6 relative overflow-hidden">
      {success && <ReactConfetti numberOfPieces={300} recycle={false} />}
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-indigo-400 mb-8 uppercase tracking-widest"
          >
            <Users size={12} />
            <span>Join 640,000+ Users</span>
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 dopamine-text">
            {step === 'signup' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-white/40 font-medium">
            {step === 'signup' ? 'Start your cognitive journey' : `Enter the code sent to ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pill-nav p-10 text-center bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)]"
            >
              <Brain size={48} className="text-[#99f6ff] mx-auto mb-6 animate-pulse" />
              <h3 className="text-2xl font-bold mb-4">Initializing Neural Link...</h3>
              <p className="text-gray-300 italic font-medium">"{welcomeMsg}"</p>
            </motion.div>
          ) : step === 'signup' ? (
            <motion.form 
              key="signup-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSignup} 
              className="space-y-4"
            >
              <div className="pill-nav p-1 px-6 flex items-center bg-white/5 border-white/10 focus-within:border-[#99f6ff]/50 transition-all group">
                <Mail className="text-white/20 group-focus-within:text-[#99f6ff] transition-colors" size={20} />
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="bg-transparent border-none h-14 text-white placeholder:text-white/20 focus-visible:ring-0 font-medium"
                />
              </div>
              <div className="pill-nav p-1 px-6 flex items-center bg-white/5 border-white/10 focus-within:border-[#99f6ff]/50 transition-all group">
                <ShieldCheck className="text-white/20 group-focus-within:text-[#99f6ff] transition-colors" size={20} />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="bg-transparent border-none h-14 text-white placeholder:text-white/20 focus-visible:ring-0 font-medium"
                />
              </div>
              <button type="submit" className="auron-button w-full h-16 text-xl mt-6 shadow-[0_0_30px_rgba(153,246,255,0.2)] flex items-center justify-center gap-3" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Join Yobest AI
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="verify-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerify} 
              className="space-y-4"
            >
              <div className="pill-nav p-1 px-6 flex items-center bg-white/5 border-white/10 focus-within:border-[#99f6ff]/50 transition-all">
                <Input 
                  type="text" 
                  placeholder="000000" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required 
                  maxLength={6}
                  className="bg-transparent border-none h-14 text-white text-center text-3xl tracking-[0.5em] placeholder:text-white/10 focus-visible:ring-0 font-black"
                />
              </div>
              <button type="submit" className="auron-button w-full h-16 text-xl mt-6 shadow-[0_0_30px_rgba(153,246,255,0.2)]" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Continue"}
              </button>
              
              <div className="flex flex-col gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={() => setStep('signup')}
                  className="text-white/40 text-sm font-bold hover:text-white transition-colors"
                >
                  Back to Signup
                </button>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-200/60 leading-relaxed">
                    If you didn't receive a code, ensure the Supabase Edge Function is deployed and your SMTP credentials are correct.
                  </p>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {step === 'signup' && !success && (
          <p className="text-center mt-10 text-white/40 font-medium">
            Already a member? <Link to="/login" className="text-[#99f6ff] font-bold hover:underline">Log In</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Signup;