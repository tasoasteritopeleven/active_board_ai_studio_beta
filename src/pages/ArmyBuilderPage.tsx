import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Library, 
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
    wood: number;
    stone: number;
    iron: number;
    gold: number;
    food: number;
    vp: number;
    time: string;
  };
}

const availableUnits: Unit[] = [
  { 
    id: '1', name: 'Βασικό Στοιχείο', type: 'Βασικό', points: 100,
    stats: { wood: 2, stone: 0, iron: 0, gold: 1, food: 1, vp: 1, time: '10λ' }
  },
  { 
    id: '2', name: 'Σπάνιο Στοιχείο', type: 'Ελίτ', points: 180,
    stats: { wood: 0, stone: 2, iron: 3, gold: 4, food: 2, vp: 3, time: '20λ' }
  },
  { 
    id: '3', name: 'Ταχυκίνητο Κομμάτι', type: 'Βασικό', points: 70,
    stats: { wood: 1, stone: 0, iron: 0, gold: 0, food: 2, vp: 1, time: '5λ' }
  },
  { 
    id: '4', name: 'Κεντρικός Ήρωας', type: 'Ήρωας', points: 120,
    stats: { wood: 0, stone: 0, iron: 2, gold: 5, food: 3, vp: 4, time: '15λ' }
  },
  { 
    id: '5', name: 'Βαρύς Εξοπλισμός', type: 'Ελίτ', points: 150,
    stats: { wood: 4, stone: 4, iron: 1, gold: 2, food: 1, vp: 2, time: '12λ' }
  },
];

