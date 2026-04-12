import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sword, 
  Shield, 
  Zap, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight,
  ChevronLeft,
  Info,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Unit {
  id: string;
  name: string;
  type: string;
  points: number;
  stats: {
    move: string;
    ws: string;
    bs: string;
    s: number;
    t: number;
    w: number;
    a: number;
    ld: number;
    sv: string;
  };
}

export default function ArmyBuilderPage() {
  const navigate = useNavigate();
  const [armyName, setArmyName] = useState('My First Legion');
  const [selectedUnits, setSelectedUnits] = useState<Unit[]>([]);
  
  const availableUnits: Unit[] = [
    { 
      id: '1', name: 'Tactical Squad', type: 'Infantry', points: 100,
      stats: { move: '6"', ws: '3+', bs: '3+', s: 4, t: 4, w: 2, a: 2, ld: 7, sv: '3+' }
    },
    { 
      id: '2', name: 'Dreadnought', type: 'Vehicle', points: 180,
      stats: { move: '8"', ws: '3+', bs: '3+', s: 6, t: 7, w: 8, a: 4, ld: 8, sv: '3+' }
    },
    { 
      id: '3', name: 'Scout Squad', type: 'Infantry', points: 70,
      stats: { move: '7"', ws: '3+', bs: '3+', s: 4, t: 4, w: 2, a: 2, ld: 7, sv: '4+' }
    },
  ];

  const totalPoints = selectedUnits.reduce((sum, unit) => sum + unit.points, 0);

  const addUnit = (unit: Unit) => {
    setSelectedUnits([...selectedUnits, { ...unit, id: Math.random().toString() }]);
  };

  const removeUnit = (id: string) => {
    setSelectedUnits(selectedUnits.filter(u => u.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Sword className="h-6 w-6" />
            </div>
            <div>
              <Input 
                value={armyName} 
                onChange={(e) => setArmyName(e.target.value)}
                className="bg-transparent border-none text-xl font-bold p-0 h-auto focus-visible:ring-0 w-full"
              />
              <p className="text-sm text-slate-400">Points Limit: 2000</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Points</p>
              <p className="text-2xl font-mono font-bold text-primary">{totalPoints} / 2000</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Save List
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Unit Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input placeholder="Search units..." className="pl-10 bg-slate-900 border-slate-800" />
              </div>
              <Button variant="outline" size="icon" className="border-slate-800">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-slate-900 border border-slate-800 w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">All Units</TabsTrigger>
                <TabsTrigger value="infantry">Infantry</TabsTrigger>
                <TabsTrigger value="vehicle">Vehicles</TabsTrigger>
                <TabsTrigger value="hq">HQ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableUnits.map((unit) => (
                    <Card key={unit.id} className="bg-slate-900 border-slate-800 hover:border-primary/50 transition-colors group">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-white">{unit.name}</CardTitle>
                            <CardDescription>{unit.type}</CardDescription>
                          </div>
                          <div className="bg-slate-800 px-2 py-1 rounded text-sm font-mono font-bold text-primary">
                            {unit.points} pts
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-9 gap-1 text-center mb-4">
                          {Object.entries(unit.stats).map(([key, val]) => (
                            <div key={key} className="bg-slate-950 rounded p-1">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">{key}</p>
                              <p className="text-xs font-bold text-slate-200">{val}</p>
                            </div>
                          ))}
                        </div>
                        <Button 
                          className="w-full bg-slate-800 hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                          onClick={() => addUnit(unit)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Army
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Army List */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Army List
                  <span className="text-sm font-mono text-primary">{selectedUnits.length} Units</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedUnits.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
                    <Shield className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">No units selected yet.</p>
                    <p className="text-xs text-slate-600 mt-1">Start adding units from the library.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedUnits.map((unit) => (
                      <div key={unit.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{unit.name}</p>
                            <p className="text-xs text-slate-500">{unit.points} pts</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-600 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => removeUnit(unit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Army Composition</span>
                    <span className="text-green-500 font-medium">Valid</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Total Points</p>
                      <p className="text-3xl font-mono font-bold text-white">{totalPoints}</p>
                    </div>
                    <Button variant="outline" className="border-slate-800 text-slate-400">
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Your army list is automatically validated against the latest core rules and errata. 
                <span className="text-primary hover:underline cursor-pointer ml-1">View rules.</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
