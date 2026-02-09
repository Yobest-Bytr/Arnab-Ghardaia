import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, ArrowRight, CheckCircle2, Users, Zap, 
  BrainCircuit, BarChart3, ShieldCheck, Play, 
  Star, ChevronDown, MousePointer2, Rocket,
  Globe, Cpu, Layers, MessageSquare
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Hero3D from '@/components/Hero3D';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-32 px-6 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black mb-8 border border-indigo-100 dark:border-indigo-800/50 uppercase tracking-[0.25em] shadow-sm">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>The Future of Work is Here</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-[0.85]">
              Master <br />
              <span className="dopamine-text">Your Time</span> <br />
              With AI.
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-xl leading-relaxed font-medium">
              Yobest AI isn't just a task manager. It's a cognitive engine that learns your rhythm and optimizes your life for peak performance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full ai-gradient hover:opacity-90 text-white px-10 py-8 text-xl rounded-2xl shadow-2xl ai-glow border-none font-black group">
                  Get Started Free <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 py-8 text-xl rounded-2xl border-2 border-gray-100 dark:border-gray-800 font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center justify-center gap-3">
                <Play size={20} className="fill-indigo-600 text-indigo-600" />
                Watch Story
              </Button>
            </div>

            <div className="mt-16 flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-950 bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-bold text-gray-500">
                <span className="text-gray-900 dark:text-white font-black">640,000+</span> users already joined
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <Hero3D />
            
            {/* Floating UI Cards */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-10 right-0 glass-card p-6 rounded-3xl shadow-2xl border-white/20 w-64"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Task Completed</p>
                  <p className="text-sm font-black dark:text-white">Project Alpha Live</p>
                </div>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full" />
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-20 left-0 glass-card p-6 rounded-3xl shadow-2xl border-white/20 w-72"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">AI Insight</p>
                  <p className="text-sm font-black dark:text-white">Focus peak in 15 mins</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- BENTO FEATURES SECTION --- */}
      <section className="py-32 px-6 bg-gray-50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black dark:text-white mb-6 tracking-tighter">Built for the <span className="dopamine-text">Elite</span>.</h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">Everything you need to scale your productivity to impossible heights.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Large Bento Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 bg-white dark:bg-gray-900 rounded-[3rem] p-12 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 mb-8">
                  <Cpu size={32} />
                </div>
                <h3 className="text-4xl font-black dark:text-white mb-6">Predictive Intelligence</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-md leading-relaxed">Our neural engine analyzes your work patterns to predict deadlines before they become emergencies.</p>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Small Bento Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-indigo-600 rounded-[3rem] p-12 shadow-xl text-white relative overflow-hidden group"
            >
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                <Zap size={32} />
              </div>
              <h3 className="text-3xl font-black mb-6">Instant Sync</h3>
              <p className="text-indigo-100 font-medium leading-relaxed">Your workspace, everywhere. Zero latency, zero friction.</p>
            </motion.div>

            {/* Small Bento Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center text-pink-600 mb-8">
                <Layers size={32} />
              </div>
              <h3 className="text-3xl font-black dark:text-white mb-6">Deep Focus</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Block distractions automatically when it's time to grind.</p>
            </motion.div>

            {/* Large Bento Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 bg-gray-900 rounded-[3rem] p-12 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8">
                    <Globe size={32} />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-6">Global Collaboration</h3>
                  <p className="text-lg text-gray-400 mb-0 leading-relaxed">Work with anyone, anywhere. Real-time multiplayer for your tasks.</p>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="w-full aspect-square bg-white/5 rounded-3xl border border-white/10" />
                  <div className="w-full aspect-square bg-white/5 rounded-3xl border border-white/10 mt-8" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF SECTION --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-black dark:text-white mb-10 tracking-tighter">Loved by the world's <span className="text-indigo-600">fastest</span> teams.</h2>
              <div className="space-y-8">
                {[
                  { name: "Sarah Chen", role: "Product Lead @ Vercel", text: "Yobest AI changed how our team thinks about deadlines. It's like having a second brain." },
                  { name: "Marcus Thorne", role: "Founder @ Thorne Labs", text: "The Yobest Score™ is addictive. I've never been more productive in my life." }
                ].map((t, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800"
                  >
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-6 italic">"{t.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100" />
                      <div>
                        <p className="font-black dark:text-white">{t.name}</p>
                        <p className="text-xs font-bold text-indigo-600">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-indigo-600 rounded-[4rem] overflow-hidden shadow-2xl relative group">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                  alt="Team working" 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-3xl font-black text-white tracking-tight">"The only tool that actually understands my workflow."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section className="py-32 px-6 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-600/5 blur-[150px] rounded-full" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">Choose Your <span className="dopamine-text">Power</span>.</h2>
            <p className="text-xl text-gray-400 font-medium">Simple pricing for complex ambitions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { name: "Starter", price: "0", features: ["Basic AI Insights", "5 Projects", "Community Support"], color: "bg-white/5" },
              { name: "Pro", price: "29", features: ["Advanced Yobest Score™", "Unlimited Projects", "Priority AI Processing", "Team Sync"], color: "ai-gradient", popular: true },
              { name: "Enterprise", price: "99", features: ["Custom AI Models", "Dedicated Manager", "SSO & Security", "Unlimited Everything"], color: "bg-white/5" }
            ].map((plan, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -20 }}
                className={`p-12 rounded-[3.5rem] border border-white/10 flex flex-col ${plan.color} ${plan.popular ? 'scale-105 shadow-2xl shadow-indigo-500/20' : ''}`}
              >
                {plan.popular && <div className="bg-white text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest self-start mb-8">Most Popular</div>}
                <h3 className="text-3xl font-black mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-6xl font-black">${plan.price}</span>
                  <span className="text-lg font-bold opacity-60">/mo</span>
                </div>
                <ul className="space-y-6 mb-12 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-lg font-bold">
                      <CheckCircle2 size={24} className={plan.popular ? 'text-white' : 'text-indigo-500'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full rounded-2xl h-16 text-xl font-black ${plan.popular ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-black text-center dark:text-white mb-20 tracking-tighter">Common Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { q: "How does the AI actually help?", a: "Our AI doesn't just list tasks; it analyzes your historical performance, current workload, and even time of day to suggest exactly what you should work on next to maintain flow state." },
              { q: "Can I import my data from other tools?", a: "Yes! We support one-click imports from Notion, Trello, Asana, and Todoist. Your transition will be seamless." },
              { q: "Is there a mobile app?", a: "Absolutely. Our iOS and Android apps are fully native and feature the same beautiful design and AI capabilities as the web version." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none bg-gray-50 dark:bg-gray-900 rounded-3xl px-8">
                <AccordionTrigger className="text-xl font-black hover:no-underline py-8 dark:text-white text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-lg text-gray-500 font-medium pb-8 leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="ai-gradient rounded-[4rem] p-20 text-center text-white relative overflow-hidden shadow-2xl ai-glow">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative z-10"
            >
              <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">Ready to go <span className="text-yellow-300">Superhuman</span>?</h2>
              <p className="text-2xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium">Join 640,000+ high-performers and start your 14-day free trial today.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-12 py-8 text-2xl rounded-2xl font-black shadow-xl">
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-12 py-8 text-2xl rounded-2xl font-black backdrop-blur-md">
                  Contact Sales
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-3 font-black text-4xl tracking-tighter dark:text-white mb-8">
                <Sparkles className="w-10 h-10 text-indigo-600 fill-indigo-600" />
                <span>Yobest AI</span>
              </Link>
              <p className="text-xl text-gray-500 max-w-sm leading-relaxed font-medium">
                The world's first dopamine-optimized productivity engine. Built for the next generation of creators.
              </p>
            </div>
            <div>
              <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs mb-8">Product</h4>
              <ul className="space-y-4 text-gray-500 font-bold">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs mb-8">Company</h4>
              <ul className="space-y-4 text-gray-500 font-bold">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-gray-100 dark:border-gray-900 gap-8">
            <p className="text-gray-400 font-medium">© 2026 Yobest AI. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><MessageSquare size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Globe size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Rocket size={24} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;