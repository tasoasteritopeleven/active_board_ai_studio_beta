import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Settings, 
  Copy, 
  Check, 
  Play,
  ChevronLeft,
  MessageSquare,
  Send,
  Plus,
  Share2,
  User,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GameRoomProvider } from '@/components/multiplayer/GameRoomProvider';

const AVAILABLE_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#9333ea', '#db2777', '#ea580c', '#06b6d4'];
const CURRENT_USER_ID = '1';

type Message = {
  id: string;
  type: 'system' | 'player';
  playerId?: string;
  text: string;
  timestamp: Date;
};

type Player = {
  id: string;
  name: string;
  role: string;
  status: string;
  color: string;
  isAI?: boolean;
  aiDifficulty?: string;
  aiRole?: string;
};

export default function GameLobbyPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [message, setMessage] = useState('');
  
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Commander Alpha', role: 'Host', status: 'Ready', color: '#dc2626' },
    { id: '2', name: 'General Beta', role: 'Player', status: 'Ready', color: '#2563eb' },
    { id: '3', name: 'Tactician Gamma', role: 'Player', status: 'Thinking...', color: '#16a34a' },
  ]);

  const [settings, setSettings] = useState({
    map: 'World Domination (Classic)',
    turnTimer: '60 Seconds',
    fogOfWar: 'Disabled',
    reinforcements: 'Fixed (4, 6, 8...)',
  });

  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', type: 'system', text: 'Commander Alpha created the room', timestamp: new Date(Date.now() - 60000) },
    { id: 'm2', type: 'player', playerId: '1', text: 'Anyone up for a quick game?', timestamp: new Date(Date.now() - 30000) },
    { id: 'm3', type: 'player', playerId: '2', text: 'Ready when you are!', timestamp: new Date(Date.now() - 15000) },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHost = players.find(p => p.id === CURRENT_USER_ID)?.role === 'Host';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/lobby/${roomCode}`;
    navigator.clipboard.writeText(link);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;
    
    setMessages([...messages, {
      id: `m${Date.now()}`,
      type: 'player',
      playerId: CURRENT_USER_ID,
      text: message.trim(),
      timestamp: new Date()
    }]);
    setMessage('');
  };

  const updatePlayerColor = (playerId: string, color: string) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, color } : p));
  };

  const updatePlayerRole = (playerId: string, role: string) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, role } : p));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';
  const getPlayerColor = (id: string) => players.find(p => p.id === id)?.color || '#ffffff';

  return (
    <GameRoomProvider roomId={`tableforge-lobby-${roomCode ?? "demo"}`}>
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-slate-400">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Λόμπι Παιχνιδιού</h1>
              <p className="text-slate-400">Αναμονή για την κινητοποίηση όλων των διοικητών...</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="gap-2 border-slate-700 bg-slate-900" onClick={copyInviteLink}>
              {inviteCopied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
              {inviteCopied ? 'Αντιγράφηκε' : 'Πρόσκληση Φίλων'}
            </Button>
            <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
              <div className="px-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Κωδικος Δωματιου</p>
                <p className="text-xl font-mono font-bold text-white">{roomCode}</p>
              </div>
              <Button size="icon" variant="secondary" onClick={copyRoomCode}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player List & Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Κινητοποιημένες Δυνάμεις ({players.length}/6)
                </CardTitle>
                <CardDescription>Απαιτούνται τουλάχιστον 2 παίκτες για την έναρξη</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {players.map((player) => (
                    <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 group hover:border-primary/30 transition-colors gap-4">
                      
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-slate-900"
                            style={{ backgroundColor: player.color }}
                          >
                            {player.name[0]}
                          </div>
                          {player.role === 'Host' && (
                            <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-800">
                              <Shield className="h-3 w-3 text-yellow-500" />
                            </div>
                          )}
                          {player.role === 'Spectator' && (
                            <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-800">
                              <Eye className="h-3 w-3 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-2">
                            {player.name}
                            {player.id === CURRENT_USER_ID && <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">ΕΣΕΙΣ</span>}
                          </p>
                          <div className="flex flex-col gap-2 mt-1">
                            {/* Role Selection */}
                            { (isHost || player.id === CURRENT_USER_ID) ? (
                              <div className="flex flex-col gap-1">
                                <Select value={player.role} onValueChange={(v) => updatePlayerRole(player.id, v)}>
                                  <SelectTrigger size="sm" className="h-6 text-xs bg-slate-900 border-slate-700 w-[120px]">
                                    <SelectValue placeholder="Ρόλος" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {isHost && <SelectItem value="Host" className="text-xs">Οικοδεσπότης</SelectItem>}
                                    <SelectItem value="Player" className="text-xs">Παίκτης</SelectItem>
                                    <SelectItem value="Spectator" className="text-xs">Θεατής</SelectItem>
                                    {isHost && <SelectItem value="AI" className="text-xs">AI (Bot)</SelectItem>}
                                  </SelectContent>
                                </Select>
                                {player.role === 'AI' && isHost && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Select value={player.aiDifficulty || 'Medium'} onValueChange={(v) => setPlayers(players.map(p => p.id === player.id ? { ...p, aiDifficulty: v } : p))}>
                                      <SelectTrigger size="sm" className="h-6 text-[10px] bg-slate-800 border-slate-700 w-[80px]">
                                        <SelectValue placeholder="Δυσκολία" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Easy" className="text-[10px]">Εύκολο</SelectItem>
                                        <SelectItem value="Medium" className="text-[10px]">Μεσαίο</SelectItem>
                                        <SelectItem value="Hard" className="text-[10px]">Δύσκολο</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Select value={player.aiRole || 'Balanced'} onValueChange={(v) => setPlayers(players.map(p => p.id === player.id ? { ...p, aiRole: v } : p))}>
                                      <SelectTrigger size="sm" className="h-6 text-[10px] bg-slate-800 border-slate-700 w-[100px]">
                                        <SelectValue placeholder="Στρατηγική" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Aggressive" className="text-[10px]">Επιθετικό</SelectItem>
                                        <SelectItem value="Defensive" className="text-[10px]">Αμυντικό</SelectItem>
                                        <SelectItem value="Balanced" className="text-[10px]">Ισορροπημένο</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 uppercase tracking-wider">{player.role}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Color Picker */}
                        <div className="flex flex-wrap gap-1 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800 max-w-[150px] sm:max-w-none justify-center">
                          {AVAILABLE_COLORS.map(color => (
                            <button
                              key={color}
                              onClick={() => updatePlayerColor(player.id, color)}
                              disabled={(player.id !== CURRENT_USER_ID && !isHost) || players.some(p => p.id !== player.id && p.color === color)}
                              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 ${player.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                              title={(player.id !== CURRENT_USER_ID && !isHost) ? "Only player can change their color" : "Select color"}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          {player.status === 'Ready' || player.status === 'Έτοιμος' ? (
                            <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/20 gap-1.5 px-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                              Έτοιμος
                            </Badge>
                          ) : player.status === 'Thinking...' || player.status === 'Σκέφτεται...' ? (
                            <Badge variant="outline" className="text-yellow-400 border-yellow-500/20 bg-yellow-500/10 gap-1.5 px-2">
                              <div className="flex gap-0.5">
                                <div className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1 h-1 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                              Σκέφτεται
                            </Badge>
                          ) : player.status === 'Disconnected' || player.status === 'Αποσυνδεδεμένος' ? (
                            <Badge variant="outline" className="text-red-400 border-red-500/20 bg-red-400/10 gap-1.5 px-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                              Εκτός
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 border-slate-700 gap-1.5 px-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                              {player.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty Slots */}
                  {[...Array(6 - players.length)].map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-dashed border-slate-800 opacity-50 bg-slate-900/30 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 shrink-0">
                          <Plus className="h-6 w-6" />
                        </div>
                        <p className="text-slate-600 font-medium italic">Αναμονή για παίκτη...</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-primary border border-primary/20 hover:bg-primary/10" onClick={copyInviteLink}>Πρόσκληση</Button>
                        {isHost && (
                           <Select onValueChange={(val: string) => {
                             const [diff, role] = val.split('-');
                             setPlayers([...players, { 
                               id: `ai-${Date.now()}`, 
                               name: `AI (${diff})`, 
                               role: 'AI', 
                               status: 'Έτοιμος', 
                               color: AVAILABLE_COLORS[players.length % AVAILABLE_COLORS.length], 
                               isAI: true,
                               aiDifficulty: diff, 
                               aiRole: role 
                             }]);
                           }}>
                              <SelectTrigger size="sm" className="h-8 text-xs bg-slate-900 border-slate-700 w-[130px]">
                                <SelectValue placeholder="+ Προσθήκη AI" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="Εύκολο-Επιθετικό" className="text-xs">AI Εύκολο (Επιθετικό)</SelectItem>
                                 <SelectItem value="Μεσαίο-Αμυντικό" className="text-xs">AI Μεσαίο (Αμυντικό)</SelectItem>
                                 <SelectItem value="Δύσκολο-Ισορροπημένο" className="text-xs">AI Δύσκολο (Ισορροπιμένο)</SelectItem>
                              </SelectContent>
                           </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Settings */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Battle Parameters
                </CardTitle>
                <CardDescription>
                  {isHost ? 'Configure the rules of engagement.' : 'Only the Host can modify these settings.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Map */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Map</Label>
                  {isHost ? (
                    <Select value={settings.map} onValueChange={(v) => setSettings({...settings, map: v})}>
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="World Domination (Classic)">World Domination (Classic)</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white font-medium">{settings.map}</p>
                  )}
                </div>

                {/* Turn Timer */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Turn Timer</Label>
                  {isHost ? (
                    <Select value={settings.turnTimer} onValueChange={(v) => setSettings({...settings, turnTimer: v})}>
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30 Seconds">30 Seconds</SelectItem>
                        <SelectItem value="60 Seconds">60 Seconds</SelectItem>
                        <SelectItem value="90 Seconds">90 Seconds</SelectItem>
                        <SelectItem value="Unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white font-medium">{settings.turnTimer}</p>
                  )}
                </div>

                {/* Fog of War */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Fog of War</Label>
                  {isHost ? (
                    <Select value={settings.fogOfWar} onValueChange={(v) => setSettings({...settings, fogOfWar: v})}>
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disabled">Disabled</SelectItem>
                        <SelectItem value="Enabled">Enabled</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white font-medium">{settings.fogOfWar}</p>
                  )}
                </div>

                {/* Reinforcements */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <Label className="text-xs text-slate-500 uppercase font-bold">Reinforcements</Label>
                  {isHost ? (
                    <Select value={settings.reinforcements} onValueChange={(v) => setSettings({...settings, reinforcements: v})}>
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fixed (4, 6, 8...)">Fixed (4, 6, 8...)</SelectItem>
                        <SelectItem value="Progressive">Progressive</SelectItem>
                        <SelectItem value="Flat (+5)">Flat (+5)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white font-medium">{settings.reinforcements}</p>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Chat & Actions */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 h-[500px] flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-800/50 bg-slate-900">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Συζήτηση Λόμπι
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/50">
                {messages.map((msg) => {
                  if (msg.type === 'system') {
                    return (
                      <div key={msg.id} className="text-[11px] text-slate-500 italic text-center py-1">
                        {msg.text} • {formatTime(msg.timestamp)}
                      </div>
                    );
                  }

                  const isOwn = msg.playerId === CURRENT_USER_ID;
                  const playerColor = msg.playerId ? getPlayerColor(msg.playerId) : '#fff';
                  const playerName = msg.playerId ? getPlayerName(msg.playerId) : 'Άγνωστος';

                  return (
                    <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {!isOwn && (
                        <span className="text-[10px] font-bold mb-1 ml-1 opacity-80" style={{ color: playerColor }}>
                          {playerName}
                        </span>
                      )}
                      <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                          : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-600 mt-1 mx-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </CardContent>
              
              <div className="p-3 bg-slate-900 border-t border-slate-800">
                <form onSubmit={sendMessage} className="relative flex items-center gap-2">
                  <Input 
                    placeholder="Πληκτρολογήστε ένα μήνυμα..." 
                    className="bg-slate-950 border-slate-800 pr-10 focus-visible:ring-1 focus-visible:ring-primary h-10 w-full"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:bg-primary/20 hover:text-primary"
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>

            <div className="space-y-3">
              <Button 
                className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 group relative overflow-hidden"
                onClick={() => navigate(`/game/${roomCode}`)}
                disabled={!isHost}
              >
                {!isHost && (
                  <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] flex items-center justify-center z-10 cursor-not-allowed">
                    <span className="text-sm font-medium text-slate-300">Αναμονή για τον Οικοδεσπότη...</span>
                  </div>
                )}
                <div className={`flex items-center justify-center ${!isHost ? 'opacity-30' : ''}`}>
                  <Play className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                  ΕΝΑΡΞΗ ΜΑΧΗΣ
                </div>
              </Button>
              
              <div className="flex justify-between items-center px-2">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-yellow-500/70" />
                  Μόνο ο Οικοδεσπότης μπορεί να ξεκινήσει το παιχνίδι
                </p>
                <div className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {players.filter(p => p.status === 'Ready').length}/{players.length} Έτοιμοι
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </GameRoomProvider>
  );
}
