import { ReactNode } from 'react';
import { LiveblocksProvider } from '@liveblocks/react';
import { liveblocksEnabled, liveblocksPublicKey } from '@/lib/liveblocks/client';
import { AuthProvider } from '@/contexts/AuthContext';

interface TableForgeProvidersProps {
  children: ReactNode;
}

export function TableForgeProviders({ children }: TableForgeProvidersProps) {
  if (!liveblocksEnabled || !liveblocksPublicKey) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <LiveblocksProvider publicApiKey={liveblocksPublicKey}>
      <AuthProvider>{children}</AuthProvider>
    </LiveblocksProvider>
  );
}
