import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  enterDemoMode: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing demo session first
    const demoUser = localStorage.getItem('yobest_demo_user');
    if (demoUser) {
      const parsedUser = JSON.parse(demoUser);
      setUser(parsedUser);
      setLoading(false);
    }

    // Check active Supabase sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      } else if (!localStorage.getItem('yobest_demo_user')) {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const enterDemoMode = (email: string) => {
    // Use a valid UUID format for the demo ID to prevent Supabase 400 errors
    const demoUuid = '00000000-0000-0000-0000-000000000000';
    const mockUser = {
      id: demoUuid,
      email: email,
      user_metadata: { display_name: email.split('@')[0] },
      aud: 'authenticated',
      role: 'authenticated',
    } as any;
    
    localStorage.setItem('yobest_demo_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem('yobest_demo_user');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, enterDemoMode }}>
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