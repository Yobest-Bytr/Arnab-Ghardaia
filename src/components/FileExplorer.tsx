"use client";

import React, { useState } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, Search, Plus, Trash2, RefreshCw, FileText, Settings, Database, Layout, Box, Code } from 'lucide-react';
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
  const [openFolders, setOpenFolders] = useState<string[]>(['src', 'public', 'components']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => 
      prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]
    );
  };

  const renderFile = (file: any) => (
    <div 
      key={file.id}
      className={cn(
        "group flex items-center justify-between pr-2 transition-all cursor-pointer",
        selectedFileId === file.id ? "bg-indigo-600/10" : "hover:bg-white/5"
      )}
      onClick={() => onFileSelect(file)}
    >
      <div className={cn(
        "flex-1 flex items-center gap-2 px-6 py-1.5 text-[11px] transition-all",
        selectedFileId === file.id ? "text-indigo-400 font-bold" : "text-white/40 hover:text-white"
      )}>
        <FileCode size={14} className={selectedFileId === file.id ? "text-indigo-400" : "text-white/20"} />
        <span className="truncate">{file.title}</span>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onFileDelete(file.id); }}
        className="opacity-0 group-hover:opacity-100 p-1 text-white/10 hover:text-rose-400 transition-all"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );

  const renderFolder = (name: string, icon: any, children: any[], path: string) => {
    const isOpen = openFolders.includes(path);
    return (
      <div key={path} className="mb-1">
        <button 
          onClick={() => toggleFolder(path)}
          className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold text-white/40 hover:bg-white/5 transition-colors"
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {React.createElement(icon, { size: 14, className: "text-indigo-400/60" })}
          <span>{name}</span>
        </button>
        {isOpen && (
          <div className="ml-4 border-l border-white/5">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Organize files into the structure seen in images
  const publicFiles = files.filter(f => f.path?.startsWith('public/') || f.title === 'favicon.ico' || f.title === 'robots.txt');
  const srcFiles = files.filter(f => f.path?.startsWith('src/') || ['App.tsx', 'main.tsx', 'globals.css'].includes(f.title));
  const rootFiles = files.filter(f => !publicFiles.includes(f) && !srcFiles.includes(f));

  const componentsFiles = srcFiles.filter(f => f.path?.includes('components/'));
  const pagesFiles = srcFiles.filter(f => f.path?.includes('pages/'));
  const utilsFiles = srcFiles.filter(f => f.path?.includes('utils/'));

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] border-r border-white/5 select-none">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className="text-white/20" />
          <span className="text-[11px] font-bold text-white/40">{files.length} files</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onFileCreate} className="p-1.5 rounded-lg hover:bg-white/5 text-indigo-400 transition-all"><Plus size={16} /></button>
        </div>
      </div>
      
      <div className="p-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={12} />
          <input 
            type="text" 
            placeholder="Search file contents" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {renderFolder('public', Folder, publicFiles.map(renderFile), 'public')}
        
        {renderFolder('src', Folder, [
          renderFolder('components', Folder, componentsFiles.map(renderFile), 'src/components'),
          renderFolder('pages', Layout, pagesFiles.map(renderFile), 'src/pages'),
          renderFolder('utils', Settings, utilsFiles.map(renderFile), 'src/utils'),
          ...srcFiles.filter(f => !f.path?.includes('/')).map(renderFile)
        ], 'src')}

        <div className="mt-4 pt-4 border-t border-white/5">
          {rootFiles.map(renderFile)}
        </div>
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
          <Database size={12} />
          <span>System Messages</span>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;