import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Mail, ArrowRight, CheckCircle2, Loader2, Sparkles, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WaitlistPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <div className="w-full max-w-2xl text-center space-y-8 mb-12">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Gamepad2 className="h-7 w-7" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">TableForge</span>
          </Link>
        </div>
        
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Early Access Phase 1
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Wargaming</span> is Coming
          </h1>
          <p className="text-xl text-slate-400 max-w-lg mx-auto">
            Join 5,000+ commanders waiting for the ultimate VR-first remote wargaming experience.
          </p>
        </div>
      </div>

      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Secure Your Spot</CardTitle>
          <CardDescription className="text-slate-400">
            Be the first to know when we launch and get exclusive founder rewards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  type="email"
                  placeholder="commander@tableforge.com"
                  className="pl-10 h-12 bg-slate-950/50 border-slate-800 text-white focus:ring-primary/50 text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Join Waitlist
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-slate-500">
                By joining, you agree to our Terms and Privacy Policy.
              </p>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">You're on the list!</h3>
                <p className="text-slate-400">
                  We've sent a confirmation to <span className="text-primary font-medium">{email}</span>.
                </p>
              </div>
              <Button variant="outline" className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setIsSubmitted(false)}>
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-12 flex items-center gap-8 text-slate-500 grayscale opacity-50">
        {/* Placeholder for partner logos */}
        <div className="font-bold text-xl tracking-tighter">WARHAMMER</div>
        <div className="font-bold text-xl tracking-tighter">BATTLEFIELD</div>
        <div className="font-bold text-xl tracking-tighter">CITADEL</div>
      </div>
    </div>
  );
}
