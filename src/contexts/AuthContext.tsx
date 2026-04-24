
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { storage } from '@/lib/db';

export interface AuthContextType {
  user: any | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const signup = async (email: string, pass: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { display_name: name }
      }
    });
    if (error) throw error;
    
    if (data.user) {
      // Create profile using upsert to be safe
      await supabase.from('profiles').upsert([{
        id: data.user.id,
        email: email,
        display_name: name,
        updated_at: new Date().toISOString()
      }]);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    storage.clearAuth();
    setUser(null);
  };

  const signOut = logout;

  const enterDemoMode = () => {
    const demoUser = { id: 'demo-user', email: 'demo@example.com', user_metadata: { display_name: 'Demo User' } };
    setUser(demoUser);
    localStorage.setItem('yobest_demo_user', JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, signOut, enterDemoMode, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
