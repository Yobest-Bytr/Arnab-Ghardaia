import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Zap, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Users, BarChart3 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
        
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-8 border border-indigo-100 dark:border-indigo-800">
              <Sparkles size={16} className="animate-pulse" />
              <span>Next-Gen AI Task Management</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
              Yobest AI: <br />
              <span className="text-transparent bg-clip-text ai-gradient">Smarter</span> Tasking
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Experience the future of productivity. Our AI doesn't just track tasks—it predicts your needs, suggests workflows, and optimizes your entire team's performance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/signup">
                <Button size="lg" className="ai-gradient hover:opacity-90 text-white px-10 py-8 text-xl rounded-full shadow-2xl ai-glow border-none font-bold">
                  Get Started Free <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-10 py-8 text-xl rounded-full border-2 border-indigo-100 dark:border-gray-800 font-bold hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)] border-8 border-white dark:border-gray-800">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                alt="Dashboard Preview" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -right-12 top-1/4 animate-float hidden lg:block">
              <div className="glass-card p-6 rounded-3xl shadow-2xl border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400">AI SUGGESTION</p>
                    <p className="text-sm font-bold">Review Q4 Strategy</p>
                  </div>
                </div>
                <Button size="sm" className="w-full bg-indigo-600 rounded-xl h-8 text-[10px]">Accept Suggestion</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-gray-50 dark:bg-gray-800/50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Built for the AI Era</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Powerful features that leverage machine learning to keep you ahead of the curve.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "AI Suggestions",
                desc: "Our engine analyzes your habits to suggest tasks and optimize your daily schedule automatically.",
                icon: BrainCircuit,
                color: "from-indigo-500 to-blue-600"
              },
              {
                title: "Real-time Collab",
                desc: "Work together seamlessly with live updates, shared workspaces, and AI-driven team insights.",
                icon: Users,
                color: "from-emerald-500 to-teal-600"
              },
              {
                title: "Smart Analytics",
                desc: "Visualize your productivity with deep-dive analytics and AI-generated performance reports.",
                icon: BarChart3,
                color: "from-purple-500 to-pink-600"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="glass-card p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="ai-gradient rounded-[3.5rem] p-16 text-white text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Ready to work smarter?</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium">
                Join 50,000+ professionals who have already upgraded their workflow with Yobest AI.
              </p>
              <Link to="/signup">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 px-12 py-8 text-2xl rounded-full font-black shadow-2xl">
                  Start Your Free Trial
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-20 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-white font-black text-3xl mb-6 tracking-tighter">
              <Sparkles className="w-8 h-8 text-indigo-500 fill-indigo-500" />
              <span>Yobest AI</span>
            </div>
            <p className="max-w-sm text-lg leading-relaxed">
              The world's first truly intelligent task management platform. Built for teams that demand excellence.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Product</h4>
            <ul className="space-y-4 text-lg">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">AI Engine</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Company</h4>
            <ul className="space-y-4 text-lg">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm">© 2024 Yobest AI. All rights reserved.</p>
          <div className="flex gap-6">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
              <Zap size={18} className="text-white" />
            </div>
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
              <Users size={18} className="text-white" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;