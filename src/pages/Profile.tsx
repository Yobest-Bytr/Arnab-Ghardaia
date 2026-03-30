import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Settings, Sparkles, Loader2, LogOut, Check, Palette, Bell, ShieldCheck, Mail } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const profiles = await storage.get('profiles', user.id);
    if (profiles && profiles.length > 0) {
      setDisplayName(profiles[0].display_name || user.email?.split('@')[0] || '');
    } else {
      setDisplayName(user.email?.split('@')[0] || '');
    }
  };

  const handleUpdateProfile = async () => {
    if (user) {
      setLoading(true);
      try {
        const profiles = await storage.get('profiles', user.id);
        if (profiles && profiles.length > 0) {
          await storage.update('profiles', user.id, profiles[0].id, { display_name: displayName });
        } else {
          await storage.insert('profiles', user.id, { display_name: displayName, email: user.email });
        }
        showSuccess('Profile updated in cloud.');
      } catch (err) {
        showError('Failed to update profile.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your personal information and farm preferences.</p>
          </header>

          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="farm-card p-6 text-center">
                <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-xl shadow-emerald-200 dark:shadow-none">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{displayName}</h3>
                <p className="text-sm text-slate-400 font-medium mb-6">{user?.email}</p>
                <button onClick={signOut} className="w-full py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 font-bold text-sm hover:bg-rose-100 transition-all flex items-center justify-center gap-2">
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </aside>

            <div className="lg:col-span-3 space-y-8">
              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1 rounded-2xl h-14">
                  <TabsTrigger value="general" className="rounded-xl px-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="security" className="rounded-xl px-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold">
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="rounded-xl px-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold">
                    Notifications
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                  <div className="farm-card">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <User className="text-emerald-600" size={20} />
                      Personal Information
                    </h3>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</Label>
                          <Input 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</Label>
                          <Input 
                            value={user?.email || ''} 
                            disabled
                            className="h-12 bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl font-bold opacity-60" 
                          />
                        </div>
                      </div>
                      <Button onClick={handleUpdateProfile} disabled={loading} className="farm-button h-12 px-8">
                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Check className="mr-2" size={18} />}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <div className="farm-card">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <ShieldCheck className="text-emerald-600" size={20} />
                      Security Settings
                    </h3>
                    <div className="space-y-6">
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="text-emerald-600" size={20} />
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Email Verification</p>
                            <p className="text-xs text-slate-500">Your email is verified and secure.</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest">Verified</span>
                      </div>
                      <Button variant="outline" className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold">
                        Change Password
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <div className="farm-card">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Bell className="text-emerald-600" size={20} />
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      {[
                        { title: "Breeding Alerts", desc: "Get notified when a litter is due." },
                        { title: "Health Reminders", desc: "Daily check-up reminders for your stock." },
                        { title: "Market Updates", desc: "Weekly reports on rabbit market prices." }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                          </div>
                          <div className="w-12 h-6 bg-emerald-600 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;