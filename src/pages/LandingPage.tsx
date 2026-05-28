import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Shield, 
  Medal, 
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
              <span className="text-[17px] font-bold text-white tracking-tighter">TableForge</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Δυνατότητες</a>
              <a href="#games" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Παιχνίδια</a>
              <Link to="/waitlist" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Λίστα Αναμονής</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-400 hover:text-white">Σύνδεση</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
                  Εγγραφή
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full -z-20 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/80 z-10"></div>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-50 mix-blend-screen"
            src="https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
          />
        </div>

        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[15px] font-medium mb-8 animate-fade-in">
            <Zap className="h-4 w-4" />
            Επιτραπέζιο Gaming Νέας Γενιάς
          </div>
          <h1 className="text-[19px] md:text-[23px] font-extrabold text-white tracking-tighter leading-[1.1] mb-8">
            ΠΑΙΞΤΕ ΠΑΝΤΟΥ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-purple-500">ΜΑΖΙ</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Η απόλυτη πλατφόρμα απομακρυσμένου επιτραπέζιου gaming. Παίξτε τα αγαπημένα σας επιτραπέζια με οποιονδήποτε, οπουδήποτε, σε μια εκπληκτική 3D εμπειρία.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="h-[35px] px-[17px] text-[14px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/40 group">
                ΕΝΑΡΞΗ ΠΑΙΧΝΙΔΙΟΥ
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/games/risk">
              <Button size="lg" variant="outline" className="h-[35px] px-[17px] text-[14px] font-bold border-slate-700 text-slate-300 hover:bg-slate-800">
                <Play className="mr-2 h-5 w-5 fill-current" />
                ΔΕΙΤΕ ΤΟ DEMO
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image/Mockup */}
        <div className="mt-20 max-w-6xl mx-auto px-4 relative">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-2 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none"></div>
            <motion.img 
              animate={{ 
                scale: [1, 1.05, 1],
                objectPosition: ['50% 50%', '55% 50%', '50% 50%']
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              src="https://picsum.photos/seed/boardgame/1920/1080" 
              alt="TableForge Interface" 
              className="rounded-xl w-full object-cover aspect-video opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/50 cursor-pointer pointer-events-auto hover:scale-110 transition-transform">
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
              <p className="text-[17px] font-bold text-white mb-1">50k+</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Ενεργοι Παικτες</p>
            </div>
            <div>
              <p className="text-[17px] font-bold text-white mb-1">12</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Συστηματα Παιχνιδιων</p>
            </div>
            <div>
              <p className="text-[17px] font-bold text-white mb-1">1M+</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Παιχνιδια Που Ολοκληρωθηκαν</p>
            </div>
            <div>
              <p className="text-[17px] font-bold text-white mb-1">99.9%</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Διαθεσιμοτητα</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-[17px] md:text-[19px] font-bold text-white tracking-tight mb-4">ΦΤΙΑΓΜΕΝΟ ΓΙΑ ΠΑΙΚΤΕΣ</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">Όλα τα εργαλεία που χρειάζεστε για να διαχειριστείτε τις συνεδρίες σας, να συντονιστείτε με φίλους και να απολαύσετε τα αγαπημένα σας παιχνίδια.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-3">Μηχανή Τακτικής VR</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Ζήστε τα αγαπημένα σας παιχνίδια σε πλήρες 3D με την αποκλειστική VR-πρώτα μηχανή απόδοσής μας.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Medal className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-3">Διαχείριση Συλλογής</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Δημιουργήστε, επικυρώστε και διαχειριστείτε τις λίστες κομματιών, καρτών ή ηρώων σας με αυτόματο υπολογισμό αξίας.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-3">Παγκόσμιο Matchmaking</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Βρείτε άμεσα αντιπάλους με τις ίδιες ικανότητες ή οργανώστε ιδιωτικές συνεδρίες για την τοπική σας παρέα.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-[15px] md:text-[17px] font-bold text-white tracking-tighter mb-8">ΕΤΟΙΜΟΙ ΝΑ ΠΑΙΞΕΤΕ;</h2>
          <p className="text-base text-slate-400 mb-12">Εγγραφείτε στην ενεργή κοινότητα παικτών του TableForge σήμερα και επαναπροσδιορίστε την εμπειρία των επιτραπέζιων παιχνιδιών σας.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="h-[35px] px-[31px] text-[14px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
                ΔΗΜΙΟΥΡΓΙΑ ΔΩΡΕΑΝ ΛΟΓΑΡΙΑΣΜΟΥ
              </Button>
            </Link>
            <Link to="/waitlist">
              <Button size="lg" variant="ghost" className="h-[35px] px-[17px] text-[14px] font-bold text-slate-400 hover:text-white">
                ΜΑΘΕΤΕ ΠΕΡΙΣΣΟΤΕΡΑ
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
              <span className="text-[17px] font-bold text-white tracking-tighter">TableForge</span>
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
