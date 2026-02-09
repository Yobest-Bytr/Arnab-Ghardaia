import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Globe, Settings, Sparkles, Loader2, LogOut, Check, Palette, Server, Zap, Key, Database, MessageSquare, Code } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';
import AvatarDecoration, { avatarDecorationEffects } from '@/components/AvatarDecoration';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedEffect, setSelectedEffect] = useState<string>('none');
  
  // AI Keys State
  const [keys, setKeys] = useState({
    openai: '',
    gemini: '',
    grok: ''
  });

  useEffect(() => {
    if (user) {
      const savedEffect = localStorage.getItem(`avatar_effect_${user.id}`);
      if (savedEffect) setSelectedEffect(savedEffect);
      
      const savedKeys = localStorage.getItem(`ai_keys_${user.id}`);
      if (savedKeys) setKeys(JSON.parse(savedKeys));

      const savedName = localStorage.getItem(`display_name_${user.id}`);
      setDisplayName(savedName || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const handleUpdateProfile = () => {
    if (user) {
      localStorage.setItem(`display_name_${user.id}`, displayName);
      showSuccess('Profile updated successfully');
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

  const saveAvatarEffect = (effect: string) => {
    if (user) {
      setSelectedEffect(effect);
      localStorage.setItem(`avatar_effect_${user.id}`, effect);
      showSuccess(`Applied ${effect} effect`);
    }
  };

  const saveAiKeys = () => {
    if (user) {
      localStorage.setItem(`ai_keys_${user.id}`, JSON.stringify(keys));
      showSuccess('AI Keys updated successfully');
    }
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
              <TabsTrigger value="ai-keys" className="rounded-full px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold whitespace-nowrap">
                <Key size={16} className="mr-2" /> AI Keys
              </TabsTrigger>
              <TabsTrigger value="workspace" className="rounded-full px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold whitespace-nowrap">
                <Database size={16} className="mr-2" /> Workspace
              </TabsTrigger>
              <TabsTrigger value="appearance" className="rounded-full px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold whitespace-nowrap">
                <Palette size={16} className="mr-2" /> Appearance
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
                  <h3 className="text-xl font-bold">{displayName}</h3>
                  <p className="text-white/40 text-sm font-medium">{user?.email}</p>
                </div>
                <div className="md:col-span-2 p-10 pill-nav bg-white/5 border-white/10 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-white/30 uppercase tracking-widest">Display Name</Label>
                    <Input 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-white/5 border-white/10 h-12 rounded-xl font-bold" 
                    />
                  </div>
                  <Button onClick={handleUpdateProfile} className="auron-button h-12 px-8">Save Changes</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-keys" className="space-y-8">
              <div className="p-10 pill-nav bg-white/5 border-white/10 max-w-3xl">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <Key className="text-indigo-400" />
                  Custom AI Integration
                </h3>
                <p className="text-white/40 mb-8 font-medium">Add your own API keys to use specific models within Yobest AI.</p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-white/30 uppercase tracking-widest">OpenAI API Key</Label>
                    <Input 
                      type="password" 
                      placeholder="sk-..." 
                      value={keys.openai}
                      onChange={(e) => setKeys({...keys, openai: e.target.value})}
                      className="bg-white/5 border-white/10 h-12 rounded-xl font-mono" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-white/30 uppercase tracking-widest">Google Gemini Key</Label>
                    <Input 
                      type="password" 
                      placeholder="AIza..." 
                      value={keys.gemini}
                      onChange={(e) => setKeys({...keys, gemini: e.target.value})}
                      className="bg-white/5 border-white/10 h-12 rounded-xl font-mono" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-white/30 uppercase tracking-widest">xAI Grok Key</Label>
                    <Input 
                      type="password" 
                      placeholder="xai-..." 
                      value={keys.grok}
                      onChange={(e) => setKeys({...keys, grok: e.target.value})}
                      className="bg-white/5 border-white/10 h-12 rounded-xl font-mono" 
                    />
                  </div>
                  <Button onClick={saveAiKeys} className="auron-button h-12 px-8 mt-4">Update AI Keys</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workspace" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-10 pill-nav bg-white/5 border-white/10 space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <MessageSquare className="text-indigo-400" size={20} />
                    AI Message History
                  </h3>
                  <p className="text-sm text-white/40">Automatically save all conversations with Grok and other models.</p>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="font-bold">Auto-Save Messages</span>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="p-10 pill-nav bg-white/5 border-white/10 space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <Code className="text-[#99f6ff]" size={20} />
                    Script Repository
                  </h3>
                  <p className="text-sm text-white/40">Store and manage your custom automation scripts and snippets.</p>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="font-bold">Cloud Sync Scripts</span>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
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
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;