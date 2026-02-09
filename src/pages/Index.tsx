import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, ArrowRight, CheckCircle2, Users, Zap, 
  BrainCircuit, BarChart3, ShieldCheck, Play, 
  Star, ChevronDown, MousePointer2
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Hero3D from '@/components/Hero3D';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      <Navbar />
      
      {/* Surreal Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[900px] bg-indigo-500/5 blur-[150px] -z-10 rounded-full animate-pulse-glow" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black mb-8 border border-indigo-100 dark:border-indigo-800 uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/10">
              <Users size={14} />
              <span>Trusted by 640K+ High-Performers</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-[0.95]">
              Peak <br />
              <span className="dopamine-text">Productivity</span> <br />
              Unlocked.
            </h1>
            
            <p className="text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-xl leading-relaxed font-medium">
              The 2026 Edition of Yobest AI is here. Immersive, predictive, and designed to spark joy in every task.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link to="/signup">
                <Button size="lg" className="ai-gradient hover:opacity-90 text-white px-12 py-9 text-2xl rounded-[2rem] shadow-2xl ai-glow border-none font-black group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    Generate AI Task <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-10 py-9 text-xl rounded-[2rem] border-2 border-gray-100 dark:border-gray-800 font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-4 group">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play size={16} fill="currentColor" />
                </div>
                Watch Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <Hero3D />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 glass-card p-6 rounded-[2rem] shadow-2xl border-indigo-100 flex items-center gap-4 animate-float-3d">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Optimization</p>
                <p className="text-lg font-black dark:text-white">+340% Efficiency</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Stats - Immersive Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "Active Users", val: "640K+", icon: Users, color: "text-indigo-600" },
            { label: "Tasks Optimized", val: "2.4M+", icon: Zap, color: "text-amber-500" },
            { label: "Hours Saved", val: "10B+", icon: BarChart3, color: "text-emerald-500" },
            { label: "Global Rating", val: "4.8/5", icon: Star, color: "text-pink-500" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${stat.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm`}>
                <stat.icon size={32} />
              </div>
              <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{stat.val}</h3>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problem/Solution - Maximalist Minimalism */}
      <section className="py-32 bg-gray-50 dark:bg-gray-900/50 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <div className="glass-card p-10 rounded-[3.5rem] shadow-2xl border-indigo-100 dark:border-indigo-900/30 relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-3xl font-black dark:text-white">Yobest Score™</h3>
                  <div className="w-20 h-20 rounded-full border-8 border-indigo-600 flex items-center justify-center font-black text-2xl text-indigo-600 shadow-xl shadow-indigo-100">
                    88
                  </div>
                </div>
                <div className="space-y-8">
                  {[
                    { label: "Virality", val: 94, color: "bg-indigo-600" },
                    { label: "Clarity", val: 82, color: "bg-purple-600" },
                    { label: "Efficiency", val: 88, color: "bg-pink-600" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm font-black mb-3 dark:text-white uppercase tracking-widest">
                        <span>{item.label}</span>
                        <span>{item.val}%</span>
                      </div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-1">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.val}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full ${item.color} rounded-full shadow-lg`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-12 ai-gradient rounded-[1.5rem] h-16 font-black text-xl text-white shadow-2xl hover:scale-[1.02] transition-transform">
                  Optimize My Workflow
                </Button>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-10 tracking-tighter leading-tight">
                Fix Your <br />
                <span className="text-indigo-600">Productivity</span> <br />
                Instantly.
              </h2>
              <div className="space-y-10">
                <div className="flex gap-8 group">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-[1.5rem] flex items-center justify-center text-red-600 shrink-0 group-hover:rotate-12 transition-transform">
                    <Zap size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black mb-3 dark:text-white">The Problem: Task Fatigue</h4>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">Your brain wastes 40% of its energy just deciding what to do next. Most task managers are just digital graveyards.</p>
                  </div>
                </div>
                <div className="flex gap-8 group">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shrink-0 group-hover:rotate-12 transition-transform">
                    <BrainCircuit size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black mb-3 dark:text-white">The Solution: AI Personalization</h4>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">Our AI adapts to your unique rhythm, suggesting tasks when you're most focused and automating the mundane.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Dopamine Gradients */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-8xl font-black dark:text-white mb-8 tracking-tighter">Simple, Viral Pricing</h2>
            <p className="text-xl text-gray-500 font-medium">Join the elite 1% of productive humans.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { name: "Essential", price: 14, features: ["Basic AI Suggestions", "100 AI Credits", "Personal Workspace"], color: "bg-white dark:bg-gray-900" },
              { name: "Premium", price: 28, features: ["Advanced Yobest Score™", "Unlimited AI Credits", "Priority Support", "Custom AI Personas"], color: "ai-gradient text-white", popular: true },
              { name: "Ultimate", price: 56, features: ["Team Collaboration", "Private AI Model", "API Access", "Dedicated Manager"], color: "bg-white dark:bg-gray-900" },
            ].map((plan, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -20 }}
                className={`p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden ${plan.color} ${plan.popular ? 'scale-105 z-10' : 'border border-gray-100 dark:border-gray-800'}`}
              >
                {plan.popular && <div className="absolute top-8 right-8 bg-white text-indigo-600 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Most Popular</div>}
                <h3 className="text-3xl font-black mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-6xl font-black">${plan.price}</span>
                  <span className="text-lg font-bold opacity-70">/mo</span>
                </div>
                <ul className="space-y-6 mb-12">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-lg font-bold">
                      <CheckCircle2 size={24} className={plan.popular ? 'text-white' : 'text-indigo-600'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full rounded-[1.5rem] h-16 text-xl font-black shadow-xl ${plan.popular ? 'bg-white text-indigo-600 hover:bg-gray-50' : 'ai-gradient text-white'}`}>
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-32 px-6 bg-gray-50 dark:bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-black text-center dark:text-white mb-20 tracking-tighter">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-6">
            {[
              { q: "How do AI credits work?", a: "Each AI-generated task or optimization uses 10-20 credits depending on complexity. Essential plan includes 100 credits/mo." },
              { q: "Is my data private?", a: "Absolutely. We use enterprise-grade encryption and never train our public models on your private task data." },
              { q: "Can I collaborate with my team?", a: "Yes! The Ultimate plan is designed specifically for teams with shared workspaces and real-time syncing." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none glass-card rounded-[2rem] px-8">
                <AccordionTrigger className="text-xl font-black hover:no-underline py-8 dark:text-white">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-lg text-gray-500 font-medium pb-8 leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex items-center gap-3 text-white font-black text-4xl tracking-tighter">
            <Sparkles className="w-10 h-10 text-indigo-500 fill-indigo-500" />
            <span>Yobest AI</span>
          </div>
          <div className="flex gap-16 text-sm font-black uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
          </div>
          <p className="text-sm font-medium">© 2026 Yobest AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;