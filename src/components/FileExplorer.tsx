"use client";

import React, { useState } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, Search, Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileExplorerProps {
  files: any[];
  onFileSelect: (file: any) => void;
  selectedFileId?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect, selectedFileId }) => {
  const [isPublicOpen, setIsPublicOpen] = useState(true);
  const [isSrcOpen, setIsSrcOpen] = useState(true);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] border-r border-white/5 select-none">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className="text-white/20" />
          <span className="text-[11px] font-bold text-white/40">{files.length} files</span>
        </div>
        <Maximize2 size={14} className="text-white/20 cursor-pointer hover:text-white transition-colors" />
      </div>
      
      <div className="p-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={12} />
          <input 
            type="text" 
            placeholder="Search file contents" 
            className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {/* Public Folder */}
        <div className="mb-1">
          <button 
            onClick={() => setIsPublicOpen(!isPublicOpen)}
            className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold text-white/40 hover:bg-white/5 transition-colors"
          >
            {isPublicOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Folder size={14} className="text-amber-400/60" />
            <span>public</span>
          </button>
          {isPublicOpen && (
            <div className="ml-4 border-l border-white/5">
              {['favicon.ico', 'placeholder.svg', 'robots.txt'].map(f => (
                <div key={f} className="flex items-center gap-2 px-6 py-1 text-[11px] text-white/30 hover:text-white/60 cursor-pointer">
                  <FileCode size={12} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Src Folder */}
        <div className="mb-1">
          <button 
            onClick={() => setIsSrcOpen(!isSrcOpen)}
            className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold text-white/40 hover:bg-white/5 transition-colors"
          >
            {isSrcOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Folder size={14} className="text-indigo-400/60" />
            <span>src</span>
          </button>
          {isSrcOpen && (
            <div className="ml-4 border-l border-white/5">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => onFileSelect(file)}
                  className={cn(
                    "w-full flex items-center gap-2 px-6 py-1.5 text-[11px] transition-all group",
                    selectedFileId === file.id 
                      ? "bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-500" 
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <FileCode size={14} className={selectedFileId === file.id ? "text-indigo-400" : "text-white/20 group-hover:text-white/40"} />
                  <span className="truncate font-medium">{file.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { Maximize2, RefreshCw } from 'lucide-react';
export default FileExplorer;