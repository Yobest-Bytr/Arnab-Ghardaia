import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Code, Save } from 'lucide-react';

interface ScriptEditorProps {
  script: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedScript: any) => void;
}

const ScriptEditor = ({ script, isOpen, onClose, onSave }: ScriptEditorProps) => {
  const [title, setTitle] = useState(script?.title || '');
  const [content, setContent] = useState(script?.content || '');

  const handleSave = () => {
    onSave({ ...script, title, content });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#020408] border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <Code className="text-[#99f6ff]" />
            Edit Script
          </DialogTitle>
          <DialogDescription className="text-white/40 font-medium">
            Modify the neural logic of your archived script.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Script Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 h-12 rounded-xl font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Code Content</label>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              className="bg-white/5 border-white/10 min-h-[300px] rounded-xl font-mono text-indigo-300"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="ghost" className="text-white/40 hover:text-white">Cancel</Button>
          <Button onClick={handleSave} className="auron-button h-12 px-8 flex items-center gap-2">
            <Save size={18} />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScriptEditor;