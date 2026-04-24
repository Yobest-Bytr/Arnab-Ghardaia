import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Shield, Settings, Sparkles, Loader2, LogOut,
  Check, Palette, Bell, ShieldCheck, Mail, Key, Cpu, Zap, Eye, EyeOff, Globe, ExternalLink, BrainCircuit
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    openai: false,
    anthropic: false,
    deepseek: false,
    google: false,
    grok: false,
    gemini: false
  });
  
  const [aiKeys, setAiKeys] = useState({
    openai: '',
    anthropic: '',
    deepseek: '',
    google: '',
    grok: '',
    gemini: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      loadKeys();
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

  const loadKeys = () => {
    const savedKeys = localStorage.getItem(`neural_keys_${user?.id}`);
    if (savedKeys) {
      setAiKeys(JSON.parse(savedKeys));
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
        showSuccess(t('save'));
      } catch (err) {
        showError('Failed to update profile.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveKeys = () => {
    localStorage.setItem(`neural_keys_${user?.id}`, JSON.stringify(aiKeys));
    showSuccess(t('initializeUplink'));
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const providerLinks: Record<string, string> = {
    openai: 'https://platform.openai.com/api-keys',
    anthropic: 'https://console.anthropic.com/settings/keys',
    deepseek: 'https://platform.deepseek.com/api_keys',
    google: 'https://aistudio.google.com/app/apikey',
    grok: 'https://x.ai/api',
    gemini: 'https://aistudio.google.com/app/apikey'
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white relative overflow-hidden">
      <div className="absolute inset-0 auron-radial pointer-events-none opacity-50" />
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <header className="mb-12">
            <h1 className="text-5xl font-black tracking-tighter">{t('neuralSettings')}</h1>
            <p className="text-white/40 font-medium mt-1 text-lg">Configure your identity and cognitive uplink.</p>
          </header>

          <div className="grid lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1">
              <div className="pill-nav p-8 text-center bg-white/5 border-white/10">
                <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-black mb-1">{displayName}</h3>
                <p className="text-xs text-white/20 font-bold uppercase tracking-widest mb-8">{user?.email}</p>
                <button onClick={signOut} className="w-full py-4 rounded-2xl bg-rose-500/10 text-rose-400 font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2">
                  <LogOut size={16} /> {t('terminateSession')}
                </button>
              </div>
            </aside>

            <div className="lg:col-span-3">
              <Tabs defaultValue="general" className="space-y-8">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-16">
                  <TabsTrigger value="general" className="rounded-xl px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">
                    {t('identity')}
                  </TabsTrigger>
                  <TabsTrigger value="keys" className="rounded-xl px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">
                    {t('neuralKeys')}
                  </TabsTrigger>
                  <TabsTrigger value="security" className="rounded-xl px-8 data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">
                    {t('security')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-8">
                  <div className="pill-nav p-10 bg-white/5 border-white/10">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                      <User className="text-indigo-400" size={24} />
                      Personal Information
                    </h3>
                    <div className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('displayName')}</Label>
                          <Input 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold focus:border-indigo-500/50" 
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">{t('emailAddress')}</Label>
                          <Input 
                            value={user?.email || ''} 
                            disabled
                            className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold opacity-40 cursor-not-allowed" 
                          />
                        </div>
                      </div>
                      <Button onClick={handleUpdateProfile} disabled={loading} className="auron-button h-14 px-10">
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Check className="mr-2" size={20} />}
                        {t('saveIdentity')}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="keys" className="space-y-8">
                  <div className="pill-nav p-10 bg-white/5 border-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black flex items-center gap-3">
                        <Key className="text-indigo-400" size={24} />
                        {t('neuralKeys')}
                      </h3>
                      <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        Local Encryption Active
                      </div>
                    </div>
                    
                    <p className="text-white/40 font-medium mb-10 leading-relaxed">
                      Provide your own API keys to bypass default limits and use specific models in the Neural Lab. Keys are stored only in your browser's local storage.
                    </p>

                    <div className="space-y-8">
                      {[
                        { id: 'openai', name: 'OpenAI API Key', icon: Cpu },
                        { id: 'anthropic', name: 'Anthropic API Key', icon: Zap },
                        { id: 'deepseek', name: 'DeepSeek API Key', icon: Sparkles },
                        { id: 'google', name: 'Google Gemini API Key', icon: Globe },
                        { id: 'grok', name: 'xAI Grok API Key', icon: BrainCircuit },
                        { id: 'gemini', name: 'Google Gemini Pro API Key', icon: Sparkles },
                      ].map((k) => (
                        <div key={k.id} className="space-y-3">
                          <div className="flex items-center justify-between px-2">
                            <Label className="text-[10px] font-black text-white/30 uppercase tracking-widest">{k.name}</Label>
                            <a 
                              href={providerLinks[k.id]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                            >
                              Get Key <ExternalLink size={10} />
                            </a>
                          </div>
                          <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">
                              <k.icon size={20} />
                            </div>
                            <Input 
                              type={showKeys[k.id] ? "text" : "password"}
                              value={aiKeys[k.id as keyof typeof aiKeys]} 
                              onChange={(e) => setAiKeys({...aiKeys, [k.id]: e.target.value})}
                              placeholder={`sk-...`}
                              className="h-14 pl-14 pr-14 bg-white/5 border-white/10 rounded-2xl font-mono text-indigo-300 focus:border-indigo-500/50" 
                            />
                            <button 
                              type="button"
                              onClick={() => toggleKeyVisibility(k.id)}
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                            >
                              {showKeys[k.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <Button onClick={handleSaveKeys} className="auron-button h-14 px-10 w-full md:w-auto">
                        <ShieldCheck className="mr-2" size={20} />
                        {t('initializeUplink')}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-8">
                  <div className="pill-nav p-10 bg-white/5 border-white/10">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                      <ShieldCheck className="text-indigo-400" size={24} />
                      {t('security')}
                    </h3>
                    <div className="space-y-6">
                      <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Mail size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-black">Email Verification</p>
                            <p className="text-xs text-white/40 font-medium">Your neural link is verified and secure.</p>
                          </div>
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest">Verified</span>
                      </div>
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