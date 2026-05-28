import { useCallback, useEffect, useState } from 'react';
import { Glasses, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  enterTableForgeVR,
  exitTableForgeXR,
  isWebXRSupported,
  tableForgeXRStore,
} from '@/xr/tableForgeXR';

interface VRSessionControlsProps {
  className?: string;
  compact?: boolean;
}

export function VRSessionControls({ className = '', compact = false }: VRSessionControlsProps) {
  const [supported, setSupported] = useState(false);
  const [inSession, setInSession] = useState(false);

  useEffect(() => {
    setSupported(isWebXRSupported());
    const unsub = tableForgeXRStore.subscribe((state) => {
      setInSession(!!state.session);
    });
    return unsub;
  }, []);

  const handleToggle = useCallback(async () => {
    if (inSession) {
      exitTableForgeXR();
      return;
    }
    try {
      const session = await enterTableForgeVR();
      if (!session) {
        toast.error('Δεν ήταν δυνατή η είσοδος σε VR. Δοκιμάστε Chrome/Edge με συμβατό headset.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Σφάλμα WebXR — ελέγξτε ότι το headset είναι συνδεδεμένο.');
    }
  }, [inSession]);

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? 'sm' : 'default'}
      onClick={handleToggle}
      className={`border-primary/30 bg-slate-900/80 text-primary hover:bg-primary/10 ${className}`}
      title={inSession ? 'Έξοδος VR' : 'Είσοδος VR'}
    >
      {inSession ? (
        <>
          <Monitor className="h-4 w-4 mr-2" />
          {!compact && 'Έξοδος VR'}
        </>
      ) : (
        <>
          <Glasses className="h-4 w-4 mr-2" />
          {!compact && 'Είσοδος VR'}
        </>
      )}
    </Button>
  );
}
