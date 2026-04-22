
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Index from './pages/Index';
import Inventory from './pages/Inventory';
import Breeding from './pages/Breeding';
import NeuralLab from './pages/NeuralLab';
import { 
  LayoutDashboard, 
  Archive, 
  Zap, 
  Menu, 
  X,
  Rabbit as RabbitIcon,
  BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inventory', icon: Archive, label: 'Inventory' },
    { to: '/breeding', icon: Zap, label: 'Breeding' },
    { to: '/neural-lab', icon: BrainCircuit, label: 'Neural Lab' },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-xl text-white">
              <RabbitIcon className="h-5 w-5" />
            </div>
            <span className="font-black text-xl tracking-tight">Hop Farm</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full flex flex-col p-6">
            <div className="hidden md:flex items-center gap-3 mb-10">
              <div className="p-2.5 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                <RabbitIcon className="h-6 w-6" />
              </div>
              <span className="font-black text-2xl tracking-tight text-primary">Hop Farm</span>
            </div>

            <nav className="flex-1 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                    isActive 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-slate-100 hover:text-primary"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-bold">System Online</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/breeding" element={<Breeding />} />
            <Route path="/neural-lab" element={<NeuralLab />} />
          </Routes>
        </main>
      </div>
      <Toaster />
      <SonnerToaster position="top-right" />
    </Router>
  );
};

export default App;
