import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Code } from 'lucide-react';

const AIEntryModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('yobest-ai-alert');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('yobest-ai-alert', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="max-w-lg w-full pill-nav p-8 bg-[#020408] border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 ai-gradient" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <h3 className="text-2xl font-black mb-4 tracking-tight">Cognitive Engine Active</h3>
            <p className="text-gray-400 font-medium leading-relaxed mb-6">
              The site uses artificial intelligence to function. This AI is used, but display <span className="text-indigo-400 font-bold">yobest.ai</span>:
            </p>

            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 mb-8 flex items-center gap-3">
              <Code size={16} className="text-gray-600" />
              <code className="text-[10px] text-gray-500 font-mono">
                <script src="https://js.puter.com/v2/"></script>
              </code>
            </div>

            <button 
              onClick={handleClose}
              className="auron-button w-full h-14 text-lg shadow-[0_0_20px_rgba(153,246,255,0.2)]"
            >
              Initialize Workspace
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AIEntryModal;