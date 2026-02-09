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
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="md:ml-[280px] pt-24 p-6 md:p-12 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black mb-6 uppercase tracking-[0.2em]">
              <BrainCircuit size={14} />
              <span>Neural Analysis Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Cognitive <span className="dopamine-text">Insights</span>
            </h1>
            <p className="text-xl text-gray-500 font-bold">Deep-dive analysis of your productivity patterns across the digital void.</p>
          </motion.header>

          <div className="grid lg:grid-cols-3 gap-10 mb-16">
            {/* Main Chart Card */}
            <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 p-12 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
              <CardHeader className="p-0 mb-12 flex flex-row items-center justify-between">
                <CardTitle className="text-3xl font-black flex items-center gap-3">
                  <TrendingUp className="text-indigo-400" size={32} />
                  Productivity Velocity
                </CardTitle>
                <div className="flex gap-2">
                  {['24H', '7D', '30D'].map(t => (
                    <button key={t} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black transition-all">
                      {t}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] w-full bg-white/[0.02] rounded-[2.5rem] flex items-center justify-center relative overflow-hidden border border-white/5">
                  <div className="absolute inset-0 flex items-end justify-around px-12 pb-12">
                    {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, duration: 1.5, ease: "easeOut" }}
                        className="w-12 bg-indigo-600/40 rounded-t-[1rem] relative group hover:bg-indigo-500 transition-all"
                      >
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {h}%
                        </div>
                        <motion.div 
                          className="absolute inset-0 bg-white/10"
                          animate={{ opacity: [0.1, 0.3, 0.1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      </motion.div>
                    ))}
                  </div>
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between p-12 pointer-events-none opacity-10">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-white" />)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Card */}
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Focus Peak", val: "10:00 AM", icon: Zap, color: "text-amber-400" },
              { title: "Task Completion", val: "92%", icon: Target, color: "text-emerald-400" },
              { title: "AI Efficiency", val: "+45%", icon: BrainCircuit, color: "text-indigo-400" },
              { title: "Global Rank", val: "#124", icon: BarChart3, color: "text-purple-400" },
            ].map((insight, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl group"
              >
                <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center ${insight.color} mb-8 group-hover:scale-110 transition-transform`}>
                  <insight.icon size={32} />
                </div>
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">{insight.title}</h3>
                <p className="text-4xl font-black tracking-tighter">{insight.val}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIInsights;