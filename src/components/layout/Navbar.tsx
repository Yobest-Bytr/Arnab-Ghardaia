import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Menu, Search, Sparkles, Bell, Moon, Sun, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, signOut } = useAuth();
  const { setLanguage, language } = useLanguage();
  const navigate = useNavigate();
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
    <nav className="fixed top-0 left-0 right-0 h-16 bg-gray-950/80 backdrop-blur-xl border-b border-white/10 text-white flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={onMenuClick}>
          <Menu size={24} />
        </Button>
        <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tighter">
          <Sparkles className="w-7 h-7 text-indigo-400 fill-indigo-400" />
          <span>Yobest AI</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
              <Globe size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white">
            <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer hover:bg-indigo-600">English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('fr')} className="cursor-pointer hover:bg-indigo-600">Français</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('ar')} className="cursor-pointer hover:bg-indigo-600">العربية</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10" onClick={toggleDarkMode}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        
        {user ? (
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white" onClick={() => signOut()}>
            <LogOut size={20} />
          </Button>
        ) : (
          <Link to="/login">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 font-bold">Log In</Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;