import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GameCategory } from '../../types';
import { GameCard } from '../GameCard';
import { soundEngine } from '../../utils/audio';
import { Flame, Trophy, Gift, Sparkles, ShieldCheck, Download } from 'lucide-react';

export const LobbyView: React.FC = () => {
  const { games, setDailyModalOpen, setSpinModalOpen, setApkModalOpen, soundEnabled } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All 15 Games' },
    { id: 'jackpot', label: 'Jackpots' },
    { id: 'slots', label: 'Slots' },
    { id: 'wheels', label: 'Wheels' },
    { id: 'arcade', label: 'Arcade' },
    { id: 'table', label: 'Table' },
  ];

  const filteredGames = games.filter((g) => {
    if (!g.enabled) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'table') return g.category === 'table';
    return g.category === selectedCategory;
  });

  const totalJackpotSum = games.reduce((acc, g) => acc + g.jackpotAmount, 0);

  return (
    <div className="space-y-5 pb-20">
      {/* Hero Marquee Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#17120a] via-[#241708] to-[#120e06] border-2 border-amber-500/40 p-4 sm:p-6 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
        {/* Background glow & particles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>GRAND PROGRESSIVE JACKPOT POOL</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
              <span className="text-amber-400 font-mono tabular-nums">
                {totalJackpotSum.toLocaleString()}
              </span>{' '}
              <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest block sm:inline">
                VIRTUAL COINS
              </span>
            </h2>
            <p className="text-xs text-slate-300 max-w-md">
              15 Premium games available. Spin for progressive pots, daily fortune wheel rewards, and rise to MDX Legend status!
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center">
            <button
              onClick={() => {
                soundEngine.playClick(soundEnabled);
                setDailyModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400 hover:bg-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Daily Bonus</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick(soundEnabled);
                setSpinModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Lucky Spin</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick(soundEnabled);
                setApkModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-md flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Install APK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Functional Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              soundEngine.playClick(soundEnabled);
              setSelectedCategory(c.id);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === c.id
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 15 Games Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {/* Safe Gaming Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800 text-center text-xs text-slate-400">
        <p className="flex items-center justify-center gap-1.5 font-bold text-amber-400/90 uppercase tracking-wider text-[11px] mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          MDX JACKPOT – Safe & Purely Virtual Entertainment
        </p>
        <span>
          All coins, jackpots, and rewards in MDX JACKPOT are purely virtual with no real-world monetary value.
          No real money deposits, wagering, or cash withdrawals are supported.
        </span>
      </div>
    </div>
  );
};
