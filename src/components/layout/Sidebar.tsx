import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Users, Archive, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose?: () => void }) => {
  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'My Tasks' },
    { to: '/shared', icon: Users, label: 'Shared Tasks' },
    { to: '/archive', icon: Archive, label: 'Archive' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm" 
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed left-0 top-[60px] bottom-0 w-[250px] bg-[#F3F4F6] border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-white text-[#2563EB] shadow-sm" 
                  : "text-gray-600 hover:bg-gray-200"
              )}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;