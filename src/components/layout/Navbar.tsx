import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Rabbit, Globe, ChevronDown, LayoutDashboard, ShoppingBag, Info, Phone, User, LogOut, Search, DollarSign, BarChart3, Heart, BrainCircuit, Wallet, Settings, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../ThemeToggle';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: t('home'), icon: Rabbit },
    { to: '/shop', label: t('inventory'), icon: ShoppingBag },
    { to: '/about', label: t('about'), icon: Info },
    { to: '/contact', label: t('contact'), icon: Phone },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const triggerSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true
    }));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:rotate-12 transition-transform">
            <Rabbit size={24} />
          </div>
          <span className="font-black text-xl tracking-tight text-foreground hidden xs:block">{t('appName')}</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className={cn(
                "text-sm font-bold transition-colors",
                location.pathname === link.to ? "text-emerald-600" : "text-muted-foreground hover:text-emerald-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={triggerSearch}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-all"
            title="Search (Ctrl+K)"
          >
            <Search size={20} />
          </button>

          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-xs sm:text-sm font-bold text-muted-foreground hover:text-emerald-600 transition-colors outline-none">
              <Globe size={18} />
              <span className="uppercase hidden sm:inline">{language}</span>
              <ChevronDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border-border rounded-xl p-2">
              <DropdownMenuItem onClick={() => setLanguage('en')} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-accent">
                🇺🇸 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ar')} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-accent">
                🇸🇦 العربية
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('fr')} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-accent">
                🇫🇷 Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-[1px] bg-border mx-1 sm:mx-2" />

          {!user ? (
            <Link to="/login">
              <button className="farm-button h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-sm">
                {t('login')}
              </button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 pr-2 sm:pr-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-black">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hidden md:block">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className="text-emerald-600" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 bg-background border-border rounded-2xl p-2 shadow-2xl">
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
                  <Link to="/dashboard" className="flex items-center gap-3">
                    <LayoutDashboard size={18} className="text-emerald-600" />
                    <span className="font-bold">{t('dashboard')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
                  <Link to="/qr-manager" className="flex items-center gap-3">
                    <Printer size={18} className="text-indigo-600" />
                    <span className="font-bold">{t('qrStudio')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
                  <Link to="/neural-lab" className="flex items-center gap-3">
                    <BrainCircuit size={18} className="text-indigo-600" />
                    <span className="font-bold">Neural Lab</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
                  <Link to="/profile" className="flex items-center gap-3">
                    <Settings size={18} className="text-indigo-600" />
                    <span className="font-bold">{t('profile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
                  <Link to="/inventory" className="flex items-center gap-3">
                    <ShoppingBag size={18} className="text-emerald-600" />
                    <span className="font-bold">{t('inventory')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
                  <Link to="/expenses" className="flex items-center gap-3">
                    <Wallet size={18} className="text-emerald-600" />
                    <span className="font-bold">{t('expenses')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
                  <Link to="/reports" className="flex items-center gap-3">
                    <BarChart3 size={18} className="text-emerald-600" />
                    <span className="font-bold">{t('reports')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer py-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  <div className="flex items-center gap-3">
                    <LogOut size={18} />
                    <span className="font-bold">Log Out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;