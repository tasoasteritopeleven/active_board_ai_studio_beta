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
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Select a Game</h1>
          <p className="text-slate-400">Choose a game engine to start your session.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Catan Card */}
          <Card 
            className="bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer group"
            onClick={() => navigate('/games/catan')}
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Hexagon className="h-8 w-8 text-orange-500" />
              </div>
              <CardTitle className="text-2xl text-white group-hover:text-orange-400 transition-colors">Settlers of Catan</CardTitle>
              <CardDescription className="text-slate-400">
                Resource management, trading, and building on a hex grid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>• 3D Hexagonal Terrain</li>
                <li>• Physics-based Dice</li>
                <li>• Resource Flow Animations</li>
                <li>• AI Opponents</li>
              </ul>
              <Button className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white">
                Play Catan
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
              <CardTitle className="text-2xl text-white group-hover:text-blue-400 transition-colors">Risk Global Domination</CardTitle>
              <CardDescription className="text-slate-400">
                Strategic conquest, army deployment, and territory control.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>• 3D World Map</li>
                <li>• Spatial Presence Panels</li>
                <li>• Cinematic Lighting</li>
                <li>• AI Opponents</li>
              </ul>
              <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                Play Risk
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
