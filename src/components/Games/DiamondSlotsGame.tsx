import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Sparkles, Gem } from 'lucide-react';

const GEMS = ['💎', '🔷', '🔶', '🔮', '✨', '💍'];

export const DiamondSlotsGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [grid, setGrid] = useState<string[][]>([
    ['💎', '🔷', '🔶', '🔮'],
    ['✨', '💎', '💍', '🔷'],
    ['🔮', '💍', '💎', '✨'],
    ['🔶', '✨', '🔷', '💎'],
  ]);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">4x4 Jewel Cascade Arena:</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>💎 5+ Diamonds</span>
          <span className="text-cyan-400 font-bold">40X Jackpot</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>💍 4+ Rings</span>
          <span className="text-purple-400 font-bold">20X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🔮 4+ Orbs</span>
          <span className="text-pink-400 font-bold">10X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Any Gem Cluster</span>
          <span className="text-emerald-400 font-bold">3X - 5X</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="diamond-slots" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const handleSpin = () => {
          if (isSpinning || user.coins < bet) return;

          setIsSpinning(true);
          setWinMessage(null);
          soundEngine.playSpinTick(soundEnabled);

          let ticks = 0;
          const interval = setInterval(() => {
            setGrid(
              Array.from({ length: 4 }, () =>
                Array.from({ length: 4 }, () => GEMS[Math.floor(Math.random() * GEMS.length)])
              )
            );
            soundEngine.playCoinClink(soundEnabled);
            ticks++;

            if (ticks >= 10) {
              clearInterval(interval);

              const rand = Math.random();
              let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS' = 'LOSS';
              let multiplier = 0;
              let finalGrid: string[][];

              if (rand < 0.06) {
                // Diamond Jackpot cascade
                finalGrid = [
                  ['💎', '💎', '💎', '💎'],
                  ['💎', '🔷', '🔶', '🔮'],
                  ['✨', '💎', '💍', '🔷'],
                  ['🔶', '✨', '💎', '💎'],
                ];
                multiplier = 40;
                outcome = 'JACKPOT';
              } else if (rand < 0.18) {
                // Big cluster
                finalGrid = [
                  ['💍', '💍', '💍', '💍'],
                  ['💎', '💎', '🔶', '🔮'],
                  ['✨', '💎', '💍', '🔷'],
                  ['🔶', '✨', '🔷', '💎'],
                ];
                multiplier = 20;
                outcome = 'BIG_WIN';
              } else if (rand < 0.5) {
                finalGrid = [
                  ['🔮', '🔮', '🔮', '✨'],
                  ['💎', '🔷', '🔶', '🔮'],
                  ['✨', '💎', '💍', '🔷'],
                  ['🔶', '✨', '🔷', '💎'],
                ];
                multiplier = 4;
                outcome = 'WIN';
              } else {
                finalGrid = [
                  ['🔶', '🔮', '✨', '🔷'],
                  ['🔮', '🔷', '💍', '🔶'],
                  ['✨', '💍', '🔮', '✨'],
                  ['🔶', '✨', '🔷', '🔮'],
                ];
                multiplier = 0;
                outcome = 'LOSS';
              }

              setGrid(finalGrid);
              setIsSpinning(false);
              soundEngine.playReelStop(soundEnabled);

              const payout = Math.round(bet * multiplier);
              setLastResult({ payout, multiplier, outcome });

              if (outcome === 'JACKPOT') {
                soundEngine.playJackpot(soundEnabled);
                fireJackpotConfetti();
                setWinMessage(`DIAMOND FRENZY! ${(payout + 750000).toLocaleString()} Coins!`);
                recordGameSpin('diamond-slots', bet, payout + 750000, outcome, multiplier);
              } else if (outcome === 'BIG_WIN') {
                soundEngine.playWin(soundEnabled, true);
                fireCoinCelebration();
                setWinMessage(`SHINING WIN! ${multiplier}x (${payout.toLocaleString()} Coins)`);
                recordGameSpin('diamond-slots', bet, payout, outcome, multiplier);
              } else if (outcome === 'WIN') {
                soundEngine.playWin(soundEnabled, false);
                setWinMessage(`CASCADE WIN! +${payout.toLocaleString()} Coins`);
                recordGameSpin('diamond-slots', bet, payout, outcome, multiplier);
              } else {
                setWinMessage('No Matches. Drop Again!');
                recordGameSpin('diamond-slots', bet, 0, 'LOSS', 0);
              }
            }
          }, 80);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-sm py-2">
            <div className="w-full bg-[#0e1320] p-4 rounded-3xl border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-cyan-500/30">
                <div className="flex items-center gap-1.5">
                  <Gem className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-black tracking-widest text-cyan-400 font-display">
                    DIAMOND SLOTS 4x4
                  </span>
                </div>
                <span className="text-xs text-cyan-300 font-medium">CASCADE WINS</span>
              </div>

              {/* 4x4 Jewels Grid */}
              <div className="grid grid-cols-4 gap-2 bg-[#050810] p-3 rounded-2xl border border-cyan-900/60 shadow-inner">
                {grid.map((row, rIdx) =>
                  row.map((gem, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`h-14 sm:h-16 rounded-xl bg-slate-900/90 border border-cyan-900/40 flex items-center justify-center ${
                        gem === '💎' ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]' : ''
                      } ${isSpinning ? 'scale-95 opacity-80' : 'scale-100'} transition-all`}
                    >
                      <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                        {gem}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="h-9 mt-3 flex items-center justify-center">
                {winMessage ? (
                  <span className="text-sm font-extrabold font-display uppercase tracking-wide text-cyan-300">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Drop Gems to Match Diamonds</span>
                )}
              </div>

              <button
                disabled={isSpinning || user.coins < bet}
                onClick={handleSpin}
                className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                  isSpinning || user.coins < bet
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-500 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-cyan-200 shadow-cyan-500/20'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>{isSpinning ? 'DROPPING...' : `DROP GEMS (${bet.toLocaleString()})`}</span>
              </button>
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
