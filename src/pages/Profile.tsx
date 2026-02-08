import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Shield, Trash2, Camera, Loader2, Sparkles, Moon, Sun, Download } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      showSuccess('Password updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="md:ml-[280px] pt-16 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">Account Settings</h1>

            <div className="grid gap-8">
              {/* Profile Info */}
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-gray-900 overflow-hidden">
                <CardHeader className="ai-gradient text-white pb-16 relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center border-4 border-white/30 backdrop-blur-md group-hover:scale-105 transition-transform duration-500">
                        <User size={48} />
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-xl hover:bg-indigo-50 transition-all">
                        <Camera size={20} />
                      </button>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-black">{user?.email?.split('@')[0]}</CardTitle>
                      <CardDescription className="text-indigo-100 font-medium flex items-center gap-2">
                        <Sparkles size={14} /> AI-Enhanced Account
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-10 space-y-8 px-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={14} /> Email Address
                      </Label>
                      <Input value={user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold h-12" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Sun size={14} /> Appearance
                      </Label>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl h-12">
                        <span className="text-sm font-bold dark:text-white">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                        <button 
                          onClick={toggleDarkMode}
                          className={`w-12 h-6 rounded-full transition-colors relative ${isDark ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        >
                          <motion.div 
                            animate={{ x: isDark ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-gray-900 p-4">
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-3 dark:text-white">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                      <Shield size={20} />
                    </div>
                    Security & Privacy
                  </CardTitle>
                  <CardDescription className="font-medium">Update your credentials to keep your AI workspace secure.</CardDescription>
                </CardHeader>
                <CardContent className="px-6">
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="new-password font-bold">New Password</Label>
                        <Input 
                          id="new-password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="rounded-2xl bg-gray-50 dark:bg-gray-800 border-none h-12" 
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="confirm-password font-bold">Confirm Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="rounded-2xl bg-gray-50 dark:bg-gray-800 border-none h-12" 
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="ai-gradient hover:opacity-90 rounded-2xl px-8 h-12 font-bold shadow-lg border-none" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Data & Danger */}
              <div className="grid sm:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-gray-900 p-4">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-3 dark:text-white">
                      <Download size={20} className="text-emerald-600" />
                      Export Data
                    </CardTitle>
                    <CardDescription className="font-medium">Download your tasks and AI insights in JSON format.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6">
                    <Button variant="outline" className="w-full rounded-2xl border-emerald-100 dark:border-emerald-900/30 text-emerald-600 font-bold h-12">
                      Download Archive
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-gray-900 p-4 border-l-4 border-red-500">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-3 text-red-600">
                      <Trash2 size={20} />
                      Danger Zone
                    </CardTitle>
                    <CardDescription className="font-medium">Permanently delete your account and all AI data.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6">
                    <Button variant="destructive" className="w-full rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 border-none font-bold h-12">
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;