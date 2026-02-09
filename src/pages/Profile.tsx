import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Globe, Settings, Sparkles, Loader2, LogOut, Check, Palette, Server, Zap } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';
import AvatarDecoration, { avatarDecorationEffects } from '@/components/AvatarDecoration';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedEffect, setSelectedEffect] = useState<string>('none');
  const [domain, setDomain] = useState('yobest.ai');

  useEffect(() => {
    const savedEffect = localStorage.getItem(`avatar_effect_${user?.id}`);
    if (savedEffect) setSelectedEffect(savedEffect);
  }, [user]);

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

  const saveAvatarEffect = (effect: string) => {
    setSelectedEffect(effect);
    localStorage.setItem(`avatar_effect_${user?.id}`, effect);
    showSuccess(`Applied ${effect} effect`);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none" />
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-5xl font-black tracking-tighter dopamine-text">Settings</h1>
              <p className="text-white/40 font-medium mt-2">Manage your cognitive identity and workspace.</p>
            </div>
            <button onClick={signOut} className="pill-nav px-6 h-12 flex items-center gap-2 text-rose-400 border-rose-500/20 hover:bg-rose-500/10 transition-all font-bold">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>

          <Tabs defaultValue="account" className="space-y-12">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-full h-14 overflow-x-auto flex-nowrap">
              <TabsTrigger value="account" className="rounded-full px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold whitespace-nowrap">
                <User size={16} className="mr-2" /> Account
              </TabsTrigger>
              <TabsTrigger value="appearance" className="rounded-full px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold whitespace-nowrap">
                <Palette size={16} className="mr-2" /> Appearance
              </TabsTrigger>
              <TabsTrigger value="project" className="rounded-full px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold whitespace-nowrap">
                <Globe size={16} className="mr-2" /> Project
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-full px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold whitespace-nowrap">
                <Shield size={16} className="mr-2" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center p-10 pill-nav bg-white/5 border-white/10">
                  <AvatarDecoration 
                    fallbackText={user?.email || ''} 
                    effect={selectedEffect} 
                    size="xl" 
                    className="mb-6"
                  />
                  <h3 className="text-xl font-bold">{user?.email?.split('@')[0]}</h3>
                  <p className="text-white/40 text-sm font-medium">{user?.email}</p>
                  <div className="mt-6 px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    Pro Member
                  </div>
                </div>
                <div className="md:col-span-2 p-10 pill-nav bg-white/5 border-white/10 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-white/30 uppercase tracking-widest">Display Name</Label>
                    <Input defaultValue={user?.email?.split('@')[0]} className="bg-white/5 border-white/10 h-12 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-white/30 uppercase tracking-widest">Email Address</Label>
                    <Input value={user?.email || ''} disabled className="bg-white/5 border-white/10 h-12 rounded-xl font-bold opacity-50" />
                  </div>
                  <Button className="auron-button h-12 px-8">Save Changes</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-8">
              <div className="p-10 pill-nav bg-white/5 border-white/10">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <Sparkles className="text-[#99f6ff]" />
                  Avatar Decorations
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {avatarDecorationEffects.map((effect) => (
                    <button
                      key={effect.value}
                      onClick={() => saveAvatarEffect(effect.value)}
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        selectedEffect === effect.value 
                          ? 'border-[#99f6ff] bg-[#99f6ff]/10' 
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <AvatarDecoration 
                        fallbackText={user?.email || ''} 
                        effect={effect.value} 
                        size="md" 
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">{effect.label}</span>
                      {selectedEffect === effect.value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#99f6ff] text-[#020408] rounded-full flex items-center justify-center">
                          <Check size={14} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="project" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-10 pill-nav bg-white/5 border-white/10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black">Domains</h3>
                      <p className="text-white/40 font-medium">Connected workspace domains.</p>
                    </div>
                    <Button className="bg-white/10 hover:bg-white/20 text-white rounded-full px-6 font-bold">Add</Button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Globe size={20} />
                        </div>
                        <div>
                          <p className="font-bold">{domain}</p>
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-white/20 hover:text-white">Manage</Button>
                    </div>
                  </div>
                </div>

                <div className="p-10 pill-nav bg-white/5 border-white/10 space-y-8">
                  <h3 className="text-2xl font-black">Project Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="text-indigo-400" size={20} />
                        <div>
                          <p className="font-bold">Edge Computing</p>
                          <p className="text-xs text-white/40">Optimize latency globally</p>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="text-amber-400" size={20} />
                        <div>
                          <p className="font-bold">Auto-Optimization</p>
                          <p className="text-xs text-white/40">AI-driven task sorting</p>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-white/10 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-8">
              <div className="p-10 pill-nav bg-white/5 border-white/10 max-w-2xl">
                <h3 className="text-2xl font-black mb-8">Change Password</h3>
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-white/30 uppercase tracking-widest">New Password</Label>
                    <Input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 h-12 rounded-xl font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-white/30 uppercase tracking-widest">Confirm Password</Label>
                    <Input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/5 border-white/10 h-12 rounded-xl font-bold" 
                    />
                  </div>
                  <Button type="submit" className="auron-button h-12 px-8" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;