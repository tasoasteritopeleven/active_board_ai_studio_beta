import { Dice5, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface DiceRollButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function DiceRollButton({ 
  onClick, 
  disabled = false, 
  label = "ROLL DICE",
  className = ""
}: DiceRollButtonProps) {
  const [isRolling, setIsRolling] = useState(false);

  const handleClick = () => {
    setIsRolling(true);
    
    // Play sound effect
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // Slide up
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch(e) {
      console.log('Audio not supported or blocked');
    }

    onClick();
    setTimeout(() => setIsRolling(false), 500);
  };

  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`relative ${disabled ? 'opacity-50 grayscale' : ''}`}
    >
      <AnimatePresence>
        {!disabled && isRolling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{ opacity: 1, scale: 1.5, rotate: 180 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-0"
          >
            <div className="w-full h-full bg-primary/20 rounded-full blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        size="lg" 
        onClick={handleClick}
        disabled={disabled}
        className={`relative z-10 w-full h-14 bg-white hover:bg-slate-100 text-slate-950 font-semibold text-[10px] tracking-[0.3em] uppercase border-none shadow-xl transition-all ${className}`}
      >
        <motion.div
          animate={isRolling ? { rotate: [0, -20, 20, -20, 0] } : {}}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Dice5 className="h-6 w-6 mr-3" />
        </motion.div>
        {label}
        {isRolling && (
          <span className="absolute right-4">
            <Sparkles className="h-5 w-5 animate-pulse text-yellow-300" />
          </span>
        )}
      </Button>
    </motion.div>
  );
}
