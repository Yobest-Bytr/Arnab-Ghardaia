import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Globe, ChevronDown } from 'lucide-react';
import AvatarDecoration from '@/components/AvatarDecoration';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user } = useAuth();
  const { language, setLanguage, isRTL } = useLanguage();
  const [effect, setEffect] = useState<string>('none');

  useEffect(() => {
    if (user) {
      const savedEffect = localStorage.getItem(`avatar_effect_${user.id}`);
      if (savedEffect) setEffect(savedEffect);
    }
  }, [user]);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-6">
      <nav className="pill-nav flex items-center gap-4 md:gap-8 max-w-7xl w-full justify-between">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <Sparkles className="w-5 h-5 text-[#99f6ff]" />
          <span className="font-bold text-lg tracking-tight text-white">Yobest</span>
        </Link>

        <div className="hidden xl:flex items-center gap-6">
          <Link to="/" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Home</Link>
          <Link to="/showcase" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Showcase</Link>
          <Link to="/pricing" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Pricing</Link>
          <Link to="/about" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">About</Link>
          <Link to="/dashboard" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Workspace</Link>
          <Link to="/neural-lab" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Neural Lab</Link>
          <Link to="/ai-insights" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Insights</Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-[12px] font-bold text-white/50 hover:text-white transition-colors outline-none">
              <Globe size={16} className="text-[#99f6ff]" />
              <span className="uppercase">{language}</span>
              <ChevronDown size={12} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#020408]/90 border-white/10 backdrop-blur-xl rounded-2xl p-2">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl text-white hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-xs font-bold">{lang.label}</span>
                  {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-[#99f6ff] ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {!user ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors hidden sm:inline">
                Login
              </Link>
              <Link to="/signup">
                <button className="bg-white/10 hover:bg-white/20 text-white text-[13px] font-bold px-5 py-2 rounded-full transition-all whitespace-nowrap">
                  Free Trial
                </button>
              </Link>
            </div>
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