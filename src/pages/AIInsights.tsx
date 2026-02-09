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
        <div className="max-w-6xl mx-auto">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <BrainCircuit className="text-indigo-600" size={40} />
              AI Insights Report
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Deep-dive analysis of your productivity patterns.</p>
          </motion.header>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-gray-900 p-8">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl font-black dark:text-white flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" />
                  Productivity Velocity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] w-full bg-gray-50 dark:bg-gray-800/50 rounded-3xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-around px-8 pb-8">
                    {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, duration: 1 }}
                        className="w-8 bg-indigo-600 rounded-t-xl relative group"
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {h}%
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2.5rem] bg-indigo-600 text-white p-8 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl font-black flex items-center gap-2">
                  <Sparkles />
                  Yobest Score™
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-center">
                <div className="w-40 h-40 rounded-full border-8 border-white/20 flex items-center justify-center mx-auto mb-6 relative">
                  <div className="text-5xl font-black">88</div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute inset-0 border-8 border-white border-t-transparent rounded-full"
                  />
                </div>
                <p className="text-indigo-100 font-bold">You're in the top 2% of users this week!</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Focus Peak", val: "10:00 AM", desc: "Your efficiency is 45% higher during this window.", icon: Zap, color: "text-amber-500" },
              { title: "Task Completion", val: "92%", desc: "You've completed 24 tasks ahead of schedule.", icon: Target, color: "text-emerald-500" },
            ].map((insight, i) => (
              <Card key={i} className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-gray-900 p-8">
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center ${insight.color}`}>
                    <insight.icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black dark:text-white mb-1">{insight.title}</h3>
                    <p className="text-3xl font-black text-indigo-600 mb-2">{insight.val}</p>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{insight.desc}</p>
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