export default function ArmyBuilderPage() {
  const navigate = useNavigate();
  const [armyName, setArmyName] = useState('Η Συλλογή Μου');
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
  const hasHQ = selectedUnits.some(u => u.type === 'Ήρωας');
  const isOverPoints = totalPoints > MAX_POINTS;
  const isValid = hasHQ && !isOverPoints;

  const addUnit = (unit: Unit) => {
    if (totalPoints + unit.points > MAX_POINTS) {
      toast.error(`Αδύνατη προσθήκη ${unit.name}: Υπέρβαση ορίου αξίας ${MAX_POINTS}!`);
      return;
    }
    
    // Rule of 3 check (excluding basic units)
    if (unit.type !== 'Βασικό') {
      const count = selectedUnits.filter(u => u.name === unit.name).length;
      if (count >= 3) {
        toast.error(`Αδύνατη προσθήκη ${unit.name}: Μέγιστο 3 όμοια ανά σετ!`);
        return;
      }
    }

    setSelectedUnits([...selectedUnits, { ...unit, id: Math.random().toString() }]);
    toast.success(`Προστέθηκε ${unit.name} στη συλλογή.`);
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
    toast.success('Η συλλογή αποθηκεύτηκε επιτυχώς!');
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
              <Library className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <Input 
                value={armyName} 
                onChange={(e) => setArmyName(e.target.value)}
                className="bg-transparent border-none text-xl font-bold p-0 h-auto focus-visible:ring-0 w-full"
                placeholder="Όνομα Σετ / Συλλογής"
              />
              <p className="text-sm text-slate-400">Όριο Αξίας: {MAX_POINTS}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Συνολική Αξία</p>
              <p className={`text-2xl font-mono font-bold ${isOverPoints ? 'text-red-500' : 'text-primary'}`}>
                {totalPoints} / {MAX_POINTS}
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20" onClick={saveArmy}>
              <Save className="h-4 w-4 mr-2" />
              Απoθήκευση
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
                  placeholder="Αναζήτηση κομματιών..." 
                  className="pl-10 bg-slate-900 border-slate-800 text-white font-medium" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-slate-900 border-slate-800 text-white font-bold">
                    <SelectValue placeholder="Ταξινόμηση" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Όνομα (A-Z)</SelectItem>
                    <SelectItem value="points-asc">Αξία (Αύξουσα)</SelectItem>
                    <SelectItem value="points-desc">Αξία (Φθίνουσα)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-900 border border-slate-800 w-full justify-start overflow-x-auto">
                <TabsTrigger value="all" className="font-bold">Όλα</TabsTrigger>
                <TabsTrigger value="βασικό" className="font-bold">Βασικά</TabsTrigger>
                <TabsTrigger value="ελίτ" className="font-bold">Ελίτ</TabsTrigger>
                <TabsTrigger value="ήρωας" className="font-bold">Ήρωες</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUnits.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500 font-medium">
                      Δεν βρέθηκαν κομμάτια με αυτά τα κριτήρια.
                    </div>
                  ) : (
                    filteredUnits.map((unit) => (
                      <Card key={unit.id} className="bg-slate-900 border-slate-800 hover:border-primary/50 transition-colors group">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg text-white font-black">{unit.name}</CardTitle>
                              <CardDescription className="font-bold text-slate-500">{unit.type}</CardDescription>
                            </div>
                            <div className="bg-slate-800 px-2 py-1 rounded text-sm font-mono font-bold text-primary">
                              {unit.points} ΑΞΙΑ
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-7 gap-1 text-center mb-4">
                            {Object.entries(unit.stats).map(([key, val]) => (
                              <div key={key} className="bg-slate-950 rounded p-1">
                                <p className="text-[10px] text-slate-500 uppercase font-black truncate" title={
                                   key === 'wood' ? 'Κόστος Ξύλου' : 
                                   key === 'stone' ? 'Κόστος Πέτρας' : 
                                   key === 'iron' ? 'Κόστος Σιδήρου' : 
                                   key === 'gold' ? 'Κόστος Χρυσού' : 
                                   key === 'food' ? 'Τροφή / Συντήρηση' : 
                                   key === 'vp' ? 'Πόντοι Νίκης' : 'Χρόνος'
                                }>
                                  {key === 'wood' ? 'ΞΥΛΟ' : 
                                   key === 'stone' ? 'ΠΕΤΡΑ' : 
                                   key === 'iron' ? 'ΣΙΔΗΡ' : 
                                   key === 'gold' ? 'ΧΡΥΣΟΣ' : 
                                   key === 'food' ? 'ΤΡΟΦΗ' : 
                                   key === 'vp' ? 'ΝΙΚΗ' : 'ΧΡΟΝΟΣ'}
                                </p>
                                <p className="text-xs font-bold text-slate-200">{val}</p>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full bg-slate-800 hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all text-white font-black"
                            onClick={() => addUnit(unit)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Προσθήκη στο Σετ
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
                <CardTitle className="flex items-center justify-between text-white font-black">
                  Λίστα Συλλογής
                  <span className="text-sm font-mono text-primary">{selectedUnits.length} Κομμάτια</span>
                </CardTitle>
                <div className="mt-2">
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary resize-none font-medium"
                    placeholder="Σημειώσεις ή περιγραφή..."
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
                    <p className="text-slate-500 font-bold">Δεν έχουν επιλεγεί κομμάτια.</p>
                    <p className="text-xs text-slate-600 mt-1">Προσθέστε κομμάτια από τη βιβλιοθήκη δεξιά.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedUnits.map((unit) => (
                      <div key={unit.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 group transition-all hover:border-primary/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-none mb-1">{unit.name}</p>
                            <p className="text-[10px] uppercase font-black text-slate-600">{unit.points} ΑΞΙΑ</p>
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
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">ΣΥΝθεση σετ</span>
                    {isValid ? (
                      <span className="text-green-500 font-black flex items-center gap-1 text-[10px] uppercase tracking-wider">
                        <Shield className="h-3 w-3" /> ΕΓΚΥΡΟ
                      </span>
                    ) : (
                      <span className="text-red-500 font-black flex items-center gap-1 text-[10px] uppercase tracking-wider">
                        <AlertCircle className="h-3 w-3" /> ΜΗ ΕΓΚΥΡΟ
                      </span>
                    )}
                  </div>
                  
                  {!isValid && selectedUnits.length > 0 && (
                    <div className="text-[10px] font-bold text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20 uppercase tracking-widest leading-relaxed">
                      {!hasHQ && <p>• Απαιτείται τουλάχιστον 1 Ήρωας/Αρχηγός.</p>}
                      {isOverPoints && <p>• Υπέρβαση ορίου αξίας ({MAX_POINTS}).</p>}
                    </div>
                  )}

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Συνολική Αξία</p>
                      <p className={`text-3xl font-mono font-black ${isOverPoints ? 'text-red-500' : 'text-white'}`}>
                        {totalPoints}
                      </p>
                    </div>
                    <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white font-bold h-12 px-6">
                      Εξαγωγή PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Η συλλογή σας επικυρώνεται αυτόματα με βάση τους τελευταίους κανόνες. 
                <span className="text-primary hover:underline cursor-pointer ml-1 font-bold">Προβολή κανόνων.</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
