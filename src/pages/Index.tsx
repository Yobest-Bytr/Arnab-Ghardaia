
import React, { useState, useEffect } from 'react';
import { storage, Rabbit, BreedingRecord, Task, Cage, Litter } from '@/lib/db';
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
  Edit2,
  Zap,
  ShieldCheck,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { FlowBoard } from '@/components/FlowBoard';
import { QRScanner } from '@/components/QrScanner';
import { format, addDays, isBefore, isAfter, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const Index = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
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
      if (fetchedRabbits.length === 0 && user) {
        const demoRabbits = [
          { tagId: 'D-001', name: 'Luna', breed: 'New Zealand White', gender: 'Doe', birthDate: '2023-05-10', weight: 4.2, weightHistory: [{date: '2023-05-10', weight: 4.2}], status: 'Active', cageId: 'c1' },
          { tagId: 'B-001', name: 'Max', breed: 'Flemish Giant', gender: 'Buck', birthDate: '2023-06-15', weight: 5.5, weightHistory: [{date: '2023-06-15', weight: 5.5}], status: 'Active', cageId: 'c2' },
          { tagId: 'D-002', name: 'Bella', breed: 'Rex', gender: 'Doe', birthDate: '2023-08-20', weight: 3.8, weightHistory: [{date: '2023-08-20', weight: 3.8}], status: 'Active', cageId: 'c3' },
        ];
        for (const r of demoRabbits) {
          await storage.insert('rabbits', user.id, r);
        }
        const newRabbits = await storage.getRabbits();
        setRabbits(newRabbits);
      } else {
        setRabbits(fetchedRabbits);
      }

      const fetchedBreeding = await storage.getBreedingRecords();
      if (fetchedBreeding.length === 0 && user) {
        const currentRabbits = await storage.getRabbits();
        const buck = currentRabbits.find(r => r.gender === 'Buck');
        const doe = currentRabbits.find(r => r.gender === 'Doe');
        
        if (buck && doe) {
          const demoBreeding = [
            { buckId: buck.id, doeId: doe.id, date: format(addDays(new Date(), -15), 'yyyy-MM-dd'), status: 'Mated' },
            { buckId: buck.id, doeId: doe.id, date: format(addDays(new Date(), -35), 'yyyy-MM-dd'), status: 'Kindled' },
          ];
          for (const b of demoBreeding) {
            await storage.insert('mating_history', user.id, b);
          }
          const newBreeding = await storage.getBreedingRecords();
          setBreedingRecords(newBreeding);
        }
      } else {
        setBreedingRecords(fetchedBreeding);
      }

      setTasks(await storage.getTasks());
      setCages(await storage.getCages());
      setLitters(await storage.getLitters());
    };

    if (user) fetchData();
  }, [user]);

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
    <div className="container mx-auto p-4 md:p-8 space-y-10 pb-24 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary flex items-center gap-4">
            <LayoutDashboard className="h-10 w-10" />
            {t('welcomeBack').split(' ')[0]}, {user?.user_metadata?.display_name || user?.name || 'Breeder'}!
          </h1>
          <p className="text-muted-foreground text-lg font-medium mt-1">{t('welcomeBack')}</p>
        </motion.div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={() => setShowScanner(true)} variant="outline" className="rounded-2xl h-14 px-6 gap-2 border-2 font-bold flex-1 md:flex-none">
            <QrCode className="h-5 w-5" />
            Scan
          </Button>
          <Button onClick={() => navigate('/inventory')} className="rounded-2xl h-14 px-8 gap-2 shadow-lg shadow-primary/20 font-bold flex-1 md:flex-none">
            <Plus className="h-5 w-5" />
            {t('addRabbit')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('totalRabbits'), val: totalRabbits, icon: Activity, color: 'bg-emerald-50 text-emerald-600', badge: 'Active' },
          { label: t('females'), val: activeDoes, icon: TrendingUp, color: 'bg-pink-50 text-pink-600', badge: 'Does' },
          { label: t('males'), val: activeBucks, icon: TrendingUp, color: 'bg-blue-50 text-blue-600', badge: 'Bucks' },
          { label: t('empty'), val: cages.filter(c => c.status === 'Empty').length, icon: Box, color: 'bg-orange-50 text-orange-600', badge: 'Cages' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-2 rounded-[2rem] shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="rounded-lg px-3 py-1 font-black uppercase tracking-widest text-[10px]">{stat.badge}</Badge>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tighter">{stat.val}</div>
                  <div className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Smart Insights "Think" Section */}
      <Card className="border-2 border-primary/20 bg-primary/[0.02] rounded-[2.5rem] overflow-hidden shadow-xl">
        <CardHeader className="pb-4 p-8 bg-white/50 dark:bg-slate-900/50 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">{t('neuralCommandActive')}</CardTitle>
              <CardDescription className="font-medium">AI-powered suggestions for your farm optimization.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground italic p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed text-center col-span-2">
                Everything looks good! No urgent actions needed.
              </p>
            ) : (
              insights.map((insight, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -2 }}
                  className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={cn(
                    "p-3 rounded-xl shrink-0",
                    insight.priority === 'Critical' ? "bg-red-50 text-red-500" : 
                    insight.type === 'action' ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
                  )}>
                    {insight.priority === 'Critical' ? <AlertTriangle className="h-5 w-5" /> : 
                     insight.type === 'action' ? <CheckCircle2 className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-black text-sm truncate">{insight.title}</h4>
                      <Badge variant={insight.priority === 'Critical' ? 'destructive' : 'outline'} className="text-[9px] font-black uppercase tracking-widest px-2">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{insight.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Breeding Flow Board */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            {t('breeding')} Flow
          </h2>
          <Button variant="ghost" onClick={() => navigate('/breeding')} className="font-black text-primary hover:bg-primary/10 rounded-xl">
            View All Records <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <FlowBoard records={breedingRecords} rabbits={rabbits} />
      </div>

      {/* Tasks & Litters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Upcoming Tasks
          </h2>
          <Card className="border-2 rounded-[2.5rem] shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y-2">
                {tasks.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No pending tasks. You're all caught up!</p>
                  </div>
                ) : (
                  tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-6 flex items-center gap-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                        task.priority === 'High' ? "bg-red-50 text-red-600" :
                        task.priority === 'Medium' ? "bg-orange-50 text-orange-600" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm truncate">{task.title}</h4>
                        <p className="text-xs text-muted-foreground font-bold flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> {task.dueDate}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[9px] px-2 py-1">{task.category}</Badge>
                    </div>
                  ))
                )}
              </div>
              {tasks.length > 5 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center border-t-2">
                  <Button variant="link" onClick={() => navigate('/tasks')} className="font-black text-xs uppercase tracking-widest">View All Tasks</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Baby className="h-8 w-8 text-primary" />
            {t('litters')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {litters.slice(0, 4).map((litter) => (
              <Card key={litter.id} className="bg-white dark:bg-slate-900 shadow-sm border-2 rounded-[2rem] hover:border-primary/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary/5 rounded-xl">
                      <Baby className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg font-black">{litter.aliveKits} Kits</Badge>
                  </div>
                  <div>
                    <span className="font-black text-lg block truncate">{rabbits.find(r => r.id === litter.doeId)?.name || 'Unknown'}'s Litter</span>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Born: {litter.birthDate}
                    </p>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 h-10 w-10 rounded-xl shadow-lg"
                    onClick={() => setEditingLitter(litter)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {litters.length === 0 && (
              <div className="col-span-2 p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed">
                <Baby className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-bold">No litters recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Litter Dialog */}
      <Dialog open={!!editingLitter} onOpenChange={(open) => !open && setEditingLitter(null)}>
        <DialogContent className="rounded-[2.5rem] p-8 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{t('editLitter')}</DialogTitle>
          </DialogHeader>
          {editingLitter && (
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalKits" className="text-right font-bold">Total Kits</Label>
                <Input 
                  id="totalKits" 
                  type="number" 
                  value={editingLitter.totalKits} 
                  onChange={(e) => setEditingLitter({...editingLitter, totalKits: parseInt(e.target.value)})}
                  className="col-span-3 h-12 rounded-xl border-2" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="aliveKits" className="text-right font-bold">Alive Kits</Label>
                <Input 
                  id="aliveKits" 
                  type="number" 
                  value={editingLitter.aliveKits} 
                  onChange={(e) => setEditingLitter({...editingLitter, aliveKits: parseInt(e.target.value)})}
                  className="col-span-3 h-12 rounded-xl border-2" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadKits" className="text-right font-bold">Dead Kits</Label>
                <Input 
                  id="deadKits" 
                  type="number" 
                  value={editingLitter.deadKits} 
                  onChange={(e) => setEditingLitter({...editingLitter, deadKits: parseInt(e.target.value)})}
                  className="col-span-3 h-12 rounded-xl border-2" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birthDate" className="text-right font-bold">Birth Date</Label>
                <Input 
                  id="birthDate" 
                  type="date" 
                  value={editingLitter.birthDate} 
                  onChange={(e) => setEditingLitter({...editingLitter, birthDate: e.target.value})}
                  className="col-span-3 h-12 rounded-xl border-2" 
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setEditingLitter(null)} className="h-12 rounded-xl font-bold px-6">Cancel</Button>
            <Button onClick={handleSaveLitter} className="h-12 rounded-xl font-black px-8 shadow-lg shadow-primary/20">Save Changes</Button>
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
