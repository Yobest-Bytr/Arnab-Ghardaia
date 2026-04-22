
import React, { useState, useEffect } from 'react';
import { storage, Rabbit, BreedingRecord, Litter } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Baby, 
  Activity, 
  Scale,
  Calendar,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Statistics = () => {
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [breeding, setBreeding] = useState<BreedingRecord[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);

  useEffect(() => {
    setRabbits(storage.getRabbits());
    setBreeding(storage.getBreedingRecords());
    setLitters(storage.getLitters());
  }, []);

  // Data processing for charts
  const breedData = rabbits.reduce((acc: any[], rabbit) => {
    const existing = acc.find(item => item.name === rabbit.breed);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: rabbit.breed, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  const litterStats = litters.slice(-6).map(l => ({
    date: l.birthDate,
    kits: l.aliveKits,
    total: l.totalKits
  }));

  const totalKits = litters.reduce((sum, l) => sum + l.aliveKits, 0);
  const avgLitterSize = litters.length > 0 ? (totalKits / litters.length).toFixed(1) : 0;
  const survivalRate = litters.reduce((sum, l) => sum + l.totalKits, 0) > 0 
    ? ((totalKits / litters.reduce((sum, l) => sum + l.totalKits, 0)) * 100).toFixed(1) 
    : 0;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-black text-primary">Farm Statistics</h1>
        <p className="text-muted-foreground">Deep dive into your farm's performance and growth.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <Activity className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{rabbits.length}</div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Stock</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-pink-100 rounded-xl text-pink-600">
                <Baby className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{totalKits}</div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Kits Born</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                <PieChartIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{avgLitterSize}</div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Avg. Litter Size</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-xl text-green-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold">{survivalRate}%</div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Survival Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Breed Distribution */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Breed Distribution</CardTitle>
            <CardDescription>Breakdown of your stock by breed</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {breedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {breedData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-bold">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Litter Performance */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Litter Performance</CardTitle>
            <CardDescription>Kits born vs kits alive in last 6 litters</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={litterStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Total Kits" />
                <Bar dataKey="kits" fill="#6366f1" radius={[4, 4, 0, 0]} name="Alive Kits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Farm Growth Trend</CardTitle>
          <CardDescription>Monthly stock increase over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { month: 'Jan', count: 10 },
              { month: 'Feb', count: 15 },
              { month: 'Mar', count: 12 },
              { month: 'Apr', count: 22 },
              { month: 'May', count: 30 },
              { month: 'Jun', count: 45 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 6, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
