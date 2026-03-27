import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Rabbit, Globe, ChevronDown, Menu, LayoutDashboard, ShoppingBag, Info, Phone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('home'), icon: Rabbit },
    { to: '/shop', label: t('inventory'), icon: ShoppingBag },
    { to: '/about', label: t('about'), icon: Info },
    { to: '/contact', label: t('contact'), icon: Phone },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:rotate-12 transition-transform">
            <Rabbit size={24} />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900">Aranib <span className="text-emerald-600">Farm</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className={cn(
                "text-sm font-bold transition-colors",
                location.pathname === link.to ? "text-emerald-600" : "text-slate-500 hover:text-emerald-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors outline-none">
              <Globe size={18} />
              <span className="uppercase">{language}</span>
              <ChevronDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-emerald-50 rounded-xl p-2">
              <DropdownMenuItem onClick={() => setLanguage('en')} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-emerald-50">
                🇺🇸 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ar')} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-emerald-50">
                🇸🇦 العربية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-[1px] bg-emerald-100 mx-2" />

          {!user ? (
            <Link to="/login">
              <button className="farm-button h-11 px-6 text-sm">
                {t('login')}
              </button>
            </Link>
          ) : (
            <Link to="/dashboard">
              <button className="flex items-center gap-2 h-11 px-6 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-all">
                <LayoutDashboard size={18} />
                {t('dashboard')}
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;