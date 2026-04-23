
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Inventory from './pages/Inventory';
import Breeding from './pages/Breeding';
import NeuralLab from './pages/NeuralLab';
import Auth from './pages/Auth';
import Cages from './pages/Cages';
import Statistics from './pages/Statistics';
import PrintQR from './pages/PrintQR';
import Settings from './pages/Settings';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import PublicRabbits from './pages/PublicRabbits';
import QrManager from './pages/QrManager';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from 'next-themes';
import { 
  LayoutDashboard, 
  Archive, 
  Zap, 
  Menu, 
  X,
  Rabbit as RabbitIcon,
  BrainCircuit,
  Box,
  BarChart3,
  QrCode,
  Settings as SettingsIcon,
  LogOut,
  Wallet,
  FileText,
  ShoppingBag,
  ListTodo,
  User,
  TrendingUp,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { ThemeToggle } from './components/ThemeToggle';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  
  return <>{children}</>;
};

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();

  const navLinks = [
    { to: '/', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/inventory', icon: Archive, label: t('inventory') },
    { to: '/breeding', icon: Zap, label: t('breeding') },
    { to: '/cages', icon: Box, label: 'Cages' },
    { to: '/statistics', icon: BarChart3, label: 'Statistics' },
    { to: '/neural-lab', icon: BrainCircuit, label: 'Neural Lab' },
    { to: '/print-qr', icon: QrCode, label: 'Print QR' },
    { to: '/expenses', icon: Wallet, label: t('expenses') },
    { to: '/sales', icon: ShoppingBag, label: t('sales') },
    { to: '/reports', icon: FileText, label: t('reports') },
    { to: '/tasks', icon: ListTodo, label: 'Tasks' },
    { to: '/qr-manager', icon: Printer, label: t('qrStudio') },
    { to: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    );
  }

  return (
    <div className={cn("min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row", isRTL && "rtl")}>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-xl text-white">
            <RabbitIcon className="h-5 w-5" />
          </div>
          <span className="font-black text-xl tracking-tight dark:text-white">{t('appName')}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 dark:text-white">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        isRTL && "left-auto right-0"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="hidden md:flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                <RabbitIcon className="h-6 w-6" />
              </div>
              <span className="font-black text-2xl tracking-tight text-primary">{t('appName')}</span>
            </div>
            <ThemeToggle />
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t dark:border-slate-800 space-y-4">
            <NavLink 
              to="/profile"
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                isActive ? "bg-slate-100 dark:bg-slate-800 text-primary" : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                {user.name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate dark:text-white">{user.name || user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </NavLink>
            <button 
              onClick={logout} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all"
            >
              <LogOut className="h-5 w-5" />
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto dark:bg-slate-950">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/breeding" element={<ProtectedRoute><Breeding /></ProtectedRoute>} />
          <Route path="/cages" element={<ProtectedRoute><Cages /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/neural-lab" element={<ProtectedRoute><NeuralLab /></ProtectedRoute>} />
          <Route path="/print-qr" element={<ProtectedRoute><PrintQR /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/shop" element={<PublicRabbits />} />
          <Route path="/qr-manager" element={<ProtectedRoute><QrManager /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <AppContent />
            <Toaster />
            <SonnerToaster position="top-right" />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
