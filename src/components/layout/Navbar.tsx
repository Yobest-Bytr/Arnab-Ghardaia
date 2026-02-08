import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Menu, Search, Sparkles, Bell, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, signOut } = useAuth();
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 ai-gradient text-white flex items-center justify-between px-6 z-50 shadow-lg">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20" onClick={onMenuClick}>
          <Menu size={24} />
        </Button>
        <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tighter">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="w-7 h-7 text-yellow-300 fill-yellow-300" />
          </motion.div>
          <span>Yobest AI</span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 max-w-lg mx-12">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200 w-4 h-4 group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Ask AI to find tasks..." 
            className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-11 pr-4 text-sm placeholder:text-indigo-100 focus:bg-white/20 focus:ring-2 focus:ring-white/50 outline-none transition-all backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20" onClick={toggleDarkMode}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        
        {user ? (
          <>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-indigo-600"></span>
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20 text-white border border-white/30">
                <UserIcon size={20} />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20 text-white" onClick={handleSignOut}>
              <LogOut size={20} />
            </Button>
          </>
        ) : (
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/20 font-semibold">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-full px-6 shadow-lg">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;