import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Shield, Trash2, Camera, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Profile = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="md:ml-[250px] pt-[60px] p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>

          <div className="space-y-6">
            {/* Profile Info */}
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white pb-12">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
                      <User size={40} />
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 transition-colors">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{user?.email?.split('@')[0]}</CardTitle>
                    <CardDescription className="text-blue-100">Manage your personal information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-500 flex items-center gap-2">
                      <Mail size={14} /> Email Address
                    </Label>
                    <Input value={user?.email || ''} disabled className="bg-gray-50 rounded-xl border-gray-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-none shadow-sm rounded-3xl bg-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield size={20} className="text-blue-600" />
                  Security
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl" 
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="rounded-xl" 
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 rounded-xl" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-none shadow-sm rounded-3xl bg-white border-l-4 border-red-500">
              <CardHeader>
                <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                  <Trash2 size={20} />
                  Danger Zone
                </CardTitle>
                <CardDescription>Permanently delete your account and all your data</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border-none">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;