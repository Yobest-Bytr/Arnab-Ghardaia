import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Sparkles, Users } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';
import ReactConfetti from 'react-confetti';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setSuccess(true);
      showSuccess('Welcome to the elite 1%! Check your email.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      showError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 relative overflow-hidden">
      {success && <ReactConfetti numberOfPieces={200} recycle={false} />}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-indigo-500/10 blur-[100px] -z-10 rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 shadow-xl text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-50 dark:border-indigo-900/30">
            <Users size={12} />
            <span>Join 640,000+ Users</span>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-gray-900">
          <CardHeader className="space-y-2 ai-gradient text-white pb-12 pt-12 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <CardTitle className="text-3xl font-black tracking-tight relative z-10">Create Account</CardTitle>
            <CardDescription className="text-indigo-100 font-medium relative z-10">
              Start your journey to peak productivity
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-10 px-8">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-3">
                <Label className="font-bold ml-1">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="rounded-2xl bg-gray-50 dark:bg-gray-800 border-none h-12 font-medium"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-bold ml-1">Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="rounded-2xl bg-gray-50 dark:bg-gray-800 border-none h-12 font-medium pr-12"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-bold ml-1">Confirm Password</Label>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  className="rounded-2xl bg-gray-50 dark:bg-gray-800 border-none h-12 font-medium"
                />
              </div>
              <Button type="submit" className="w-full ai-gradient hover:opacity-90 rounded-2xl h-14 text-lg font-black shadow-xl ai-glow border-none mt-4" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Join Yobest AI"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pb-10 px-8">
            <p className="text-center w-full text-sm text-gray-500 font-medium">
              Already a member?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-black hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;