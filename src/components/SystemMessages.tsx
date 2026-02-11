"use client";

import React from 'react';
import { Terminal, ChevronUp, ChevronDown, X } from 'lucide-react';

interface SystemMessagesProps {
  messages: any[];
  isOpen: boolean;
  onToggle: () => void;
}

const SystemMessages: React.FC<SystemMessagesProps> = ({ messages, isOpen, onToggle }) => {
  return (
    <div className={`border-t border-white/5 bg-[#0a0a0a] transition-all duration-300 ${isOpen ? 'h-48' : 'h-10'}`}>
      <div 
        className="h-10 px-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">System Messages</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-white/20">[200] GET https://api.puter.com/socket.io/...</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 overflow-y-auto h-38 font-mono text-[11px] space-y-1 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-white/20">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
              <span className={msg.type === 'error' ? 'text-rose-400' : msg.type === 'warn' ? 'text-amber-400' : 'text-indigo-400'}>
                {msg.type.toUpperCase()}
              </span>
              <span className="text-white/60">{msg.text}</span>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-white/10 italic">No system messages recorded.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemMessages;