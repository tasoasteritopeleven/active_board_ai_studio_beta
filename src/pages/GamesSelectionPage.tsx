import { useNavigate } from 'react-router-dom';
import { Gamepad2, Hexagon, Globe2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GamesSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => navigate('/dashboard')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Επιστροφή στον Πίνακα Ελέγχου
        </Button>

        <div>
          <h1 className="text-[18px] font-bold text-white mb-2">Επιλογή Παιχνιδιού</h1>
          <p className="text-slate-400">Επιλέξτε μια μηχανή παιχνιδιού για να ξεκινήσετε τη συνεδρία σας.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Catan Card */}
          <Card 
            className="bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer group"
            onClick={() => navigate('/games/catan')}
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Hexagon className="h-8 w-8 text-orange-500" />
              </div>
              <CardTitle className="text-[19.2px] text-white group-hover:text-orange-400 transition-colors">Settlers of Catan</CardTitle>
              <CardDescription className="text-slate-400">
                Διαχείριση πόρων, εμπόριο και χτίσιμο σε εξαγωνικό πλέγμα.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>• 3D Εξαγωνικό Ταμπλό</li>
                <li>• Φυσική Ζαριών</li>
                <li>• Εφέ Ροής Πόρων</li>
                <li>• AI Αντίπαλοι</li>
              </ul>
              <Button className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold">
                Παίξτε Catan
              </Button>
            </CardContent>
          </Card>

          {/* Risk Card */}
          <Card 
            className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
            onClick={() => navigate('/games/risk')}
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe2 className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-[19.2px] text-white group-hover:text-blue-400 transition-colors">Risk Global Domination</CardTitle>
              <CardDescription className="text-slate-400">
                Στρατηγική κατάκτηση, ανάπτυξη στρατού και έλεγχος περιοχών.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>• 3D Παγκόσμιος Χάρτης</li>
                <li>• Πάνελ Χωρικής Παρουσίας</li>
                <li>• Κινηματογραφικός Φωτισμός</li>
                <li>• AI Αντίπαλοι</li>
              </ul>
              <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                Παίξτε Risk
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
            onClick={() => navigate('/games/monopoly')}
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="h-8 w-8 text-emerald-500" />
              </div>
              <CardTitle className="text-[19.2px] text-white">Monopoly</CardTitle>
              <CardDescription className="text-slate-400">Κλασικό οικονομικό παιχνίδι — σε εξέλιξη.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Προεπισκόπηση</Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-slate-900/50 border-slate-800 hover:border-violet-500/50 transition-all cursor-pointer group"
            onClick={() => navigate('/games/codenames')}
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="h-8 w-8 text-violet-500" />
              </div>
              <CardTitle className="text-[19.2px] text-white">Codenames</CardTitle>
              <CardDescription className="text-slate-400">Ομαδικό παιχνίδι λέξεων — σε εξέλιξη.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white font-bold">Προεπισκόπηση</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
