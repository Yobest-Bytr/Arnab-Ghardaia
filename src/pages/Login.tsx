import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showSuccess('Welcome back.');
      navigate('/dashboard');
    } catch (error: any) {
      showError(error.message || 'Failed to log in');
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
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-[#99f6ff]" size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-white/40 font-medium">Access your cognitive workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="pill-nav p-1 px-6 flex items-center bg-white/5 border-white/10">
            <Input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="bg-transparent border-none h-14 text-white placeholder:text-white/20 focus-visible:ring-0"
            />
          </div>
          <div className="pill-nav p-1 px-6 flex items-center bg-white/5 border-white/10">
            <Input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="bg-transparent border-none h-14 text-white placeholder:text-white/20 focus-visible:ring-0"
            />
          </div>
          <button type="submit" className="auron-button w-full h-14 text-lg mt-4" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Log In"}
          </button>
        </form>

        <p className="text-center mt-8 text-white/40 font-medium">
          New here? <Link to="/signup" className="text-[#99f6ff] hover:underline">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;