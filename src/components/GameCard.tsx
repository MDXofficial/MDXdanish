import React from 'react';
import { GameInfo } from '../types';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../utils/audio';
import { Flame, Play, Sparkles, Trophy } from 'lucide-react';

interface GameCardProps {
  game: GameInfo;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { setActiveGame, soundEnabled } = useGame();

  const handlePlay = () => {
    soundEngine.playClick(soundEnabled);
    setActiveGame(game.id);
  };

  return (
    <div
      onClick={handlePlay}
      className="group relative rounded-2xl bg-gradient-to-b from-[#161822] via-[#0f1118] to-[#0a0a0f] border border-amber-500/25 hover:border-amber-400 p-2.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Top Banner Tag */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
        {game.image ? (
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-3 text-center relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at center, ${game.glowColor} 0%, #0a0b10 80%)`,
            }}
          >
            <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
              {game.category === 'jackpot'
                ? '🎰'
                : game.category === 'wheels'
                ? '🎡'
                : game.category === 'table'
                ? '🎲'
                : '💎'}
            </span>
            <span className="text-xs font-black text-amber-300 font-display mt-2 uppercase tracking-wider">
              {game.name}
            </span>
          </div>
        )}

        {/* Badge overlay */}
        {game.badge && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
            <Flame className="w-3 h-3 fill-slate-950" />
            <span>{game.badge}</span>
          </div>
        )}

        {/* Play overlay button on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Content */}
      <div className="mt-2.5 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-white font-display truncate group-hover:text-amber-400 transition">
            {game.name}
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0">
            {game.rtp}% RTP
          </span>
        </div>

        {/* Jackpot Ticker */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">JACKPOT</span>
          <span className="text-amber-400 font-bold font-mono text-[11px]">
            {game.jackpotAmount >= 1000000
              ? `${(game.jackpotAmount / 1000000).toFixed(1)}M`
              : game.jackpotAmount.toLocaleString()}
          </span>
        </div>

        {/* Min Bet / Action Bar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
          <span className="text-slate-400">Min: {game.minBet.toLocaleString()}</span>
          <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
            PLAY <Play className="w-2.5 h-2.5 fill-amber-400" />
          </span>
        </div>
      </div>
    </div>
  );
};
