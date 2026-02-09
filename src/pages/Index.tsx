import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, ArrowRight, CheckCircle2, Users, Zap, 
  BrainCircuit, BarChart3, ShieldCheck, Play, 
  MessageSquare, Star, ChevronDown 
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-purple-500/5 blur-[120px] -z-10 rounded-full animate-pulse-glow" />
        
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black mb-8 border border-indigo-100 dark:border-indigo-800 uppercase tracking-widest">
              <Users size={14} />
              <span>Trusted by 640K+ High-Performers</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-[1.05]">
              Yobest AI: The Shortcut to <br />
              <span className="text-transparent bg-clip-text ai-gradient">Peak Productivity</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              From chaos to viral efficiency with data-backed AI tasks. Our engine analyzes your workflow and predicts your next move before you even think of it.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/signup">
                <Button size="lg" className="ai-gradient hover:opacity-90 text-white px-12 py-8 text-xl rounded-full shadow-2xl ai-glow border-none font-black group">
                  Generate First Task <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-10 py-8 text-xl rounded-full border-2 border-gray-100 dark:border-gray-800 font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                  <Play size={14} fill="currentColor" />
                </div>
                Watch Demo (65s)
              </Button>
            </div>
          </motion.div>

          {/* Success Metrics Grid */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { label: "Users Worldwide", val: "640K+", icon: Users },
              { label: "Tasks Optimized", val: "2.4M+", icon: Zap },
              { label: "Hours Saved", val: "10B+", icon: Clock },
              { label: "Avg. Yobest Score", val: "88%", icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stat.val}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-32 bg-gray-50 dark:bg-gray-900/50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
                Fix Your Productivity <br />
                <span className="text-indigo-600">Instantly.</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 dark:text-white">The Problem: Task Fatigue</h4>
                    <p className="text-gray-600 dark:text-gray-400">Your brain wastes 40% of its energy just deciding what to do next. Most task managers are just digital graveyards.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 dark:text-white">The Solution: Yobest Score™</h4>
                    <p className="text-gray-600 dark:text-gray-400">Our AI analyzes every task on 5 pillars: Virality, Clarity, Idea, Curiosity, and Efficiency. We don't just list tasks; we optimize them for success.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="glass-card p-8 rounded-[3rem] shadow-2xl border-indigo-100 dark:border-indigo-900/30 relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black dark:text-white">Yobest Score™</h3>
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center font-black text-xl text-indigo-600">
                    85
                  </div>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "Clarity", val: 92, color: "bg-indigo-600" },
                    { label: "Efficiency", val: 78, color: "bg-purple-600" },
                    { label: "Curiosity", val: 85, color: "bg-pink-600" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm font-bold mb-2 dark:text-white">
                        <span>{item.label}</span>
                        <span>{item.val}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.val}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className={`h-full ${item.color}`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-8 ai-gradient rounded-2xl h-14 font-black text-white">Optimize This Task</Button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-500/10 blur-[80px] -z-10 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <h2 className="text-4xl font-black dark:text-white mb-4">"Truly shocked by the AI quality"</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">4.8/5 from 12,000+ verified reviews</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Alex Rivera", role: "Founder @ ScaleUp", quote: "Managed 1M+ tasks across my teams. Yobest AI is the only tool that actually thinks for us.", metrics: "340% Growth" },
              { name: "Sarah Chen", role: "Creative Director", quote: "The Prompt-to-Task feature is magic. I just talk, and my entire week is planned perfectly.", metrics: "20h Saved/Wk" },
              { name: "Marcus Thorne", role: "Productivity Coach", quote: "I've tried every tool. Yobest Score™ is the first metric that actually correlates with real output.", metrics: "92% Efficiency" },
            ].map((t, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="glass-card p-8 rounded-[2.5rem] border-gray-100 dark:border-gray-800"
              >
                <p className="text-lg font-medium mb-8 dark:text-gray-200">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full" />
                    <div>
                      <p className="font-bold text-sm dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-black rounded-full uppercase">
                    {t.metrics}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-gray-50 dark:bg-gray-900/50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black dark:text-white mb-6">Simple, Viral Pricing</h2>
            <p className="text-gray-500 font-medium">Join the elite 1% of productive humans.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Essential", price: 14, features: ["Basic AI Suggestions", "100 AI Credits", "Personal Workspace"], color: "bg-white" },
              { name: "Premium", price: 28, features: ["Advanced Yobest Score™", "Unlimited AI Credits", "Priority Support", "Custom AI Personas"], color: "ai-gradient text-white", popular: true },
              { name: "Ultimate", price: 56, features: ["Team Collaboration", "Private AI Model", "API Access", "Dedicated Manager"], color: "bg-white" },
            ].map((plan, i) => (
              <div key={i} className={`p-10 rounded-[3rem] shadow-xl relative overflow-hidden ${plan.color} ${plan.popular ? 'scale-105 z-10' : 'dark:bg-gray-900'}`}>
                {plan.popular && <div className="absolute top-6 right-6 bg-white text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Most Popular</div>}
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className="text-sm font-bold opacity-70">/mo</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-bold">
                      <CheckCircle2 size={18} className={plan.popular ? 'text-white' : 'text-indigo-600'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full rounded-2xl h-14 font-black ${plan.popular ? 'bg-white text-indigo-600 hover:bg-gray-50' : 'ai-gradient text-white'}`}>
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-center dark:text-white mb-16">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { q: "How do AI credits work?", a: "Each AI-generated task or optimization uses 10-20 credits depending on complexity. Essential plan includes 100 credits/mo." },
              { q: "Is my data private?", a: "Absolutely. We use enterprise-grade encryption and never train our public models on your private task data." },
              { q: "Can I collaborate with my team?", a: "Yes! The Ultimate plan is designed specifically for teams with shared workspaces and real-time syncing." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none glass-card rounded-3xl px-6">
                <AccordionTrigger className="text-lg font-bold hover:no-underline py-6 dark:text-white">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-500 font-medium pb-6">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2 text-white font-black text-3xl tracking-tighter">
            <Sparkles className="w-8 h-8 text-indigo-500 fill-indigo-500" />
            <span>Yobest AI</span>
          </div>
          <div className="flex gap-12 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
          </div>
          <p className="text-sm font-medium">© 2024 Yobest AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const Clock = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default Index;