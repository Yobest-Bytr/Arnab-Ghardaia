import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FolderPlus, Sparkles } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: { title: string; description: string }) => void;
}

const ProjectModal = ({ isOpen, onClose, onSave }: ProjectModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, description });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#020408] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <FolderPlus className="text-[#99f6ff]" />
            New Project
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Project Name</label>
            <Input 
              placeholder="e.g., Neural Interface v2"
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 h-12 rounded-xl font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Initial Objective</label>
            <Textarea 
              placeholder="Describe what this project will achieve..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 min-h-[100px] rounded-xl font-medium"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="ghost" className="text-white/40 hover:text-white">Cancel</Button>
          <Button onClick={handleSave} className="auron-button h-12 px-8 flex items-center gap-2">
            <Sparkles size={18} />
            Initialize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;