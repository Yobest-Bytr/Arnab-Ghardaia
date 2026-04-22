
import React, { useState, useEffect } from 'react';
import { storage, UserSettings } from '@/lib/storage';
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
  Database
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());

  const handleSave = () => {
    storage.saveSettings(settings);
    toast.success('Settings saved successfully');
    // Apply theme if needed
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-primary">Settings</h1>
          <p className="text-muted-foreground">Configure your farm experience and AI preferences.</p>
        </div>
        <Button onClick={handleSave} className="rounded-full gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                <CardTitle>General Configuration</CardTitle>
              </div>
              <CardDescription>Basic farm information and display settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Farm Name</Label>
                <Input 
                  value={settings.farmName} 
                  onChange={(e) => setSettings({...settings, farmName: e.target.value})}
                  placeholder="e.g. Golden Valley Rabbitry"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(v: any) => setSettings({...settings, language: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={settings.theme} 
                    onValueChange={(v: any) => setSettings({...settings, theme: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <CardTitle>AI & Neural Lab</CardTitle>
              </div>
              <CardDescription>Configure your AI engine and API keys.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>OpenAI / Anthropic API Key</Label>
                <Input 
                  type="password"
                  value={settings.aiKey || ''} 
                  onChange={(e) => setSettings({...settings, aiKey: e.target.value})}
                  placeholder="sk-..."
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Your key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                <div className="space-y-0.5">
                  <Label>Advanced Analysis</Label>
                  <p className="text-xs text-muted-foreground">Enable deep neural processing for farm data.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-2 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">System Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Version</span>
                <span className="font-bold">4.1.0-flow</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-bold">124 KB</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last Backup</span>
                <span className="font-bold">2 hours ago</span>
              </div>
              <Button variant="outline" className="w-full text-xs h-8 rounded-lg gap-2">
                <Database className="h-3 w-3" />
                Export Data
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-sm">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Breeding Alerts</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Health Reminders</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">System Updates</span>
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
