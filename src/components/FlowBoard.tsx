
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BreedingRecord, Rabbit } from '@/lib/db';
import { format, differenceInDays, addDays } from 'date-fns';
import { Calendar, Heart, Baby, Home, CheckCircle2, AlertCircle } from 'lucide-react';

interface FlowBoardProps {
  records: BreedingRecord[];
  rabbits: Rabbit[];
}

export const FlowBoard: React.FC<FlowBoardProps> = ({ records, rabbits }) => {
  const getRabbitName = (id: string) => rabbits.find(r => r.id === id)?.name || 'Unknown';

  const stages = [
    { id: 'Mated', label: 'Mated', icon: Heart, color: 'bg-pink-100 text-pink-700 border-pink-200' },
    { id: 'Confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'Kindled', label: 'Kindled', icon: Baby, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'Weaned', label: 'Weaned', icon: Home, color: 'bg-green-100 text-green-700 border-green-200' },
  ];

  const getStageRecords = (status: string) => {
    return records.filter(r => r.status === status).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageRecords = getStageRecords(stage.id);
        const Icon = stage.icon;

        return (
          <div key={stage.id} className="flex flex-col gap-3 min-w-[280px]">
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${stage.color} font-semibold`}>
              <Icon className="h-5 w-5" />
              <span>{stage.label}</span>
              <Badge variant="secondary" className="ml-auto bg-white/50">
                {stageRecords.length}
              </Badge>
            </div>

            <div className="flex flex-col gap-3">
              {stageRecords.length === 0 ? (
                <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                  <p className="text-xs">No records</p>
                </div>
              ) : (
                stageRecords.map((record) => {
                  const daysSince = differenceInDays(new Date(), new Date(record.date));
                  const doeName = getRabbitName(record.doeId);
                  const buckName = getRabbitName(record.buckId);

                  return (
                    <Card key={record.id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-sm">{doeName} × {buckName}</div>
                          <Badge variant="outline" className="text-[10px]">
                            {format(new Date(record.date), 'MMM d')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{daysSince} days in stage</span>
                          </div>

                          {record.status === 'Mated' && (
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>Palpation due: {format(addDays(new Date(record.date), 14), 'MMM d')}</span>
                            </div>
                          )}

                          {record.status === 'Confirmed' && (
                            <div className="flex items-center gap-2 text-xs font-medium text-orange-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>Kindling due: {format(addDays(new Date(record.date), 31), 'MMM d')}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
