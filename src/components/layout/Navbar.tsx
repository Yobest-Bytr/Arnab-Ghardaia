import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-6">
      <nav className="pill-nav flex items-center gap-8 max-w-4xl w-full justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="w-5 h-5 text-[#99f6ff]" />
          <span className="font-bold text-lg tracking-tight text-white">Yobest</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Home</Link>
          <Link to="/about" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">About</Link>
          <Link to="/dashboard" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Workspace</Link>
          <Link to="#" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <Link to="/login" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">
              Login
            </Link>
          ) : (
            <Link to="/profile" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">
              Profile
            </Link>
          )}
          <Link to="/signup">
            <button className="bg-white/10 hover:bg-white/20 text-white text-[13px] font-bold px-5 py-2 rounded-full transition-all">
              Free Trial
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;