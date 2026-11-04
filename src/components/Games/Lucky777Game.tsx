import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Sparkles, Flame } from 'lucide-react';

const SEVEN_SYMBOLS = ['7️⃣', '🔴', '🟢', '🟡', '🔔', '⭐'];

export const Lucky777Game: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Classic Vegas Triple Sevens:</p>
      <div className="space-y-1.5">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>7️⃣ 7️⃣ 7️⃣ Triple Gold 7s</span>
          <span className="text-red-400 font-bold">77X Jackpot</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🟡 🟡 🟡 Golden Orbs</span>
          <span className="text-amber-400 font-bold">25X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🟢 🟢 🟢 Emerald Lights</span>
          <span className="text-emerald-400 font-bold">15X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Any 3 Matching</span>
          <span className="text-slate-300 font-bold">4X</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="lucky-777" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const handleSpin = () => {
          if (isSpinning || user.coins < bet) return;

          setIsSpinning(true);
          setWinMessage(null);
          soundEngine.playSpinTick(soundEnabled);

          let ticks = 0;
          const interval = setInterval(() => {
            setReels([
              SEVEN_SYMBOLS[Math.floor(Math.random() * SEVEN_SYMBOLS.length)],
              SEVEN_SYMBOLS[Math.floor(Math.random() * SEVEN_SYMBOLS.length)],
              SEVEN_SYMBOLS[Math.floor(Math.random() * SEVEN_SYMBOLS.length)],
            ]);
            soundEngine.playSpinTick(soundEnabled);
            ticks++;

            if (ticks >= 10) {
              clearInterval(interval);

              const rand = Math.random();
              let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS' = 'LOSS';
              let multiplier = 0;
              let finalReels: string[];

              if (rand < 0.05) {
                finalReels = ['7️⃣', '7️⃣', '7️⃣'];
                multiplier = 77;
                outcome = 'JACKPOT';
              } else if (rand < 0.15) {
                finalReels = ['🟡', '🟡', '🟡'];
                multiplier = 25;
                outcome = 'BIG_WIN';
              } else if (rand < 0.28) {
                finalReels = ['🟢', '🟢', '🟢'];
                multiplier = 15;
                outcome = 'BIG_WIN';
              } else if (rand < 0.5) {
                finalReels = ['🔔', '🔔', '🔔'];
                multiplier = 5;
                outcome = 'WIN';
              } else {
                finalReels = ['7️⃣', '🔔', '⭐'];
                multiplier = 0;
                outcome = 'LOSS';
              }

              setReels(finalReels);
              setIsSpinning(false);
              soundEngine.playReelStop(soundEnabled);

              const payout = Math.round(bet * multiplier);
              setLastResult({ payout, multiplier, outcome });

              if (outcome === 'JACKPOT') {
                soundEngine.playJackpot(soundEnabled);
                fireJackpotConfetti();
                setWinMessage(`TRIPLE 777 JACKPOT! ${(payout + 777777).toLocaleString()} Coins!`);
                recordGameSpin('lucky-777', bet, payout + 777777, outcome, multiplier);
              } else if (outcome === 'BIG_WIN') {
                soundEngine.playWin(soundEnabled, true);
                fireCoinCelebration();
                setWinMessage(`SUPER SEVEN WIN! ${multiplier}x (${payout.toLocaleString()} Coins)`);
                recordGameSpin('lucky-777', bet, payout, outcome, multiplier);
              } else if (outcome === 'WIN') {
                soundEngine.playWin(soundEnabled, false);
                setWinMessage(`WIN! +${payout.toLocaleString()} Coins`);
                recordGameSpin('lucky-777', bet, payout, outcome, multiplier);
              } else {
                setWinMessage('Hit 7-7-7 for 77X Pot!');
                recordGameSpin('lucky-777', bet, 0, 'LOSS', 0);
              }
            }
          }, 80);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-sm py-2">
            <div className="w-full bg-[#180a0a] p-5 rounded-3xl border-2 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-red-500/30">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                  <span className="text-xs font-black tracking-widest text-red-400 font-display">
                    VEGAS LUCKY 777
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-400">77X JACKPOT</span>
              </div>

              {/* 3 Reels with Neon Red Border */}
              <div className="flex items-center justify-around gap-2 bg-[#090202] p-4 rounded-2xl border-2 border-red-800/80 shadow-inner">
                {reels.map((sym, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-28 bg-gradient-to-b from-red-950/40 via-red-900/20 to-black rounded-xl border border-red-500/40 flex items-center justify-center"
                  >
                    <span className="text-5xl select-none filter drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]">
                      {sym}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-9 mt-3 flex items-center justify-center">
                {winMessage ? (
                  <span className="text-sm font-extrabold font-display uppercase tracking-wide text-red-300">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Roll for Triple Neon Sevens</span>
                )}
              </div>

              <button
                disabled={isSpinning || user.coins < bet}
                onClick={handleSpin}
                className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                  isSpinning || user.coins < bet
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-red-500 via-amber-400 to-red-600 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-red-300 shadow-red-500/20'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>{isSpinning ? 'SPINNING...' : `SPIN 777 (${bet.toLocaleString()})`}</span>
              </button>
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
