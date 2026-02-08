import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Menu, Search, CheckSquare } from 'lucide-react';

const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[60px] bg-[#2563EB] text-white flex items-center justify-between px-4 z-50 shadow-md">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-blue-700" onClick={onMenuClick}>
          <Menu size={24} />
        </Button>
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <CheckSquare className="w-6 h-6" />
          <span>TaskMaster</span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-blue-700/50 border-none rounded-full py-1.5 pl-10 pr-4 text-sm placeholder:text-blue-200 focus:ring-2 focus:ring-white/50 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link to="/dashboard" className="hidden sm:block text-sm font-medium hover:text-blue-100 px-3">Dashboard</Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-700 text-white">
                <UserIcon size={20} />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-700 text-white" onClick={handleSignOut}>
              <LogOut size={20} />
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-blue-700">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-white text-[#2563EB] hover:bg-blue-50">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;