import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gamepad2, 
  Shield, 
  Sword, 
  Zap, 
  ChevronRight, 
  Play, 
  Users, 
  Trophy,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tighter">TableForge</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#games" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Games</a>
              <Link to="/waitlist" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Waitlist</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-400 hover:text-white">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Zap className="h-4 w-4" />
            Next-Gen Remote Wargaming
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold text-white tracking-tighter leading-[0.9] mb-8">
            FORGE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-purple-500">DESTINY</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            The world's first VR-native remote wargaming platform. Play your favorite tabletop systems with anyone, anywhere, in stunning 3D.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/40 group">
                START CAMPAIGN
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/games/risk">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-slate-700 text-slate-300 hover:bg-slate-800">
                <Play className="mr-2 h-5 w-5 fill-current" />
                WATCH DEMO
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image/Mockup */}
        <div className="mt-20 max-w-6xl mx-auto px-4 relative">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-2 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
            <img 
              src="https://picsum.photos/seed/wargame/1920/1080" 
              alt="TableForge Interface" 
              className="rounded-xl w-full object-cover aspect-video opacity-80 group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/50 cursor-pointer hover:scale-110 transition-transform">
                <Play className="h-8 w-8 fill-current ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white mb-1">50k+</p>
              <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Active Players</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">12</p>
              <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Game Systems</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">1M+</p>
              <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Battles Fought</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">99.9%</p>
              <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">ENGINEERED FOR VICTORY</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Every tool you need to manage your armies, coordinate with allies, and crush your enemies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Tactical VR Engine</h3>
              <p className="text-slate-400 leading-relaxed">Experience your favorite games in full 3D with our proprietary VR-first rendering engine.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Sword className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Army Builder</h3>
              <p className="text-slate-400 leading-relaxed">Create, validate, and manage your lists across multiple systems with real-time point tracking.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Global Matchmaking</h3>
              <p className="text-slate-400 leading-relaxed">Find opponents of your skill level instantly or host private sessions for your local gaming group.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-8">READY TO DEPLOY?</h2>
          <p className="text-xl text-slate-400 mb-12">Join the elite ranks of TableForge commanders today and redefine your tabletop experience.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="h-14 px-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
                CREATE FREE ACCOUNT
              </Button>
            </Link>
            <Link to="/waitlist">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg font-bold text-slate-400 hover:text-white">
                LEARN MORE
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">T</div>
              <span className="text-xl font-bold text-white tracking-tighter">TableForge</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
            <p className="text-sm text-slate-600">© 2026 TableForge Systems. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
