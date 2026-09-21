import React from 'react';
import { IconTrash } from '../UI/Icons';

const STATUS_CLASS = {
  Playing: 'status-pill status-pill-playing',
  Backlog: 'status-pill status-pill-backlog',
  Completed: 'status-pill status-pill-completed',
  Unplayed: 'status-pill status-pill-unplayed',
  Dropped: 'status-pill status-pill-dropped',
};

const COVER_GRADIENTS = [
  'from-brand-700 via-brand-500 to-accent-cyan',
  'from-accent-pink via-brand-600 to-brand-400',
  'from-accent-cyan via-brand-500 to-brand-700',
  'from-brand-800 via-accent-pink to-brand-500',
  'from-slate-700 via-brand-600 to-accent-cyan',
];

function gradientFor(seed) {
  let h = 0;
  for (let i = 0; i < (seed || '').length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COVER_GRADIENTS[h % COVER_GRADIENTS.length];
}

const GameCard = ({ game, onDelete }) => {
  const initials = (game.title || '?').trim().slice(0, 2).toUpperCase();
  const gradient = gradientFor(game.title);
  const pillClass = STATUS_CLASS[game.status] || 'status-pill status-pill-unplayed';

  return (
    <div className="game-card group">
      {/* "Cover" — gradient with initials, since we have no real artwork */}
      <div className={`aspect-[2/2.7] bg-gradient-to-br ${gradient} flex items-center justify-center relative border-b border-white/[0.05]`}>
        <span className="font-display font-black text-6xl text-white/85 drop-shadow-lg tracking-tighter">
          {initials}
        </span>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(game.id); }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 hover:bg-rose-500/80 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/10"
            aria-label="Delete"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base text-slate-100 leading-tight line-clamp-2 group-hover:text-brand-300 transition-colors">
            {game.title}
          </h3>
          <span className={pillClass}>{game.status || 'Unplayed'}</span>
        </div>
        {game.platform && (
          <p className="text-xs text-slate-500 font-medium">{game.platform}</p>
        )}
        {game.updated_at && (
          <p className="text-[10px] text-slate-600 font-mono">
            updated {new Date(game.updated_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default GameCard;
