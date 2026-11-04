import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Flame, Sparkles } from 'lucide-react';

const DRAGON_ICONS = ['🐉', '🏮', '🪙', '🪭', '🏯', '🧧', '✨'];

export const DragonJackpotGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [reels, setReels] = useState<string[][]>([
    ['🐉', '🏮', '🪙', '🪭', '🏯'],
    ['🪙', '🐉', '🏮', '✨', '🧧'],
    ['🏯', '🪭', '🐉', '🪙', '🏮'],
  ]);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Mythic Asian Dragon 5-Reel Slot:</p>
      <div className="space-y-1.5">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🐉 Full Dragon Reel (Wild)</span>
          <span className="text-amber-400 font-bold">60X + Dragon Pot</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🏯 Imperial Palace x5</span>
          <span className="text-yellow-400 font-bold">30X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🏮 Red Lantern x5</span>
          <span className="text-red-400 font-bold">15X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🪙 Gold Ingot x4</span>
          <span className="text-emerald-400 font-bold">8X</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="dragon-jackpot" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const handleSpin = () => {
          if (isSpinning || user.coins < bet) return;

          setIsSpinning(true);
          setWinMessage(null);
          soundEngine.playSpinTick(soundEnabled);

          let ticks = 0;
          const interval = setInterval(() => {
            setReels([
              Array.from({ length: 5 }, () => DRAGON_ICONS[Math.floor(Math.random() * DRAGON_ICONS.length)]),
              Array.from({ length: 5 }, () => DRAGON_ICONS[Math.floor(Math.random() * DRAGON_ICONS.length)]),
              Array.from({ length: 5 }, () => DRAGON_ICONS[Math.floor(Math.random() * DRAGON_ICONS.length)]),
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
                // Dragon Jackpot Wild Breath
                finalGrid = [
                  ['🐉', '🐉', '🐉', '🐉', '🐉'],
                  ['🪙', '🏯', '🏮', '✨', '🧧'],
                  ['🏯', '🪭', '🪙', '🪙', '🏮'],
                ];
                multiplier = 60;
                outcome = 'JACKPOT';
              } else if (rand < 0.18) {
                finalGrid = [
                  ['🏯', '🏯', '🏯', '🏯', '✨'],
                  ['🐉', '🏮', '🪙', '🪭', '🏯'],
                  ['🪙', '🪭', '🐉', '🪙', '🏮'],
                ];
                multiplier = 30;
                outcome = 'BIG_WIN';
              } else if (rand < 0.45) {
                finalGrid = [
                  ['🏮', '🏮', '🏮', '🪙', '✨'],
                  ['🪙', '🐉', '🏮', '✨', '🧧'],
                  ['🏯', '🪭', '🐉', '🪙', '🏮'],
                ];
                multiplier = 6;
                outcome = 'WIN';
              } else {
                finalGrid = [
                  ['🪭', '🪙', '🏮', '🏯', '✨'],
                  ['🧧', '✨', '🪙', '🪭', '🏯'],
                  ['🏮', '🏯', '🪭', '🧧', '🪙'],
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
                setWinMessage(`DRAGON ROAR JACKPOT! ${(payout + 1500000).toLocaleString()} Coins!`);
                recordGameSpin('dragon-jackpot', bet, payout + 1500000, outcome, multiplier);
              } else if (outcome === 'BIG_WIN') {
                soundEngine.playWin(soundEnabled, true);
                fireCoinCelebration();
                setWinMessage(`DRAGON BLESSING! ${multiplier}x (${payout.toLocaleString()} Coins)`);
                recordGameSpin('dragon-jackpot', bet, payout, outcome, multiplier);
              } else if (outcome === 'WIN') {
                soundEngine.playWin(soundEnabled, false);
                setWinMessage(`WIN! +${payout.toLocaleString()} Coins`);
                recordGameSpin('dragon-jackpot', bet, payout, outcome, multiplier);
              } else {
                setWinMessage('Spin again for Dragon Wilds!');
                recordGameSpin('dragon-jackpot', bet, 0, 'LOSS', 0);
              }
            }
          }, 80);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-lg py-2">
            <div className="w-full bg-[#181108] p-4 sm:p-5 rounded-3xl border-2 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.25)]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-500/30">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="text-xs font-black tracking-widest text-amber-400 font-display">
                    DRAGON JACKPOT 28.5M
                  </span>
                </div>
                <span className="text-xs text-yellow-300 font-bold">EXPANDING WILDS</span>
              </div>

              {/* 5x3 Reels */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-[#090602] p-2.5 sm:p-3 rounded-2xl border-2 border-amber-900/60 shadow-inner">
                {reels.map((row, rIdx) =>
                  row.map((icon, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`h-16 sm:h-20 bg-slate-900/90 rounded-xl flex items-center justify-center border border-amber-950/80 ${
                        icon === '🐉' ? 'bg-amber-950/50 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : ''
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
                  <span className="text-sm font-extrabold font-display uppercase tracking-wide text-amber-300">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Awaken the Golden Dragon</span>
                )}
              </div>

              <button
                disabled={isSpinning || user.coins < bet}
                onClick={handleSpin}
                className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                  isSpinning || user.coins < bet
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-amber-200 shadow-amber-500/30'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>{isSpinning ? 'SPINNING...' : `DRAGON SPIN (${bet.toLocaleString()})`}</span>
              </button>
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
