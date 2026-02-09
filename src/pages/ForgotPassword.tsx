import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/profile',
      });
      if (error) throw error;
      setSubmitted(true);
      showSuccess('Recovery link sent to your neural node.');
    } catch (error: any) {
      showError(error.message || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(153,246,255,0.1)]"
          >
            <KeyRound className="text-[#99f6ff]" size={40} />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 dopamine-text">Recover Access</h1>
          <p className="text-white/40 font-medium">We'll send a recovery link to your email</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleReset} className="space-y-4">
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
            <button type="submit" className="auron-button w-full h-16 text-xl mt-6 flex items-center justify-center gap-3" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  Send Recovery Link
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="pill-nav p-10 text-center bg-indigo-500/10 border-indigo-500/30">
            <Sparkles size={48} className="text-[#99f6ff] mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">Check Your Inbox</h3>
            <p className="text-white/40 font-medium mb-8">If an account exists for {email}, you will receive a link shortly.</p>
            <Link to="/login" className="text-[#99f6ff] font-bold hover:underline">Return to Login</Link>
          </div>
        )}

        {!submitted && (
          <p className="text-center mt-10 text-white/40 font-medium">
            Remembered your password? <Link to="/login" className="text-[#99f6ff] font-bold hover:underline">Log In</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;