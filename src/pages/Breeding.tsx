
import React, { useState, useEffect } from 'react';
import { storage, BreedingRecord, Rabbit, Litter } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Heart, 
  Calendar, 
  Trash2, 
  Edit2, 
  Baby, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  History,
  Zap,
  Search,
  Filter,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format, addDays, isAfter, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Breeding = () => {
  const [records, setRecords] = useState<BreedingRecord[]>([]);
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLitterModalOpen, setIsLitterModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BreedingRecord | null>(null);

  const [formData, setFormData] = useState<Partial<BreedingRecord>>({
    buckId: '',
    doeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Mated'
  });

  const [litterData, setLitterData] = useState<Partial<Litter>>({
    totalKits: 0,
    aliveKits: 0,
    deadKits: 0,
    birthDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRecords(await storage.getBreedingRecords());
    setRabbits(await storage.getRabbits());
    setLitters(await storage.getLitters());
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: BreedingRecord = {
      id: crypto.randomUUID(),
      ...formData as BreedingRecord,
    };
    const updatedList = [newRecord, ...records];
    await storage.saveBreedingRecords(updatedList);
    toast.success('Breeding record added');
    await loadData();
    setIsAddModalOpen(false);
    setFormData({ buckId: '', doeId: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'Mated' });
  };

  const handleSaveLitter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const newLitter: Litter = {
      id: crypto.randomUUID(),
      doeId: selectedRecord.doeId,
      breedingId: selectedRecord.id,
      ...litterData as Litter,
    };

    const updatedLitters = [...litters, newLitter];
    await storage.saveLitters(updatedLitters);

    const updatedRecords = records.map(r => 
      r.id === selectedRecord.id ? { ...r, status: 'Kindled' as const } : r
    );
    await storage.saveBreedingRecords(updatedRecords);

    toast.success('Litter recorded successfully');
    await loadData();
    setIsLitterModalOpen(false);
    setSelectedRecord(null);
  };

  const updateStatus = async (id: string, status: BreedingRecord['status']) => {
    const updatedList = records.map(r => r.id === id ? { ...r, status } : r);
    await storage.saveBreedingRecords(updatedList);
    setRecords(updatedList);
    toast.success(`Status updated to ${status}`);
  };

  const deleteRecord = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      const updatedList = records.filter(r => r.id !== id);
      await storage.saveBreedingRecords(updatedList);
      setRecords(updatedList);
      toast.error('Record deleted');
    }
  };

  const does = rabbits.filter(r => r.gender === 'Doe' && r.status === 'Active');
  const bucks = rabbits.filter(r => r.gender === 'Buck' && r.status === 'Active');

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-10 pb-24 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-4">
            <Heart className="h-10 w-10" />
            Breeding Management
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Track mating cycles, pregnancies, and litter production.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-14 px-8 gap-2 shadow-lg shadow-primary/20 font-black text-lg w-full md:w-auto">
              <Plus className="h-6 w-6" />
              Record Mating
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">New Mating Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveRecord} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Doe (Female)</Label>
                  <Select 
                    value={formData.doeId} 
                    onValueChange={(v) => setFormData({...formData, doeId: v})}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2">
                      <SelectValue placeholder="Select Doe" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {does.map(r => <SelectItem key={r.id} value={r.id}>{r.name} ({r.tagId})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Buck (Male)</Label>
                  <Select 
                    value={formData.buckId} 
                    onValueChange={(v) => setFormData({...formData, buckId: v})}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2">
                      <SelectValue placeholder="Select Buck" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {bucks.map(r => <SelectItem key={r.id} value={r.id}>{r.name} ({r.tagId})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Mating Date</Label>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  className="h-12 rounded-xl border-2"
                  required 
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20">Save Record</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <History className="h-6 w-6 text-primary" />
              Active Records
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl h-10 font-bold border-2">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {records.map((record, i) => {
              const doe = rabbits.find(r => r.id === record.doeId);
              const buck = rabbits.find(r => r.id === record.buckId);
              const expectedKindling = format(addDays(parseISO(record.date), 31), 'MMM dd, yyyy');
              const isOverdue = isAfter(new Date(), addDays(parseISO(record.date), 32)) && record.status !== 'Kindled';

              return (
                <motion.div key={record.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="overflow-hidden border-2 rounded-[2rem] hover:border-primary/30 transition-all shadow-sm hover:shadow-md bg-white dark:bg-slate-900 group">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="flex -space-x-4">
                            <div className="h-14 w-14 rounded-2xl bg-pink-50 dark:bg-pink-900/20 border-4 border-white dark:border-slate-900 flex items-center justify-center text-pink-600 shadow-sm">
                              <Heart className="h-6 w-6" />
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-4 border-white dark:border-slate-900 flex items-center justify-center text-blue-600 shadow-sm">
                              <Zap className="h-6 w-6" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg">{doe?.name || 'Unknown'}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="font-black text-lg">{buck?.name || 'Unknown'}</span>
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Mated: {format(parseISO(record.date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="text-right hidden md:block">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expected Kindling</p>
                            <p className={cn("font-black", isOverdue ? "text-red-500" : "text-primary")}>{expectedKindling}</p>
                          </div>
                          
                          <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800 hidden md:block" />

                          <div className="flex items-center gap-3">
                            <Badge className={cn(
                              "rounded-lg px-3 py-1 font-black uppercase tracking-widest text-[10px]",
                              record.status === 'Mated' ? "bg-blue-50 text-blue-600" :
                              record.status === 'Confirmed' ? "bg-emerald-50 text-emerald-600" :
                              record.status === 'Kindled' ? "bg-purple-50 text-purple-600" :
                              "bg-red-50 text-red-600"
                            )}>
                              {record.status}
                            </Badge>
                            
                            <div className="flex gap-1">
                              {record.status === 'Mated' && (
                                <Button variant="secondary" size="sm" className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => updateStatus(record.id, 'Confirmed')}>Confirm</Button>
                              )}
                              {record.status === 'Confirmed' && (
                                <Button variant="secondary" size="sm" className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600" onClick={() => {
                                  setSelectedRecord(record);
                                  setIsLitterModalOpen(true);
                                }}>Kindle</Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive hover:text-white" onClick={() => deleteRecord(record.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {records.length === 0 && (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-bold">No breeding records found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <Baby className="h-6 w-6 text-primary" />
            Recent Litters
          </h2>
          <div className="space-y-4">
            {litters.slice(0, 5).map((litter, i) => {
              const doe = rabbits.find(r => r.id === litter.doeId);
              return (
                <motion.div key={litter.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-2 rounded-2xl hover:border-primary/20 transition-all shadow-sm bg-white dark:bg-slate-900">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <Baby className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-sm">{doe?.name || 'Unknown'}'s Litter</h4>
                            <p className="text-[10px] font-bold text-muted-foreground">{litter.birthDate}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg font-black">{litter.aliveKits} Kits</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                          <p className="text-[8px] font-black text-muted-foreground uppercase">Total</p>
                          <p className="font-black text-sm">{litter.totalKits}</p>
                        </div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
                          <p className="text-[8px] font-black text-emerald-600 uppercase">Alive</p>
                          <p className="font-black text-sm text-emerald-600">{litter.aliveKits}</p>
                        </div>
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-center">
                          <p className="text-[8px] font-black text-rose-600 uppercase">Dead</p>
                          <p className="font-black text-sm text-rose-600">{litter.deadKits}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kindle Modal */}
      <Dialog open={isLitterModalOpen} onOpenChange={setIsLitterModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Record Kindling</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveLitter} className="space-y-6 pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Total</Label>
                <Input 
                  type="number" 
                  value={litterData.totalKits} 
                  onChange={(e) => setLitterData({...litterData, totalKits: parseInt(e.target.value)})} 
                  className="h-12 rounded-xl border-2 text-center font-black"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Alive</Label>
                <Input 
                  type="number" 
                  value={litterData.aliveKits} 
                  onChange={(e) => setLitterData({...litterData, aliveKits: parseInt(e.target.value)})} 
                  className="h-12 rounded-xl border-2 text-center font-black text-emerald-600"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Dead</Label>
                <Input 
                  type="number" 
                  value={litterData.deadKits} 
                  onChange={(e) => setLitterData({...litterData, deadKits: parseInt(e.target.value)})} 
                  className="h-12 rounded-xl border-2 text-center font-black text-rose-600"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Birth Date</Label>
              <Input 
                type="date" 
                value={litterData.birthDate} 
                onChange={(e) => setLitterData({...litterData, birthDate: e.target.value})} 
                className="h-12 rounded-xl border-2"
                required 
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20">Record Litter</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Breeding;
