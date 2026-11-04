import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Sparkles, Cherry } from 'lucide-react';

const FRUITS = [
  { char: '🍉', name: 'Watermelon', mult: 30 },
  { char: '🍇', name: 'Grapes', mult: 20 },
  { char: '🍋', name: 'Lemon', mult: 12 },
  { char: '🍒', name: 'Cherry', mult: 6 },
  { char: '🍊', name: 'Orange', mult: 4 },
  { char: '⭐', name: 'Golden Star', mult: 50 },
];

export const FruitSlotsGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [reels, setReels] = useState(['🍉', '🍒', '🍋']);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Match 3 Juicy Fruits on Payline:</p>
      <div className="grid grid-cols-2 gap-2">
        {FRUITS.map((f) => (
          <div key={f.name} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
            <span>{f.char} x3</span>
            <span className="text-pink-400 font-bold">{f.mult}X</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <GameShell gameId="fruit-slots" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const handleSpin = () => {
          if (isSpinning || user.coins < bet) return;

          setIsSpinning(true);
          setWinMessage(null);
          soundEngine.playSpinTick(soundEnabled);

          let ticks = 0;
          const interval = setInterval(() => {
            setReels([
              FRUITS[Math.floor(Math.random() * FRUITS.length)].char,
              FRUITS[Math.floor(Math.random() * FRUITS.length)].char,
              FRUITS[Math.floor(Math.random() * FRUITS.length)].char,
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
                finalReels = ['⭐', '⭐', '⭐'];
                multiplier = 50;
                outcome = 'JACKPOT';
              } else if (rand < 0.15) {
                finalReels = ['🍉', '🍉', '🍉'];
                multiplier = 30;
                outcome = 'BIG_WIN';
              } else if (rand < 0.3) {
                finalReels = ['🍇', '🍇', '🍇'];
                multiplier = 20;
                outcome = 'BIG_WIN';
              } else if (rand < 0.52) {
                finalReels = ['🍒', '🍒', '🍒'];
                multiplier = 6;
                outcome = 'WIN';
              } else {
                finalReels = ['🍋', '🍇', '🍊'];
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
                setWinMessage(`JUICY JACKPOT! ${(payout + 500000).toLocaleString()} Coins!`);
                recordGameSpin('fruit-slots', bet, payout + 500000, outcome, multiplier);
              } else if (outcome === 'BIG_WIN') {
                soundEngine.playWin(soundEnabled, true);
                fireCoinCelebration();
                setWinMessage(`FRUIT BLAST! ${multiplier}x (${payout.toLocaleString()} Coins)`);
                recordGameSpin('fruit-slots', bet, payout, outcome, multiplier);
              } else if (outcome === 'WIN') {
                soundEngine.playWin(soundEnabled, false);
                setWinMessage(`WIN! +${payout.toLocaleString()} Coins`);
                recordGameSpin('fruit-slots', bet, payout, outcome, multiplier);
              } else {
                setWinMessage('Spin again for Fruit Fiesta!');
                recordGameSpin('fruit-slots', bet, 0, 'LOSS', 0);
              }
            }
          }, 80);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-sm py-2">
            <div className="w-full bg-[#1c0f13] p-5 rounded-3xl border-2 border-pink-500/40 shadow-[0_0_40px_rgba(244,63,94,0.25)]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-pink-500/30">
                <div className="flex items-center gap-1.5">
                  <Cherry className="w-5 h-5 text-pink-400" />
                  <span className="text-xs font-black tracking-widest text-pink-400 font-display">
                    FRUIT SLOTS FIESTA
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-400">30X WATERMELONS</span>
              </div>

              <div className="flex items-center justify-around gap-2 bg-[#090305] p-4 rounded-2xl border-2 border-pink-900/60 shadow-inner">
                {reels.map((sym, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-28 bg-gradient-to-b from-pink-950/40 via-pink-900/20 to-black rounded-xl border border-pink-500/40 flex items-center justify-center"
                  >
                    <span className="text-5xl select-none filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                      {sym}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-9 mt-3 flex items-center justify-center">
                {winMessage ? (
                  <span className="text-sm font-extrabold font-display uppercase tracking-wide text-pink-300">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Spin the Classic Fruit Reels</span>
                )}
              </div>

              <button
                disabled={isSpinning || user.coins < bet}
                onClick={handleSpin}
                className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                  isSpinning || user.coins < bet
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-pink-200 shadow-pink-500/20'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>{isSpinning ? 'SPINNING...' : `SPIN FRUITS (${bet.toLocaleString()})`}</span>
              </button>
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
