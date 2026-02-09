import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, Chrome, ShieldCheck, Mail, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showSuccess('Neural link established.');
      navigate('/dashboard');
    } catch (error: any) {
      showError(error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
    } catch (error: any) {
      showError(error.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      
      {/* Cognitive Scan Effect */}
      <motion.div 
        initial={{ top: '-100%' }}
        animate={{ top: '100%' }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#99f6ff]/30 to-transparent z-0 pointer-events-none"
      />

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
            <Sparkles className="text-[#99f6ff]" size={40} />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 dopamine-text">Welcome Back</h1>
          <p className="text-white/40 font-medium">Access your cognitive workspace</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="pill-nav w-full h-16 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 transition-all font-bold border-white/10 group"
          >
            <Chrome size={20} className="text-[#99f6ff] group-hover:scale-110 transition-transform" />
            Continue with Google
          </button>

          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]"><span className="bg-[#020408] px-4 text-white/20 font-black">Neural Authentication</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Password" 
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
            
            <div className="flex items-center justify-between px-2">
              <button 
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 group"
              >
                <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-[#99f6ff] border-[#99f6ff]' : 'border-white/10 group-hover:border-white/30'}`}>
                  {rememberMe && <Check size={10} className="text-[#020408] stroke-[4]" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors">Remember Me</span>
              </button>
              <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-[#99f6ff] transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="auron-button w-full h-16 text-xl mt-6 flex items-center justify-center gap-3" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  Initialize Link
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-white/40 font-medium">
          New here? <Link to="/signup" className="text-[#99f6ff] font-bold hover:underline">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;