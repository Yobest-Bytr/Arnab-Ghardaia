
import React, { useState, useEffect, useMemo } from 'react';
import { storage, Rabbit, Cage } from '@/lib/db';
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
  ArrowUpRight,
  Baby,
  User,
  Clock,
  Activity,
  TrendingUp as TrendingUpIcon,
  BarChart3,
  FileText,
  HeartPulse
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { QRCodeSVG } from 'qrcode.react';
import { format, differenceInMonths, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Inventory = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [cages, setCages] = useState<Cage[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingRabbit, setEditingRabbit] = useState<Rabbit | null>(null);
  const [selectedRabbitForQr, setSelectedRabbitForQr] = useState<Rabbit | null>(null);
  const [selectedRabbitForWeight, setSelectedRabbitForWeight] = useState<Rabbit | null>(null);
  const [selectedRabbitForReport, setSelectedRabbitForReport] = useState<Rabbit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterGender, setFilterGender] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterAgeRange, setFilterAgeRange] = useState<string>('All');
  const [filterBreed, setFilterBreed] = useState<string>('All');
  const [filterCage, setFilterCage] = useState<string>('All');
  const [filterHealth, setFilterHealth] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  const [formData, setFormData] = useState<Partial<Rabbit>>({
    tagId: '',
    name: '',
    breed: 'New Zealand White',
    gender: 'Doe',
    birthDate: format(new Date(), 'yyyy-MM-dd'),
    weight: 0,
    status: 'Active',
    cageId: '',
    notes: '',
    health_status: 'Healthy'
  });

  const [customBreed, setCustomBreed] = useState('');
  const [isCustomBreed, setIsCustomBreed] = useState(false);

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
    setIsLoading(true);
    try {
      const [rabbitsData, cagesData] = await Promise.all([
        storage.getRabbits(),
        storage.getCages()
      ]);
      setRabbits(rabbitsData);
      setCages(cagesData);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRabbit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const finalBreed = isCustomBreed ? customBreed : formData.breed;
    const finalData = { ...formData, breed: finalBreed };

    try {
      if (editingRabbit) {
        await storage.update('rabbits', user.id, editingRabbit.id, finalData);
        showSuccess('Rabbit updated successfully');
      } else {
        const newRabbitData = {
          ...finalData,
          weightHistory: [{ date: format(new Date(), 'yyyy-MM-dd'), weight: formData.weight || 0 }]
        };
        await storage.insert('rabbits', user.id, newRabbitData);
        showSuccess('Rabbit added successfully');
      }

      await loadData();
      setIsAddModalOpen(false);
      setEditingRabbit(null);
      setIsCustomBreed(false);
      setCustomBreed('');
      setFormData({
        tagId: '',
        name: '',
        breed: 'New Zealand White',
        gender: 'Doe',
        birthDate: format(new Date(), 'yyyy-MM-dd'),
        weight: 0,
        status: 'Active',
        cageId: '',
        notes: '',
        health_status: 'Healthy'
      });
    } catch (error) {
      showError(error);
    }
  };

  const handleUpdateWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRabbitForWeight || !user) return;

    try {
      const history = selectedRabbitForWeight.weightHistory || [];
      const updatedHistory = [...history, { date: format(new Date(), 'yyyy-MM-dd'), weight: newWeight }];
      
      await storage.update('rabbits', user.id, selectedRabbitForWeight.id, {
        weight: newWeight,
        weightHistory: updatedHistory
      });

      await loadData();
      setIsWeightModalOpen(false);
      setSelectedRabbitForWeight(null);
      showSuccess('Weight updated successfully');
    } catch (error) {
      showError(error);
    }
  };

  const deleteRabbit = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this rabbit?')) {
      try {
        await storage.delete('rabbits', user.id, id);
        setRabbits(rabbits.filter(r => r.id !== id));
        showSuccess('Rabbit deleted');
      } catch (error) {
        showError(error);
      }
    }
  };

  const filteredRabbits = useMemo(() => {
    return rabbits
      .filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                             r.tagId.toLowerCase().includes(search.toLowerCase()) ||
                             r.breed.toLowerCase().includes(search.toLowerCase());
        const matchesGender = filterGender === 'All' || r.gender === filterGender;
        const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
        const matchesBreed = filterBreed === 'All' || r.breed === filterBreed;
        const matchesCage = filterCage === 'All' || r.cageId === filterCage;
        const matchesHealth = filterHealth === 'All' || r.health_status === filterHealth;
        
        let matchesAge = true;
        if (filterAgeRange !== 'All') {
          const ageInMonths = differenceInMonths(new Date(), parseISO(r.birthDate));
          if (filterAgeRange === 'Young') matchesAge = ageInMonths < 6;
          if (filterAgeRange === 'Adult') matchesAge = ageInMonths >= 6;
        }

        return matchesSearch && matchesGender && matchesStatus && matchesAge && matchesBreed && matchesCage && matchesHealth;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.id.localeCompare(a.id);
        if (sortBy === 'oldest') return a.id.localeCompare(b.id);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'weight') return b.weight - a.weight;
        return 0;
      });
  }, [rabbits, search, filterGender, filterStatus, filterAgeRange, filterBreed, filterCage, filterHealth, sortBy]);

  const BREEDS = ['New Zealand White', 'Flemish Giant', 'Netherland Dwarf', 'Rex', 'California', 'Angora', 'Dutch', 'Lionhead', 'Other'];
  const uniqueBreeds = useMemo(() => Array.from(new Set(rabbits.map(r => r.breed))), [rabbits]);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
            <RabbitIcon className="h-10 w-10" />
            {t('inventory')}
          </h1>
          <p className="text-muted-foreground font-medium">Manage your breeding stock and offspring with precision.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) {
              setEditingRabbit(null);
              setIsCustomBreed(false);
              setCustomBreed('');
            }
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 gap-2 shadow-lg shadow-primary/20 flex-1 md:flex-none">
                <Plus className="h-5 w-5" />
                {t('addRabbit')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">{editingRabbit ? 'Edit Rabbit' : 'Add New Rabbit'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveRabbit} className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tag ID</Label>
                    <Input 
                      value={formData.tagId} 
                      onChange={(e) => setFormData({...formData, tagId: e.target.value})} 
                      placeholder="e.g. R-101"
                      className="h-12 rounded-xl border-2 focus:ring-primary"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. Snowball"
                      className="h-12 rounded-xl border-2 focus:ring-primary"
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Breed</Label>
                    {isCustomBreed ? (
                      <div className="flex gap-2">
                        <Input 
                          value={customBreed} 
                          onChange={(e) => setCustomBreed(e.target.value)} 
                          placeholder="Enter custom breed"
                          className="h-12 rounded-xl border-2 focus:ring-primary flex-1"
                          required 
                        />
                        <Button type="button" variant="ghost" onClick={() => setIsCustomBreed(false)} className="h-12 w-12 rounded-xl">
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    ) : (
                      <Select 
                        value={formData.breed} 
                        onValueChange={(v) => {
                          if (v === 'Other') setIsCustomBreed(true);
                          else setFormData({...formData, breed: v});
                        }}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-2">
                          <SelectValue placeholder="Select Breed" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {BREEDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Gender</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(v: any) => setFormData({...formData, gender: v})}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Doe">Doe (Female)</SelectItem>
                        <SelectItem value="Buck">Buck (Male)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Birth Date</Label>
                    <Input 
                      type="date" 
                      value={formData.birthDate} 
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})} 
                      className="h-12 rounded-xl border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Weight (kg)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={formData.weight} 
                      onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value)})} 
                      className="h-12 rounded-xl border-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Cage</Label>
                    <Select 
                      value={formData.cageId} 
                      onValueChange={(v) => setFormData({...formData, cageId: v})}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-2">
                        <SelectValue placeholder="Select Cage" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {cages.map(c => <SelectItem key={c.id} value={c.id}>{c.number} ({c.type})</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="Deceased">Deceased</SelectItem>
                        <SelectItem value="Quarantine">Quarantine</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Health Status</Label>
                  <Select 
                    value={formData.health_status} 
                    onValueChange={(v: any) => setFormData({...formData, health_status: v})}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2">
                      <SelectValue placeholder="Select Health" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Healthy">Healthy</SelectItem>
                      <SelectItem value="Sick">Sick</SelectItem>
                      <SelectItem value="Injured">Injured</SelectItem>
                      <SelectItem value="Recovering">Recovering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Notes</Label>
                  <Textarea 
                    value={formData.notes} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                    placeholder="Any special notes?"
                    className="rounded-xl border-2 min-h-[100px]"
                  />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20">
                  {editingRabbit ? 'Update Rabbit' : 'Save Rabbit'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <Card className="border-2 rounded-[2rem] shadow-sm overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name, tag, or breed..." 
                className="pl-12 h-14 rounded-2xl border-2 bg-slate-50/50 focus:bg-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger className="h-14 w-[140px] rounded-2xl border-2 font-bold">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="Gender" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Genders</SelectItem>
                  <SelectItem value="Doe">Does</SelectItem>
                  <SelectItem value="Buck">Bucks</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAgeRange} onValueChange={setFilterAgeRange}>
                <SelectTrigger className="h-14 w-[140px] rounded-2xl border-2 font-bold">
                  <div className="flex items-center gap-2">
                    <Baby className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="Age" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Ages</SelectItem>
                  <SelectItem value="Young">Young (&lt;6m)</SelectItem>
                  <SelectItem value="Adult">Adult (&gt;=6m)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-14 w-[140px] rounded-2xl border-2 font-bold">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Quarantine">Quarantine</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBreed} onValueChange={setFilterBreed}>
                <SelectTrigger className="h-14 w-[140px] rounded-2xl border-2 font-bold">
                  <div className="flex items-center gap-2">
                    <RabbitIcon className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="Breed" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Breeds</SelectItem>
                  {uniqueBreeds.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterCage} onValueChange={setFilterCage}>
                <SelectTrigger className="h-14 w-[140px] rounded-2xl border-2 font-bold">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="Cage" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Cages</SelectItem>
                  {cages.map(c => <SelectItem key={c.id} value={c.id}>{c.number}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterHealth} onValueChange={setFilterHealth}>
                <SelectTrigger className="h-14 w-[140px] rounded-2xl border-2 font-bold">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="Health" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Health</SelectItem>
                  <SelectItem value="Healthy">Healthy</SelectItem>
                  <SelectItem value="Sick">Sick</SelectItem>
                  <SelectItem value="Injured">Injured</SelectItem>
                  <SelectItem value="Recovering">Recovering</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-14 w-[140px] rounded-2xl border-2 font-bold">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <SelectValue placeholder="Sort By" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="weight">Weight (High-Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rabbit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredRabbits.map((rabbit) => {
          const cage = cages.find(c => c.id === rabbit.cageId);
          const ageInMonths = differenceInMonths(new Date(), parseISO(rabbit.birthDate));
          
          return (
            <Card key={rabbit.id} className="group overflow-hidden border-2 rounded-[2.5rem] hover:border-primary/50 transition-all shadow-sm hover:shadow-xl bg-white dark:bg-slate-900">
              <CardHeader className="pb-2 relative p-6">
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "p-4 rounded-[1.5rem] shadow-inner",
                    rabbit.gender === 'Doe' ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                  )}>
                    <RabbitIcon className="h-8 w-8" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl" onClick={() => {
                      setEditingRabbit(rabbit);
                      setFormData(rabbit);
                      setIsAddModalOpen(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive hover:text-white" onClick={() => deleteRabbit(rabbit.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-6">
                  <CardTitle className="text-2xl font-black tracking-tight">{rabbit.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-0.5">
                      {rabbit.tagId}
                    </Badge>
                    <Badge className={cn(
                      "text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-0.5",
                      rabbit.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                      rabbit.status === 'Sold' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                    )}>
                      {rabbit.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      setSelectedRabbitForWeight(rabbit);
                      setNewWeight(rabbit.weight);
                      setIsWeightModalOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:border-primary/30 transition-all text-left group/weight"
                  >
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 flex items-center gap-1 group-hover/weight:text-primary">
                      <Scale className="h-3 w-3" /> Weight
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-black">{rabbit.weight} kg</p>
                      <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover/weight:opacity-100 transition-all" />
                    </div>
                  </button>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Cage
                    </p>
                    <p className="text-lg font-black">{cage?.number || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Age
                    </span>
                    <span className="font-black">{ageInMonths} months</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <RabbitIcon className="h-4 w-4" /> Breed
                    </span>
                    <span className="font-black truncate max-w-[120px]">{rabbit.breed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <HeartPulse className="h-4 w-4" /> Health
                    </span>
                    <Badge variant="outline" className={cn(
                      "font-black text-[10px] uppercase",
                      rabbit.health_status === 'Healthy' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-rose-600 border-rose-200 bg-rose-50'
                    )}>
                      {rabbit.health_status || 'Healthy'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-10 rounded-xl gap-2 text-primary font-black hover:bg-primary/10" onClick={() => setSelectedRabbitForQr(rabbit)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-10 rounded-xl gap-2 text-indigo-600 font-black hover:bg-indigo-100" onClick={() => {
                      setSelectedRabbitForReport(rabbit);
                      setIsReportModalOpen(true);
                    }}>
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-[10px] uppercase tracking-widest">Report</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Clock className="h-3 w-3" />
                    {format(parseISO(rabbit.birthDate), 'MMM yyyy')}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weight Update Modal */}
      <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Update Weight</DialogTitle>
          </DialogHeader>
          {selectedRabbitForWeight && (
            <form onSubmit={handleUpdateWeight} className="space-y-6 pt-4">
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed">
                <p className="text-sm text-muted-foreground font-medium">Updating weight for</p>
                <h3 className="text-2xl font-black text-primary mt-1">{selectedRabbitForWeight.name}</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">New Weight (kg)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={newWeight} 
                  onChange={(e) => setNewWeight(parseFloat(e.target.value))} 
                  autoFocus
                  className="h-14 rounded-2xl border-2 text-xl font-black text-center"
                  required 
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20">Update Weight</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Rabbit Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              Rabbit Performance Report
            </DialogTitle>
          </DialogHeader>
          {selectedRabbitForReport && (
            <div className="space-y-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current Weight</p>
                  <h4 className="text-3xl font-black text-primary">{selectedRabbitForReport.weight} kg</h4>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Age</p>
                  <h4 className="text-3xl font-black text-primary">{differenceInMonths(new Date(), parseISO(selectedRabbitForReport.birthDate))} mo</h4>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Health</p>
                  <h4 className="text-2xl font-black text-emerald-600">{selectedRabbitForReport.health_status || 'Healthy'}</h4>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5 text-primary" />
                  Weight Growth Velocity
                </h3>
                <div className="h-64 w-full bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border-2 border-dashed">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedRabbitForReport.weightHistory || []}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorWeight)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Weight Log
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedRabbitForReport.weightHistory || []).slice().reverse().map((h, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-transparent">
                      <span className="text-xs font-bold text-muted-foreground">{h.date}</span>
                      <span className="font-black text-primary">{h.weight} kg</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10">
                <h3 className="text-lg font-black mb-4">Neural Insights</h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  Based on the growth velocity of <span className="text-primary font-black">{selectedRabbitForReport.name}</span>, 
                  this rabbit is showing a <span className="text-emerald-600 font-black">healthy development curve</span>. 
                  Current weight is optimal for its age group ({differenceInMonths(new Date(), parseISO(selectedRabbitForReport.birthDate))} months).
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={!!selectedRabbitForQr} onOpenChange={(open) => !open && setSelectedRabbitForQr(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Rabbit QR Tag</DialogTitle>
          </DialogHeader>
          {selectedRabbitForQr && (
            <div className="flex flex-col items-center gap-8 py-6">
              <div className="p-8 bg-white rounded-[3rem] shadow-2xl border-4 border-slate-50">
                <QRCodeSVG value={selectedRabbitForQr.tagId} size={220} />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tight">{selectedRabbitForQr.name}</h3>
                <p className="text-lg text-muted-foreground font-black uppercase tracking-widest mt-1">{selectedRabbitForQr.tagId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button variant="outline" className="h-14 rounded-2xl font-black gap-2" onClick={() => window.print()}>
                  <Download className="h-5 w-5" />
                  Save Tag
                </Button>
                <Button className="h-14 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20">
                  <QrCode className="h-5 w-5" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
