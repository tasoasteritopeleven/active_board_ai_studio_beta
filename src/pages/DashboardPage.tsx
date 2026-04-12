import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Users, 
  Trophy, 
  Settings, 
  Plus, 
  Search,
  Bell,
  Menu,
  X,
  Sword,
  Building2,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard', active: true },
    { icon: Gamepad2, label: 'My Games', path: '/games' },
    { icon: Users, label: 'Friends', path: '#' },
    { icon: Sword, label: 'Army Builder', path: '/army-builder' },
    { icon: Trophy, label: 'Achievements', path: '/player' },
    { icon: Building2, label: 'Venue', path: '/venue' },
    { icon: Settings, label: 'Settings', path: '#' },
  ];

  const recentGames = [
    { id: '1', name: 'Warhammer 40k', players: 2, status: 'In Progress', time: '2h ago', system: 'Risk Engine' },
    { id: '2', name: 'D&D Session', players: 5, status: 'Scheduled', time: 'Tomorrow', system: 'TableForge Core' },
    { id: '3', name: 'Risk Global', players: 4, status: 'Completed', time: '2 days ago', system: 'Risk Engine' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">T</div>
            <span className="font-bold text-xl text-white">TableForge</span>
          </Link>
        </div>
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="text-slate-400">
              <Menu className="h-6 w-6" />
            </Button>
          } />
          <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-800">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xl text-white">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.label}
                    variant={item.active ? 'secondary' : 'ghost'}
                    className={`w-full justify-start gap-3 ${item.active ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => {
                      if (item.path !== '#') navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 h-screen sticky top-0 bg-slate-900/50 backdrop-blur-xl">
          <div className="p-6 border-b border-slate-800 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-slate-400 -ml-2" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">T</div>
              <span className="font-bold text-2xl tracking-tight text-white">TableForge</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 transition-all duration-200 ${
                  item.active 
                    ? 'bg-primary/10 text-primary hover:bg-primary/20 shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                onClick={() => item.path !== '#' && navigate(item.path)}
              >
                <item.icon className={`h-5 w-5 ${item.active ? 'text-primary' : ''}`} />
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <div 
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-all duration-200 group"
              onClick={() => navigate('/player')}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">JD</div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">John Doe</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">Elite Commander</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Top Bar */}
            <div className="hidden lg:flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <Input placeholder="Search games, players, venues..." className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary/50 transition-all" />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-slate-900 animate-pulse"></span>
                </Button>
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" onClick={() => navigate('/lobby/NEW-GAME')}>
                  <Plus className="h-4 w-4" />
                  New Battle
                </Button>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  Season 4 Active
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Welcome back, Commander</h1>
                <p className="text-slate-400 font-medium">Your armies are ready for deployment. <span className="text-primary">3 games</span> active across the sector.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white w-full sm:w-auto" onClick={() => navigate('/player')}>View Profile</Button>
                <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white w-full sm:w-auto" onClick={() => navigate('/venue')}>Venue Dashboard</Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Wins', value: '124', trend: '+12%', trendUp: true, icon: Trophy, color: 'text-yellow-500' },
                { label: 'Hours Played', value: '452h', trend: '12 systems', trendUp: true, icon: Gamepad2, color: 'text-purple-500' },
                { label: 'Global Rank', value: '#1,240', trend: 'Top 5%', trendUp: true, icon: Sparkles, color: 'text-primary' },
                { label: 'Active Battles', value: '3', trend: '2 turns pending', trendUp: false, icon: Sword, color: 'text-red-500' },
              ].map((stat) => (
                <Card key={stat.label} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 group">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      {stat.label}
                      <stat.icon className={`h-4 w-4 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                    <p className={`text-xs font-bold mt-1 ${stat.trendUp ? 'text-green-500' : 'text-slate-500'}`}>
                      {stat.trend}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Games */}
              <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white">Recent Battles</CardTitle>
                    <CardDescription className="text-slate-500">Your latest wargaming sessions</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentGames.map((game) => (
                      <div 
                        key={game.id} 
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Gamepad2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-primary transition-colors">{game.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{game.players} Players • {game.time} • <span className="text-slate-600 italic">{game.system}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline" 
                            className={`font-bold uppercase tracking-wider text-[10px] ${
                              game.status === 'In Progress' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' :
                              game.status === 'Scheduled' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' :
                              'border-green-500/30 text-green-400 bg-green-500/5'
                            }`}
                          >
                            {game.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions / Friends */}
              <div className="space-y-6">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-24 flex-col gap-2 border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-primary/50 transition-all group" onClick={() => navigate('/lobby/HOST')}>
                      <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-widest">Host</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2 border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-primary/50 transition-all group">
                      <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <Search className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-widest">Join</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2 border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-primary/50 transition-all group" onClick={() => navigate('/army-builder')}>
                      <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <Sword className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-widest">Armies</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2 border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-primary/50 transition-all group">
                      <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-widest">Social</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white">Online Friends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400 group-hover:border-primary/50 transition-colors">F{i}</div>
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Friend {i}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Playing Risk</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 text-primary hover:bg-primary/10">Invite</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
