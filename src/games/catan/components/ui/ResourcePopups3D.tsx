import React, { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { gameEvents, GameEvent } from '../../core/EventBus';
import { ResourceType } from '../../domain/types';

interface Popup {
  id: string;
  position: [number, number, number];
  resources: Record<string, number>;
}

const RESOURCE_COLORS: Record<string, string> = {
  [ResourceType.WOOD]: 'text-green-400',
  [ResourceType.BRICK]: 'text-orange-400',
  [ResourceType.SHEEP]: 'text-lime-400',
  [ResourceType.WHEAT]: 'text-yellow-400',
  [ResourceType.ORE]: 'text-slate-300',
};

export function ResourcePopups3D() {
  const [popups, setPopups] = useState<Popup[]>([]);

  useEffect(() => {
    const handleEvent = (e: GameEvent) => {
      if (e.type === 'RESOURCE_GAINED' && e.position) {
        const newPopup: Popup = {
          id: Math.random().toString(36).substring(7),
          position: e.position,
          resources: e.resources
        };
        
        setPopups(prev => [...prev, newPopup]);

        // Auto remove after animation completes
        setTimeout(() => {
          setPopups(prev => prev.filter(p => p.id !== newPopup.id));
        }, 2500);
      }
    };

    const unsubscribe = gameEvents.subscribe(handleEvent);
    return () => unsubscribe();
  }, []);

  return (
    <group>
      {popups.map(popup => (
        <Html key={popup.id} position={popup.position} center zIndexRange={[100, 0]}>
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="flex flex-col items-center pointer-events-none"
          >
            {Object.entries(popup.resources).map(([res, count]) => (
              <div 
                key={res} 
                className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-full shadow-2xl font-black text-sm flex items-center gap-2 mb-1"
              >
                <span className="text-white">+{count}</span>
                <span className={`uppercase tracking-wider text-xs ${RESOURCE_COLORS[res] || 'text-white'}`}>
                  {res}
                </span>
              </div>
            ))}
          </motion.div>
        </Html>
      ))}
    </group>
  );
}
