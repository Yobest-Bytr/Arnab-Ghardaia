
import React, { useState, useEffect } from 'react';
import { storage, UserSettings } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Settings as SettingsIcon,
  Globe,
  Palette,
  BrainCircuit,
  Save,
  Bell,
  Shield,
  Database,
  Cpu,
  Zap,
  Layout,
  Moon,
  Sun,
  Monitor,
  Heart,
  Baby,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/utils/toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    language: 'en',
    farmName: 'My Hop Farm',
    aiProvider: 'openai'
  });
  const { setLanguage, t } = useLanguage();
  const { setTheme } = useTheme();

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await storage.getSettings();
      setSettings(saved);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await storage.saveSettings(settings);
      setLanguage(settings.language);
      setTheme(settings.theme);
      showSuccess('Settings saved successfully');
    } catch (error: any) {
      showError(error);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-10 pb-24 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-4">
            <SettingsIcon className="h-10 w-10" />
            {t('neuralSettings')}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Configure your farm experience and cognitive uplink preferences.</p>
        </div>
        <Button onClick={handleSave} className="rounded-2xl h-14 px-8 gap-2 shadow-lg shadow-primary/20 font-black text-lg w-full md:w-auto">
          <Save className="h-6 w-6" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 rounded-[2.5rem] overflow-hidden shadow-sm">
              <CardHeader className="p-8 bg-slate-50 dark:bg-slate-900/50 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Layout className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight">General Configuration</CardTitle>
                    <CardDescription className="font-medium">Basic farm information and display settings.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Farm Name</Label>
                  <Input 
                    value={settings.farmName} 
                    onChange={(e) => setSettings({...settings, farmName: e.target.value})}
                    placeholder="e.g. Golden Valley Rabbitry"
                    className="h-14 rounded-2xl border-2 text-lg font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Language</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(v: any) => setSettings({...settings, language: v})}
                    >
                      <SelectTrigger className="h-14 rounded-2xl border-2 font-bold">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-primary" />
                          <SelectValue placeholder="Select Language" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="en" className="font-bold">🇺🇸 English</SelectItem>
                        <SelectItem value="fr" className="font-bold">🇫🇷 Français</SelectItem>
                        <SelectItem value="ar" className="font-bold">🇸🇦 العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Theme</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(v: any) => setSettings({...settings, theme: v})}
                    >
                      <SelectTrigger className="h-14 rounded-2xl border-2 font-bold">
                        <div className="flex items-center gap-2">
                          {settings.theme === 'light' ? <Sun className="h-5 w-5 text-primary" /> : 
                           settings.theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : 
                           <Monitor className="h-5 w-5 text-primary" />}
                          <SelectValue placeholder="Select Theme" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="light" className="font-bold">Light Mode</SelectItem>
                        <SelectItem value="dark" className="font-bold">Dark Mode</SelectItem>
                        <SelectItem value="system" className="font-bold">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2 rounded-[2.5rem] overflow-hidden shadow-sm">
              <CardHeader className="p-8 bg-slate-50 dark:bg-slate-900/50 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <BrainCircuit className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight">AI & Neural Lab</CardTitle>
                    <CardDescription className="font-medium">Configure your AI engine and cognitive uplink keys.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">AI Model Provider</Label>
                  <Select 
                    value={settings.aiProvider || 'openai'} 
                    onValueChange={(v: any) => setSettings({...settings, aiProvider: v})}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-2 font-bold">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-indigo-500" />
                        <SelectValue placeholder="Select Provider" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="openai" className="font-bold">OpenAI (GPT-4o)</SelectItem>
                      <SelectItem value="anthropic" className="font-bold">Anthropic (Claude 3.5)</SelectItem>
                      <SelectItem value="google" className="font-bold">Google (Gemini 1.5)</SelectItem>
                      <SelectItem value="gemini" className="font-bold">Google Gemini Pro</SelectItem>
                      <SelectItem value="grok" className="font-bold">xAI (Grok-1)</SelectItem>
                      <SelectItem value="mistral" className="font-bold">Mistral AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">API Key</Label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                    <Input 
                      type="password"
                      value={settings.aiKey || ''} 
                      onChange={(e) => setSettings({...settings, aiKey: e.target.value})}
                      placeholder="Enter your API key..."
                      className="h-14 pl-12 rounded-2xl border-2 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">
                    Your key is stored locally in your browser and never sent to our servers.
                  </p>
                </div>
                <div className="flex items-center justify-between p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[1.5rem] border-2 border-indigo-100 dark:border-indigo-900/30">
                  <div className="space-y-1">
                    <Label className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Advanced Analysis</Label>
                    <p className="text-xs text-muted-foreground font-medium">Enable deep neural processing for farm data optimization.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-indigo-500" />
                </div>

                <div className="pt-8 border-t">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                    <Baby className="h-5 w-5 text-primary" />
                    Age Thresholds
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Young Age Threshold (Months)</Label>
                      <div className="relative">
                        <Baby className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-500" />
                        <Input
                          type="number"
                          value={settings.youngAgeThreshold || 6}
                          onChange={(e) => setSettings({...settings, youngAgeThreshold: parseInt(e.target.value)})}
                          className="h-14 pl-12 rounded-2xl border-2 font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">
                        Rabbits younger than this will be filtered as "Young".
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Adult Age Threshold (Months)</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                        <Input
                          type="number"
                          value={settings.adultAgeThreshold || 6}
                          onChange={(e) => setSettings({...settings, adultAgeThreshold: parseInt(e.target.value)})}
                          className="h-14 pl-12 rounded-2xl border-2 font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">
                        Rabbits older than or equal to this will be filtered as "Adult".
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="border-2 rounded-[2.5rem] bg-primary/[0.02] border-primary/20 overflow-hidden shadow-sm">
            <CardHeader className="p-6 border-b bg-white/50 dark:bg-slate-900/50">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-primary">System Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Version</span>
                <Badge variant="secondary" className="font-black rounded-lg">4.2.0-neural</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Storage</span>
                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Cloud
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Last Sync</span>
                <span className="font-black text-xs">Just now</span>
              </div>
              <Button variant="outline" className="w-full h-12 rounded-xl gap-2 font-black text-xs uppercase tracking-widest border-2">
                <Database className="h-4 w-4" />
                Export Data
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 rounded-[2.5rem] overflow-hidden shadow-sm">
            <CardHeader className="p-6 border-b bg-slate-50 dark:bg-slate-900/50">
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <Heart className="h-4 w-4 text-pink-500" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">Breeding Alerts</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <Shield className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">Health Reminders</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Bell className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">System Updates</span>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
