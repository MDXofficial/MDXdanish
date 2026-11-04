import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Sparkles, Crown } from 'lucide-react';

const ICONS = ['👑', '💎', '🔥', '⚡', '7️⃣', '🪙', '🌟'];

export const MegaSpinGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [grid, setGrid] = useState<string[][]>([
    ['👑', '💎', '7️⃣', '🪙', '🌟'],
    ['🔥', '7️⃣', '👑', '💎', '⚡'],
    ['🪙', '⚡', '💎', '👑', '7️⃣'],
  ]);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">5 Reels x 3 Rows (25 Paylines):</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>👑 Crown (Wild)</span>
          <span className="text-amber-400 font-bold">50X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>💎 Diamond x5</span>
          <span className="text-blue-400 font-bold">30X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>7️⃣ Lucky 7 x5</span>
          <span className="text-red-400 font-bold">20X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🌟 Scatter (3+)</span>
          <span className="text-yellow-400 font-bold">5 Free Spins</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="mega-spin" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const handleSpin = () => {
          if (isSpinning || (user.coins < bet && freeSpinsLeft === 0)) return;

          setIsSpinning(true);
          setWinMessage(null);
          soundEngine.playSpinTick(soundEnabled);

          let ticks = 0;
          const interval = setInterval(() => {
            setGrid([
              Array.from({ length: 5 }, () => ICONS[Math.floor(Math.random() * ICONS.length)]),
              Array.from({ length: 5 }, () => ICONS[Math.floor(Math.random() * ICONS.length)]),
              Array.from({ length: 5 }, () => ICONS[Math.floor(Math.random() * ICONS.length)]),
            ]);
            soundEngine.playSpinTick(soundEnabled);
            ticks++;

            if (ticks >= 12) {
              clearInterval(interval);

              const rand = Math.random();
              let multiplier = 0;
              let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS' = 'LOSS';
              let finalGrid: string[][];

              if (rand < 0.05) {
                // Crown Jackpot line
                finalGrid = [
                  ['👑', '👑', '👑', '👑', '👑'],
                  ['🔥', '7️⃣', '💎', '🪙', '⚡'],
                  ['🪙', '⚡', '💎', '🔥', '7️⃣'],
                ];
                multiplier = 50;
                outcome = 'JACKPOT';
              } else if (rand < 0.15) {
                // Big 4-5 diamond line
                finalGrid = [
                  ['💎', '💎', '💎', '💎', '🌟'],
                  ['🔥', '👑', '💎', '🪙', '⚡'],
                  ['🪙', '⚡', '💎', '🔥', '7️⃣'],
                ];
                multiplier = 25;
                outcome = 'BIG_WIN';
              } else if (rand < 0.45) {
                // Normal 3-of-a-kind line
                finalGrid = [
                  ['7️⃣', '7️⃣', '7️⃣', '🪙', '🌟'],
                  ['🔥', '👑', '💎', '🪙', '⚡'],
                  ['🪙', '⚡', '💎', '🔥', '7️⃣'],
                ];
                multiplier = 4;
                outcome = 'WIN';
              } else {
                finalGrid = [
                  ['🔥', '💎', '7️⃣', '🪙', '🌟'],
                  ['⚡', '👑', '🪙', '💎', '⚡'],
                  ['🪙', '⚡', '🔥', '🔥', '7️⃣'],
                ];
                multiplier = 0;
                outcome = 'LOSS';
              }

              setGrid(finalGrid);
              setIsSpinning(false);
              soundEngine.playReelStop(soundEnabled);

              const effectiveBet = freeSpinsLeft > 0 ? 0 : bet;
              const payout = Math.round(bet * multiplier);

              if (freeSpinsLeft > 0) {
                setFreeSpinsLeft((prev) => prev - 1);
              }

              if (outcome === 'JACKPOT') {
                soundEngine.playJackpot(soundEnabled);
                fireJackpotConfetti();
                setWinMessage(`MEGA CROWN WIN! ${(payout + 800000).toLocaleString()} Coins!`);
                recordGameSpin('mega-spin', effectiveBet, payout + 800000, outcome, multiplier);
              } else if (outcome === 'BIG_WIN') {
                soundEngine.playWin(soundEnabled, true);
                fireCoinCelebration();
                setWinMessage(`BIG WIN! ${multiplier}x (${payout.toLocaleString()} Coins)`);
                recordGameSpin('mega-spin', effectiveBet, payout, outcome, multiplier);
              } else if (outcome === 'WIN') {
                soundEngine.playWin(soundEnabled, false);
                setWinMessage(`WIN! +${payout.toLocaleString()} Coins`);
                recordGameSpin('mega-spin', effectiveBet, payout, outcome, multiplier);
              } else {
                setWinMessage('Spin again for 25x lines!');
                recordGameSpin('mega-spin', effectiveBet, 0, 'LOSS', 0);
              }

              setLastResult({ payout, multiplier, outcome });
            }
          }, 80);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-lg py-2">
            {/* Top Reel Frame */}
            <div className="w-full bg-[#12141c] p-4 sm:p-5 rounded-3xl border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-black tracking-widest text-emerald-400 font-display">
                    5-REEL MEGA SPIN
                  </span>
                </div>
                {freeSpinsLeft > 0 ? (
                  <span className="text-xs font-extrabold text-amber-400 animate-pulse">
                    FREE SPINS: {freeSpinsLeft}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">25 PAYLINES ACTIVE</span>
                )}
              </div>

              {/* 5x3 Grid */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-[#06070a] p-2.5 sm:p-3 rounded-2xl border-2 border-emerald-900/60 shadow-inner">
                {grid.map((row, rIdx) =>
                  row.map((icon, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`h-16 sm:h-20 bg-slate-900/90 rounded-xl flex items-center justify-center border border-slate-800 ${
                        isSpinning ? 'scale-95 opacity-80' : 'scale-100'
                      } transition-all`}
                    >
                      <span className="text-3xl sm:text-4xl filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
                        {icon}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="h-9 mt-3 flex items-center justify-center">
                {winMessage ? (
                  <span className="text-sm font-extrabold font-display uppercase tracking-wide text-emerald-400">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Tap Spin to Roll 5 Reels</span>
                )}
              </div>

              <button
                disabled={isSpinning || (user.coins < bet && freeSpinsLeft === 0)}
                onClick={handleSpin}
                className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                  isSpinning || (user.coins < bet && freeSpinsLeft === 0)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-green-300 shadow-emerald-500/20'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {isSpinning
                    ? 'SPINNING...'
                    : freeSpinsLeft > 0
                    ? `FREE SPIN (${freeSpinsLeft})`
                    : `MEGA SPIN (${bet.toLocaleString()})`}
                </span>
              </button>
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
