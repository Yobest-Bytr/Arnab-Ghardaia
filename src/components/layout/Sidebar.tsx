import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Archive, Settings, BrainCircuit, Zap, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose?: () => void }) => {
  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'My Workspace' },
    { to: '/ai-insights', icon: BrainCircuit, label: 'AI Insights' },
    { to: '/shared', icon: Users, label: 'Collaborators' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/archive', icon: Archive, label: 'Archive' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-md" 
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed left-0 top-16 bottom-0 w-[280px] bg-white dark:bg-gray-900 border-r border-indigo-100 dark:border-gray-800 z-40 transition-all duration-500 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="p-6 space-y-6">
          <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Zap size={14} className="fill-current" />
              AI Assistant
            </div>
            <p className="text-[11px] text-indigo-500 dark:text-indigo-300 leading-relaxed">
              "You have 3 high-priority tasks due today. Focus on the 'Project Alpha' first."
            </p>
          </div>

          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
                    : "text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <link.icon size={20} className={cn("transition-colors", isActive ? "text-white" : "group-hover:text-indigo-600")} />
                </motion.div>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-8 left-6 right-6">
          <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl text-white shadow-xl overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>
            <p className="text-xs font-bold mb-1">Pro Plan</p>
            <p className="text-[10px] opacity-80 mb-3">Unlock advanced AI features</p>
            <Button size="sm" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 text-[10px] font-bold h-8 rounded-xl">
              Upgrade Now
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;