import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Users, Brain, Mail, ShieldCheck } from 'lucide-react';
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
        // Call the Edge Function to send the code
        const { error: funcError } = await supabase.functions.invoke('send-verification-code', {
          body: { email, userId: data.user.id },
        });
        
        if (funcError) throw funcError;
        
        showSuccess('Verification code sent to your email.');
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
      // Verify the code against the database
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
      
      // Grok Welcome
      const msg = await grokChat(`Write a 1-sentence welcome message for a new user named ${email.split('@')[0]} who just joined Yobest AI.`);
      setWelcomeMsg(msg);

      setTimeout(() => navigate('/dashboard'), 4000);
    } catch (error: any) {
      showError(error.message || 'Verification failed');
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-indigo-400 mb-8 uppercase tracking-widest">
            <Users size={12} />
            <span>Join 640,000+ Users</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-2">
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
              className="pill-nav p-10 text-center bg-indigo-500/10 border-indigo-500/30"
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
              <div className="pill-nav p-1 px-6 flex items-center bg-white/5 border-white/10 focus-within:border-[#99f6ff]/50 transition-all">
                <Mail className="text-white/20 mr-2" size={20} />
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="bg-transparent border-none h-14 text-white placeholder:text-white/20 focus-visible:ring-0 font-medium"
                />
              </div>
              <div className="pill-nav p-1 px-6 flex items-center bg-white/5 border-white/10 focus-within:border-[#99f6ff]/50 transition-all">
                <ShieldCheck className="text-white/20 mr-2" size={20} />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="bg-transparent border-none h-14 text-white placeholder:text-white/20 focus-visible:ring-0 font-medium"
                />
              </div>
              <button type="submit" className="auron-button w-full h-16 text-xl mt-6 shadow-[0_0_30px_rgba(153,246,255,0.2)]" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Join Yobest AI"}
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
                  placeholder="6-Digit Code" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required 
                  maxLength={6}
                  className="bg-transparent border-none h-14 text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/20 focus-visible:ring-0 font-black"
                />
              </div>
              <button type="submit" className="auron-button w-full h-16 text-xl mt-6 shadow-[0_0_30px_rgba(153,246,255,0.2)]" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Continue"}
              </button>
              <button 
                type="button" 
                onClick={() => setStep('signup')}
                className="w-full text-center text-white/40 text-sm font-bold hover:text-white transition-colors mt-4"
              >
                Back to Signup
              </button>
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