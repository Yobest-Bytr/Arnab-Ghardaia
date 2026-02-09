import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, TrendingUp, Zap, Target, Sparkles, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const AIInsights = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="md:ml-[280px] pt-16 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-4">
              <BrainCircuit className="text-indigo-600" size={56} />
              AI Insights <span className="dopamine-text">2026</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-bold mt-3">Deep-dive analysis of your productivity patterns.</p>
          </motion.header>

          <div className="grid lg:grid-cols-3 gap-10 mb-16">
            <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3.5rem] bg-white dark:bg-gray-900 p-12">
              <CardHeader className="p-0 mb-12">
                <CardTitle className="text-3xl font-black dark:text-white flex items-center gap-3">
                  <TrendingUp className="text-emerald-500" size={32} />
                  Productivity Velocity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] w-full bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-around px-12 pb-12">
                    {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, duration: 1.5, ease: "easeOut" }}
                        className="w-12 bg-indigo-600 rounded-t-[1rem] relative group shadow-xl shadow-indigo-500/20"
                      >
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {h}%
                        </div>
                        <motion.div 
                          className="absolute inset-0 bg-white/20"
                          animate={{ opacity: [0.2, 0.5, 0.2] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl rounded-[3.5rem] bg-indigo-600 text-white p-12 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
              <CardHeader className="p-0 mb-12">
                <CardTitle className="text-3xl font-black flex items-center gap-3">
                  <Sparkles size={32} />
                  Yobest Score™
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-center">
                <div className="w-56 h-56 rounded-full border-[12px] border-white/20 flex items-center justify-center mx-auto mb-10 relative">
                  <div className="text-7xl font-black tracking-tighter">88</div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    className="absolute inset-0 border-[12px] border-white border-t-transparent rounded-full"
                  />
                </div>
                <p className="text-2xl text-indigo-100 font-black tracking-tight">You're in the top 2% of users this week!</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              { title: "Focus Peak", val: "10:00 AM", desc: "Your efficiency is 45% higher during this window.", icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
              { title: "Task Completion", val: "92%", desc: "You've completed 24 tasks ahead of schedule.", icon: Target, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            ].map((insight, i) => (
              <Card key={i} className="border-none shadow-xl rounded-[3.5rem] bg-white dark:bg-gray-900 p-12 hover:scale-[1.02] transition-transform">
                <div className="flex items-start gap-10">
                  <div className={`w-20 h-20 ${insight.bg} rounded-[2rem] flex items-center justify-center ${insight.color} shadow-inner`}>
                    <insight.icon size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black dark:text-white mb-2">{insight.title}</h3>
                    <p className="text-5xl font-black text-indigo-600 mb-4 tracking-tighter">{insight.val}</p>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-bold leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIInsights;