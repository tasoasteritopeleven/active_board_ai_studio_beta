import { useState } from 'react';
import { PhysicalTableLayout } from '@/components/boardgame/PhysicalTableLayout';
import { BoardGameTable } from '@/components/boardgame/BoardGameTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SAMPLE_WORDS = [
  'ΘΑΛΑΣΣΑ', 'ΒΙΒΛΙΟ', 'ΜΟΥΣΙΚΗ', 'ΦΩΤΙΑ', 'ΔΕΝΤΡΟ',
  'ΠΟΛΗ', 'ΧΡΟΝΟΣ', 'ΚΑΡΔΙΑ', 'ΑΣΤΕΡΙ', 'ΝΕΡΟ',
  'ΑΝΕΜΟΣ', 'ΣΠΙΤΙ', 'ΟΝΕΙΡΟ', 'ΦΕΓΓΑΡΙ', 'ΔΡΟΜΟΣ',
  'ΧΕΙΜΩΝΑΣ', 'ΚΑΛΟΚΑΙΡΙ', 'ΤΑΞΙΔΙ', 'ΓΕΛΙΟ', 'ΕΛΠΙΔΑ',
];

/** Ομαδικό παιχνίδι λέξεων — σε εξέλιξη (physical tabletop shell). */
export default function WordsGamePage() {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <PhysicalTableLayout
      title="Ομαδικό παιχνίδι λέξεων"
      subtitle="Σε εξέλιξη — TableForge tabletop shell"
      headerRight={<Badge variant="outline" className="text-[10px]">Beta</Badge>}
      board={
        <BoardGameTable>
          <div className="relative w-[min(95vw,800px)] p-6">
            <div className="boardgame-felt boardgame-felt--codenames rounded-xl p-6 shadow-2xl">
              <p className="text-center text-[#c9e4d4] text-xs uppercase tracking-[0.25em] mb-6 opacity-80">
                Word tiles — team play coming soon
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {SAMPLE_WORDS.map((word, i) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => toggle(i)}
                    className={`h-20 sm:h-24 rounded-lg flex items-center justify-center font-bold text-[10px] sm:text-xs tracking-widest transition-all ${
                      revealed.has(i)
                        ? 'bg-amber-900/60 border-amber-500/50 text-amber-100 boardgame-card-stock--lifted'
                        : 'boardgame-card-stock text-[#1a1a1a] hover:-translate-y-1'
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </BoardGameTable>
      }
      actionDock={
        <div className="text-center space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
            Πλήρης μηχανή + multiplayer — επόμενη φάση
          </p>
          <Button size="sm" variant="secondary" disabled className="w-full">
            Έναρξη γύρου
          </Button>
        </div>
      }
    />
  );
}
