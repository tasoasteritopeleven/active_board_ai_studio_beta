import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Sword, 
  Settings, 
  Copy, 
  Check, 
  Play,
  ChevronLeft,
  MessageSquare,
  Send,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function GameLobbyPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');

  const players = [
    { id: '1', name: 'Commander Alpha', role: 'Host', status: 'Ready', color: '#dc2626' },
    { id: '2', name: 'General Beta', role: 'Player', status: 'Ready', color: '#2563eb' },
    { id: '3', name: 'Tactician Gamma', role: 'Player', status: 'Thinking...', color: '#16a34a' },
  ];

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-slate-400">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Game Lobby</h1>
              <p className="text-slate-400">Waiting for all commanders to mobilize...</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
            <div className="px-4">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Room Code</p>
              <p className="text-xl font-mono font-bold text-white">{roomCode}</p>
            </div>
            <Button size="icon" variant="secondary" onClick={copyRoomCode}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Mobilized Forces ({players.length}/6)
                </CardTitle>
                <CardDescription>Minimum 2 players required to start</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 group hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                          style={{ backgroundColor: player.color }}
                        >
                          {player.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-2">
                            {player.name}
                            {player.role === 'Host' && <Shield className="h-3 w-3 text-yellow-500" />}
                          </p>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">{player.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={player.status === 'Ready' ? 'default' : 'outline'} className={player.status === 'Ready' ? 'bg-green-500/20 text-green-500 border-green-500/20' : 'text-slate-500'}>
                          {player.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty Slots */}
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-slate-800 opacity-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700">
                          <Plus className="h-6 w-6" />
                        </div>
                        <p className="text-slate-600 font-medium italic">Waiting for player...</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary">Invite</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Settings Preview */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Battle Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Map</p>
                  <p className="text-white font-medium">World Domination (Classic)</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Turn Timer</p>
                  <p className="text-white font-medium">60 Seconds</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Fog of War</p>
                  <p className="text-white font-medium">Disabled</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Reinforcements</p>
                  <p className="text-white font-medium">Fixed (4, 6, 8...)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat & Actions */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 h-[400px] flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Lobby Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                <div className="text-xs text-slate-500 italic text-center py-2">Commander Alpha created the room</div>
                <div className="space-y-2">
                  <p className="text-xs"><span className="text-primary font-bold">Alpha:</span> Anyone up for a quick game?</p>
                  <p className="text-xs"><span className="text-blue-400 font-bold">Beta:</span> Ready when you are!</p>
                </div>
              </CardContent>
              <div className="p-4 border-t border-slate-800">
                <div className="relative">
                  <Input 
                    placeholder="Type a message..." 
                    className="bg-slate-950 border-slate-800 pr-10"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <Button 
              className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 group"
              onClick={() => navigate(`/game/${roomCode}`)}
            >
              <Play className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
              COMMENCE BATTLE
            </Button>
            
            <p className="text-center text-xs text-slate-500">
              Only the Host can start the game.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
