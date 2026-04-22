
import React, { useState, useEffect } from 'react';
import { storage, Cage, Rabbit } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Box, 
  Trash2, 
  Edit2, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  MapPin
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Cages = () => {
  const [cages, setCages] = useState<Cage[]>([]);
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCage, setEditingCage] = useState<Cage | null>(null);

  const [formData, setFormData] = useState<Partial<Cage>>({
    number: '',
    type: 'Single',
    location: '',
    status: 'Empty',
    capacity: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedCages = storage.getCages();
    if (savedCages.length === 0) {
      const demoCages: Cage[] = [
        { id: 'c1', number: 'C-01', type: 'Single', location: 'Section A', status: 'Occupied', capacity: 1 },
        { id: 'c2', number: 'C-02', type: 'Breeding', location: 'Section A', status: 'Empty', capacity: 2 },
        { id: 'c3', number: 'G-01', type: 'Grow-out', location: 'Section B', status: 'Occupied', capacity: 10 },
      ];
      storage.saveCages(demoCages);
      setCages(demoCages);
    } else {
      setCages(savedCages);
    }
    setRabbits(storage.getRabbits());
  };

  const handleSaveCage = (e: React.FormEvent) => {
    e.preventDefault();
    const cagesList = storage.getCages();
    
    if (editingCage) {
      const updatedList = cagesList.map(c => c.id === editingCage.id ? { ...editingCage, ...formData } as Cage : c);
      storage.saveCages(updatedList);
      toast.success('Cage updated successfully');
    } else {
      const newCage: Cage = {
        id: crypto.randomUUID(),
        ...formData as Cage,
      };
      const updatedList = [...cagesList, newCage];
      storage.saveCages(updatedList);
      toast.success('Cage added successfully');
    }

    loadData();
    setIsAddModalOpen(false);
    setEditingCage(null);
    setFormData({ number: '', type: 'Single', location: '', status: 'Empty', capacity: 1 });
  };

  const deleteCage = (id: string) => {
    if (confirm('Are you sure you want to delete this cage?')) {
      const updatedList = cages.filter(c => c.id !== id);
      storage.saveCages(updatedList);
      setCages(updatedList);
      toast.error('Cage deleted');
    }
  };

  const getOccupants = (cageId: string) => {
    return rabbits.filter(r => r.cageId === cageId);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-primary">Cage Management</h1>
          <p className="text-muted-foreground">Organize your farm layout and housing.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            setEditingCage(null);
            setFormData({ number: '', type: 'Single', location: '', status: 'Empty', capacity: 1 });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2">
              <Plus className="h-4 w-4" />
              Add Cage
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCage ? 'Edit Cage' : 'Add New Cage'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCage} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cage Number</Label>
                  <Input 
                    value={formData.number} 
                    onChange={(e) => setFormData({...formData, number: e.target.value})} 
                    placeholder="e.g. C-101"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v: any) => setFormData({...formData, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Breeding">Breeding</SelectItem>
                      <SelectItem value="Grow-out">Grow-out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} 
                  placeholder="e.g. Section A, Row 1"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input 
                    type="number"
                    value={formData.capacity} 
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v: any) => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Empty">Empty</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">{editingCage ? 'Update Cage' : 'Save Cage'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cages.map((cage) => {
          const occupants = getOccupants(cage.id);
          return (
            <Card key={cage.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all shadow-sm">
              <CardHeader className="pb-2 bg-muted/30">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Box className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      setEditingCage(cage);
                      setFormData(cage);
                      setIsAddModalOpen(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCage(cage.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-xl font-bold">{cage.number}</CardTitle>
                  <Badge variant="outline" className="mt-1">{cage.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{cage.location}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Occupancy</span>
                    <span>{occupants.length} / {cage.capacity}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all",
                        occupants.length >= cage.capacity ? "bg-red-500" : "bg-primary"
                      )}
                      style={{ width: `${Math.min((occupants.length / cage.capacity) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Current Occupants</p>
                  <div className="flex flex-wrap gap-1">
                    {occupants.length === 0 ? (
                      <span className="text-xs italic text-muted-foreground">Empty</span>
                    ) : (
                      occupants.map(r => (
                        <Badge key={r.id} variant="secondary" className="text-[10px]">
                          {r.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {cage.status === 'Occupied' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : cage.status === 'Maintenance' ? (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                    )}
                    <span className="text-xs font-bold">{cage.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Cages;
