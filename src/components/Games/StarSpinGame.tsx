import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Sparkles, Star } from 'lucide-react';

const COSMIC_ICONS = ['🪐', '🚀', '🌌', '⭐', '💎', '☄️'];

export const StarSpinGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [reels, setReels] = useState<string[][]>([
    ['🪐', '⭐', '💎', '🚀', '🌌'],
    ['🚀', '⭐', '🌌', '💎', '🪐'],
    ['💎', '⭐', '🪐', '🌌', '☄️'],
  ]);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Starburst Expanding Wilds (Reels 2, 3, 4):</p>
      <div className="space-y-1.5">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>⭐ Starburst Wild</span>
          <span className="text-yellow-400 font-bold">Expands over full reel + Free Re-spin</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🪐 Saturn Ring x5</span>
          <span className="text-purple-400 font-bold">25X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🚀 Cosmic Rocket x5</span>
          <span className="text-cyan-400 font-bold">15X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Any 3 Matching Line</span>
          <span className="text-slate-300 font-bold">4X</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="star-spin" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const handleSpin = () => {
          if (isSpinning || user.coins < bet) return;

          setIsSpinning(true);
          setWinMessage(null);
          soundEngine.playSpinTick(soundEnabled);

          let ticks = 0;
          const interval = setInterval(() => {
            setReels([
              Array.from({ length: 5 }, () => COSMIC_ICONS[Math.floor(Math.random() * COSMIC_ICONS.length)]),
              Array.from({ length: 5 }, () => COSMIC_ICONS[Math.floor(Math.random() * COSMIC_ICONS.length)]),
              Array.from({ length: 5 }, () => COSMIC_ICONS[Math.floor(Math.random() * COSMIC_ICONS.length)]),
            ]);
            soundEngine.playSpinTick(soundEnabled);
            ticks++;

            if (ticks >= 11) {
              clearInterval(interval);

              const rand = Math.random();
              let multiplier = 0;
              let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS' = 'LOSS';
              let finalGrid: string[][];

              if (rand < 0.05) {
                // Triple Starburst wild center
                finalGrid = [
                  ['🪐', '⭐', '⭐', '⭐', '🌌'],
                  ['🚀', '⭐', '⭐', '⭐', '🪐'],
                  ['💎', '⭐', '⭐', '⭐', '☄️'],
                ];
                multiplier = 50;
                outcome = 'JACKPOT';
              } else if (rand < 0.18) {
                finalGrid = [
                  ['🪐', '🪐', '🪐', '🪐', '🌌'],
                  ['🚀', '⭐', '⭐', '💎', '🪐'],
                  ['💎', '🪐', '🪐', '🪐', '☄️'],
                ];
                multiplier = 25;
                outcome = 'BIG_WIN';
              } else if (rand < 0.45) {
                finalGrid = [
                  ['🚀', '🚀', '🚀', '🌌', '🪐'],
                  ['🪐', '⭐', '💎', '💎', '☄️'],
                  ['💎', '🚀', '🪐', '🌌', '🚀'],
                ];
                multiplier = 5;
                outcome = 'WIN';
              } else {
                finalGrid = [
                  ['🪐', '🚀', '🌌', '💎', '☄️'],
                  ['💎', '🪐', '🚀', '🪐', '🌌'],
                  ['☄️', '🌌', '🪐', '🚀', '💎'],
                ];
                multiplier = 0;
                outcome = 'LOSS';
              }

              setReels(finalGrid);
              setIsSpinning(false);
              soundEngine.playReelStop(soundEnabled);

              const payout = Math.round(bet * multiplier);
              setLastResult({ payout, multiplier, outcome });

              if (outcome === 'JACKPOT') {
                soundEngine.playJackpot(soundEnabled);
                fireJackpotConfetti();
                setWinMessage(`SUPERNOVA JACKPOT! ${(payout + 720000).toLocaleString()} Coins!`);
                recordGameSpin('star-spin', bet, payout + 720000, outcome, multiplier);
              } else if (outcome === 'BIG_WIN') {
                soundEngine.playWin(soundEnabled, true);
                fireCoinCelebration();
                setWinMessage(`STARBURST BURST! ${multiplier}x (${payout.toLocaleString()} Coins)`);
                recordGameSpin('star-spin', bet, payout, outcome, multiplier);
              } else if (outcome === 'WIN') {
                soundEngine.playWin(soundEnabled, false);
                setWinMessage(`WIN! +${payout.toLocaleString()} Coins`);
                recordGameSpin('star-spin', bet, payout, outcome, multiplier);
              } else {
                setWinMessage('Spin for Expanding Star Wilds!');
                recordGameSpin('star-spin', bet, 0, 'LOSS', 0);
              }
            }
          }, 80);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-lg py-2">
            <div className="w-full bg-[#120a1f] p-4 sm:p-5 rounded-3xl border-2 border-purple-500/40 shadow-[0_0_40px_rgba(139,92,246,0.25)]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-purple-500/30">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-yellow-400 animate-spin" />
                  <span className="text-xs font-black tracking-widest text-purple-400 font-display">
                    STARBURST COSMIC SPIN
                  </span>
                </div>
                <span className="text-xs text-yellow-300 font-bold">EXPANDING WILDS</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-[#06030c] p-2.5 sm:p-3 rounded-2xl border-2 border-purple-900/60 shadow-inner">
                {reels.map((row, rIdx) =>
                  row.map((icon, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`h-16 sm:h-20 bg-slate-900/90 rounded-xl flex items-center justify-center border border-purple-950/80 ${
                        icon === '⭐'
                          ? 'bg-purple-950/60 border-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
                          : ''
                      } ${isSpinning ? 'scale-95 opacity-80' : 'scale-100'} transition-all`}
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
                  <span className="text-sm font-extrabold font-display uppercase tracking-wide text-purple-300">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Align Supernova Stars</span>
                )}
              </div>

              <button
                disabled={isSpinning || user.coins < bet}
                onClick={handleSpin}
                className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                  isSpinning || user.coins < bet
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-purple-500 via-pink-400 to-amber-400 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-purple-200 shadow-purple-500/20'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>{isSpinning ? 'SPINNING...' : `COSMIC SPIN (${bet.toLocaleString()})`}</span>
              </button>
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
