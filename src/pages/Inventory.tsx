
import React, { useState, useEffect } from 'react';
import { storage, Rabbit } from '@/lib/storage';
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
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

const Inventory = () => {
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRabbit, setEditingRabbit] = useState<Rabbit | null>(null);
  const [selectedRabbitForQr, setSelectedRabbitForQr] = useState<Rabbit | null>(null);

  const [formData, setFormData] = useState<Partial<Rabbit>>({
    tagId: '',
    name: '',
    breed: 'New Zealand White',
    gender: 'Doe',
    birthDate: format(new Date(), 'yyyy-MM-dd'),
    weight: 0,
    status: 'Active',
    cageNumber: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
    // Check for search param from QR scan
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('search');
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, []);

  const loadData = () => {
    setRabbits(storage.getRabbits());
  };

  const handleSaveRabbit = (e: React.FormEvent) => {
    e.preventDefault();
    const rabbitsList = storage.getRabbits();
    
    if (editingRabbit) {
      const updatedList = rabbitsList.map(r => r.id === editingRabbit.id ? { ...editingRabbit, ...formData } as Rabbit : r);
      storage.saveRabbits(updatedList);
      toast.success('Rabbit updated successfully');
    } else {
      const newRabbit: Rabbit = {
        id: crypto.randomUUID(),
        ...formData as Rabbit,
      };
      const updatedList = [newRabbit, ...rabbitsList];
      storage.saveRabbits(updatedList);
      toast.success('Rabbit added successfully');
    }

    loadData();
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
      cageNumber: '',
      notes: ''
    });
  };

  const deleteRabbit = (id: string) => {
    if (confirm('Are you sure you want to delete this rabbit?')) {
      const updatedList = rabbits.filter(r => r.id !== id);
      storage.saveRabbits(updatedList);
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
                cageNumber: '',
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
                    <Label>Cage Number</Label>
                    <Input 
                      value={formData.cageNumber} 
                      onChange={(e) => setFormData({...formData, cageNumber: e.target.value})} 
                      placeholder="e.g. C-12"
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
        {filteredRabbits.map((rabbit) => (
          <Card key={rabbit.id} className="group overflow-hidden border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-2 relative">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${rabbit.gender === 'Doe' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
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
                <div className="p-3 rounded-xl bg-muted/50 border border-muted">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 flex items-center gap-1">
                    <Scale className="h-3 w-3" /> Weight
                  </p>
                  <p className="text-sm font-bold">{rabbit.weight} kg</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border border-muted">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Cage
                  </p>
                  <p className="text-sm font-bold">{rabbit.cageNumber || 'N/A'}</p>
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
        ))}
      </div>

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
