import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative z-10 pt-32 pb-16 px-6 border-t border-white/5 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-3xl tracking-tighter mb-8">
              <Sparkles className="w-8 h-8 text-indigo-400 fill-indigo-400" />
              <span>Yobest AI</span>
            </Link>
            <p className="text-xl text-gray-500 font-medium max-w-md leading-relaxed">
              The world's first cognitive operating system designed for the next generation of creators and builders.
            </p>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs text-white mb-8">Platform</h4>
            <ul className="space-y-4 text-gray-500 font-bold">
              <li><Link to="#" className="hover:text-indigo-400 transition-colors">Features</Link></li>
              <li><Link to="#" className="hover:text-indigo-400 transition-colors">Integrations</Link></li>
              <li><Link to="#" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
              <li><Link to="#" className="hover:text-indigo-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs text-white mb-8">Connect</h4>
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-16 border-t border-white/5 text-gray-600 text-sm font-bold">
          <p>© 2026 Yobest AI. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;