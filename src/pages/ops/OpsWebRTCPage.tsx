import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { probeIceConnectivity } from '@/lib/webrtc/iceProbe';
import { livekitEnabled, telepresenceSfuMinPlayers } from '@/lib/webrtc/livekitConfig';

export default function OpsWebRTCPage() {
  const [iceResult, setIceResult] = useState<string>('—');
  const [diag, setDiag] = useState<string>('—');
  const [running, setRunning] = useState(false);

  const runProbe = async () => {
    setRunning(true);
    try {
      const [probe, diagRes] = await Promise.all([
        probeIceConnectivity(),
        fetch('/api/webrtc/diagnostics').then((r) => r.json()),
      ]);
      setIceResult(JSON.stringify(probe, null, 2));
      setDiag(JSON.stringify(diagRes, null, 2));
    } catch (e) {
      setIceResult(e instanceof Error ? e.message : 'Probe failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">TableForge · WebRTC Ops</h1>
          <Link to="/ops/telepresence">
            <Button variant="outline">Telepresence Lab</Button>
          </Link>
        </div>

        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>ICE / TURN probe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              Tests STUN/TURN from <code className="text-amber-400">/api/webrtc/ice-servers</code>.
              Relay candidates indicate TURN success (critical behind carrier-grade NAT).
            </p>
            <Button onClick={runProbe} disabled={running}>
              {running ? 'Probing…' : 'Run ICE probe'}
            </Button>
            <pre className="text-xs bg-slate-950 p-4 rounded-lg overflow-auto border border-slate-800">
              {iceResult}
            </pre>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle>Server diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-slate-950 p-4 rounded-lg overflow-auto border border-slate-800">
              {diag}
            </pre>
          </CardContent>
        </Card>

        <p className="text-xs text-slate-500">
          LiveKit: {livekitEnabled ? 'configured' : 'not configured'} · SFU threshold:{' '}
          {telepresenceSfuMinPlayers} players
        </p>
      </div>
    </div>
  );
}
