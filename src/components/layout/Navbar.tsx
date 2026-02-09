import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Sparkles, Globe, Moon, Sun, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, signOut } = useAuth();
  const { setLanguage } = useLanguage();
  const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 glass-navbar z-50 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={onMenuClick}>
          <Menu size={24} />
        </Button>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 ai-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
            <Sparkles className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white">Yobest AI</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {['Features', 'Showcase', 'Pricing', 'Docs'].map((item) => (
          <Link key={item} to="#" className="text-sm font-bold text-gray-400 hover:text-white transition-colors tracking-wide uppercase">
            {item}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <Command size={12} />
          <span>K to Search</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl text-white hover:bg-white/10 h-10 w-10">
              <Globe size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white rounded-2xl p-2">
            <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer hover:bg-indigo-600 rounded-xl font-bold">English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('fr')} className="cursor-pointer hover:bg-indigo-600 rounded-xl font-bold">Français</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('ar')} className="cursor-pointer hover:bg-indigo-600 rounded-xl font-bold">العربية</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="rounded-xl text-white hover:bg-white/10 h-10 w-10" onClick={toggleDarkMode}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        
        {user ? (
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 h-10 w-10" onClick={() => signOut()}>
            <LogOut size={20} />
          </Button>
        ) : (
          <Link to="/login">
            <Button className="ai-gradient hover:opacity-90 text-white rounded-xl px-8 h-11 font-black shadow-lg ai-glow border-none transition-all hover:scale-105">
              Log In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;