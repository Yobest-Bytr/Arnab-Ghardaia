"use client";

import React, { useState, useMemo } from 'react';
import { Folder, FileCode, ChevronRight, ChevronDown, Search, Plus, Trash2, RefreshCw, Box, Layout, Zap, Share2, Database, Settings, Layers } from 'lucide-react';
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
  const [openFolders, setOpenFolders] = useState<string[]>(['src', 'src/pages', 'src/components', 'public']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFolder = (path: string) => {
    setOpenFolders(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  // Build a dynamic tree from the flat file list
  const fileTree = useMemo(() => {
    const tree: any = { _files: [], _path: '' };
    
    files.forEach(file => {
      const path = file.path || file.title;
      const parts = path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current._files.push(file);
        } else {
          if (!current[part]) {
            current[part] = { _files: [], _path: current._path ? `${current._path}/${part}` : part };
          }
          current = current[part];
        }
      });
    });
    
    return tree;
  }, [files]);

  const getFolderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'components': return Box;
      case 'pages': return Layout;
      case 'hooks': return Zap;
      case 'contexts': return Share2;
      case 'lib': return Database;
      case 'utils': return Settings;
      case 'integrations': return Layers;
      default: return Folder;
    }
  };

  const renderTree = (node: any, name: string = 'root') => {
    const entries = Object.entries(node).filter(([key]) => !key.startsWith('_'));
    const nodeFiles = node._files || [];
    const path = node._path;
    const isOpen = openFolders.includes(path) || path === '';

    return (
      <div key={path || 'root'} className={cn(path ? "ml-4 border-l border-white/5" : "")}>
        {path && (
          <button 
            onClick={() => toggleFolder(path)}
            className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold text-white/40 hover:bg-white/5 transition-colors group"
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {React.createElement(getFolderIcon(name), { size: 14, className: "text-indigo-400/60" })}
            <span>{name}</span>
          </button>
        )}
        
        {isOpen && (
          <>
            {entries.map(([key, value]) => renderTree(value, key))}
            {nodeFiles.map((file: any) => (
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
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] border-r border-white/5 select-none">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className="text-white/20" />
          <span className="text-[11px] font-bold text-white/40">{files.length} files</span>
        </div>
        <button onClick={onFileCreate} className="p-1.5 rounded-lg hover:bg-white/5 text-indigo-400 transition-all">
          <Plus size={16} />
        </button>
      </div>
      
      <div className="p-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={12} />
          <input 
            type="text" 
            placeholder="Search files..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {renderTree(fileTree)}
      </div>
    </div>
  );
};

export default FileExplorer;