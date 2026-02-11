import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FolderPlus, Sparkles, Code, Globe, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: { title: string; description: string; template: string }) => void;
}

const TEMPLATES = [
  { id: 'react', name: 'React Component', icon: Code, desc: 'Modern UI with Tailwind' },
  { id: 'html', name: 'Static Web', icon: Globe, desc: 'Pure HTML/CSS/JS' },
  { id: 'logic', name: 'Neural Script', icon: Brain, desc: 'Logic & Automation' },
];

const ProjectModal = ({ isOpen, onClose, onSave }: ProjectModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('react');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, description, template: selectedTemplate });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#020408] border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <FolderPlus className="text-[#99f6ff]" />
            Initialize Workspace
          </DialogTitle>
          <DialogDescription className="text-white/40 font-medium">
            Select a neural template to begin your cognitive build.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8 py-6">
          <div className="grid grid-cols-3 gap-4">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3",
                  selectedTemplate === t.id 
                    ? "border-[#99f6ff] bg-[#99f6ff]/10" 
                    : "border-white/5 bg-white/5 hover:border-white/10"
                )}
              >
                <t.icon size={24} className={selectedTemplate === t.id ? "text-[#99f6ff]" : "text-white/20"} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">{t.name}</p>
                  <p className="text-[9px] text-white/30 font-medium">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-6">
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