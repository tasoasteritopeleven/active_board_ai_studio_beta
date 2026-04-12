import { Dice5 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  return (
    <Button 
      size="lg" 
      onClick={onClick}
      disabled={disabled}
      className={`bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20 transition-all active:scale-95 ${className}`}
    >
      <Dice5 className="h-5 w-5 mr-2" />
      {label}
    </Button>
  );
}
