
import React, { useState, useEffect, useMemo } from 'react';
import { storage, Cage, Rabbit } from '@/lib/db';
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
  MapPin,
  LayoutGrid,
  Info,
  ArrowRight,
  Filter,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const Cages = () => {
  const { user } = useAuth();
  const [cages, setCages] = useState<Cage[]>([]);
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCage, setEditingCage] = useState<Cage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const [formData, setFormData] = useState<Partial<Cage>>({
    number: '',
    type: 'Single',
    location: '',
    status: 'Empty',
    capacity: 1
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [savedCages, savedRabbits] = await Promise.all([
        storage.getCages(),
        storage.getRabbits()
      ]);
      setCages(savedCages || []);
      setRabbits(savedRabbits || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      if (editingCage) {
        await storage.update('cages', user.id, editingCage.id, formData);
        toast.success('Cage updated successfully');
      } else {
        await storage.insert('cages', user.id, formData);
        toast.success('Cage added successfully');
      }

      await loadData();
      setIsAddModalOpen(false);
      setEditingCage(null);
      setFormData({ number: '', type: 'Single', location: '', status: 'Empty', capacity: 1 });
    } catch (error) {
      toast.error('Failed to save cage');
    }
  };

  const deleteCage = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this cage?')) {
      try {
        await storage.delete('cages', user.id, id);
        setCages(cages.filter(c => c.id !== id));
        toast.error('Cage deleted');
      } catch (error) {
        toast.error('Failed to delete cage');
      }
    }
  };

  const getOccupants = (cageId: string) => {
    return rabbits.filter(r => r.cageId === cageId || r.cage_number === cageId);
  };

  const filteredCages = useMemo(() => {
    return cages.filter(c => {
      const matchesType = filterType === 'All' || c.type === filterType;
      const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
      return matchesType && matchesStatus;
    });
  }, [cages, filterType, filterStatus]);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-10 pb-24 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-4">
            <LayoutGrid className="h-10 w-10" />
            Cage Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Organize your farm layout and housing nodes with precision.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            setEditingCage(null);
            setFormData({ number: '', type: 'Single', location: '', status: 'Empty', capacity: 1 });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-14 px-8 gap-2 shadow-lg shadow-primary/20 font-black text-lg w-full md:w-auto">
              <Plus className="h-6 w-6" />
              Add Cage
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{editingCage ? 'Edit Cage' : 'Add New Cage'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCage} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Cage Number</Label>
                  <Input 
                    value={formData.number} 
                    onChange={(e) => setFormData({...formData, number: e.target.value})} 
                    placeholder="e.g. C-101"
                    className="h-12 rounded-xl border-2"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v: any) => setFormData({...formData, type: v})}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Breeding">Breeding</SelectItem>
                      <SelectItem value="Grow-out">Grow-out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Location</Label>
                <Input 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} 
                  placeholder="e.g. Section A, Row 1"
                  className="h-12 rounded-xl border-2"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Capacity</Label>
                  <Input 
                    type="number"
                    value={formData.capacity} 
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} 
                    className="h-12 rounded-xl border-2"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v: any) => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Empty">Empty</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20">
                {editingCage ? 'Update Cage' : 'Save Cage'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-2 rounded-[2rem] shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-12 w-[180px] rounded-xl border-2 font-bold">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Filter Type" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Breeding">Breeding</SelectItem>
                <SelectItem value="Grow-out">Grow-out</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-12 w-[180px] rounded-xl border-2 font-bold">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Filter Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Empty">Empty</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border-2 rounded-xl px-6 h-12">
              <Filter className="h-4 w-4 text-primary mr-2" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{filteredCages.length} Results</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]" />
          ))
        ) : filteredCages.map((cage, i) => {
          const occupants = getOccupants(cage.id);
          return (
            <motion.div key={cage.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden border-2 rounded-[2.5rem] hover:border-primary/50 transition-all shadow-sm hover:shadow-xl bg-white dark:bg-slate-900 group">
                <CardHeader className="pb-4 bg-slate-50 dark:bg-slate-800/50 p-6 border-b">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm transition-transform group-hover:scale-110">
                      <Box className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl" onClick={() => {
                        setEditingCage(cage);
                        setFormData(cage);
                        setIsAddModalOpen(true);
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive hover:text-white" onClick={() => deleteCage(cage.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <CardTitle className="text-2xl font-black tracking-tight">{cage.number}</CardTitle>
                    <Badge variant="outline" className="mt-2 font-black uppercase tracking-widest text-[10px] rounded-lg px-2 py-0.5">{cage.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span>{cage.location}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      <span>Occupancy</span>
                      <span className={cn(occupants.length >= cage.capacity ? "text-red-500" : "text-primary")}>
                        {occupants.length} / {cage.capacity}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((occupants.length / cage.capacity) * 100, 100)}%` }}
                        className={cn(
                          "h-full transition-all",
                          occupants.length >= cage.capacity ? "bg-red-500" : "bg-primary"
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" /> Current Occupants
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {occupants.length === 0 ? (
                        <span className="text-xs italic text-muted-foreground font-medium p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed w-full text-center">Empty Node</span>
                      ) : (
                        occupants.map(r => (
                          <Badge key={r.id} variant="secondary" className="text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary transition-colors cursor-default">
                            {r.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cage.status === 'Occupied' ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{cage.status}</span>
                        </div>
                      ) : cage.status === 'Maintenance' ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{cage.status}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 dark:bg-slate-800">
                          <div className="h-3 w-3 rounded-full border-2 border-slate-300" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{cage.status}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      {filteredCages.length === 0 && !isLoading && (
        <div className="p-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed">
          <Box className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground font-bold">No cages match your filters.</p>
        </div>
      )}
    </div>
  );
};

export default Cages;
