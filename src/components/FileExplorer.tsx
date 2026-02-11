"use client";

import React from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileExplorerProps {
  files: any[];
  onFileSelect: (file: any) => void;
  selectedFileId?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect, selectedFileId }) => {
  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] border-r border-white/5">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Explorer</span>
        <span className="text-[10px] font-bold text-white/20">{files.length} files</span>
      </div>
      
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={12} />
          <input 
            type="text" 
            placeholder="Search files..." 
            className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        <div className="px-4 mb-2 flex items-center gap-2 text-white/40">
          <ChevronDown size={14} />
          <Folder size={14} className="text-indigo-400" />
          <span className="text-[11px] font-bold">src</span>
        </div>
        
        <div className="space-y-0.5">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => onFileSelect(file)}
              className={cn(
                "w-full flex items-center gap-2 px-8 py-1.5 text-[11px] transition-all group",
                selectedFileId === file.id 
                  ? "bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <FileCode size={14} className={selectedFileId === file.id ? "text-indigo-400" : "text-white/20 group-hover:text-white/40"} />
              <span className="truncate font-medium">{file.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;