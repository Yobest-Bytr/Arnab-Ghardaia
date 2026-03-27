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
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
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
    try {
      // 1. Create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;

      if (data.user) {
        setUserId(data.user.id);
        
        // 2. Call the Edge Function. 
        // It will generate the code, store it in 'auth_codes', and send the email.
        const { error: funcError } = await supabase.functions.invoke('send-verification-code', {
          body: { email, userId: data.user.id },
        });

        if (funcError) {
          console.error("Edge Function Error:", funcError);
          showError('Neural link delayed. Use 123456 for demo if email fails.');
        } else {
          showSuccess('Verification code transmitted to your Gmail.');
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
      // Check the code against the database using the schema from your Edge Function
      const { data, error } = await supabase
        .from('auth_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('code', verificationCode)
        .eq('purpose', 'email_verification')
        .single();

      if (error && verificationCode !== '123456') {
        throw new Error('Invalid or expired verification code.');
      }

      setSuccess(true);
      showSuccess('Neural identity confirmed.');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error: any) {
      showError(error.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 relative overflow-hidden">
      {success && <ReactConfetti numberOfPieces={300} recycle={false} />}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-emerald-50 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-200">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {step === 'signup' ? 'Join Aranib Farm' : 'Verify Your Email'}
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            {step === 'signup' ? 'Start managing your rabbit business today.' : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Check size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome Aboard!</h3>
              <p className="text-slate-500">Initializing your farm dashboard...</p>
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
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="pl-12 h-14 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                    {req.met ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-slate-300" />}
                    <span className={req.met ? 'text-slate-900' : 'text-slate-400'}>{req.label}</span>
                  </div>
                ))}
              </div>

              <button type="submit" className="farm-button w-full h-16 text-lg mt-6 flex items-center justify-center gap-3" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Create Account
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
                  className="h-20 text-center text-4xl tracking-[0.5em] bg-slate-50 border-none rounded-2xl font-black focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button type="submit" className="farm-button w-full h-16 text-lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Continue"}
              </button>
              
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                <Info size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                  If you don't receive an email, use code <code className="bg-amber-100 px-1 rounded">123456</code> for this demo.
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {step === 'signup' && !success && (
          <p className="text-center mt-8 text-slate-400 font-bold text-sm">
            Already have an account? <Link to="/login" className="text-emerald-600 hover:underline">Log In</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Signup;