
import React, { useState, useEffect } from 'react';
import { storage, Rabbit, Cage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  QrCode, 
  Trash2, 
  Edit2, 
  Filter,
  Download,
  X,
  Rabbit as RabbitIcon,
  Scale,
  MapPin,
  Calendar,
  History,
  ArrowUpRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Inventory = () => {
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [cages, setCages] = useState<Cage[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [editingRabbit, setEditingRabbit] = useState<Rabbit | null>(null);
  const [selectedRabbitForQr, setSelectedRabbitForQr] = useState<Rabbit | null>(null);
  const [selectedRabbitForWeight, setSelectedRabbitForWeight] = useState<Rabbit | null>(null);

  const [formData, setFormData] = useState<Partial<Rabbit>>({
    tagId: '',
    name: '',
    breed: 'New Zealand White',
    gender: 'Doe',
    birthDate: format(new Date(), 'yyyy-MM-dd'),
    weight: 0,
    status: 'Active',
    cageId: '',
    notes: ''
  });

  const [newWeight, setNewWeight] = useState<number>(0);

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('search');
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, []);

  const loadData = async () => {
    setRabbits(await storage.getRabbits());
    setCages(await storage.getCages());
  };

  const handleSaveRabbit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rabbitsList = await storage.getRabbits();
    
    if (editingRabbit) {
      const updatedList = rabbitsList.map(r => r.id === editingRabbit.id ? { ...editingRabbit, ...formData } as Rabbit : r);
      await storage.saveRabbits(updatedList);
      toast.success('Rabbit updated successfully');
    } else {
      const newRabbit: Rabbit = {
        id: crypto.randomUUID(),
        ...formData as Rabbit,
        weightHistory: [{ date: format(new Date(), 'yyyy-MM-dd'), weight: formData.weight || 0 }]
      };
      const updatedList = [newRabbit, ...rabbitsList];
      await storage.saveRabbits(updatedList);
      toast.success('Rabbit added successfully');
    }

    await loadData();
    setIsAddModalOpen(false);
    setEditingRabbit(null);
    setFormData({
      tagId: '',
      name: '',
      breed: 'New Zealand White',
      gender: 'Doe',
      birthDate: format(new Date(), 'yyyy-MM-dd'),
      weight: 0,
      status: 'Active',
      cageId: '',
      notes: ''
    });
  };

  const handleUpdateWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRabbitForWeight) return;

    const updatedList = rabbits.map(r => {
      if (r.id === selectedRabbitForWeight.id) {
        const history = r.weightHistory || [];
        return {
          ...r,
          weight: newWeight,
          weightHistory: [...history, { date: format(new Date(), 'yyyy-MM-dd'), weight: newWeight }]
        };
      }
      return r;
    });

    await storage.saveRabbits(updatedList);
    setRabbits(updatedList);
    setIsWeightModalOpen(false);
    setSelectedRabbitForWeight(null);
    toast.success('Weight updated successfully');
  };

  const deleteRabbit = async (id: string) => {
    if (confirm('Are you sure you want to delete this rabbit?')) {
      const updatedList = rabbits.filter(r => r.id !== id);
      await storage.saveRabbits(updatedList);
      setRabbits(updatedList);
      toast.error('Rabbit deleted');
    }
  };

  const filteredRabbits = rabbits.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.tagId.toLowerCase().includes(search.toLowerCase()) ||
    r.breed.toLowerCase().includes(search.toLowerCase())
  );

  const BREEDS = ['New Zealand White', 'Flemish Giant', 'Netherland Dwarf', 'Rex', 'California', 'Angora', 'Dutch', 'Lionhead'];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary">Rabbit Inventory</h1>
          <p className="text-muted-foreground">Manage your breeding stock and offspring.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, tag, or breed..." 
              className="pl-9 rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) {
              setEditingRabbit(null);
              setFormData({
                tagId: '',
                name: '',
                breed: 'New Zealand White',
                gender: 'Doe',
                birthDate: format(new Date(), 'yyyy-MM-dd'),
                weight: 0,
                status: 'Active',
                cageId: '',
                notes: ''
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-full gap-2">
                <Plus className="h-4 w-4" />
                Add Rabbit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingRabbit ? 'Edit Rabbit' : 'Add New Rabbit'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveRabbit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tag ID</Label>
                    <Input 
                      value={formData.tagId} 
                      onChange={(e) => setFormData({...formData, tagId: e.target.value})} 
                      placeholder="e.g. R-101"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. Snowball"
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Breed</Label>
                    <Select 
                      value={formData.breed} 
                      onValueChange={(v) => setFormData({...formData, breed: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Breed" />
                      </SelectTrigger>
                      <SelectContent>
                        {BREEDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(v: any) => setFormData({...formData, gender: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Doe">Doe (Female)</SelectItem>
                        <SelectItem value="Buck">Buck (Male)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Birth Date</Label>
                    <Input 
                      type="date" 
                      value={formData.birthDate} 
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={formData.weight} 
                      onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value)})} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cage</Label>
                    <Select 
                      value={formData.cageId} 
                      onValueChange={(v) => setFormData({...formData, cageId: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Cage" />
                      </SelectTrigger>
                      <SelectContent>
                        {cages.map(c => <SelectItem key={c.id} value={c.id}>{c.number} ({c.type})</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="Deceased">Deceased</SelectItem>
                        <SelectItem value="Quarantine">Quarantine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={formData.notes} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                    placeholder="Any special notes?"
                  />
                </div>
                <Button type="submit" className="w-full">{editingRabbit ? 'Update Rabbit' : 'Save Rabbit'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rabbit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRabbits.map((rabbit) => {
          const cage = cages.find(c => c.id === rabbit.cageId);
          return (
            <Card key={rabbit.id} className="group overflow-hidden border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
              <CardHeader className="pb-2 relative">
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    rabbit.gender === 'Doe' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                  )}>
                    <RabbitIcon className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      setEditingRabbit(rabbit);
                      setFormData(rabbit);
                      setIsAddModalOpen(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRabbit(rabbit.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-xl font-bold">{rabbit.name}</CardTitle>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{rabbit.tagId}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      setSelectedRabbitForWeight(rabbit);
                      setNewWeight(rabbit.weight);
                      setIsWeightModalOpen(true);
                    }}
                    className="p-3 rounded-xl bg-muted/50 border border-muted hover:bg-primary/5 hover:border-primary/30 transition-all text-left group/weight"
                  >
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 flex items-center gap-1 group-hover/weight:text-primary">
                      <Scale className="h-3 w-3" /> Weight
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">{rabbit.weight} kg</p>
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover/weight:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  <div className="p-3 rounded-xl bg-muted/50 border border-muted">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Cage
                    </p>
                    <p className="text-sm font-bold">{cage?.number || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline" className="rounded-full">
                    {rabbit.breed}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary" onClick={() => setSelectedRabbitForQr(rabbit)}>
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weight Update Modal */}
      <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Update Weight</DialogTitle>
          </DialogHeader>
          {selectedRabbitForWeight && (
            <form onSubmit={handleUpdateWeight} className="space-y-4 pt-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Updating weight for</p>
                <h3 className="text-xl font-black">{selectedRabbitForWeight.name}</h3>
              </div>
              <div className="space-y-2">
                <Label>New Weight (kg)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={newWeight} 
                  onChange={(e) => setNewWeight(parseFloat(e.target.value))} 
                  autoFocus
                  required 
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-bold">Update Weight</Button>
              
              {selectedRabbitForWeight.weightHistory && selectedRabbitForWeight.weightHistory.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                    <History className="h-3 w-3" /> Recent History
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedRabbitForWeight.weightHistory.slice().reverse().map((h, i) => (
                      <div key={i} className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg border">
                        <span className="text-muted-foreground">{h.date}</span>
                        <span className="font-bold">{h.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={!!selectedRabbitForQr} onOpenChange={(open) => !open && setSelectedRabbitForQr(null)}>
        <DialogContent className="sm:max-w-[350px] text-center">
          <DialogHeader>
            <DialogTitle>Rabbit QR Tag</DialogTitle>
          </DialogHeader>
          {selectedRabbitForQr && (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="p-6 bg-white rounded-3xl shadow-xl border-2 border-primary/10">
                <QRCodeSVG value={selectedRabbitForQr.tagId} size={200} />
              </div>
              <div>
                <h3 className="text-2xl font-black">{selectedRabbitForQr.name}</h3>
                <p className="text-muted-foreground font-bold">{selectedRabbitForQr.tagId}</p>
              </div>
              <Button className="w-full gap-2" onClick={() => window.print()}>
                <Download className="h-4 w-4" />
                Download Tag
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
