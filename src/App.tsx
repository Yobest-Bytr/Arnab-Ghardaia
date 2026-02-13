import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AIInsights from "./pages/AIInsights";
import About from "./pages/About";
import Collaborators from "./pages/Collaborators";
import NeuralLab from "./pages/NeuralLab";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Changelog from "./pages/Changelog";
import Pricing from "./pages/Pricing";
import Showcase from "./pages/Showcase";
import NotFound from "./pages/NotFound";
import AIEntryModal from "./components/AIEntryModal";
import SpaceBackground from "./components/SpaceBackground";
import MouseTrail from "./components/MouseTrail";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408]">
      <div className="w-12 h-12 border-4 border-[#99f6ff] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" expand={true} richColors />
          <AIEntryModal />
          <div className="relative min-h-screen overflow-hidden">
            <SpaceBackground />
            <MouseTrail />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/changelog" element={<Changelog />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/showcase" element={<Showcase />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="/ai-insights" element={
                  <ProtectedRoute>
                    <AIInsights />
                  </ProtectedRoute>
                } />

                <Route path="/shared" element={
                  <ProtectedRoute>
                    <Collaborators />
                  </ProtectedRoute>
                } />

                <Route path="/neural-lab" element={
                  <ProtectedRoute>
                    <NeuralLab />
                  </ProtectedRoute>
                } />

                <Route path="/analytics" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
                <Route path="/archive" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;