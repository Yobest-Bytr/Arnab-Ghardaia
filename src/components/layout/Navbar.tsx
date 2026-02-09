import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles } from 'lucide-react';
import AvatarDecoration from '@/components/AvatarDecoration';

const Navbar = () => {
  const { user } = useAuth();
  const [effect, setEffect] = useState<string>('none');

  useEffect(() => {
    if (user) {
      const savedEffect = localStorage.getItem(`avatar_effect_${user.id}`);
      if (savedEffect) setEffect(savedEffect);
    }
  }, [user]);

  return (
    <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-6">
      <nav className="pill-nav flex items-center gap-8 max-w-6xl w-full justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="w-5 h-5 text-[#99f6ff]" />
          <span className="font-bold text-lg tracking-tight text-white">Yobest</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Home</Link>
          <Link to="/showcase" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Showcase</Link>
          <Link to="/pricing" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Pricing</Link>
          <Link to="/about" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">About</Link>
          <Link to="/dashboard" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Workspace</Link>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/signup">
                <button className="bg-white/10 hover:bg-white/20 text-white text-[13px] font-bold px-5 py-2 rounded-full transition-all">
                  Free Trial
                </button>
              </Link>
            </>
          ) : (
            <Link to="/profile" className="flex items-center gap-3 group">
              <span className="text-[13px] font-bold text-white/50 group-hover:text-white transition-colors hidden sm:inline">
                {user.email?.split('@')[0]}
              </span>
              <AvatarDecoration 
                fallbackText={user.email || ''} 
                effect={effect} 
                size="sm" 
              />
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;