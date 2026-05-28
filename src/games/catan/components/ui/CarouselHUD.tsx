import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCatanStore } from "../../store/catanStore";
import { ResourceType, LifecyclePhase } from "../../domain/types";
import {
  ChevronUp,
  ChevronDown,
  Hammer,
  ArrowRightLeft,
  Scroll,
  BarChart3,
  Package,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CARDS = [
  { id: "resources", title: "Πόροι", icon: Package },
  { id: "build", title: "Χτίσιμο", icon: Hammer },
  { id: "trade_bank", title: "Ανταλλαγή 4:1", icon: ArrowRightLeft },
  { id: "trade_player", title: "Πρόταση Ανταλλαγής", icon: ArrowRightLeft },
  { id: "dev_cards", title: "Κάρτες Ανάπτυξης", icon: Scroll },
  { id: "stats", title: "Στατιστικά", icon: BarChart3 },
];

export function CarouselHUD() {
  const {
    uiState,
    setCarouselIndex,
    toggleCarousel,
    players,
    activePlayerId,
    phase,
    robberMode,
    pendingRobberHexId,
    confirmRobberMove,
    vertices,
  } = useCatanStore();
  const activePlayer = players[activePlayerId];
  const constraintsRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!uiState.isCarouselOpen) {
      setIsExpanded(false);
    }
  }, [uiState.isCarouselOpen]);

  const handleDragEnd = (e: any, info: any) => {
    const swipeThreshold = 50;
    if (
      info.offset.x < -swipeThreshold &&
      uiState.activeCarouselIndex < CARDS.length - 1
    ) {
      setCarouselIndex(uiState.activeCarouselIndex + 1);
    } else if (
      info.offset.x > swipeThreshold &&
      uiState.activeCarouselIndex > 0
    ) {
      setCarouselIndex(uiState.activeCarouselIndex - 1);
    }
  };

  // If robber mode is active, override the HUD with Robber UI
  if (robberMode) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-50 p-4 pb-8 pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md mx-auto pointer-events-auto"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border-t-4 border-red-500 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                <div className="w-8 h-10 bg-slate-900 rounded-t-full relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rounded-full"></div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 border-2 border-red-500 rounded-full"
                />
              </div>

              {!pendingRobberHexId ? (
                <>
                  <h3 className="text-2xl font-black text-white">
                    Μετακίνησε τον Ληστή!
                  </h3>
                  <p className="text-slate-400">
                    Επίλεξε ένα νέο εξάγωνο για να τον τοποθετήσεις.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-white">
                    Κλοπή Πόρου
                  </h3>
                  <p className="text-slate-400">
                    Επίλεξε παίκτη για να κλέψεις.
                  </p>

                  <div className="flex flex-col gap-2 mt-4 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {/* Find adjacent players to the pending hex */}
                    {(() => {
                      const adjacentPlayers = new Set<string>();
                      Object.values(vertices).forEach((v) => {
                        if (v.building && v.id.includes(pendingRobberHexId)) {
                          if (v.building.ownerId !== activePlayerId) {
                            adjacentPlayers.add(v.building.ownerId);
                          }
                        }
                      });

                      const victims = Array.from(adjacentPlayers);

                      if (victims.length === 0) {
                        return (
                          <Button
                            className="w-full h-12 text-lg font-bold bg-amber-600 hover:bg-amber-700 text-white border-none"
                            onClick={() => confirmRobberMove()}
                          >
                            Ασφαλής Περιοχή (Τοποθέτηση)
                          </Button>
                        );
                      }

                      return victims.map((vid) => (
                        <Button
                          key={vid}
                          className="w-full h-12 text-lg font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-red-100 hover:border-red-500 transition-colors"
                          onClick={() => confirmRobberMove(vid)}
                        >
                          Κλέψε από τον/την {players[vid].name}
                        </Button>
                      ));
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeCard = CARDS[uiState.activeCarouselIndex];

  return (
    <>
      {/* Floating Toggle Button (Central Button) - Absolute relative to the page bottom */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-[70] pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
        style={{
          bottom: uiState.isCarouselOpen
            ? isExpanded
              ? "calc(80vh + 1.5rem)"
              : "calc(max(40vh, 320px) + 1.5rem)"
            : "125px",
        }}
        onPanEnd={(e, info) => {
          if (info.offset.y < -30) {
            if (!uiState.isCarouselOpen) {
              toggleCarousel();
            } else if (!isExpanded) {
              setIsExpanded(true);
            }
          }
          if (info.offset.y > 30) {
            if (isExpanded) {
              setIsExpanded(false);
            } else if (uiState.isCarouselOpen) {
              toggleCarousel();
            }
          }
        }}
      >
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-slate-900/70 backdrop-blur-md hover:bg-slate-800/90 border-2 border-white/20 text-white w-14 h-14 cursor-pointer shadow-lg shadow-black/50"
          onClick={(e) => {
            e.stopPropagation();
            toggleCarousel();
          }}
        >
          {uiState.isCarouselOpen ? (
            <ChevronDown size={28} />
          ) : (
            <ChevronUp size={28} />
          )}
        </Button>
      </motion.div>

      {/* Carousel Container */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none flex flex-col items-center">
        <AnimatePresence>
          {uiState.isCarouselOpen && (
            <motion.div
              initial={{ y: "100%", opacity: 0, height: "40vh" }}
              animate={{
                y: 0,
                opacity: 1,
                height: isExpanded ? "80vh" : "40vh",
              }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md pointer-events-auto bg-slate-900/60 backdrop-blur-xl border-t border-x border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
              style={{
                minHeight: isExpanded ? "auto" : "320px",
                paddingBottom: "0",
                borderTopLeftRadius: "2rem",
                borderTopRightRadius: "2rem",
              }}
            >
              {/* Pull-down Handle */}
              <motion.div
                className="w-full flex justify-center pt-4 pb-2 cursor-ns-resize"
                onPanEnd={(e, info) => {
                  if (info.offset.y > 30) {
                    if (isExpanded) {
                      setIsExpanded(false);
                    } else {
                      toggleCarousel();
                    }
                  } else if (info.offset.y < -30) {
                    if (!isExpanded) {
                      setIsExpanded(true);
                    }
                  }
                }}
                onClick={() => {
                  if (isExpanded) {
                    setIsExpanded(false);
                  } else {
                    setIsExpanded(true);
                  }
                }}
              >
                <div className="w-12 h-1.5 bg-slate-600 hover:bg-slate-500 rounded-full transition-colors pointer-events-none" />
              </motion.div>

              {/* Header / Navigation Dots */}
              <div className="flex flex-col px-6 pb-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
                      <activeCard.icon className="w-5 h-5 text-primary drop-shadow-sm" />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">
                      {activeCard.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="w-10 h-10 rounded-full bg-black/30 text-white hover:bg-black/50 border border-transparent hover:border-white/20 transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleCarousel}
                      className="w-10 h-10 rounded-full bg-red-900/40 text-red-100 hover:bg-red-900/60 border border-transparent hover:border-red-500/30 transition-colors"
                    >
                      <X size={22} />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between gap-1 w-full mt-1">
                  {CARDS.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className="flex-1 py-3 group focus:outline-none"
                      aria-label={`Go to ${card.title}`}
                    >
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === uiState.activeCarouselIndex ? "bg-primary" : "bg-white/20 group-hover:bg-white/40"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Swipeable Content Area */}
              <motion.div
                ref={constraintsRef}
                className="flex-1 relative overflow-hidden"
              >
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 w-full h-full p-4 md:p-6"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={uiState.activeCarouselIndex}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="w-full h-full"
                    >
                      {/* Card Content Switcher */}
                      {uiState.activeCarouselIndex === 0 && (
                        <ResourcesCard player={activePlayer} />
                      )}
                      {uiState.activeCarouselIndex === 1 && (
                        <BuildCard phase={phase} />
                      )}
                      {uiState.activeCarouselIndex === 2 && (
                        <BankTradeCard player={activePlayer} phase={phase} />
                      )}
                      {uiState.activeCarouselIndex === 3 && <PlayerTradeCard />}
                      {uiState.activeCarouselIndex === 4 && (
                        <DevCardsCard player={activePlayer} />
                      )}
                      {uiState.activeCarouselIndex === 5 && (
                        <StatsCard player={activePlayer} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// --- Card Components ---

function ResourcesCard({ player }: { player: any }) {
  const res = [
    {
      id: "WOOD",
      name: "Ξύλο",
      count: player.resources.WOOD || 0,
      color: "bg-green-600",
      ring: "ring-green-500/50",
    },
    {
      id: "BRICK",
      name: "Τούβλο",
      count: player.resources.BRICK || 0,
      color: "bg-orange-600",
      ring: "ring-orange-500/50",
    },
    {
      id: "SHEEP",
      name: "Πρόβατο",
      count: player.resources.SHEEP || 0,
      color: "bg-lime-500",
      ring: "ring-lime-500/50",
    },
    {
      id: "WHEAT",
      name: "Σιτάρι",
      count: player.resources.WHEAT || 0,
      color: "bg-yellow-500",
      ring: "ring-yellow-500/50",
    },
    {
      id: "ORE",
      name: "Μετάλ",
      count: player.resources.ORE || 0,
      color: "bg-slate-500",
      ring: "ring-slate-400/50",
    },
  ];

  const totalResources = Object.values(player.resources).reduce(
    (a: any, b: any) => a + b,
    0,
  ) as number;
  const isOverLimit = totalResources > 7;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50">
        <span className="text-slate-300 font-bold text-sm">
          Σύνολο Πόρων (Όριο: 7):
        </span>
        <div
          className={`flex items-center gap-2 font-black text-lg ${isOverLimit ? "text-red-400" : "text-primary"}`}
        >
          {isOverLimit && (
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          )}
          <span>{totalResources}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-1 content-start">
        {res.map((r) => (
          <div
            key={r.name}
            className="flex flex-col items-center bg-black/20 rounded-xl p-2 border border-white/5 shadow-sm backdrop-blur-sm"
          >
            <div
              className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center shadow-inner ring-1 ring-offset-1 ring-offset-black/20 ${r.ring}`}
            >
              <span className="text-white font-bold text-base drop-shadow-sm">
                {r.count}
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-widest drop-shadow-sm">
              {r.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuildCard({ phase }: { phase: LifecyclePhase }) {
  const canBuild =
    phase === LifecyclePhase.TRADING_BUILDING ||
    phase === LifecyclePhase.SETUP_1 ||
    phase === LifecyclePhase.SETUP_2;
  const isSetup =
    phase === LifecyclePhase.SETUP_1 || phase === LifecyclePhase.SETUP_2;

  const {
    buildMode,
    setBuildMode,
    pendingBuild,
    confirmBuild,
    players,
    activePlayerId,
  } = useCatanStore();
  const player = players[activePlayerId];

  // In Setup phase, building costs 0. In Trading/Building phase, it costs resources.
  const hasSettlementRes =
    isSetup ||
    ((player.resources.WOOD || 0) >= 1 &&
      (player.resources.BRICK || 0) >= 1 &&
      (player.resources.SHEEP || 0) >= 1 &&
      (player.resources.WHEAT || 0) >= 1);
  const hasRoadRes =
    isSetup ||
    ((player.resources.WOOD || 0) >= 1 && (player.resources.BRICK || 0) >= 1);
  const hasCityRes =
    !isSetup &&
    (player.resources.WHEAT || 0) >= 2 &&
    (player.resources.ORE || 0) >= 3;

  if (!canBuild) {
    let msg = "Δεν μπορείς να χτίσεις τώρα!";
    if (phase === LifecyclePhase.ROLLING)
      msg = "Πρέπει πρώτα να ρίξεις τα ζάρια!";
    if (buildMode) setBuildMode(null); // Safety cleanup
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-75">
        <Hammer className="w-12 h-12 text-slate-500" />
        <p className="text-slate-400 font-bold">{msg}</p>
      </div>
    );
  }

  if (pendingBuild) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center relative shadow-[0_0_15px_rgba(251,146,60,0.5)]">
          <Hammer className="w-8 h-8 text-primary animate-bounce relative z-10" />
        </div>
        <div>
          <h4 className="text-white font-black text-xl mb-1">Επιβεβαίωση</h4>
          <p className="text-slate-400 text-sm">
            Να τοποθετηθεί εδώ το κτίσμα σου;
          </p>
        </div>
        <div className="flex gap-3 w-full max-w-xs mx-auto">
          <Button
            variant="outline"
            className="flex-1 h-14 text-lg font-bold border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => setBuildMode(null)}
          >
            Ακύρωση
          </Button>
          <Button
            className="flex-1 h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg"
            onClick={confirmBuild}
          >
            ΟΚ
          </Button>
        </div>
      </div>
    );
  }

  if (buildMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Hammer className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div>
          <h4 className="text-white font-black text-xl mb-2">
            Επιλογή Τοποθεσίας
          </h4>
          <p className="text-slate-400 text-sm max-w-[250px] mx-auto leading-relaxed">
            Το ταμπλό έχει φωτιστεί! Πάτησε σε ένα από τα διαθέσιμα σημεία για
            να τοποθετήσεις το κτίσμα σου.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full max-w-xs h-12 text-lg font-bold border-slate-700/80 text-red-300 hover:bg-red-950/30 hover:border-red-900"
          onClick={() => setBuildMode(null)}
        >
          Ακύρωση Τοποθέτησης
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full justify-start overflow-y-auto custom-scrollbar pr-1 pb-1">
      {isSetup && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center mb-1">
          <span className="text-primary font-bold text-sm tracking-tight inline-flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            ΦΑΣΗ ΤΟΠΟΘΕΤΗΣΗΣ: ΔΩΡΕΑΝ ΚΤΙΣΜΑΤΑ
          </span>
        </div>
      )}

      <Button
        disabled={!canBuild || !hasRoadRes}
        onClick={() => setBuildMode("ROAD")}
        className="group h-[4.5rem] w-full text-left font-bold justify-start px-0 bg-black/40 hover:bg-black/60 border border-white/10 transition-all rounded-xl overflow-hidden disabled:opacity-50 backdrop-blur-sm shadow-md"
      >
        <div className="flex items-center h-full w-full">
          <div className="w-16 h-full bg-orange-600/30 group-hover:bg-orange-600/50 flex items-center justify-center transition-colors border-r border-white/10">
            <span className="text-xl font-black text-white px-2 drop-shadow-md">Δ</span>
          </div>
          <div className="flex flex-col flex-1 pl-4 pr-3 justify-center">
            <span className="text-white text-lg leading-tight uppercase tracking-tight drop-shadow-md">
              Χτίσε Δρόμο
            </span>
            <span className="text-[11px] text-orange-200 font-semibold mt-0.5 tracking-wider drop-shadow-sm">
              {isSetup ? "ΔΩΡΕΑΝ" : "1 ΞΥΛΟ, 1 ΤΟΥΒΛΟ"}
            </span>
          </div>
        </div>
      </Button>

      <Button
        disabled={!canBuild || !hasSettlementRes}
        onClick={() => setBuildMode("SETTLEMENT")}
        className="group h-[4.5rem] w-full text-left font-bold justify-start px-0 bg-black/40 hover:bg-black/60 border border-white/10 transition-all rounded-xl overflow-hidden disabled:opacity-50 backdrop-blur-sm shadow-md"
      >
        <div className="flex items-center h-full w-full">
          <div className="w-16 h-full bg-blue-600/30 group-hover:bg-blue-600/50 flex items-center justify-center transition-colors border-r border-white/10">
            <span className="text-xl font-black text-white px-2 drop-shadow-md">Ο</span>
          </div>
          <div className="flex flex-col flex-1 pl-4 pr-3 justify-center">
            <span className="text-white text-lg leading-tight uppercase tracking-tight drop-shadow-md">
              Χτίσε Οικισμό
            </span>
            <span className="text-[11px] text-blue-200 font-semibold mt-0.5 tracking-wider drop-shadow-sm">
              {isSetup ? "ΔΩΡΕΑΝ" : "1 Ξ, 1 Τ, 1 ΠΡ, 1 ΣΙΤ"}
            </span>
          </div>
        </div>
      </Button>

      {!isSetup && (
        <Button
          disabled={!hasCityRes}
          onClick={() => setBuildMode("CITY")}
          className="group h-[4.5rem] w-full text-left font-bold justify-start px-0 bg-black/40 hover:bg-black/60 border border-white/10 transition-all rounded-xl overflow-hidden disabled:opacity-50 backdrop-blur-sm shadow-md"
        >
          <div className="flex items-center h-full w-full">
            <div className="w-16 h-full bg-slate-400/30 group-hover:bg-slate-400/50 flex items-center justify-center transition-colors border-r border-white/10">
              <span className="text-xl font-black text-white px-2 drop-shadow-md">Π</span>
            </div>
            <div className="flex flex-col flex-1 pl-4 pr-3 justify-center">
              <span className="text-white text-lg leading-tight uppercase tracking-tight drop-shadow-md">
                Χτίσε Πόλη
              </span>
              <span className="text-[11px] text-slate-300 font-semibold mt-0.5 tracking-wider drop-shadow-sm">
                2 ΣΙΤΑΡΙ, 3 ΜΕΤΑΛΛΕΥΜΑ
              </span>
            </div>
          </div>
        </Button>
      )}
    </div>
  );
}

function BankTradeCard({
  player,
  phase,
}: {
  player: any;
  phase: LifecyclePhase;
}) {
  const { bankTrade } = useCatanStore();
  const [give, setGive] = useState<string | null>(null);
  const [get, setGet] = useState<string | null>(null);

  const resources = ["WOOD", "BRICK", "SHEEP", "WHEAT", "ORE"] as const;
  const colors: Record<string, string> = {
    WOOD: "bg-green-600",
    BRICK: "bg-orange-600",
    SHEEP: "bg-lime-500",
    WHEAT: "bg-yellow-500",
    ORE: "bg-slate-500",
  };
  const labels: Record<string, string> = {
    WOOD: "ΞΥΛ",
    BRICK: "ΤΟΥ",
    SHEEP: "ΠΡΟ",
    WHEAT: "ΣΙΤ",
    ORE: "ΜΕΤ",
  };

  const isTradingPhase = phase === LifecyclePhase.TRADING_BUILDING;
  const canTrade =
    give &&
    get &&
    give !== get &&
    (player.resources[give] || 0) >= 4 &&
    isTradingPhase;

  const handleTrade = () => {
    if (canTrade) {
      bankTrade(give as any, get as any);
      setGive(null);
      setGet(null);
    }
  };

  if (!isTradingPhase) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-75">
        <ArrowRightLeft className="w-12 h-12 text-slate-500" />
        <p className="text-slate-400 font-bold">
          Μπορείς να ανταλλάξεις μόνο
          <br />
          κατά τη φάση ανταλλαγών!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="px-1 text-center">
        <h4 className="text-white font-bold text-lg">Βασική Ανταλλαγή (4:1)</h4>
        <p className="text-xs text-slate-400">
          Δώσε 4 ίδιους πόρους για να πάρεις 1 της επιλογής σου.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 px-1 py-1">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-md">
          <p className="text-xs font-bold text-slate-300 mb-2 tracking-widest text-center drop-shadow-md">
            ΔΙΝΕΙΣ 4 x
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {resources.map((res) => (
              <button
                key={`give-${res}`}
                onClick={() => setGive(res)}
                className={`w-12 h-12 rounded-full ${colors[res]} flex items-center justify-center shadow-inner text-[10px] font-black text-white transition-all duration-200 drop-shadow-md ${give === res ? "ring-4 ring-white ring-offset-2 ring-offset-black/50 scale-110 z-10" : "opacity-70 hover:opacity-100"} ${(player.resources[res] || 0) < 4 ? "grayscale opacity-30 cursor-not-allowed" : ""}`}
                disabled={(player.resources[res] || 0) < 4}
              >
                {labels[res]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center -my-6 relative z-20">
          <div className="bg-black/80 backdrop-blur-md border hover:border-white/20 border-white/10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
            <ArrowRightLeft className="w-4 h-4 text-slate-100" />
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-md">
          <p className="text-xs font-bold text-slate-300 mb-2 tracking-widest text-center drop-shadow-md">
            ΠΑΙΡΝΕΙΣ 1 x
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {resources.map((res) => (
              <button
                key={`get-${res}`}
                onClick={() => setGet(res)}
                className={`w-12 h-12 rounded-full ${colors[res]} flex items-center justify-center shadow-inner text-[10px] font-black text-white transition-all duration-200 drop-shadow-md ${get === res ? "ring-4 ring-white ring-offset-2 ring-offset-black/50 scale-110 z-10" : "opacity-70 hover:opacity-100"} ${give === res ? "opacity-30 grayscale cursor-not-allowed hidden" : ""}`}
                disabled={give === res}
              >
                {labels[res]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        disabled={!canTrade}
        onClick={handleTrade}
        className="w-full h-12 text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-lg transition-all rounded-xl disabled:bg-slate-800 disabled:text-slate-500 uppercase tracking-wide flex-shrink-0"
      >
        Ολοκληρωση Ανταλλαγης
      </Button>
    </div>
  );
}

function PlayerTradeCard() {
  const {
    activeTrade,
    updateTradeDraft,
    proposeTrade,
    cancelTrade,
    executeTrade,
    players,
    activePlayerId,
    phase,
  } = useCatanStore();
  const activePlayer = players[activePlayerId];
  const isTradingPhase = phase === LifecyclePhase.TRADING_BUILDING;

  if (!isTradingPhase) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-75">
        <ArrowRightLeft className="w-12 h-12 text-slate-500" />
        <p className="text-slate-400 font-bold">
          Μπορείς να ανταλλάξεις μόνο
          <br />
          κατά τη φάση ανταλλαγών!
        </p>
      </div>
    );
  }

  // Initialize draft if none exists
  if (!activeTrade) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center ring-4 ring-slate-700 shadow-xl">
          <ArrowRightLeft className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h4 className="text-white font-black text-2xl mb-2">
            Ανταλλαγή Παίκτη
          </h4>
          <p className="text-slate-400 text-sm max-w-[260px] mx-auto leading-relaxed">
            Δημιούργησε μια πρόταση ανταλλαγής πόρων και στείλε τη στους
            αντιπάλους σου!
          </p>
        </div>
        <Button
          className="w-full max-w-xs h-14 text-lg font-bold text-white bg-primary hover:bg-primary/90 shadow-lg rounded-xl uppercase tracking-wider"
          onClick={() =>
            updateTradeDraft(
              { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 },
              { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 },
            )
          }
        >
          Νεα Προταση
        </Button>
      </div>
    );
  }

  if (activeTrade.status === "PROPOSED") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
          <ArrowRightLeft className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <div>
          <h4 className="text-white font-black text-2xl mb-2">
            Η Πρόταση Εστάλη
          </h4>
          <p className="text-slate-400 text-sm max-w-[260px] mx-auto leading-relaxed">
            Η πρόταση εστάλη επιτυχώς. Αναμονή απάντησης από τους άλλους
            παίκτες...
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full max-w-xs h-14 text-lg font-bold border-slate-700/80 text-red-300 hover:bg-red-950/30 hover:border-red-900 rounded-xl"
          onClick={cancelTrade}
        >
          Ακύρωση Πρότασης
        </Button>
      </div>
    );
  }

  if (activeTrade.status === "ACCEPTED") {
    const partner = players[activeTrade.partnerId!];
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center ring-4 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
          <ArrowRightLeft className="w-10 h-10 text-green-500" />
        </div>
        <div>
          <h4 className="text-green-400 font-black text-2xl mb-2">
            Αποδοχή Ανταλλαγής!
          </h4>
          <p className="text-slate-300 text-base">
            <span className="font-bold text-white">{partner.name}</span> δέχτηκε
            την πρότασή σου.
          </p>
        </div>
        <Button
          className="w-full max-w-xs h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/50 rounded-xl uppercase tracking-wider"
          onClick={() => executeTrade(activeTrade.partnerId!)}
        >
          Ολοκλήρωση
        </Button>
      </div>
    );
  }

  if (activeTrade.status === "REJECTED") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center ring-4 ring-red-500/50">
          <ArrowRightLeft className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h4 className="text-red-400 font-black text-2xl mb-2">Απόρριψη</h4>
          <p className="text-slate-400 text-sm max-w-[260px] mx-auto leading-relaxed">
            Κανείς από τους παίκτες δεν δέχτηκε την πρότασή ανταλλαγής σου.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full max-w-xs h-14 text-lg font-bold border-slate-700/80 text-white hover:bg-slate-800 rounded-xl uppercase tracking-wider"
          onClick={cancelTrade}
        >
          Κλείσιμο
        </Button>
      </div>
    );
  }

  // DRAFT STATE
  const resources = ["WOOD", "BRICK", "SHEEP", "WHEAT", "ORE"] as const;
  const colors: Record<string, string> = {
    WOOD: "bg-green-600",
    BRICK: "bg-orange-600",
    SHEEP: "bg-lime-500",
    WHEAT: "bg-yellow-500",
    ORE: "bg-slate-500",
  };
  const labels: Record<string, string> = {
    WOOD: "ΞΥΛ",
    BRICK: "ΤΟΥ",
    SHEEP: "ΠΡΟ",
    WHEAT: "ΣΙΤ",
    ORE: "ΜΕΤ",
  };

  const handleAdjust = (
    type: "give" | "get",
    res: keyof typeof activeTrade.give,
    delta: number,
  ) => {
    const current = activeTrade[type][res];
    const newVal = Math.max(0, current + delta);

    // Check if player has enough to give
    if (
      type === "give" &&
      newVal >
        (activePlayer.resources[res as keyof typeof activePlayer.resources] ||
          0)
    ) {
      return;
    }

    updateTradeDraft(
      {
        ...activeTrade.give,
        [res]: type === "give" ? newVal : activeTrade.give[res],
      },
      {
        ...activeTrade.get,
        [res]: type === "get" ? newVal : activeTrade.get[res],
      },
    );
  };

  const totalGive = Object.values(activeTrade.give).reduce((a, b) => a + b, 0);
  const totalGet = Object.values(activeTrade.get).reduce((a, b) => a + b, 0);
  const isValidOffer = totalGive > 0 && totalGet > 0;

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex justify-between items-center mb-1 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 shadow-md">
        <h4 className="text-white font-bold text-sm tracking-wide drop-shadow-md">
          Διαμόρφωση Πρότασης
        </h4>
        <button
          onClick={cancelTrade}
          className="text-xs font-bold text-slate-300 hover:text-white px-2 py-1 rounded bg-black/40 hover:bg-black/60 transition-colors border border-transparent hover:border-white/10"
        >
          Καθαρισμός
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 pb-2">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 text-[10px] font-black tracking-widest text-slate-300 text-center mb-2 sticky top-0 bg-transparent z-10 py-1 drop-shadow-md">
          <div className="bg-red-500/20 text-red-300 py-1 rounded border border-red-500/10 backdrop-blur-sm">ΔΙΝΕΙΣ</div>
          <div className="w-10"></div>
          <div className="bg-green-500/20 text-green-300 py-1 rounded border border-green-500/10 backdrop-blur-sm">ΠΑΙΡΝΕΙΣ</div>
        </div>

        {resources.map((res) => (
          <div
            key={res}
            className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center bg-black/30 p-2 rounded-xl border border-white/5 hover:bg-black/50 transition-colors backdrop-blur-sm shadow-sm"
          >
            {/* Give Column */}
            <div
              className={`flex items-center justify-between rounded-lg px-1.5 py-1 ${(activeTrade.give[res as keyof typeof activeTrade.give] || 0) > 0 ? "bg-red-950/60 border border-red-500/30" : "bg-black/40 border border-transparent"}`}
            >
              <button
                disabled={
                  (activeTrade.give[res as keyof typeof activeTrade.give] ||
                    0) === 0
                }
                onClick={() => handleAdjust("give", res as any, -1)}
                className="w-7 h-7 flex items-center justify-center rounded bg-black/50 text-slate-300 hover:text-white hover:bg-black/80 disabled:opacity-30 transition-colors border border-white/10 hover:border-white/30"
              >
                -
              </button>
              <span
                className={`text-lg font-black w-6 text-center ${(activeTrade.give[res as keyof typeof activeTrade.give] || 0) > 0 ? "text-red-400" : "text-slate-600"}`}
              >
                {activeTrade.give[res as keyof typeof activeTrade.give] || 0}
              </span>
              <button
                disabled={
                  (activePlayer.resources[res] || 0) <=
                  (activeTrade.give[res as keyof typeof activeTrade.give] || 0)
                }
                onClick={() => handleAdjust("give", res as any, 1)}
                className="w-7 h-7 flex items-center justify-center rounded bg-black/50 text-slate-300 hover:text-white hover:bg-black/80 disabled:opacity-30 transition-colors border border-white/10 hover:border-white/30"
              >
                +
              </button>
            </div>

            {/* Resource Icon */}
            <div
              className={`w-10 h-10 rounded-full ${colors[res]} flex items-center justify-center shadow-inner text-[10px] font-black text-white ring-2 ring-black/40 drop-shadow-lg`}
            >
              {labels[res]}
            </div>

            {/* Get Column */}
            <div
              className={`flex items-center justify-between rounded-lg px-1.5 py-1 ${(activeTrade.get[res as keyof typeof activeTrade.get] || 0) > 0 ? "bg-green-950/60 border border-green-500/30" : "bg-black/40 border border-transparent"}`}
            >
              <button
                disabled={
                  (activeTrade.get[res as keyof typeof activeTrade.get] ||
                    0) === 0
                }
                onClick={() => handleAdjust("get", res as any, -1)}
                className="w-7 h-7 flex items-center justify-center rounded bg-black/50 text-slate-300 hover:text-white hover:bg-black/80 disabled:opacity-30 transition-colors border border-white/10 hover:border-white/30"
              >
                -
              </button>
              <span
                className={`text-lg font-black w-6 text-center drop-shadow-md ${(activeTrade.get[res as keyof typeof activeTrade.get] || 0) > 0 ? "text-green-400" : "text-slate-400"}`}
              >
                {activeTrade.get[res as keyof typeof activeTrade.get] || 0}
              </span>
              <button
                disabled={
                  (activeTrade.give[res as keyof typeof activeTrade.give] ||
                    0) > 0
                }
                onClick={() => handleAdjust("get", res as any, 1)}
                className="w-7 h-7 flex items-center justify-center rounded bg-black/50 text-slate-300 hover:text-white hover:bg-black/80 disabled:opacity-30 transition-colors border border-white/10 hover:border-white/30"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button
        disabled={!isValidOffer}
        onClick={proposeTrade}
        className="w-full h-12 text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-lg transition-all rounded-xl disabled:bg-slate-800 disabled:text-slate-500 uppercase tracking-widest flex-shrink-0"
      >
        Αποστολη Προτασης
      </Button>
    </div>
  );
}

function DevCardsCard({ player }: { player: any }) {
  const { buyDevCard, playDevCard, phase } = useCatanStore();
  const isTradingBuilding = phase === LifecyclePhase.TRADING_BUILDING;
  const canBuy =
    isTradingBuilding &&
    (player.resources.SHEEP || 0) >= 1 &&
    (player.resources.WHEAT || 0) >= 1 &&
    (player.resources.ORE || 0) >= 1;

  const unplayedCards = player.devCards?.filter((c: any) => !c.played) || [];

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center px-1">
        <h4 className="text-white font-bold text-lg">Κάρτες Ανάπτυξης</h4>
        <span className="text-xs font-bold text-purple-400 bg-purple-900/30 px-2 py-1 rounded-md border border-purple-800/50">
          {unplayedCards.length} Διαθέσιμες
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
        {unplayedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70 border border-dashed border-white/20 bg-black/20 backdrop-blur-sm rounded-xl p-4">
            <div className="w-12 h-12 rounded-full bg-black/40 flex justify-center items-center">
              <Scroll className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-300 text-sm font-semibold">
              Δεν έχεις αχρησιμοποίητες κάρτες ανάπτυξης.
            </p>
          </div>
        ) : (
          unplayedCards.map((card: any) => (
            <div
              key={card.id}
              className="flex items-center justify-between bg-purple-900/30 backdrop-blur-sm p-3 rounded-xl border border-purple-500/30 hover:bg-purple-900/50 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-200 shadow-inner">
                  <Scroll className="w-5 h-5 drop-shadow-md" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-sm tracking-tight leading-tight drop-shadow-md">
                    {card.type === "KNIGHT"
                      ? "Ιππότης"
                      : card.type === "VICTORY_POINT"
                        ? "Πόντος Νίκης"
                        : card.type === "ROAD_BUILDING"
                          ? "Δύο Δρόμοι"
                          : card.type === "YEAR_OF_PLENTY"
                            ? "Αφθονία"
                            : card.type === "MONOPOLY"
                              ? "Μονοπώλιο"
                              : card.type}
                  </span>
                  <span className="text-[10px] text-purple-300/70 font-semibold uppercase tracking-wider mt-0.5">
                    {card.type === "KNIGHT"
                      ? "Μετακινεί τον ληστή"
                      : card.type === "VICTORY_POINT"
                        ? "+1 Πόντος (Κρυφό)"
                        : card.type === "ROAD_BUILDING"
                          ? "Δωρεάν 2 δρόμοι"
                          : card.type === "YEAR_OF_PLENTY"
                            ? "Παίρνεις 2 πόρους"
                            : card.type === "MONOPOLY"
                              ? "Όλοι δίνουν 1 πόρο"
                              : ""}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                disabled={!isTradingBuilding}
                className="h-8 px-4 font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-md disabled:bg-slate-800 disabled:text-slate-500 text-xs"
                onClick={() => playDevCard(card.id)}
              >
                Χρήση
              </Button>
            </div>
          ))
        )}
      </div>

      <Button
        disabled={!canBuy}
        onClick={buyDevCard}
        className="w-full h-12 text-lg font-black bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all rounded-xl disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none uppercase tracking-wide flex-shrink-0"
      >
        <div className="flex items-center justify-center gap-3">
          <span>Αγορα Καρτας</span>
          <span className="text-[10px] bg-purple-900/80 font-semibold px-2 py-1 rounded text-purple-200 tracking-wider">
            1Π, 1Σ, 1Μ
          </span>
        </div>
      </Button>
    </div>
  );
}

function StatsCard({ player }: { player: any }) {
  const unplayedCards =
    player.devCards?.filter((c: any) => !c.played).length || 0;
  const playedKnights = player.largestArmy || 0;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="px-2 mb-1">
        <h4 className="text-white font-bold text-lg">Η Πρόοδος σου</h4>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        <div className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 transition-transform hover:scale-[1.01] shadow-md">
          <div className="flex flex-col">
            <span className="text-white font-black text-lg leading-tight drop-shadow-md">
              Πόντοι Νίκης
            </span>
            <span className="text-xs text-slate-300 font-semibold mt-1 drop-shadow-sm">
              Απαιτούνται 10 για την νίκη
            </span>
          </div>
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(251,146,60,0.5)] ring-4 ring-black/40">
            <span className="text-2xl font-black text-primary drop-shadow-md">
              {player.victoryPoints}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center p-4 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 shadow-md">
            <span className="text-3xl font-black text-white mb-1.5 drop-shadow-md">
              {player.longestRoad || 0}
            </span>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center leading-tight drop-shadow-md">
              Ο Μεγαλύτερος
              <br />
              Δρόμος Σου
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 shadow-md">
            <span className="text-3xl font-black text-white mb-1.5 drop-shadow-md">
              {playedKnights}
            </span>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center leading-tight drop-shadow-md">
              Παιγμένοι
              <br />
              Ιππότες
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 shadow-md">
          <div className="flex flex-col">
            <span className="text-slate-200 font-bold text-sm drop-shadow-md">
              Κάρτες Ανάπτυξης
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5 drop-shadow-sm">
              Αχρησιμοποίητες
            </span>
          </div>
          <span className="text-xl font-black text-white bg-black/40 px-4 py-1 rounded-xl shadow-inner border border-white/10 drop-shadow-md">
            {unplayedCards}
          </span>
        </div>
      </div>
    </div>
  );
}
