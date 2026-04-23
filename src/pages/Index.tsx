
import React, { useState, useEffect } from 'react';
import { storage, Rabbit, BreedingRecord, Task, Cage, Litter } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  QrCode, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  BrainCircuit,
  ArrowRight,
  Baby,
  Activity,
  Box,
  Edit2
} from 'lucide-react';
import { FlowBoard } from '@/components/FlowBoard';
import { QRScanner } from '@/components/QrScanner';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Index = () => {
  const { user } = useAuth();
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cages, setCages] = useState<Cage[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [editingLitter, setEditingLitter] = useState<Litter | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const fetchedRabbits = await storage.getRabbits();
      if (fetchedRabbits.length === 0) {
        const demoRabbits: Rabbit[] = [
          { id: '1', tagId: 'D-001', name: 'Luna', breed: 'New Zealand White', gender: 'Doe', birthDate: '2023-05-10', weight: 4.2, weightHistory: [{date: '2023-05-10', weight: 4.2}], status: 'Active', cageId: 'c1' },
          { id: '2', tagId: 'B-001', name: 'Max', breed: 'Flemish Giant', gender: 'Buck', birthDate: '2023-06-15', weight: 5.5, weightHistory: [{date: '2023-06-15', weight: 5.5}], status: 'Active', cageId: 'c2' },
          { id: '3', tagId: 'D-002', name: 'Bella', breed: 'Rex', gender: 'Doe', birthDate: '2023-08-20', weight: 3.8, weightHistory: [{date: '2023-08-20', weight: 3.8}], status: 'Active', cageId: 'c3' },
        ];
        await storage.saveRabbits(demoRabbits);
        setRabbits(demoRabbits);
      } else {
        setRabbits(fetchedRabbits);
      }

      const fetchedBreeding = await storage.getBreedingRecords();
      if (fetchedBreeding.length === 0) {
        const demoBreeding: BreedingRecord[] = [
          { id: 'b1', buckId: '2', doeId: '1', date: format(addDays(new Date(), -15), 'yyyy-MM-dd'), status: 'Mated' },
          { id: 'b2', buckId: '2', doeId: '3', date: format(addDays(new Date(), -35), 'yyyy-MM-dd'), status: 'Kindled' },
        ];
        await storage.saveBreedingRecords(demoBreeding);
        setBreedingRecords(demoBreeding);
      } else {
        setBreedingRecords(fetchedBreeding);
      }

      setTasks(await storage.getTasks());
      setCages(await storage.getCages());
      setLitters(await storage.getLitters());
    };

    fetchData();
  }, []);

  const activeDoes = rabbits.filter(r => r.gender === 'Doe' && r.status === 'Active').length;
  const activeBucks = rabbits.filter(r => r.gender === 'Buck' && r.status === 'Active').length;
  const totalRabbits = rabbits.length;

  const handleScan = (data: string) => {
    setShowScanner(false);
    const rabbit = rabbits.find(r => r.id === data || r.tagId === data);
    if (rabbit) {
      navigate(`/inventory?search=${rabbit.tagId}`);
    } else {
      toast.error(`Scanned: ${data}. No matching rabbit found.`);
    }
  };

  const getInsights = () => {
    const insights = [];
    const today = new Date();

    breedingRecords.filter(r => r.status === 'Mated').forEach(record => {
      const palpationDate = addDays(new Date(record.date), 14);
      if (isBefore(palpationDate, addDays(today, 2))) {
        insights.push({
          type: 'action',
          title: 'Palpation Due',
          description: `Doe ${rabbits.find(r => r.id === record.doeId)?.name} is ready for palpation.`,
          priority: 'High'
        });
      }
    });

    breedingRecords.filter(r => r.status === 'Confirmed').forEach(record => {
      const kindlingDate = addDays(new Date(record.date), 31);
      if (isBefore(kindlingDate, addDays(today, 3))) {
        insights.push({
          type: 'alert',
          title: 'Kindling Imminent',
          description: `Doe ${rabbits.find(r => r.id === record.doeId)?.name} is expected to kindle soon. Prepare nest box.`,
          priority: 'Critical'
        });
      }
    });

    litters.forEach(litter => {
      const weaningDate = addDays(new Date(litter.birthDate), 30);
      if (isBefore(weaningDate, addDays(today, 2)) && !litter.weaningDate) {
        insights.push({
          type: 'action',
          title: 'Weaning Due',
          description: `Litter from ${rabbits.find(r => r.id === litter.doeId)?.name} is ready for weaning.`,
          priority: 'Medium'
        });
      }
    });

    if (rabbits.length > 0) {
      insights.push({
        type: 'info',
        title: 'Weekly Health Check',
        description: 'Time to check weights and ear health for all active rabbits.',
        priority: 'Medium'
      });
    }

    return insights;
  };

  const insights = getInsights();

  const handleSaveLitter = async () => {
    if (!editingLitter) return;
    try {
      const updatedLitters = litters.map(l => l.id === editingLitter.id ? editingLitter : l);
      await storage.saveLitters(updatedLitters);
      setLitters(updatedLitters);
      setEditingLitter(null);
      toast.success("Litter updated successfully");
    } catch (error) {
      toast.error("Failed to update litter");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Welcome, {user?.user_metadata?.display_name || user?.name || 'Breeder'}!</h1>
          <p className="text-muted-foreground">Here's what's happening on your farm today.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowScanner(true)} variant="outline" className="rounded-full gap-2">
            <QrCode className="h-4 w-4" />
            Scan
          </Button>
          <Button onClick={() => navigate('/inventory')} className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            Add Rabbit
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-2 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-xl text-green-600">
                <Activity className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="bg-green-200 text-green-800">Active</Badge>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{totalRabbits}</div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Stock</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-pink-100 rounded-xl text-pink-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{activeDoes}</div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Active Does</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{activeBucks}</div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Active Bucks</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                <Box className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{cages.filter(c => c.status === 'Empty').length}</div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Empty Cages</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights "Think" Section */}
      <Card className="border-2 border-primary/20 bg-primary/5 overflow-hidden shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Smart Insights</CardTitle>
          </div>
          <CardDescription>AI-powered suggestions for your farm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Everything looks good! No urgent actions needed.</p>
            ) : (
              insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  {insight.priority === 'Critical' ? (
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : insight.type === 'action' ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                  ) : (
                    <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm">{insight.title}</h4>
                      <Badge variant={insight.priority === 'Critical' ? 'destructive' : 'outline'} className="text-[10px]">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Breeding Flow Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Breeding Flow
          </h2>
          <Button variant="link" onClick={() => navigate('/breeding')}>View All Records</Button>
        </div>
        <FlowBoard records={breedingRecords} rabbits={rabbits} />
      </div>

      {/* Tasks & Litters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Upcoming Tasks
          </h2>
          <Card className="border-2">
            <CardContent className="p-0">
              <div className="divide-y">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No pending tasks. You're all caught up!</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        task.priority === 'High' ? "bg-red-100 text-red-600" :
                        task.priority === 'Medium' ? "bg-orange-100 text-orange-600" :
                        "bg-blue-100 text-blue-600"
                      )}>
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{task.title}</h4>
                        <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                      </div>
                      <Badge variant="outline">{task.category}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="h-6 w-6 text-primary" />
            Recent Litters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {litters.slice(0, 4).map((litter) => (
              <Card key={litter.id} className="bg-white shadow-sm border-2 hover:border-primary/30 transition-colors group relative">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm">{rabbits.find(r => r.id === litter.doeId)?.name || 'Unknown'}'s Litter</span>
                    <Badge className="bg-green-100 text-green-700 border-green-200">{litter.aliveKits} Kits</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Born: {litter.birthDate}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => setEditingLitter(litter)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Litter Dialog */}
      <Dialog open={!!editingLitter} onOpenChange={(open) => !open && setEditingLitter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Litter Details</DialogTitle>
          </DialogHeader>
          {editingLitter && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalKits" className="text-right">Total Kits</Label>
                <Input 
                  id="totalKits" 
                  type="number" 
                  value={editingLitter.totalKits} 
                  onChange={(e) => setEditingLitter({...editingLitter, totalKits: parseInt(e.target.value)})}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="aliveKits" className="text-right">Alive Kits</Label>
                <Input 
                  id="aliveKits" 
                  type="number" 
                  value={editingLitter.aliveKits} 
                  onChange={(e) => setEditingLitter({...editingLitter, aliveKits: parseInt(e.target.value)})}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadKits" className="text-right">Dead Kits</Label>
                <Input 
                  id="deadKits" 
                  type="number" 
                  value={editingLitter.deadKits} 
                  onChange={(e) => setEditingLitter({...editingLitter, deadKits: parseInt(e.target.value)})}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birthDate" className="text-right">Birth Date</Label>
                <Input 
                  id="birthDate" 
                  type="date" 
                  value={editingLitter.birthDate} 
                  onChange={(e) => setEditingLitter({...editingLitter, birthDate: e.target.value})}
                  className="col-span-3" 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLitter(null)}>Cancel</Button>
            <Button onClick={handleSaveLitter}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
};

export default Index;
