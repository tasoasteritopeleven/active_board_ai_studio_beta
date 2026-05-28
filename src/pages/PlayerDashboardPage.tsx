import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  TrendingUp, 
  Shield, 
  User,
  Medal,
  ChevronRight,
  ChevronLeft,
  Gamepad2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function PlayerDashboardPage() {
  const navigate = useNavigate();
  const [level] = useState(42);
  const [xp] = useState(75);

  const stats = [
    { label: 'Top 3 Τερματισμοί', value: '82%', icon: Target, color: 'text-blue-500' },
    { label: 'Ολοκληρωμένα Παιχνίδια', value: '1,240', icon: Gamepad2, color: 'text-purple-500' },
    { label: 'Έρως για', value: 'Στρατηγική', icon: Medal, color: 'text-red-500' },
    { label: 'Μέσος Γύρος', value: '42s', icon: Clock, color: 'text-green-500' },
  ];

  const recentAchievements = [
    { name: 'Ασταμάτητη Δύναμη', desc: 'Νίκησε σε 10 συνεχόμενα παιχνίδια', icon: Trophy, date: 'Πριν 2 μέρες' },
    { name: 'Μετρ της Στρατηγικής', desc: 'Συγκέντρωσε τους περισσότερους πόρους σε 1 γύρο', icon: Medal, date: 'Πριν 1 εβδομάδα' },
    { name: 'Γρήγορη Εκκίνηση', desc: 'Σημείωσε προβάδισμα από τον πρώτο γύρο', icon: Star, date: 'Πριν 2 εβδομάδες' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Προφίλ Παίκτη</h1>
        </div>

        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-orange-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-4xl font-bold text-white">
                  JD
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-primary font-bold">
                {level}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Παίκτης John Doe</h1>
                <p className="text-slate-400 font-medium">Βετεράνος Board Gamer • Μέλος από το 2024</p>
              </div>
              <div className="space-y-2 max-w-md mx-auto md:mx-0">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Πρόοδος Επιπέδου</span>
                  <span className="text-primary font-bold">{xp}%</span>
                </div>
                <Progress value={xp} className="h-2 bg-slate-800" />
                <p className="text-xs text-slate-500">2,450 XP μέχρι το Επίπεδο {level + 1}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-800">Επεξεργασία</Button>
              <Button className="bg-primary hover:bg-primary/90">Κοινοποίηση</Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Achievements */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Πρόσφατα Επιτεύγματα
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentAchievements.map((ach) => (
                  <div key={ach.name} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center text-yellow-500">
                        <ach.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{ach.name}</p>
                        <p className="text-sm text-slate-500">{ach.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600 font-medium">{ach.date}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
                  Προβολή Όλων των Επιτευγμάτων
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Favorite Systems */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Αγαπημένα Παιχνίδια
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: 'Terraforming Mars', games: 452, color: 'from-orange-500/20' },
                  { name: 'Gloomhaven', games: 312, color: 'from-blue-500/20' },
                  { name: 'Catan', games: 184, color: 'from-red-500/20' },
                ].map((system) => (
                  <div key={system.name} className={`p-4 rounded-xl bg-gradient-to-br ${system.color} to-transparent border border-slate-800`}>
                    <p className="text-sm font-bold text-white mb-1">{system.name}</p>
                    <p className="text-xs text-slate-500">{system.games} Παιχνίδια</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Side Panels */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-slate-500">Τρέχον Rank</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-slate-950 border-8 border-primary flex items-center justify-center shadow-[0_0_50px_-12px_rgba(237,117,26,0.5)]">
                    <Shield className="h-16 w-16 text-primary" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                    DIAMOND III
                  </div>
                </div>
                <div className="mt-8 space-y-2">
                  <p className="text-slate-400 text-sm">Κορυφαίο 2.4% των παικτών</p>
                  <p className="text-xs text-slate-600">Η σεζόν λήγει σε 12 μέρες</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-slate-500">Συμπαίκτες & Αντίπαλοι</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold font-mono">
                          ΠΛ
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Παίκτης {i}</p>
                          <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Ολοκληρώθηκε</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-primary">
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
