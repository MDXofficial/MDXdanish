import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Sparkles, Trophy } from 'lucide-react';

const SYMBOLS = [
  { char: '7️⃣', name: 'Lucky 7', mult: 50 },
  { char: '💎', name: 'Diamond', mult: 25 },
  { char: '🔔', name: 'Bell', mult: 12 },
  { char: '🍀', name: 'Clover', mult: 8 },
  { char: '🪙', name: 'Gold Coin', mult: 5 },
  { char: '🍒', name: 'Cherry', mult: 3 },
  { char: '⭐', name: 'Star', mult: 2 },
];

export const LuckyJackpotGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [reels, setReels] = useState(['7️⃣', '💎', '7️⃣']);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Match 3 symbols on the central payline to win:</p>
      <div className="grid grid-cols-2 gap-2">
        {SYMBOLS.map((s) => (
          <div key={s.name} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-base">{s.char} x3</span>
            <span className="text-amber-400 font-bold">{s.mult}x</span>
          </div>
        ))}
      </div>
      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
        <span className="font-bold">JACKPOT TRIGGER:</span> Triple 7️⃣ gives 50x + Progressive Jackpot Coins!
      </div>
    </div>
  );

  return (
    <GameShell gameId="lucky-jackpot" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const handleSpin = () => {
          if (isSpinning || user.coins < bet) return;

          setIsSpinning(true);
          setWinMessage(null);
          soundEngine.playSpinTick(soundEnabled);

          // Simulated spinning intervals
          let tickCount = 0;
          const interval = setInterval(() => {
            setReels([
              SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
              SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
              SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].char,
            ]);
            soundEngine.playSpinTick(soundEnabled);
            tickCount++;

            if (tickCount >= 12) {
              clearInterval(interval);

              // Determine final outcome based on chance
              const rand = Math.random();
              let outcomeReels: string[];
              let multiplier = 0;
              let outcomeType: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS' = 'LOSS';

              if (rand < 0.05) {
                // Jackpot! 777
                outcomeReels = ['7️⃣', '7️⃣', '7️⃣'];
                multiplier = 50;
                outcomeType = 'JACKPOT';
              } else if (rand < 0.12) {
                // Diamond
                outcomeReels = ['💎', '💎', '💎'];
                multiplier = 25;
                outcomeType = 'BIG_WIN';
              } else if (rand < 0.22) {
                // Bell
                outcomeReels = ['🔔', '🔔', '🔔'];
                multiplier = 12;
                outcomeType = 'BIG_WIN';
              } else if (rand < 0.35) {
                // Clover
                outcomeReels = ['🍀', '🍀', '🍀'];
                multiplier = 8;
                outcomeType = 'WIN';
              } else if (rand < 0.52) {
                // Cherry or Coin
                const sym = Math.random() > 0.5 ? '🍒' : '🪙';
                outcomeReels = [sym, sym, sym];
                multiplier = sym === '🪙' ? 5 : 3;
                outcomeType = 'WIN';
              } else if (rand < 0.65) {
                // 2 matching cherries
                outcomeReels = ['🍒', '🍒', '⭐'];
                multiplier = 1.5;
                outcomeType = 'WIN';
              } else {
                // Loss
                outcomeReels = [
                  SYMBOLS[0].char,
                  SYMBOLS[2].char,
                  SYMBOLS[4].char,
                ];
                multiplier = 0;
                outcomeType = 'LOSS';
              }

              setReels(outcomeReels);
              setIsSpinning(false);
              soundEngine.playReelStop(soundEnabled);

              const payout = Math.round(bet * multiplier);
              setLastResult({ payout, multiplier, outcome: outcomeType });

              if (outcomeType === 'JACKPOT') {
                soundEngine.playJackpot(soundEnabled);
                fireJackpotConfetti();
                setWinMessage(`MEGA JACKPOT! Won ${(payout + 500000).toLocaleString()} Coins!`);
                recordGameSpin('lucky-jackpot', bet, payout + 500000, 'JACKPOT', multiplier);
              } else if (outcomeType === 'BIG_WIN') {
                soundEngine.playWin(soundEnabled, true);
                fireCoinCelebration();
                setWinMessage(`BIG WIN! Won ${payout.toLocaleString()} Coins!`);
                recordGameSpin('lucky-jackpot', bet, payout, 'BIG_WIN', multiplier);
              } else if (outcomeType === 'WIN') {
                soundEngine.playWin(soundEnabled, false);
                setWinMessage(`WIN! +${payout.toLocaleString()} Coins`);
                recordGameSpin('lucky-jackpot', bet, payout, 'WIN', multiplier);
              } else {
                setWinMessage('Try Again! Fortune Awaits');
                recordGameSpin('lucky-jackpot', bet, 0, 'LOSS', 0);
              }
            }
          }, 80);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-md py-4">
            {/* Slot Machine Frame */}
            <div className="w-full bg-gradient-to-b from-[#1c1d24] via-[#101117] to-[#090a0e] p-6 rounded-3xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] relative">
              {/* Top Marquee */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-500/30">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black tracking-widest text-amber-400 font-display">LUCKY 3-REEL</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                  JACKPOT: 12.5M
                </div>
              </div>

              {/* Slot Reels Container */}
              <div className="relative bg-[#050608] rounded-2xl p-4 border-4 border-amber-600/50 shadow-inner flex items-center justify-around gap-2 overflow-hidden">
                {/* Center Payline Indicator */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-red-500/60 z-10 pointer-events-none" />

                {reels.map((sym, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-28 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-xl flex items-center justify-center border border-slate-700/80 shadow-md ${
                      isSpinning ? 'scale-95 blur-[0.5px] opacity-80' : 'scale-100'
                    } transition-all duration-100`}
                  >
                    <span className="text-5xl select-none filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                      {sym}
                    </span>
                  </div>
                ))}
              </div>

              {/* Win Announcement */}
              <div className="h-10 mt-4 flex items-center justify-center text-center">
                {winMessage ? (
                  <span
                    className={`text-sm font-extrabold font-display uppercase tracking-wider ${
                      winMessage.includes('JACKPOT')
                        ? 'text-yellow-400 animate-bounce'
                        : winMessage.includes('WIN')
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Select Bet & Tap Spin!</span>
                )}
              </div>

              {/* Spin Button */}
              <div className="mt-4 flex justify-center">
                <button
                  disabled={isSpinning || user.coins < bet}
                  onClick={handleSpin}
                  className={`w-full py-4 rounded-2xl font-black text-lg font-display tracking-widest uppercase transition-all duration-150 flex items-center justify-center gap-2 shadow-xl ${
                    isSpinning || user.coins < bet
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 hover:brightness-110 active:scale-[0.98] border-2 border-yellow-200 shadow-amber-500/20'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{isSpinning ? 'SPINNING...' : `SPIN (${bet.toLocaleString()})`}</span>
                </button>
              </div>
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
