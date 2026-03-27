import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-6">Get in Touch</h1>
            <p className="text-xl text-slate-500 font-medium mb-12">Have questions about our breeds or want to visit the farm? We're here to help.</p>
            
            <div className="space-y-8">
              {[
                { icon: Phone, label: "Call Us", val: "+966 50 000 0000" },
                { icon: Mail, label: "Email Us", val: "hello@aranibfarm.com" },
                { icon: MapPin, label: "Visit Us", val: "Riyadh, Saudi Arabia" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-lg font-bold text-slate-900">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-12 flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white font-black rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-green-200">
              <MessageCircle size={24} />
              Chat on WhatsApp
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="farm-card p-10"
          >
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input type="text" className="w-full h-14 px-6 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input type="email" className="w-full h-14 px-6 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Message</label>
                <textarea className="w-full min-h-[150px] p-6 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button className="farm-button w-full h-16 flex items-center justify-center gap-3">
                <Send size={20} />
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;