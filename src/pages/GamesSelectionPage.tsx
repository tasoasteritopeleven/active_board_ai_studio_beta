import { useNavigate } from 'react-router-dom';
import { Gamepad2, Hexagon, Globe2, ChevronLeft, Banknote, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function GamesSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => navigate('/dashboard')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Επιστροφή
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Gamepad2 className="h-7 w-7 text-primary" />
            Επιλογή Παιχνιδιού
          </h1>
          <p className="text-slate-400">
            Επιτραπέζια εμπειρία πρώτα — καθίστε στο τραπέζι, όχι σε manager panel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer group" onClick={() => navigate('/games/catan')}>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3">
                <Hexagon className="h-7 w-7 text-orange-500" />
              </div>
              <CardTitle className="text-lg text-white">Settlers of Catan</CardTitle>
              <CardDescription>3D εξαγωνικό ταμπλό, VR-ready.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 font-bold">Άνοιγμα τραπεζιού</Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group" onClick={() => navigate('/games/risk')}>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
                <Globe2 className="h-7 w-7 text-blue-500" />
              </div>
              <CardTitle className="text-lg text-white">Risk Global Domination</CardTitle>
              <CardDescription>3D παγκόσμιος χάρτης πάνω στο τραπέζι.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold">Άνοιγμα τραπεζιού</Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group" onClick={() => navigate('/games/monopoly')}>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <Banknote className="h-7 w-7 text-emerald-500" />
              </div>
              <CardTitle className="text-lg text-white">Monopoly</CardTitle>
              <CardDescription>Κλασικό ταμπλό 40 θέσεων με κέντρο MONOPOLY.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">Άνοιγμα τραπεζιού</Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer group" onClick={() => navigate('/games/codenames')}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-3">
                  <MessageSquare className="h-7 w-7 text-teal-400" />
                </div>
                <Badge variant="outline" className="text-[10px] border-teal-700 text-teal-400">Σε εξέλιξη</Badge>
              </div>
              <CardTitle className="text-lg text-white">Codenames</CardTitle>
              <CardDescription>Ομαδικό παιχνίδι λέξεων — 25 κάρτες σε τσόχαδο.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-teal-600 hover:bg-teal-700 font-bold">Άνοιγμα τραπεζιού</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
