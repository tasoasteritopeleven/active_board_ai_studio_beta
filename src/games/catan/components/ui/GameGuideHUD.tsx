import React, { useState, useEffect, useRef } from 'react';
import { useCatanStore } from '../../store/catanStore';
import { LifecyclePhase } from '../../domain/types';
import { X, Info } from 'lucide-react';
import { toast } from 'sonner';

export function GameGuideHUD() {
  const { phase, activePlayerId, players, buildMode } = useCatanStore();
  const [isVisible, setIsVisible] = useState(true);
  const prevPlayerIdRef = useRef<string | null>(null);

  // We primarily want to guide the local player (p1).
  // If it is another player's turn, we just say "Waiting for X".
  
  const isLocalTurn = activePlayerId === 'p1';
  const activePlayer = players[activePlayerId];

  // Auto-reappear effect
  useEffect(() => {
    let timeoutId: number;
    if (!isVisible && isLocalTurn) {
      // Re-appear after 5 seconds of inactivity so the player doesn't forget
      timeoutId = window.setTimeout(() => {
        setIsVisible(true);
      }, 5000);
    }
    
    // Auto-show when phase or buildMode changes if it's the player's turn
    if (isLocalTurn) {
      setIsVisible(true);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isVisible, isLocalTurn, phase, buildMode]);

  useEffect(() => {
    // Simulate an async push notification when the turn flips back to the local player
    if (activePlayerId === 'p1' && prevPlayerIdRef.current && prevPlayerIdRef.current !== 'p1') {
      toast("📱 Push Notification: It's your turn in Catan!", {
        description: "In an async game, this would ping your phone.",
        position: 'top-center'
      });
    }
    prevPlayerIdRef.current = activePlayerId;
  }, [activePlayerId]);
  
  if (!activePlayer) return null;

  let hintText = '';
  let ruleLink = '';
  
  if (!isLocalTurn) {
    hintText = `Waiting for ${activePlayer.name} to play...`;
  } else {
    switch (phase) {
      case LifecyclePhase.SETUP_1:
      case LifecyclePhase.SETUP_2:
        hintText = "Place your starting settlement on an intersection, then place a road.";
        ruleLink = "setup";
        break;
      case LifecyclePhase.ROLLING:
        hintText = "It's your turn! Roll the dice.";
        ruleLink = "turn-flow";
        break;
      case LifecyclePhase.ROBBER_DISCARD:
        hintText = "A 7 was rolled! You must discard half your cards.";
        ruleLink = "robber";
        break;
      case LifecyclePhase.ROBBER_MOVE:
        hintText = "Move the robber to a new hex to block it and steal a card.";
        ruleLink = "robber";
        break;
      case LifecyclePhase.TRADING_BUILDING:
        if (buildMode === 'SETTLEMENT') {
          hintText = "Select a valid intersection to build your settlement.";
          ruleLink = "building";
        } else if (buildMode === 'ROAD') {
          hintText = "Select a valid edge to build your road.";
          ruleLink = "building";
        } else if (buildMode === 'CITY') {
          hintText = "Select one of your existing settlements to upgrade to a city.";
          ruleLink = "building";
        } else {
          hintText = "Trade, build, or play development cards. End your turn when finished.";
          ruleLink = "main-phase";
        }
        break;
      default:
        hintText = "Watch the game unfold.";
    }
  }

  return (
    <>
      <div className="absolute top-20 right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
        {!isVisible && (
          <button 
            onClick={() => setIsVisible(true)}
            className="pointer-events-auto bg-slate-800/80 hover:bg-slate-700/80 text-white backdrop-blur-md rounded-full px-4 py-2 text-sm shadow-xl border border-slate-600/50 flex items-center gap-2 transition-all"
          >
            <Info className="w-4 h-4 text-blue-400" />
            Show Guide
          </button>
        )}
        
        {isVisible && (
          <div className="pointer-events-auto bg-slate-800/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl rounded-xl p-4 w-64 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLocalTurn ? 'bg-blue-400 animate-pulse' : 'bg-slate-500'}`} />
                <h3 className="font-semibold text-sm text-slate-200">
                  {isLocalTurn ? "Your Turn" : "Game State"}
                </h3>
              </div>
              <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              {hintText}
            </p>
            {isLocalTurn && ruleLink && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`In a full implementation, this will open the specific rulebook page for: ${ruleLink}`);
                }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded w-fit"
              >
                <Info className="w-3 h-3" />
                Read Rules
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
