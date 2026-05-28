import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TableForgeProviders } from '@/providers/TableForgeProviders';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const WaitlistPage = lazy(() => import('@/pages/WaitlistPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const GameRoomPage = lazy(() => import('@/pages/GameRoomPage'));
const ArmyBuilderPage = lazy(() => import('@/pages/ArmyBuilderPage'));
const VenueDashboardPage = lazy(() => import('@/pages/VenueDashboardPage'));
const GamesSelectionPage = lazy(() => import('@/pages/GamesSelectionPage'));
const MonopolyGamePage = lazy(() => import('@/games/monopoly/MonopolyGamePage'));
const CatanGamePage = lazy(() => import('@/games/catan/CatanGamePage'));
const CodenamesGamePage = lazy(() => import('@/games/codenames/CodenamesGamePage'));
const RiskGamePage = lazy(() => import('@/games/risk/RiskGamePage'));
const PlayerDashboardPage = lazy(() => import('@/pages/PlayerDashboardPage'));
const GameLobbyPage = lazy(() => import('@/pages/GameLobbyPage'));
const OpsWebRTCPage = lazy(() => import('@/pages/ops/OpsWebRTCPage'));
const OpsTelepresenceLabPage = lazy(() => import('@/pages/ops/OpsTelepresenceLabPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-primary font-bold uppercase tracking-[0.3em] text-sm animate-pulse">
        TableForge
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TableForgeProviders>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/game/:roomCode" element={<GameRoomPage />} />
            <Route path="/lobby/:roomCode" element={<GameLobbyPage />} />
            <Route path="/army-builder" element={<ArmyBuilderPage />} />
            <Route path="/venue" element={<VenueDashboardPage />} />
            <Route path="/games" element={<GamesSelectionPage />} />
            <Route path="/games/monopoly" element={<MonopolyGamePage />} />
            <Route path="/games/catan" element={<CatanGamePage />} />
            <Route path="/games/codenames" element={<CodenamesGamePage />} />
            <Route path="/games/risk" element={<RiskGamePage />} />
            <Route path="/ops/webrtc" element={<OpsWebRTCPage />} />
            <Route path="/ops/telepresence" element={<OpsTelepresenceLabPage />} />
            <Route path="/player" element={<PlayerDashboardPage />} />
          </Routes>
        </Suspense>
        <Toaster />
      </TableForgeProviders>
    </BrowserRouter>
  );
}
