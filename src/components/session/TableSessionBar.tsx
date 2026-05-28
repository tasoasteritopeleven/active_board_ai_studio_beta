import { Wifi, Users, Radio, Crown } from 'lucide-react';
import { useTelepresenceOptional } from '@/contexts/TelepresenceContext';
import { cn } from '@/lib/utils';

interface TableSessionBarProps {
  gameTitle: string;
  roomLabel?: string;
  isHost?: boolean;
  playerCount?: number;
  eventLogLength?: number;
  className?: string;
}

export function TableSessionBar({
  gameTitle,
  roomLabel,
  isHost,
  playerCount = 1,
  eventLogLength,
  className,
}: TableSessionBarProps) {
  const tp = useTelepresenceOptional();
  const mode = tp?.mode ?? 'local';

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 px-4 py-2 rounded-xl',
        'bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-amber-950/90',
        'border border-amber-900/40 shadow-lg shadow-black/30 backdrop-blur-md',
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-amber-200/90 truncate">
          {gameTitle}
        </span>
        {roomLabel && (
          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
            #{roomLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto text-[10px] uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1" title="Players in room">
          <Users className="w-3 h-3" />
          {playerCount}
        </span>
        {isHost !== undefined && (
          <span className={cn('flex items-center gap-1', isHost && 'text-amber-400')}>
            {isHost ? <Crown className="w-3 h-3" /> : null}
            {isHost ? 'Host' : 'Guest'}
          </span>
        )}
        {tp?.enabled && (
          <span className="flex items-center gap-1 text-sky-400" title="Telepresence mode">
            <Radio className="w-3 h-3" />
            {mode === 'sfu' ? 'SFU' : 'Mesh'}
          </span>
        )}
        {eventLogLength !== undefined && eventLogLength > 0 && (
          <span className="font-mono text-slate-500">evt:{eventLogLength}</span>
        )}
        <span className="flex items-center gap-1">
          <Wifi className="w-3 h-3" />
          Live
        </span>
      </div>
    </div>
  );
}
