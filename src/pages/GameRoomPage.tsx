import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  ChevronLeft, 
  Send,
  Dice5,
  History,
  Info,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import RiskBoard3D from '@/games/risk/RiskBoard3D';
import { type GameState } from '@/games/risk/RiskEngine';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export default function GameRoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLayoutMode, setIsLayoutMode] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'System', text: 'Welcome to the game room!', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSystem: true }
  ]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Mock Game State
  const [gameState] = useState<GameState>({
    territories: [
      { id: '1', name: 'Alaska', continent: 'north-america', ownerId: 'p1', armies: 3, position: { x: 50, y: 80 }, neighbors: ['2', '3'] },
      { id: '2', name: 'NW Territory', continent: 'north-america', ownerId: 'p1', armies: 2, position: { x: 150, y: 80 }, neighbors: ['1', '3', '4'] },
      { id: '3', name: 'Alberta', continent: 'north-america', ownerId: 'p2', armies: 5, position: { x: 120, y: 150 }, neighbors: ['1', '2', '4'] },
    ],
    players: [
      { id: 'p1', name: 'Commander Alpha', color: '#dc2626', armiesToPlace: 0, isEliminated: false },
      { id: 'p2', name: 'General Beta', color: '#2563eb', armiesToPlace: 3, isEliminated: false },
    ],
    currentPlayerId: 'p1',
    phase: 'attack',
    turnNumber: 5,
    log: ['Commander Alpha attacked Alberta from Alaska', 'General Beta reinforced NW Territory'],
  });

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isChatOpen]);

  const handleTerritoryClick = (id: string) => {
    setSelectedTerritory(id === selectedTerritory ? null : id);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate a reply for demonstration purposes
    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'General Beta',
        text: 'I see your move...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Game Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-slate-400">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white uppercase tracking-widest">Risk: Global Domination</h1>
            <p className="text-[10px] text-slate-500 font-mono">ROOM: {roomCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] sm:text-xs font-medium text-slate-300">Phase: <span className="text-primary uppercase">{gameState.phase}</span></span>
          </div>
          
          <div className="flex items-center -space-x-2">
            {gameState.players.map((p) => (
              <div 
                key={p.id} 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white shadow-lg`}
                style={{ backgroundColor: p.color }}
                title={p.name}
              >
                {p.name[0]}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => setIsMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetContent className="bg-slate-900 border-slate-800 text-slate-200">
              <div className="space-y-6 py-4">
                <h2 className="text-xl font-bold text-white">Game Menu</h2>
                <div className="space-y-2">
                  <Button 
                    variant={isLayoutMode ? "default" : "ghost"} 
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      setIsLayoutMode(!isLayoutMode);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Settings className="h-5 w-5" /> {isLayoutMode ? 'Exit Layout Mode' : 'Layout Mode'}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Settings className="h-5 w-5" /> Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Users className="h-5 w-5" /> Players
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <History className="h-5 w-5" /> Game Log
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    <X className="h-5 w-5" /> Leave Game
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Main Game View */}
        <div className="flex-1 relative">
          <RiskBoard3D 
            gameState={gameState} 
            selectedTerritory={selectedTerritory} 
            onTerritoryClick={handleTerritoryClick} 
            isLayoutMode={isLayoutMode}
          />

          {/* Game Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10 w-full max-w-[90%] sm:w-auto px-4 sm:px-0">
            <Card className="bg-slate-900/90 backdrop-blur-xl border-slate-800 shadow-2xl w-full sm:w-auto">
              <CardContent className="p-2 flex items-center justify-between sm:justify-start gap-2">
                <Button size="lg" className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 sm:px-8">
                  <Dice5 className="h-5 w-5 mr-2" />
                  ATTACK
                </Button>
                <div className="w-px h-8 bg-slate-800 mx-1 sm:mx-2"></div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <Info className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Territory Info Overlay */}
          {selectedTerritory && (
            <div className="absolute top-6 left-6 right-6 sm:right-auto sm:w-64 z-10 animate-slide-up">
              <Card className="bg-slate-900/90 backdrop-blur-xl border-slate-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {gameState.territories.find(t => t.id === selectedTerritory)?.name}
                      </h3>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">North America</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedTerritory(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Armies</p>
                      <p className="text-xl font-bold text-primary">
                        {gameState.territories.find(t => t.id === selectedTerritory)?.armies}
                      </p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Owner</p>
                      <p className="text-sm font-bold text-white truncate">
                        {gameState.players.find(p => p.id === gameState.territories.find(t => t.id === selectedTerritory)?.ownerId)?.name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Chat Sidebar (Desktop) */}
        <aside className={`hidden lg:flex flex-col w-80 border-l border-slate-800 bg-slate-900/50 backdrop-blur-md transition-all ${isChatOpen ? 'mr-0' : '-mr-80'}`}>
          <ChatContent 
            messages={messages} 
            message={message} 
            setMessage={setMessage} 
            handleSendMessage={handleSendMessage} 
            onClose={() => setIsChatOpen(false)}
            chatScrollRef={chatScrollRef}
          />
        </aside>

        {/* Chat Sheet (Mobile/Tablet) */}
        <Sheet open={isChatOpen && window.innerWidth < 1024} onOpenChange={setIsChatOpen}>
          <SheetContent side="right" className="w-full sm:w-80 p-0 bg-slate-900 border-slate-800">
            <ChatContent 
              messages={messages} 
              message={message} 
              setMessage={setMessage} 
              handleSendMessage={handleSendMessage} 
              onClose={() => setIsChatOpen(false)}
              chatScrollRef={chatScrollRef}
            />
          </SheetContent>
        </Sheet>

        {/* Chat Toggle */}
        {!isChatOpen && (
          <Button 
            className="absolute right-6 bottom-6 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 w-12 h-12 rounded-full bg-primary shadow-xl z-20"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ChatContent({ messages, message, setMessage, handleSendMessage, onClose, chatScrollRef }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm text-white uppercase tracking-wider">Tactical Comms</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg: any) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-[10px] font-bold ${msg.isSystem ? 'text-yellow-500' : msg.sender === 'You' ? 'text-primary' : 'text-blue-400'}`}>
                {msg.sender}
              </span>
              <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
            </div>
            <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${
              msg.isSystem ? 'bg-yellow-500/10 text-yellow-200 border border-yellow-500/20' :
              msg.sender === 'You' ? 'bg-primary/20 text-white border border-primary/30 rounded-tr-none' : 
              'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <form onSubmit={handleSendMessage} className="relative flex gap-2">
          <Input 
            placeholder="Send message..." 
            className="bg-slate-900 border-slate-700"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit" size="icon" className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
