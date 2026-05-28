import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GameRoomProvider } from '@/components/multiplayer/GameRoomProvider';
import { useTelepresence } from '@/contexts/TelepresenceContext';
import { useOthers } from '@liveblocks/react';
import { liveblocksEnabled } from '@/lib/liveblocks/client';
import { livekitEnabled, telepresenceSfuMinPlayers } from '@/lib/webrtc/livekitConfig';

function LabInner({ roomId }: { roomId: string }) {
  const tp = useTelepresence();
  const others = useOthers();
  const count = 1 + others.length;

  return (
    <Card className="bg-slate-900/80 border-slate-700">
      <CardHeader>
        <CardTitle>Room: {roomId}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          Participants: <strong>{count}</strong> · Mode:{' '}
          <span className="text-amber-400 uppercase">{tp.mode}</span>
          {count >= telepresenceSfuMinPlayers && livekitEnabled && (
            <span className="text-emerald-400"> (SFU expected)</span>
          )}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant={tp.isVideoEnabled ? 'default' : 'outline'} onClick={tp.toggleVideo}>
            Video
          </Button>
          <Button size="sm" variant={tp.isAudioEnabled ? 'default' : 'outline'} onClick={tp.toggleAudio}>
            Audio
          </Button>
        </div>
        <p className="text-slate-400">
          Open this page in 6+ browser tabs with the same room ID to validate LiveKit SFU switching.
        </p>
      </CardContent>
    </Card>
  );
}

export default function OpsTelepresenceLabPage() {
  const [roomId, setRoomId] = useState('lab-6p');
  const [livekitStatus, setLivekitStatus] = useState('—');

  useEffect(() => {
    fetch('/api/livekit/status')
      .then((r) => r.json())
      .then((j) => setLivekitStatus(JSON.stringify(j, null, 2)))
      .catch(() => setLivekitStatus('API unreachable'));
  }, []);

  if (!liveblocksEnabled) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <p>Liveblocks not configured. Set VITE_LIVEBLOCKS_PUBLIC_KEY.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Telepresence Lab</h1>
          <Link to="/ops/webrtc">
            <Button variant="outline">WebRTC Ops</Button>
          </Link>
        </div>

        <div className="space-y-2">
          <Label>Room ID (share across tabs)</Label>
          <Input value={roomId} onChange={(e) => setRoomId(e.target.value)} className="bg-slate-900" />
        </div>

        <GameRoomProvider roomId={`tableforge-lab-${roomId}`}>
          <LabInner roomId={roomId} />
        </GameRoomProvider>

        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>LiveKit server</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">{livekitStatus}</pre>
            <p className="text-xs text-slate-500 mt-2">
              CLI: <code>node scripts/livekit/smoke-test.mjs</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
