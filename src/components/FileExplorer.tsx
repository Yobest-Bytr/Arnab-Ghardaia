"use client";

import React, { useState } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, Search, Plus, Trash2, RefreshCw, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileExplorerProps {
  files: any[];
  onFileSelect: (file: any) => void;
  onFileCreate: () => void;
  onFileDelete: (id: string) => void;
  selectedFileId?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  onFileSelect, 
  onFileCreate, 
  onFileDelete,
  selectedFileId 
}) => {
  const [isPublicOpen, setIsPublicOpen] = useState(true);
  const [isSrcOpen, setIsSrcOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] border-r border-white/5 select-none">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className="text-white/20" />
          <span className="text-[11px] font-bold text-white/40">{files.length} files</span>
        </div>
        <button 
          onClick={onFileCreate}
          className="p-1.5 rounded-lg hover:bg-white/5 text-indigo-400 transition-all"
          title="New Script"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="p-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={12} />
          <input 
            type="text" 
            placeholder="Search scripts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {/* Src Folder */}
        <div className="mb-1">
          <button 
            onClick={() => setIsSrcOpen(!isSrcOpen)}
            className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold text-white/40 hover:bg-white/5 transition-colors"
          >
            {isSrcOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Folder size={14} className="text-indigo-400/60" />
            <span>src/scripts</span>
          </button>
          {isSrcOpen && (
            <div className="ml-4 border-l border-white/5">
              {filteredFiles.map((file) => (
                <div 
                  key={file.id}
                  className={cn(
                    "group flex items-center justify-between pr-2 transition-all",
                    selectedFileId === file.id ? "bg-indigo-600/10" : "hover:bg-white/5"
                  )}
                >
                  <button
                    onClick={() => onFileSelect(file)}
                    className={cn(
                      "flex-1 flex items-center gap-2 px-6 py-1.5 text-[11px] transition-all",
                      selectedFileId === file.id ? "text-indigo-400 font-bold" : "text-white/40 hover:text-white"
                    )}
                  >
                    <FileCode size={14} className={selectedFileId === file.id ? "text-indigo-400" : "text-white/20"} />
                    <span className="truncate">{file.title}</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onFileDelete(file.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/10 hover:text-rose-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {filteredFiles.length === 0 && (
                <div className="px-6 py-4 text-[10px] text-white/10 italic">No scripts found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;