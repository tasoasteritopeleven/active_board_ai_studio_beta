import { useState, useEffect } from 'react';
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
  Filter,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  { 
    id: '4', name: 'Captain', type: 'HQ', points: 120,
    stats: { move: '6"', ws: '2+', bs: '2+', s: 4, t: 4, w: 5, a: 4, ld: 9, sv: '3+' }
  },
  { 
    id: '5', name: 'Predator Tank', type: 'Vehicle', points: 150,
    stats: { move: '10"', ws: '6+', bs: '3+', s: 6, t: 8, w: 11, a: 3, ld: 8, sv: '3+' }
  },
];

export default function ArmyBuilderPage() {
  const navigate = useNavigate();
  const [armyName, setArmyName] = useState('My First Legion');
  const [armyDescription, setArmyDescription] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [activeTab, setActiveTab] = useState('all');

  const MAX_POINTS = 2000;

  // Load from local storage on mount
  useEffect(() => {
    const savedArmy = localStorage.getItem('savedArmy');
    if (savedArmy) {
      try {
        const parsed = JSON.parse(savedArmy);
        setArmyName(parsed.name || 'My First Legion');
        setArmyDescription(parsed.description || '');
        setSelectedUnits(parsed.units || []);
      } catch (e) {
        console.error("Failed to load army", e);
      }
    }
  }, []);

  const totalPoints = selectedUnits.reduce((sum, unit) => sum + unit.points, 0);

  // Validation
  const hasHQ = selectedUnits.some(u => u.type === 'HQ');
  const isOverPoints = totalPoints > MAX_POINTS;
  const isValid = hasHQ && !isOverPoints;

  const addUnit = (unit: Unit) => {
    if (totalPoints + unit.points > MAX_POINTS) {
      toast.error(`Cannot add ${unit.name}: Exceeds point limit of ${MAX_POINTS}!`);
      return;
    }
    
    // Rule of 3 check (excluding troops/infantry if we wanted to be strict, but let's just do a generic check for non-infantry)
    if (unit.type !== 'Infantry') {
      const count = selectedUnits.filter(u => u.name === unit.name).length;
      if (count >= 3) {
        toast.error(`Cannot add ${unit.name}: Maximum of 3 allowed per army!`);
        return;
      }
    }

    setSelectedUnits([...selectedUnits, { ...unit, id: Math.random().toString() }]);
    toast.success(`Added ${unit.name} to army.`);
  };

  const removeUnit = (id: string) => {
    setSelectedUnits(selectedUnits.filter(u => u.id !== id));
  };

  const saveArmy = () => {
    const armyData = {
      name: armyName,
      description: armyDescription,
      units: selectedUnits,
      points: totalPoints
    };
    localStorage.setItem('savedArmy', JSON.stringify(armyData));
    toast.success('Army list saved successfully!');
  };

  // Filter and Sort
  const filteredUnits = availableUnits
    .filter(unit => {
      if (activeTab !== 'all' && unit.type.toLowerCase() !== activeTab) return false;
      if (searchQuery && !unit.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'points-asc') return a.points - b.points;
      if (sortBy === 'points-desc') return b.points - a.points;
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white shrink-0" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shrink-0">
              <Sword className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <Input 
                value={armyName} 
                onChange={(e) => setArmyName(e.target.value)}
                className="bg-transparent border-none text-xl font-bold p-0 h-auto focus-visible:ring-0 w-full"
                placeholder="Army Name"
              />
              <p className="text-sm text-slate-400">Points Limit: {MAX_POINTS}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Points</p>
              <p className={`text-2xl font-mono font-bold ${isOverPoints ? 'text-red-500' : 'text-primary'}`}>
                {totalPoints} / {MAX_POINTS}
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white" onClick={saveArmy}>
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
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Search units..." 
                  className="pl-10 bg-slate-900 border-slate-800 text-white" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-slate-900 border-slate-800 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="points-asc">Points (Low to High)</SelectItem>
                    <SelectItem value="points-desc">Points (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-900 border border-slate-800 w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">All Units</TabsTrigger>
                <TabsTrigger value="infantry">Infantry</TabsTrigger>
                <TabsTrigger value="vehicle">Vehicles</TabsTrigger>
                <TabsTrigger value="hq">HQ</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUnits.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      No units found matching your criteria.
                    </div>
                  ) : (
                    filteredUnits.map((unit) => (
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
                            className="w-full bg-slate-800 hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all text-white"
                            onClick={() => addUnit(unit)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Army
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Army List */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  Army List
                  <span className="text-sm font-mono text-primary">{selectedUnits.length} Units</span>
                </CardTitle>
                <div className="mt-2">
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Army description or notes..."
                    rows={3}
                    value={armyDescription}
                    onChange={(e) => setArmyDescription(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedUnits.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
                    <Shield className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">No units selected yet.</p>
                    <p className="text-xs text-slate-600 mt-1">Start adding units from the library.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
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
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">Army Composition</span>
                    {isValid ? (
                      <span className="text-green-500 font-medium flex items-center gap-1">
                        <Shield className="h-4 w-4" /> Valid
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Invalid
                      </span>
                    )}
                  </div>
                  
                  {!isValid && selectedUnits.length > 0 && (
                    <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                      {!hasHQ && <p>• Army must include at least 1 HQ unit.</p>}
                      {isOverPoints && <p>• Army exceeds maximum point limit ({MAX_POINTS}).</p>}
                    </div>
                  )}

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Total Points</p>
                      <p className={`text-3xl font-mono font-bold ${isOverPoints ? 'text-red-500' : 'text-white'}`}>
                        {totalPoints}
                      </p>
                    </div>
                    <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white">
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
