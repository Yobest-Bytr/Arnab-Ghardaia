
import React, { useState, useEffect } from 'react';
import { storage, BreedingRecord, Rabbit, Litter } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Heart, 
  Calendar, 
  CheckCircle2, 
  Baby, 
  Home, 
  Trash2, 
  ChevronRight,
  AlertCircle,
  X
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Breeding = () => {
  const [records, setRecords] = useState<BreedingRecord[]>([]);
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLitterModalOpen, setIsLitterModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BreedingRecord | null>(null);

  const [formData, setFormData] = useState({
    buckId: '',
    doeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  const [litterData, setLitterData] = useState({
    totalKits: 0,
    aliveKits: 0,
    deadKits: 0,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecords(storage.getBreedingRecords());
    setRabbits(storage.getRabbits());
    setLitters(storage.getLitters());
  };

  const handleAddBreeding = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: BreedingRecord = {
      id: crypto.randomUUID(),
      ...formData,
      status: 'Mated',
      palpationDate: format(addDays(new Date(formData.date), 14), 'yyyy-MM-dd'),
      expectedKindlingDate: format(addDays(new Date(formData.date), 31), 'yyyy-MM-dd'),
    };

    const updatedRecords = [newRecord, ...records];
    storage.saveBreedingRecords(updatedRecords);
    setRecords(updatedRecords);
    setIsAddModalOpen(false);
    setFormData({ buckId: '', doeId: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
    toast.success('Breeding record added successfully');
  };

  const updateStatus = (id: string, status: BreedingRecord['status']) => {
    const updatedRecords = records.map(r => {
      if (r.id === id) {
        if (status === 'Kindled') {
          setSelectedRecord(r);
          setIsLitterModalOpen(true);
        }
        return { ...r, status };
      }
      return r;
    });
    storage.saveBreedingRecords(updatedRecords);
    setRecords(updatedRecords);
    toast.info(`Status updated to ${status}`);
  };

  const handleRecordLitter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const newLitter: Litter = {
      id: crypto.randomUUID(),
      breedingId: selectedRecord.id,
      doeId: selectedRecord.doeId,
      birthDate: format(new Date(), 'yyyy-MM-dd'),
      ...litterData
    };

    const updatedLitters = [newLitter, ...litters];
    storage.saveLitters(updatedLitters);
    setLitters(updatedLitters);
    setIsLitterModalOpen(false);
    setLitterData({ totalKits: 0, aliveKits: 0, deadKits: 0, notes: '' });
    toast.success('Litter recorded successfully');
  };

  const deleteRecord = (id: string) => {
    const updatedRecords = records.filter(r => r.id !== id);
    storage.saveBreedingRecords(updatedRecords);
    setRecords(updatedRecords);
    toast.error('Record deleted');
  };

  const getRabbitName = (id: string) => rabbits.find(r => r.id === id)?.name || 'Unknown';
  const bucks = rabbits.filter(r => r.gender === 'Buck' && r.status === 'Active');
  const does = rabbits.filter(r => r.gender === 'Doe' && r.status === 'Active');

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-primary">Breeding Management</h1>
          <p className="text-muted-foreground">Track mating cycles and litter production.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2">
              <Plus className="h-4 w-4" />
              New Breeding
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record New Breeding</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBreeding} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Doe (Female)</Label>
                <Select onValueChange={(v) => setFormData({...formData, doeId: v})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Doe" />
                  </SelectTrigger>
                  <SelectContent>
                    {does.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name} ({r.tagId})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Buck (Male)</Label>
                <Select onValueChange={(v) => setFormData({...formData, buckId: v})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Buck" />
                  </SelectTrigger>
                  <SelectContent>
                    {bucks.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name} ({r.tagId})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mating Date</Label>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                  placeholder="Any special observations?"
                />
              </div>
              <Button type="submit" className="w-full">Save Breeding Record</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map((record) => (
          <Card key={record.id} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2 bg-muted/30">
              <div className="flex justify-between items-start">
                <Badge className={
                  record.status === 'Mated' ? 'bg-pink-100 text-pink-700' :
                  record.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                  record.status === 'Kindled' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }>
                  {record.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRecord(record.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl mt-2">
                {getRabbitName(record.doeId)} × {getRabbitName(record.buckId)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Mated
                  </p>
                  <p className="font-medium">{format(new Date(record.date), 'MMM d, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Expected
                  </p>
                  <p className="font-medium text-orange-600">
                    {record.expectedKindlingDate ? format(new Date(record.expectedKindlingDate), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {record.status === 'Mated' && (
                  <>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => updateStatus(record.id, 'Confirmed')}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Confirm
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => updateStatus(record.id, 'Failed')}>
                      <X className="h-3 w-3 mr-1" /> Failed
                    </Button>
                  </>
                )}
                {record.status === 'Confirmed' && (
                  <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => updateStatus(record.id, 'Kindled')}>
                    <Baby className="h-3 w-3 mr-1" /> Kindled
                  </Button>
                )}
                {record.status === 'Kindled' && (
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => updateStatus(record.id, 'Weaned')}>
                    <Home className="h-3 w-3 mr-1" /> Wean
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Litters History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Baby className="h-6 w-6 text-primary" />
          Recent Litters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {litters.map((litter) => (
            <Card key={litter.id} className="bg-muted/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{getRabbitName(litter.doeId)}'s Litter</span>
                  <Badge variant="outline">{litter.aliveKits} Kits</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Born: {format(new Date(litter.birthDate), 'MMM d, yyyy')}</p>
                <div className="mt-3 flex gap-2">
                  <div className="flex-1 text-center p-2 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-[10px] text-green-600 font-bold uppercase">Alive</p>
                    <p className="text-lg font-black text-green-700">{litter.aliveKits}</p>
                  </div>
                  <div className="flex-1 text-center p-2 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-[10px] text-red-600 font-bold uppercase">Dead</p>
                    <p className="text-lg font-black text-red-700">{litter.deadKits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Record Litter Modal */}
      <Dialog open={isLitterModalOpen} onOpenChange={setIsLitterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Litter Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordLitter} className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Total Kits</Label>
                <Input 
                  type="number" 
                  value={litterData.totalKits} 
                  onChange={(e) => setLitterData({...litterData, totalKits: parseInt(e.target.value)})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Alive</Label>
                <Input 
                  type="number" 
                  value={litterData.aliveKits} 
                  onChange={(e) => setLitterData({...litterData, aliveKits: parseInt(e.target.value)})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Dead</Label>
                <Input 
                  type="number" 
                  value={litterData.deadKits} 
                  onChange={(e) => setLitterData({...litterData, deadKits: parseInt(e.target.value)})} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={litterData.notes} 
                onChange={(e) => setLitterData({...litterData, notes: e.target.value})} 
                placeholder="Any notes about the birth?"
              />
            </div>
            <Button type="submit" className="w-full">Save Litter Record</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Breeding;
