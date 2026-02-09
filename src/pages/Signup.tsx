import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Users, Brain, Mail, ShieldCheck, ArrowRight, AlertCircle, Info, Eye, EyeOff, Check, X } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { grokChat } from '@/lib/puter';
import AvatarDecoration from '@/components/AvatarDecoration';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [success, setSuccess] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const strength = passwordRequirements.filter(r => r.met).length;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 3) {
      showError('Please use a stronger password.');
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        if (error.status === 429) {
          throw new Error("Too many signup attempts. Please wait a few minutes.");
        }
        throw error;
      }

      if (data.user) {
        setUserId(data.user.id);
        try {
          // Attempt to send code, but don't block if the function fails (401/404)
          await supabase.functions.invoke('send-verification-code', {
            body: { email, userId: data.user.id },
          });
          showSuccess('Verification code sent.');
        } catch (fErr: any) {
          console.error("Edge Function Error:", fErr);
          // Fallback: Still move to verify step so user can check DB
          setStep('verify');
        }
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

      if (error || !data) throw new Error('Invalid or expired code.');

      setSuccess(true);
      showSuccess('Email verified.');
      
      const msg = await grokChat(`Write a 1-sentence welcome message for a new user named ${email.split('@')[0]} who just joined Yobest AI.`);
      setWelcomeMsg(msg);

      setTimeout(() => navigate('/dashboard'), 4000);
    } catch (error: any) {
      showError(error.message || 'Verification failed.');
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
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 mb-8 uppercase tracking-widest"
          >
            <Sparkles size={12} />
            <span>Neural Network Integration</span>
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 dopamine-text">
            {step === 'signup' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-white/40 font-medium">
            {step === 'signup' ? 'Join the elite 1% of cognitive builders' : `Enter the code sent to ${email}`}
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
              <div className="pill-nav p-1 px-6 flex items-center bg-white/5 border-white/10 focus-within:border-[#99f6ff]/50 transition-all group relative">
                <ShieldCheck className="text-white/20 group-focus-within:text-[#99f6ff] transition-colors" size={20} />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Strong Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="bg-transparent border-none h-14 text-white placeholder:text-white/20 focus-visible:ring-0 font-medium pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              <div className="px-6 py-4 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all duration-500 ${
                        strength >= i ? (strength === 3 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-white/10'
                      }`} 
                    />
                  ))}
                </div>
                <div className="space-y-1">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                      {req.met ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-white/20" />}
                      <span className={req.met ? 'text-white/60' : 'text-white/20'}>{req.label}</span>
                    </div>
                  ))}
                </div>
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
              <div className="flex justify-center mb-8">
                <AvatarDecoration 
                  fallbackText={email} 
                  effect="none" 
                  size="lg" 
                />
              </div>
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
                  <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-200/60 leading-relaxed">
                    Check the <code className="text-amber-400">auth_codes</code> table in Supabase for the code if email fails.
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