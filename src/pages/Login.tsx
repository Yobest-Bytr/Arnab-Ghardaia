import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showSuccess('Welcome back to Yobest AI!');
      navigate('/dashboard');
    } catch (error: any) {
      showError(error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-indigo-500/10 blur-[100px] -z-10 rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-gray-900">
          <CardHeader className="space-y-2 ai-gradient text-white pb-12 pt-12 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="flex justify-center mb-4 relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md border border-white/30">
                <Sparkles className="w-10 h-10 text-white fill-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight relative z-10">Welcome Back</CardTitle>
            <CardDescription className="text-indigo-100 font-medium relative z-10">
              Log in to your AI-powered workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-10 px-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="font-bold ml-1">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="rounded-2xl bg-gray-50 dark:bg-gray-800 border-none h-12 font-medium"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password font-bold">Password</Label>
                  <Link to="/forgot-password" title="Forgot Password" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="rounded-2xl bg-gray-50 dark:bg-gray-800 border-none h-12 font-medium pr-12"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full ai-gradient hover:opacity-90 rounded-2xl h-14 text-lg font-black shadow-xl ai-glow border-none mt-4" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Log In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pb-10 px-8">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                <span className="bg-white dark:bg-gray-900 px-4 text-gray-400">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-2xl h-12 border-gray-100 dark:border-gray-800 font-bold hover:bg-gray-50 dark:hover:bg-gray-800">
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
              </svg>
              Google Account
            </Button>
            <p className="text-center text-sm text-gray-500 font-medium">
              New to Yobest AI?{' '}
              <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-black hover:underline">
                Create Account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;