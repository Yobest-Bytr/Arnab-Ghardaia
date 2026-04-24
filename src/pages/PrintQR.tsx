
import React, { useState, useEffect } from 'react';
import { storage, Rabbit } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, CheckSquare, Square, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PrintQR = () => {
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRabbits = async () => {
      const data = await storage.getRabbits();
      setRabbits(data);
    };
    fetchRabbits();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredRabbits.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRabbits.map(r => r.id));
    }
  };

  const filteredRabbits = rabbits.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.tagId.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-primary">Print QR Tags</h1>
          <p className="text-muted-foreground">Generate and print identification tags for your stock.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={selectAll} className="rounded-full gap-2">
            {selectedIds.length === filteredRabbits.length ? <Square className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
            {selectedIds.length === filteredRabbits.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Button onClick={handlePrint} className="rounded-full gap-2" disabled={selectedIds.length === 0}>
            <Printer className="h-4 w-4" />
            Print Selected ({selectedIds.length})
          </Button>
        </div>
      </div>

      <div className="relative no-print">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search rabbits..." 
          className="pl-10 rounded-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 no-print">
        {filteredRabbits.map((rabbit) => (
          <Card 
            key={rabbit.id} 
            className={cn(
              "cursor-pointer transition-all border-2",
              selectedIds.includes(rabbit.id) ? "border-primary bg-primary/5" : "hover:border-primary/30"
            )}
            onClick={() => toggleSelect(rabbit.id)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm border">
                <QRCodeSVG value={rabbit.tagId} size={60} />
              </div>
              <div>
                <p className="text-xs font-black truncate w-full">{rabbit.name}</p>
                <p className="text-[10px] text-muted-foreground font-bold">{rabbit.tagId}</p>
              </div>
              <Checkbox checked={selectedIds.includes(rabbit.id)} onCheckedChange={() => toggleSelect(rabbit.id)} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Print Layout (Hidden on screen) */}
      <div className="hidden print:block">
        <div className="grid grid-cols-3 gap-8">
          {rabbits.filter(r => selectedIds.includes(r.id)).map((rabbit) => (
            <div key={rabbit.id} className="border-2 border-black p-6 flex flex-col items-center text-center gap-4 rounded-3xl">
              <QRCodeSVG value={rabbit.tagId} size={150} />
              <div>
                <h2 className="text-2xl font-black">{rabbit.name}</h2>
                <p className="text-lg font-bold text-slate-600">{rabbit.tagId}</p>
                <p className="text-sm mt-2">{rabbit.breed} • {rabbit.gender}</p>
              </div>
              <div className="mt-4 pt-4 border-t w-full text-[10px] font-bold uppercase tracking-widest">
                Hop Farm Flow Identification
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrintQR;
